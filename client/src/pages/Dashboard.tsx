import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HeartPulse,
  Banknote,
  House,
  GraduationCap,
  Smartphone,
  Plus,
  Trash2,
  FileText,
  CalendarClock,
  Bell,
  CheckCircle2,
  Circle,
  Timer,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
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

function upOverdue(dateMs: number) {
  return dateMs < Date.now();
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();

  const utils = trpc.useUtils();
  const { data: saved } = trpc.saved.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: tasks } = trpc.tasks.list.useQuery(undefined, { enabled: isAuthenticated });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const setStatus = trpc.tasks.setStatus.useMutation({
    onMutate: async ({ taskId, status }) => {
      await utils.tasks.list.cancel();
      const prev = utils.tasks.list.getData();
      utils.tasks.list.setData(undefined, (old: any) =>
        old?.map((t: any) => (t.id === taskId ? { ...t, status } : t))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.tasks.list.setData(undefined, ctx.prev);
      toast.error("Erreur lors de la mise à jour");
    },
    onSettled: () => utils.tasks.list.invalidate(),
  });
  const removeTask = trpc.tasks.remove.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const deadlines = useMemo(() => {
    const upcoming = (tasks ?? [])
      .filter((t: any) => t.deadlineAt)
      .sort((a: any, b: any) => (a.deadlineAt ?? 0) - (b.deadlineAt ?? 0));
    return {
      overdue: upcoming.filter((t: any) => t.deadlineAt && upOverdue(t.deadlineAt) && t.status !== "done"),
      soon: upcoming.filter((t: any) => t.deadlineAt && !upOverdue(t.deadlineAt) && t.status !== "done"),
    };
  }, [tasks]);

  const addTask = () => {
    if (newTitle.trim().length === 0) {
      toast.error("Donnez un titre à votre tâche.");
      return;
    }
    createTask.mutate({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      deadlineAt: newDeadline ? new Date(newDeadline).getTime() : undefined,
    });
    setNewTitle("");
    setNewDeadline("");
    setNewDescription("");
  };

  // Login gate
  if (!loading && !isAuthenticated) {
    return (
      <SiteLayout>
        <div className="container flex flex-col items-center py-24 text-center">
          <Bell className="h-10 w-10 text-muted-foreground/50" />
          <h1 className="mt-5 text-2xl font-semibold">Connectez-vous pour accéder à votre tableau de bord</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Votre tableau de bord garde vos démarches en cours, vos tâches et vos
            rappels de dates limites au même endroit.
          </p>
          <Button size="lg" className="mt-6" onClick={() => startLogin()}>
            Se connecter
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Bonjour {user?.name?.split(" ")[0] ?? "voyageur"},
            </h1>
            <p className="mt-2 text-muted-foreground">
              Voici vos démarches, vos tâches et vos rappels — votre copilote pour
              la suite de la semaine.
            </p>
          </div>
        </div>

        <Tabs defaultValue="procedures" className="mt-8">
          <TabsList>
            <TabsTrigger value="procedures">Mes démarches</TabsTrigger>
            <TabsTrigger value="tasks">Tâches & rappels</TabsTrigger>
            <TabsTrigger value="letters">Mes courriers</TabsTrigger>
          </TabsList>

          <TabsContent value="procedures" className="mt-6">
            {!saved || saved.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-muted-foreground/40" />
                <h3 className="mt-3 font-serif text-lg font-semibold">
                  Vous n'avez pas encore de démarche en cours
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Par où souhaite-t-on commencer ? Parcourez le catalogue et
                  sauvegardez les démarches qui vous intéressent — on suivra votre
                  progression ensemble.
                </p>
                <Button className="mt-5" asChild>
                  <Link href="/procedures">
                    Découvrir les démarches <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((s: any) => {
                  const p = PROCEDURES_BY_KEY[s.procedureKey];
                  if (!p) return null;
                  const Icon = CATEGORY_ICONS[p.category as ProcedureCategory];
                  const done = Array.isArray(s.completedSteps) ? s.completedSteps.length : 0;
                  const pct = Math.round((done / p.steps.length) * 100);
                  return (
                    <Link
                      key={s.id}
                      href={`/procedures/${s.procedureKey}`}
                      className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-primary">
                        <Icon className="h-4 w-4" />
                        {CATEGORY_LABELS[p.category]}
                      </div>
                      <h3 className="mt-2 font-serif text-lg font-semibold leading-snug">
                        {p.title}
                      </h3>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{done} / {p.steps.length} étapes</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="mt-2" />
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            {/* Deadline reminders */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="inline-flex items-center gap-2 font-serif text-base font-semibold text-destructive">
                  <Timer className="h-4 w-4" />
                  En retard ({deadlines.overdue.length})
                </h3>
                {deadlines.overdue.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Aucune tâche en retard — bravo !
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {deadlines.overdue.map((t: any) => (
                      <li key={t.id} className="flex items-center justify-between rounded-lg bg-destructive/[0.06] px-3 py-2 text-sm">
                        <span className="font-medium">{t.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(t.deadlineAt!).toLocaleDateString("fr-FR")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="inline-flex items-center gap-2 font-serif text-base font-semibold text-primary">
                  <CalendarClock className="h-4 w-4" />
                  À venir ({deadlines.soon.length})
                </h3>
                {deadlines.soon.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Aucune échéance à venir pour le moment.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {deadlines.soon.slice(0, 4).map((t: any) => (
                      <li key={t.id} className="flex items-center justify-between rounded-lg bg-accent/40 px-3 py-2 text-sm">
                        <span className="font-medium">{t.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(t.deadlineAt!).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Add task */}
            <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-serif text-base font-semibold">
                Ajouter une tâche ou un rappel
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
                <Input
                  placeholder="Titre (ex. : Résilier l'abonnement internet)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="bg-background"
                />
                <Input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="bg-background"
                />
                <Input
                  placeholder="Note (optionnel)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="bg-background"
                />
                <Button onClick={addTask} disabled={createTask.isPending}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Task list */}
            {!tasks || tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <Circle className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Pas de tâche pour le moment — une page blanche, c'est aussi du
                  temps libre. Ajoutez vos rendez-vous, échéances et rappels
                  ci-dessus pour ne rien oublier.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
                  >
                    <button
                      onClick={() => {
                        const next =
                          t.status === "todo"
                            ? "in_progress"
                            : t.status === "in_progress"
                              ? "done"
                              : "todo";
                        setStatus.mutate({ taskId: t.id, status: next });
                      }}
                      className="shrink-0"
                      aria-label="Changer le statut"
                    >
                      {t.status === "done" ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : t.status === "in_progress" ? (
                        <Timer className="h-5 w-5 text-accent-foreground" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}>
                        {t.title}
                      </div>
                      {t.description && (
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      )}
                    </div>
                    {t.deadlineAt && (
                      <span
                        className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:block ${
                          upOverdue(t.deadlineAt) && t.status !== "done"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {new Date(t.deadlineAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                    <span
                      className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium lg:block ${
                        t.status === "done"
                          ? "bg-primary/10 text-primary"
                          : t.status === "in_progress"
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.status === "done" ? "Terminée" : t.status === "in_progress" ? "En cours" : "À faire"}
                    </span>
                    <button
                      onClick={() => removeTask.mutate({ taskId: t.id })}
                      className="shrink-0 text-muted-foreground/60 transition-colors hover:text-destructive"
                      aria-label="Supprimer la tâche"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="letters" className="mt-6">
            <LettersTab />
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function LettersTab() {
  const utils = trpc.useUtils();
  const { data: history } = trpc.letters.list.useQuery(undefined, { refetchOnWindowFocus: false });

  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-9 w-9 text-muted-foreground/40" />
        <h3 className="mt-3 font-serif text-lg font-semibold">Votre boîte à lettres est encore vide</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Pas de souci : décrivez simplement votre situation dans le générateur de
          courriers, et votre première lettre apparaîtra ici, prête à envoyer.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/lettres">
            Créer un courrier <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const copy = async (text: string | null) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success("Lettre copiée dans le presse-papiers");
  };

  return (
    <div className="space-y-3">
      {history.map((l: any) => (
        <div key={l.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-base font-semibold">{l.title ?? l.letterType}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(l.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Button variant="outline" size="sm" className="bg-background" onClick={() => copy(l.content)}>
              <FileText className="mr-1 h-3.5 w-3.5" /> Copier la lettre
            </Button>
          </div>
          <p className="mt-3 max-h-28 overflow-y-auto rounded-lg bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
            {l.content}
          </p>
        </div>
      ))}
    </div>
  );
}
