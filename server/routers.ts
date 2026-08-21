import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  openRouterChat,
  isOpenRouterConfigured,
} from "./openrouter";
import { geminiChat, isGeminiConfigured } from "./gemini";

/**
 * Point d'entrée LLM unique (indépendant de la plateforme Manus) :
 * Google Gemini AI Studio (gratuit, sans dépôt) en priorité, puis OpenRouter
 * (quota gratuit + modèles peu coûteux). Hors plateforme Manus, l'API Manus
 * intégrée n'est plus disponible et a été retirée de la chaîne.
 */
async function aiChat(params: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
}): Promise<string> {
  // Ordre de priorité : Google Gemini (gratuit, sans dépôt) > OpenRouter > API Manus (fallback).
  // Quand Gemini signale un quota épuisé (saturation free-tier), on bascule
  // automatiquement sur le service suivant de la chaîne sans erreur visible.
  if (isGeminiConfigured()) {
    const system = params.messages.find((m) => m.role === "system")?.content;
    try {
      return await geminiChat({
        system,
        messages: params.messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      });
    } catch (error) {
      // Le circuit breaker Gemini rejette avec "quota dépassé" ; les échecs
      // 429 remontent comme "Gemini request failed". Dans les deux cas,
      // on bascule silencieusement sur le service suivant de la chaîne.
      const errorMessage = String(error);
      if (errorMessage.includes("quota dépassé") || errorMessage.includes("Gemini request failed")) {
        console.warn("[aiChat] Gemini saturé — bascule vers le service suivant");
      } else {
        throw error;
      }
    }
  }
  if (isOpenRouterConfigured()) {
    return openRouterChat({
      messages: params.messages,
      model: params.model ?? "google/gemini-2.5-flash",
    });
  }
  throw new Error("Aucun fournisseur IA configuré (GEMINI_API_KEY ou OPENROUTER_API_KEY manquant)");
}

import {
  createLetter,
  createTask,
  deleteTask,
  getUserById,
  listLetters,
  listSavedProcedures,
  listTasks,
  markProcedureSteps,
  saveProcedure,
  updateTaskStatus,
  updateUserProfile,
} from "./db";
import { PROCEDURES_BY_KEY } from "@shared/procedures";

const FALLBACK_ERROR = "Le service IA est temporairement indisponible. Veuillez réessayer dans un instant.";

const AGE_MODES = ["junior", "teen", "adult", "senior"] as const;

const toneForMode = (mode: (typeof AGE_MODES)[number]) => {
  switch (mode) {
    case "junior":
      return `Tu t'adresses à un enfant de 8 à 12 ans. Utilise des phrases très courtes et simples, un ton chaleureux et encourageant, des exemples concrets tirés de son quotidien (école, argent de poche, jeux). Évite tout jargon. Utilise quelques emojis avec parcimonie. Fais-lui sentir qu'il est capable et que poser des questions est une force. Réponds en français.`;
    case "teen":
      return `Tu t'adresses à un adolescent de 13 à 19 ans. Sois direct, concret et respectueux, sans être infantilisant ni trop formel. Explique les choses clairement avec des exemples proches de sa vie (premier job, carte bancaire, réseaux sociaux, études). Tu peux être légèrement décontracté mais reste fiable. Réponds en français.`;
    case "adult":
      return `Tu t'adresses à un adulte actif, souvent pressé. Sois concis, précis et structuré : étapes numérotées, documents requis en liste, pièges à éviter. Va droit au but tout en restant bienveillant. Réponds en français.`;
    case "senior":
      return `Tu t'adresses à une personne de 60 ans ou plus, parfois peu à l'aise avec le numérique. Utilise des phrases courtes, une police mentale "gros caractères" (structure aérée), un ton patient et rassurant. Évite les anglicismes et explique chaque terme technique. Rappelle systématiquement les précautions contre les arnaques quand c'est pertinent. Réponds en français.`;
  }
};

const PROCEDURES_CONTEXT = Object.values(PROCEDURES_BY_KEY)
  .map(
    (p) =>
      `- « ${p.key} » : ${p.title}. ${p.summary} Durée : ${p.duration}. Documents : ${p.documents.join(", ") || "aucun"}. Étapes : ${p.steps.map((s, i) => `${i + 1}. ${s.title} — ${s.description}`).join(" ; ")}`
  )
  .join("\n");

const baseSystemPrompt = (mode: (typeof AGE_MODES)[number], procedureKey?: string) =>
  `Tu es LifeCopilot, l'assistant qui aide les gens à accomplir les démarches de la vie quotidienne (santé, finances, logement, école, numérique).\n\n${toneForMode(mode)}\n\n${procedureKey && PROCEDURES_BY_KEY[procedureKey] ? `L'utilisateur consulte actuellement la démarche suivante : ${PROCEDURES_BY_KEY[procedureKey].title}.\n\nContexte de la démarche :\n${PROCEDURES_BY_KEY[procedureKey].summary}\nÉtapes : ${PROCEDURES_BY_KEY[procedureKey].steps.map((s, i) => `${i + 1}. ${s.title} — ${s.description}`).join("\n")}` : `Voici le catalogue des démarches disponibles que tu connais en détail :\n${PROCEDURES_CONTEXT}`}\n\nQuand l'utilisateur te parle d'une démarche du catalogue, appuie-toi sur son contenu pour le guider étape par étape. Si sa question dépasse ton champ (diagnostic médical, conseil juridique personnalisé), oriente-le vers un professionnel. Ne propose jamais de données personnelles, de coordonnées bancaires ou d'informations inventées : si tu ne sais pas, dis-le. Reste toujours factuel et prudent.`;

const letterTypeLabels: Record<string, string> = {
  cancellation: "lettre d'annulation / de résiliation",
  complaint: "lettre de réclamation",
  reimbursement: "demande de remboursement",
  admin_request: "demande / courrier administratif",
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

 /** Age-adaptive AI chat assistant (streaming). */
  chat: router({
    complete: publicProcedure
      .input(
        z.object({
          mode: z.enum(AGE_MODES).default("adult"),
          messages: z
            .array(
              z.object({ role: z.enum(["user", "assistant"]), content: z.string() })
            )
            .min(1)
            .max(40),
          procedureKey: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const system = baseSystemPrompt(input.mode, input.procedureKey);
        let content: string;
        try {
          // Timeout de 10s max pour éviter le 504 Vercel
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout IA")), 10000)
          );

          content = await Promise.race([
            aiChat({
              messages: [
                { role: "system", content: system },
                ...input.messages.map((m) => ({ role: m.role, content: m.content })),
              ],
            }),
            timeoutPromise,
          ]);
        } catch (e) {
          console.error("[Chat] AI failure:", e);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: FALLBACK_ERROR });
        }
        return { content };
      }),
  }),
  // 

  /** Automatic letter generator powered by LLM. */
  letters: router({
    generate: publicProcedure
      .input(
        z.object({
          letterType: z.enum(["cancellation", "complaint", "reimbursement", "admin_request"]),
          situation: z.string().min(10, "Décrivez votre situation (10 caractères minimum)."),
          senderName: z.string().min(2).optional(),
          senderAddress: z.string().min(2).optional(),
          recipient: z.string().optional(),
          extraDetails: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { user } = ctx;
        const saveToHistory = async (content: string) => {
          if (!user) return;
          try {
            await createLetter(user.id, {
              letterType: input.letterType,
              title: `${letterTypeLabels[input.letterType]} — ${new Date().toLocaleDateString("fr-FR")}`,
              content,
              formData: {
                situation: input.situation,
                senderName: input.senderName,
                senderAddress: input.senderAddress,
                recipient: input.recipient,
                extraDetails: input.extraDetails,
              },
            });
          } catch (e) {
            console.error("[Letters] Failed to save letter:", e);
          }
        };
        const today = new Date().toLocaleDateString("fr-FR");
        let text: string;
        try {
          text = await aiChat({
            messages: [
              {
                role: "system",
                content: `Tu es un rédacteur de courriers formels français expert. Rédige une ${letterTypeLabels[input.letterType]} professionnelle, claire et juridiquement prudente, en français, au format lettre standard (expéditeur, destinataire si fourni, objet, corps, formule de politesse, signature). Utilise les informations de situation fournies par l'utilisateur et complète les placeholders entre crochets [à compléter] pour les informations manquantes. Le corps doit faire 150 à 250 mots, factuel et poli.`,
              },
              {
                role: "user",
                content: `Date du jour : ${today}.\n${input.senderName ? `Expéditeur : ${input.senderName}${input.senderAddress ? `\nAdresse : ${input.senderAddress}` : ""}` : ""}\n${input.recipient ? `Destinataire : ${input.recipient}` : ""}\nSituation à traiter : ${input.situation}\n${input.extraDetails ? `Détails supplémentaires : ${input.extraDetails}` : ""}`,
              },
            ],
          });
        } catch (e) {
          console.error("[Letters] AI failure:", e);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: FALLBACK_ERROR });
        }
        await saveToHistory(text);
        return { content: text };
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return listLetters(ctx.user.id);
    }),
  }),

  /** Scam / suspicious content detector. */
  scams: router({
    analyze: publicProcedure
      .input(
        z.object({
          content: z.string().min(10, "Collez le contenu suspect (10 caractères minimum)."),
          kind: z.enum(["sms", "email", "contract", "other"]).default("other"),
        })
      )
      .mutation(async ({ input }) => {
        const kindLabels: Record<string, string> = {
          sms: "SMS",
          email: "e-mail",
          contract: "clause de contrat",
          other: "contenu",
        };
        let analysis: string;
        try {
          analysis = await aiChat({
            messages: [
              {
                role: "system",
                content: `Tu es un expert en détection d'arnaques et de contenus suspects, côté défense du consommateur. Analyse le ${kindLabels[input.kind]} fourni et renvoie une analyse structurée en français au format Markdown avec exactement ces sections : **Verdict** (niveau de risque : Faible / Modéré / Élevé, avec une phrase d'explication), **Signaux d'alerte repérés** (liste à puces des éléments suspects concrets trouvés dans le texte : urgence artificielle, demande de paiement, liens suspects, fautes inhabituelles, clause déséquilibrée, etc. — ou « aucun signal majeur »), **Ce que cela signifie** (explication simple en 2-3 phrases), **Conduite à tenir** (3-4 actions concrètes et prudentes : ne pas cliquer, ne pas payer, vérifier par un canal officiel, contacter sa banque, etc.). Sois factuel, ne dramatise pas mais ne minimise pas les risques réels.`,
              },
              { role: "user", content: input.content },
            ],
          });
        } catch (e) {
          console.error("[Scams] AI failure:", e);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: FALLBACK_ERROR });
        }
        return { analysis };
      }),
  }),

  /** Dashboard: saved procedures with progress. */
  saved: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return listSavedProcedures(ctx.user.id);
    }),
    save: publicProcedure
      .input(z.object({ procedureKey: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Connectez-vous pour sauvegarder." });
        if (!PROCEDURES_BY_KEY[input.procedureKey]) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Démarche inconnue." });
        }
        return saveProcedure(ctx.user.id, input.procedureKey);
      }),
    markSteps: publicProcedure
      .input(
        z.object({
          procedureKey: z.string().min(1),
          completedSteps: z.array(z.number().int().min(0)),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return markProcedureSteps(ctx.user.id, input.procedureKey, input.completedSteps);
      }),
  }),

  /** Dashboard: personal tasks with deadlines. */
  tasks: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return listTasks(ctx.user.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          description: z.string().optional(),
          deadlineAt: z.number().int().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return createTask(ctx.user.id, input);
      }),
    setStatus: publicProcedure
      .input(
        z.object({
          taskId: z.number().int(),
          status: z.enum(["todo", "in_progress", "done"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return updateTaskStatus(ctx.user.id, input.taskId, input.status);
      }),
    remove: publicProcedure
      .input(z.object({ taskId: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return deleteTask(ctx.user.id, input.taskId);
      }),
  }),

  /** User profile. */
  profile: router({
    get: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return getUserById(ctx.user.id);
    }),
    update: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(120).optional(),
          ageGroup: z.enum(AGE_MODES).optional(),
          country: z.string().min(1).max(128).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        await updateUserProfile(ctx.user.id, input);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
