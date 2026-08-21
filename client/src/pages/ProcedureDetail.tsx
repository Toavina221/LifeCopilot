import { useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HeartPulse,
  Banknote,
  House,
  GraduationCap,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  FileText,
  Clock,
  Banknote as Coin,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { AdUnit } from "@/components/AdUnit";
import { useAuth } from "@/lib/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/lib/useAuth";
import {
  PROCEDURES_BY_KEY,
  CATEGORY_LABELS,
  type ProcedureCategory,
} from "@shared/procedures";

const CATEGORY_ICONS = {
  health: HeartPulse,
  finance: Banknote,
  housing: House,
  school: GraduationCap,
  digital: Smartphone,
} as const;

export default function ProcedureDetail() {
  const [, params] = useRoute("/procedures/:key");
  const key = params?.key ?? "";
  const procedure = PROCEDURES_BY_KEY[key];
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const { data: saved } = trpc.saved.list.useQuery(undefined, {
    enabled: isAuthenticated && Boolean(procedure),
  });
  const savedEntry = saved?.find((s: any) => s.procedureKey === key);

  const saveMutation = trpc.saved.save.useMutation({
    onSuccess: () => {
      utils.saved.list.invalidate();
      toast.success("Démarche sauvegardée dans votre tableau de bord");
    },
    onError: (e) => toast.error(e.message),
  });

  const markMutation = trpc.saved.markSteps.useMutation({
    onSuccess: () => utils.saved.list.invalidate(),
  });

  // Restore persisted progress
  useMemo(() => {
    if (savedEntry?.completedSteps && Array.isArray(savedEntry.completedSteps)) {
      setCompleted(new Set((savedEntry.completedSteps as number[]).map(Number)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedEntry?.id]);

  if (!procedure) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-semibold">Démarche introuvable</h1>
          <p className="mt-2 text-muted-foreground">
            Cette démarche n'existe pas dans le catalogue LifeCopilot.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/procedures">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour au catalogue
            </Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const Icon = CATEGORY_ICONS[procedure.category as ProcedureCategory];
  const progressPct = Math.round((completed.size / procedure.steps.length) * 100);

  const toggleStep = (index: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      if (isAuthenticated) {
        markMutation.mutate({
          procedureKey: key,
          completedSteps: Array.from(next),
        });
      }
      return next;
    });
  };

  return (
    <SiteLayout>
      <section className="container py-10">
        <Link
          href="/procedures"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les démarches
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Icon className="h-4.5 w-4.5" />
              {CATEGORY_LABELS[procedure.category]}
            </span>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              {procedure.title}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {procedure.summary}
            </p>

            {/* Progress */}
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Votre progression</span>
                <span className="text-muted-foreground">
                  {completed.size} / {procedure.steps.length} étapes
                </span>
              </div>
              <Progress value={progressPct} className="mt-3" />
              {progressPct === 100 && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Démarche accomplie ! Bravo.
                </p>
              )}
            </div>

            {/* Steps */}
            <ol className="mt-8 space-y-5">
              {procedure.steps.map((step: any, i: number) => {
                const done = completed.has(i);
                return (
                  <li
                    key={i}
                    className={`rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 ${
                      done ? "border-primary/30 bg-primary/[0.03]" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={done}
                        onCheckedChange={() => toggleStep(i)}
                        className="mt-0.5 shrink-0 h-5 w-5"
                        aria-label={`Marquer l'étape ${i + 1} comme ${done ? "non faite" : "faite"}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2.5">
                          <span
                            className={`font-serif text-sm font-semibold ${done ? "text-primary" : "text-muted-foreground"}`}
                          >
                            Étape {i + 1}
                          </span>
                          <h2
                            className={`font-serif text-lg font-semibold leading-snug sm:text-xl ${done ? "text-primary" : ""}`}
                          >
                            {step.title}
                          </h2>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                        {step.tip && (
                          <div className="mt-3 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">
                            💡 {step.tip}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-serif text-base font-semibold">Informations</h3>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Durée</dt>
                    <dd className="font-medium">{procedure.duration}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Coin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Coût</dt>
                    <dd className="font-medium">{procedure.cost}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="inline-flex items-center gap-1.5 font-serif text-base font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Documents à préparer
              </h3>
              {procedure.documents.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {procedure.documents.map((d: any) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Aucun document requis — c'est une démarche purement pratique.
                </p>
              )}
            </div>

            {isAuthenticated ? (
              <Button
                className="w-full"
                onClick={() =>
                  saveMutation.mutate({ procedureKey: key })
                }
                disabled={saveMutation.isPending}
              >
                Sauvegarder cette démarche
              </Button>
            ) : (
              <Button className="w-full" variant="secondary" onClick={() => startLogin()}>
                Connectez-vous pour sauvegarder
              </Button>
            )}

            <AdUnit slot="sidebar" className="mb-6" />

            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-5">
              <h3 className="inline-flex items-center gap-1.5 font-serif text-base font-semibold">
                <MessageCircle className="h-4 w-4 text-primary" />
                Besoin d'aide ?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Posez une question à l'assistant LifeCopilot à propos de cette
                démarche — il répond dans un langage adapté à votre âge.
              </p>
              <Button variant="outline" className="mt-3 w-full bg-card" asChild>
                <Link href={`/assistant?procedure=${key}`}>
                  Ouvrir l'assistant
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
