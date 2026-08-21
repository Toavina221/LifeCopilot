import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Baby, GraduationCap, User, Armchair, RefreshCcw } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { AIChatBox, type Message as BaseMessage } from "@/components/AIChatBox";

type Message = { role: "user" | "assistant"; content: string };

import { trpc } from "@/lib/trpc";
import { PROCEDURES_BY_KEY, CATEGORY_LABELS } from "@shared/procedures";

type AgeMode = "junior" | "teen" | "adult" | "senior";

const MODES: Array<{
  key: AgeMode;
  label: string;
  age: string;
  icon: typeof Baby;
  description: string;
}> = [
  {
    key: "junior",
    label: "Enfant",
    age: "8–12 ans",
    icon: Baby,
    description: "Des phrases courtes, des exemples de la vie de tous les jours",
  },
  {
    key: "teen",
    label: "Ado",
    age: "13–19 ans",
    icon: GraduationCap,
    description: "Direct et concret : argent, papiers, vie numérique",
  },
  {
    key: "adult",
    label: "Adulte",
    age: "20–59 ans",
    icon: User,
    description: "Concis et structuré, pour aller droit au but",
  },
  {
    key: "senior",
    label: "Senior",
    age: "60 ans et +",
    icon: Armchair,
    description: "Patient, clair et vigilant face aux arnaques",
  },
];

const MODE_STYLES: Record<AgeMode, { label: string; accent: string; bg: string }> = {
  junior: { label: "text-junior", accent: "var(--junior)", bg: "oklch(0.62 0.16 150 / 0.1)" },
  teen: { label: "text-teen", accent: "var(--teen)", bg: "oklch(0.55 0.16 290 / 0.1)" },
  adult: { label: "text-adult", accent: "var(--adult)", bg: "oklch(0.38 0.085 215 / 0.1)" },
  senior: { label: "text-senior", accent: "var(--senior)", bg: "oklch(0.68 0.13 60 / 0.1)" },
};

const MODE_PROMPTS: Record<AgeMode, string[]> = {
  junior: [
    "C'est quoi une facture ?",
    "Comment garder mes mots de passe en sécurité ?",
    "Comment économiser mon argent de poche ?",
  ],
  teen: [
    "Comment ouvrir un compte bancaire jeune ?",
    "C'est quoi une arnaque sur internet ?",
    "Je commence un job d'été, que dois-je savoir ?",
  ],
  adult: [
    "Comment résilier mon abonnement téléphonique ?",
    "Comment demander un remboursement d'assurance santé ?",
    "Quels documents préparer pour louer un appartement ?",
  ],
  senior: [
    "Comment recevoir un remboursement de la Sécurité sociale ?",
    "Comment repérer un faux SMS de ma banque ?",
    "Comment prendre rendez-vous chez le médecin en ligne ?",
  ],
};

const WELCOME: Record<AgeMode, string> = {
  junior:
    "Bonjour ! Je suis **LifeCopilot**, ton copilote pour la vie. Pose-moi toutes les questions que tu veux — sur l'argent, internet, l'école ou la maison — et je t'aiderai à trouver les réponses, facilement. Tu peux cliquer sur une des questions en dessous pour commencer !",
  teen:
    "Salut ! Je suis **LifeCopilot**. Argent, papiers, vie en ligne : demande-moi n'importe quoi, je te réponds sans jargon compliqué. Si tu as une démarche précise en tête, dis-le-moi et je te guide étape par étape.",
  adult:
    "Bonjour, je suis **LifeCopilot**. Je vous accompagne dans toutes vos démarches du quotidien : finances, logement, santé, école, numérique. Décrivez votre situation et je vous guide pas à pas, avec la liste des documents nécessaires et les pièges à éviter.",
  senior:
    "Bonjour, je suis **LifeCopilot**. Je suis là pour vous accompagner à votre rythme dans toutes les démarches de la vie, même celles qui passent par internet. N'hésitez pas à me demander quelque chose, et si un message vous semble suspect, je peux aussi l'analyser pour vous.",
};

export default function Assistant() {
  const search = useSearch();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const initialMode = (qs.get("mode") as AgeMode) ?? "adult";
  const initialProcedure = qs.get("procedure") ?? null;

  const [mode, setMode] = useState<AgeMode>(initialMode);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: WELCOME[initialMode] }]);

  const chatMutation = trpc.chat.complete.useMutation();

  // Contextual open message when landing from a procedure page
  useEffect(() => {
    if (initialProcedure && PROCEDURES_BY_KEY[initialProcedure]) {
      const p = PROCEDURES_BY_KEY[initialProcedure];
      setMessages([
        {
          role: "assistant",
          content: `Vous venez d'ouvrir la démarche « **${p.title}** » (${CATEGORY_LABELS[p.category]}). Je connais ses étapes :${p.steps.map((s, i) => `\n\n**Étape ${i + 1} — ${s.title}**\n${s.description}`).join("")}\n\nPar quoi voulez-vous commencer ? Vous pouvez aussi me poser n'importe quelle question en rapport.`,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = (next: AgeMode) => {
    if (next === mode) return;
    setMode(next);
    setMessages([{ role: "assistant", content: WELCOME[next] }]);
  };

  const handleSend = (content: string) => {
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    chatMutation.mutate(
      { mode, messages: next.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), procedureKey: initialProcedure ?? undefined },
      {
        onSuccess: (res) => {
          setMessages((prev) => [...prev, { role: "assistant", content: res.content }]);
        },
        onError: (e) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Désolé, je n'ai pas pu répondre : ${e.message}. Veuillez réessayer.` },
          ]);
        },
      }
    );
  };

  const restart = () => {
    chatMutation.reset();
    setMessages([{ role: "assistant", content: WELCOME[mode] }]);
  };

  const style = MODE_STYLES[mode];

  return (
    <SiteLayout>
      <section className="container py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              L'assistant LifeCopilot
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Posez vos questions, décrivez votre situation : l'assistant vous
              répond dans un langage adapté à votre âge et connaît en détail les {Object.values(PROCEDURES_BY_KEY).length} démarches du catalogue.
            </p>
          </div>
          <button
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <RefreshCcw className="h-4 w-4" />
            Nouvelle discussion
          </button>
        </div>

        {/* Mode switcher */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = m.key === mode;
            return (
              <button
                key={m.key}
                onClick={() => switchMode(m.key)}
                className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                  active
                    ? "border-primary shadow-md"
                    : "border-border bg-card hover:border-primary/40"
                }`}
                style={active ? { backgroundColor: style.bg } : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-5 w-5" style={{ color: style.accent }} />
                  <div>
                    <div className="font-serif text-base font-semibold">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.age}</div>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="outline" style={{ color: style.accent, borderColor: style.accent }}>
              Mode {MODES.find((m) => m.key === mode)?.label}
            </Badge>
          </div>
          {messages.length === 1 && (
            <div className="mb-3">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Idées pour démarrer :</p>
              <div className="flex flex-wrap gap-2">
                {MODE_PROMPTS[mode].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={chatMutation.isPending}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={chatMutation.isPending}
            placeholder={
              mode === "junior"
                ? "Pose-moi ta question…"
                : "Décrivez votre situation ou posez votre question…"
            }
            height="560px"
            emptyStateMessage="Démarrez la conversation avec LifeCopilot"
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            LifeCopilot fournit des informations générales et ne remplace pas un
            professionnel (médecin, avocat, conseiller financier).
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
