import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// --- Mock the LLM layer so AI tests run without real API calls (free-tier quota)
// and remain deterministic. The production routers still call the live stack
// (Gemini → OpenRouter → Manus fallback).
vi.mock("./_core/llm", async (importOriginal) => {
  const original = await importOriginal<typeof import("./_core/llm")>();
  return {
    ...original,
    invokeLLM: vi.fn().mockResolvedValue({
      content: [
        {
          type: "text",
          text: "[Réponse IA simulée] Bonjour ! Voici l'aide demandée. Je suis l'assistant de LifeCopilot, prêt à vous accompagner pas à pas.",
        },
      ],
      finishReason: "stop",
    }),
  };
});

// --- Mock the Gemini / OpenRouter layers so AI tests run without real API calls.
// Désactivé lorsque RUN_LIVE_AI_TESTS=1 (test d'intégration réel, volontaire).
// Le mock reproduit les comportements attendus par les assertions :
// - letters.generate intègre le senderName dans la réponse
// - scams.analyze inclut un bloc "verdict"
if (process.env.RUN_LIVE_AI_TESTS !== "1") {
  vi.mock("./gemini", () => ({
    isGeminiConfigured: vi.fn().mockReturnValue(true),
    geminiChat: vi.fn().mockImplementation(async (params: { system?: string; messages: Array<{ content: string }> }) => {
      const full = [params.system ?? "", ...params.messages.map((m) => m.content)].join("\n");
      const senderMatch = /[Ee]xpéditeur ?[:\-] ?(.+)/.exec(full);
      const senderName = senderMatch ? senderMatch[1].trim() : null;
      if (/verdict/i.test(params.system ?? "")) {
        return (
          "Verdict: suspicion élevée. Analyse: ce message utilise l'urgence (sous 24h), " +
          "un lien suspect (http://colis-xxxx.xyz) et une demande de paiement par lien — trois signaux d'arnaque classiques.\n" +
          "Conseils: ne cliquez jamais sur le lien, signalez sur internet-signalement.gouv.fr."
        );
      }
      if (senderName) {
        return `Madame, Monsieur,\n\n${senderName} vous écrit aujourd'hui pour résilier son abonnement, comme demandé.\n\nVeuillez agréer nos salutations distinguées.`;
      }
      return "[Réponse IA simulée] Bonjour ! Voici l'aide demandée. Je suis l'assistant de LifeCopilot, prêt à vous accompagner pas à pas.";
    }),
  }));

  vi.mock("./openrouter", () => ({
    isOpenRouterConfigured: vi.fn().mockReturnValue(false),
    openRouterChat: vi.fn().mockResolvedValue("[Réponse OpenRouter simulée]"),
  }));
}

// --- Mock the db module so tests run without a real database connection ---
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getUserById: vi.fn(),
  listSavedProcedures: vi.fn(),
  saveProcedure: vi.fn(),
  markProcedureSteps: vi.fn(),
  listTasks: vi.fn(),
  createTask: vi.fn(),
  updateTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
  listLetters: vi.fn(),
  createLetter: vi.fn(),
  updateUserProfile: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("procedures catalog (shared static data)", () => {
  it("exposes at least 20 procedures across the 5 categories", async () => {
    const { PROCEDURES_BY_KEY } = await import("@shared/procedures");
    const procedures = Object.values(PROCEDURES_BY_KEY);

    expect(procedures.length).toBeGreaterThanOrEqual(20);
    const categories = new Set(procedures.map((p) => p.category));
    expect(categories).toEqual(new Set(["health", "finance", "housing", "school", "digital"]));
    for (const p of procedures) {
      expect(p.title).toBeTruthy();
      expect(p.steps.length).toBeGreaterThan(0);
      expect(p.duration).toBeTruthy();
    }
  });
});

describe("letters.generate", () => {
  it("rejects a situation that is too short", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    await expect(
      caller.letters.generate({ letterType: "complaint", situation: "courte" })
    ).rejects.toThrow();
  }, 15000);

  it.sequential("accepts all four required letter types", async () => {
    for (const letterType of ["cancellation", "complaint", "reimbursement", "admin_request"] as const) {
      const caller = appRouter.createCaller({} as TrpcContext);
      const result = await caller.letters.generate({
        letterType,
        situation: "Je souhaite contester une facture d'électricité mal calculée de 120 € pour le mois de juillet.",
        senderName: "Sample User",
      });
      expect(result.content).toBeTruthy();
      expect(typeof result.content).toBe("string");
    }
  }, 60000);

  it("returns a letter containing the sender name when provided", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    const result = await caller.letters.generate({
      letterType: "cancellation",
      situation: "Je souhaite résilier mon abonnement téléphonique numéro 0600000000 à la date du 1er septembre.",
      senderName: "Ali Testeur",
    });
    expect(result.content.toLowerCase()).toContain("ali testeur");
  });

  it("does not save letter history for anonymous callers", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    await caller.letters.generate({
      letterType: "admin_request",
      situation: "Je demande un duplicata de mon certificat de résidence pour l'année en cours.",
    });
    expect(db.createLetter).not.toHaveBeenCalled();
  });
});

describe("scams.analyze", () => {
  it("rejects content that is too short", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    await expect(
      caller.scams.analyze({ content: "ok" })
    ).rejects.toThrow();
  }, 15000);

  it.sequential("flags a classic fake-delivery SMS as high risk", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    const result = await caller.scams.analyze({
      kind: "sms",
      content:
        "URGENT : votre colis est bloqué à la douane. Payez 2,90 € de frais de dédouanement via ce lien http://colis-xxxx.xyz sous 24h sinon il sera détruit.",
    });
    expect(result.analysis).toBeTruthy();
    const lower = result.analysis.toLowerCase();
    expect(lower).toContain("verdict");
  });

  it("analyzes a clean professional clause calmly", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    const result = await caller.scams.analyze({
      kind: "contract",
      content:
        "Article 4 : le locataire s'engage à maintenir les lieux en bon état et à payer le loyer avant le 5 de chaque mois.",
    });
    expect(result.analysis).toBeTruthy();
  });
});

describe("saved procedures router", () => {
  it("returns empty list for anonymous users", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    const list = await caller.saved.list();
    expect(list).toEqual([]);
    expect(db.listSavedProcedures).not.toHaveBeenCalled();
  });

  it("saves a valid procedure for an authenticated user", async () => {
    vi.mocked(db.saveProcedure).mockResolvedValue({ success: true });
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.saved.save({ procedureKey: "finance-ouvrir-compte-bancaire" });
    expect(result.success).toBe(true);
    expect(db.saveProcedure).toHaveBeenCalledWith(42, "finance-ouvrir-compte-bancaire");
  });

  it("rejects an unknown procedure key", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.saved.save({ procedureKey: "nonexistent-key" })
    ).rejects.toThrow();
    expect(db.saveProcedure).not.toHaveBeenCalled();
  });

  it("marks completed steps for an authenticated user", async () => {
    vi.mocked(db.markProcedureSteps).mockResolvedValue({ success: true });
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.saved.markSteps({
      procedureKey: "health-rdv-medecin",
      completedSteps: [0, 2],
    });
    expect(result.success).toBe(true);
    expect(db.markProcedureSteps).toHaveBeenCalledWith(42, "health-rdv-medecin", [0, 2]);
  });
});

describe("tasks router", () => {
  it("creates a task with deadline for an authenticated user", async () => {
    const deadlineAt = Date.now() + 7 * 24 * 3600 * 1000;
    vi.mocked(db.createTask).mockResolvedValue({ id: 7 } as never);
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.create({
      title: "Apporter le dossier de location à l'agence",
      description: "Dossier complet : CNI, fiches de paie, justificatifs",
      deadlineAt,
    });
    expect((result as { id: number }).id).toBe(7);
    expect(db.createTask).toHaveBeenCalledWith(42, {
      title: "Apporter le dossier de location à l'agence",
      description: "Dossier complet : CNI, fiches de paie, justificatifs",
      deadlineAt,
    });
  });

  it("rejects an empty title", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tasks.create({ title: "" })).rejects.toThrow();
  });

  it("updates task status to done", async () => {
    vi.mocked(db.updateTaskStatus).mockResolvedValue({ success: true });
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.setStatus({ taskId: 3, status: "done" });
    expect(result.success).toBe(true);
    expect(db.updateTaskStatus).toHaveBeenCalledWith(42, 3, "done");
  });

  it("rejects an invalid status value", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.tasks.setStatus({ taskId: 3, status: "invalid" as never })
    ).rejects.toThrow();
  });
});

describe("profile router", () => {
  it("returns the user profile", async () => {
    vi.mocked(db.getUserById).mockResolvedValue({
      id: 42,
      name: "Sample User",
      ageGroup: "adult",
      country: null,
    } as never);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const profile = await caller.profile.get();

    expect(profile).toBeDefined();
    expect(profile?.name).toBe("Sample User");
    expect(db.getUserById).toHaveBeenCalledWith(42);
  });

  it("updates age group and country", async () => {
    vi.mocked(db.updateUserProfile).mockResolvedValue(undefined);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.update({ ageGroup: "senior", country: "Madagascar" });

    expect(result.success).toBe(true);
    expect(db.updateUserProfile).toHaveBeenCalledWith(42, { ageGroup: "senior", country: "Madagascar" });
  });

  it("rejects an invalid age group", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.profile.update({ ageGroup: "extraterrestrial" as never })
    ).rejects.toThrow();
  });
});

describe("chat.complete", () => {
  it.sequential("answers a question in junior mode", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    const result = await caller.chat.complete({
      mode: "junior",
      messages: [{ role: "user", content: "C'est quoi une facture ?" }],
    });
        expect(result.content).toBeTruthy();
  }, 90000);

  it.sequential("uses procedure context when provided", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    const result = await caller.chat.complete({
      mode: "adult",
      messages: [{ role: "user", content: "Quelle est la première étape ?" }],
      procedureKey: "finance-ouvrir-compte-bancaire",
    });
          expect(result.content).toBeTruthy();
  }, 90000);

  it("rejects an invalid mode", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    await expect(
      caller.chat.complete({ mode: "alien" as never, messages: [{ role: "user", content: "x" }] })
    ).rejects.toThrow();
  });
});

describe("auth.me and auth.logout", () => {
  it("returns a falsy value for anonymous users", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    expect(await caller.auth.me()).toBeFalsy();
  });

  it("returns the user for authenticated contexts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect((await caller.auth.me())?.id).toBe(42);
  });
});

describe("gemini integration", () => {
  it(
    "answers a message via Gemini using GEMINI_API_KEY",
    async () => {
      // Test d'intégration réseau : activable explicitement via RUN_LIVE_AI_TESTS=1.
      // Désactivé par défaut car le quota gratuit Gemini (20 req/min) est
      // facilement saturé par la suite complète de tests.
      if (process.env.RUN_LIVE_AI_TESTS !== "1") {
        console.warn("Live AI tests disabled; set RUN_LIVE_AI_TESTS=1 to enable");
        return;
      }
      // Skip when no key is configured (local environments without the secret)
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not set, skipping Gemini live test");
        return;
      }
      const { geminiChat, isGeminiConfigured } = await import("./gemini");
      expect(isGeminiConfigured()).toBe(true);
      const reply = await geminiChat({
        system: "Tu es l'assistant de LifeCopilot, réponds en français en une phrase.",
        messages: [
          { role: "user", content: "Dis bonjour en une phrase courte." },
        ],
      });
      expect(typeof reply).toBe("string");
      expect(reply.trim().length).toBeGreaterThan(0);
    },
    120_000
  );
});
