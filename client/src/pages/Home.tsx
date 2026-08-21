import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  Banknote,
  House,
  GraduationCap,
  Smartphone,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Baby,
  GraduationCap as TeenCap,
  User,
  Armchair,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { startLogin } from "@/lib/useAuth";
import { CATEGORY_LABELS, PROCEDURES, type ProcedureCategory } from "@shared/procedures";

const AGE_GROUPS = [
  {
    key: "junior",
    label: "Enfant",
    age: "8–12 ans",
    icon: Baby,
    color: "junior",
    description:
      "Découvrir l'argent de poche, naviguer sur internet en sécurité et préparer ses premières responsabilités.",
    href: "/assistant?mode=junior",
  },
  {
    key: "teen",
    label: "Ado",
    age: "13–19 ans",
    icon: TeenCap,
    color: "teen",
    description:
      "Première carte bancaire, premiers papiers, premiers contrats : entame la vie d'adulte en confiance.",
    href: "/assistant?mode=teen",
  },
  {
    key: "adult",
    label: "Adulte",
    age: "20–59 ans",
    icon: User,
    color: "adult",
    description:
      "Finances, logement, école des enfants, santé : garde le cap quand la vie administrative s'accumule.",
    href: "/assistant?mode=adult",
  },
  {
    key: "senior",
    label: "Senior",
    age: "60 ans et +",
    icon: Armchair,
    color: "senior",
    description:
      "Retraite, télémédecine, démarches numériques : reste autonome et protégé des arnaques.",
    href: "/assistant?mode=senior",
  },
] as const;

const CATEGORIES: Array<{ key: ProcedureCategory; icon: typeof HeartPulse }> = [
  { key: "health", icon: HeartPulse },
  { key: "finance", icon: Banknote },
  { key: "housing", icon: House },
  { key: "school", icon: GraduationCap },
  { key: "digital", icon: Smartphone },
];

const FEATURED = PROCEDURES.slice(0, 6);

export default function Home() {
  return (
    <SiteLayout>
      {/* Hero — asymmetric, textured */}
      <section className="texture-paper relative overflow-hidden">
        <div className="container grid gap-10 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Pour tous les âges, partout dans le monde
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Toutes les démarches de la vie,
              <span className="text-primary"> expliquées pas à pas.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              LifeCopilot vous prend par la main pour traverser chaque démarche
              administrative, financière, scolaire ou numérique — avec un assistant
              IA qui parle votre langage, quel que soit votre âge.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-12 px-6 text-base" onClick={() => startLogin()}>
                Commencer gratuitement
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base bg-card"
                asChild
              >
                <Link href="/procedures">Explorer les démarches</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {PROCEDURES.length} démarches guidées · 4 modes par âge · Sans engagement
            </p>
          </div>

          {/* Age entry cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {AGE_GROUPS.map((g, i) => {
              const Icon = g.icon;
              return (
                <Link
                  key={g.key}
                  href={g.href}
                  className={`fade-up group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    i % 2 === 1 ? "translate-y-4" : ""
                  }`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/5"
                    style={{ backgroundColor: `color-mix(in oklch, var(--${g.color}) 12%, transparent)`, color: `var(--${g.color})` }}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <h3 className="mt-3.5 font-serif text-lg font-semibold">
                    {g.label}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground">{g.age}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {g.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Parler à l'assistant <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value propositions */}
      <section className="container py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Un ton adapté à chaque âge",
              text: "L'assistant IA reformule tout selon que vous avez 10 ou 80 ans : phrases simples et illustrées pour les enfants, langage direct pour les adultes, gros caractères et anti-arnaque pour les seniors.",
            },
            {
              icon: FileText,
              title: "Courriers rédigés en 30 secondes",
              text: "Résilier un abonnement, réclamer un remboursement, demander une aide : décrivez votre situation et recevez une lettre formelle prête à envoyer.",
            },
            {
              icon: ShieldCheck,
              title: "Vigilance anti-arnaque",
              text: "Collez un SMS suspect, un e-mail ou une clause de contrat : l'IA repère les signaux d'alerte et vous explique quoi faire.",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="fade-up rounded-2xl border border-border bg-card p-6 shadow-sm"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories strip */}
      <section className="border-y border-border/70 bg-secondary/50">
        <div className="container py-12">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const count = PROCEDURES.filter((p) => p.category === c.key).length;
              return (
                <Link
                  key={c.key}
                  href={`/procedures?cat=${c.key}`}
                  className="flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {CATEGORY_LABELS[c.key]}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured procedures */}
      <section className="container py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Démarches populaires</h2>
            <p className="mt-2 text-muted-foreground">
              Les démarches les plus demandées, prêtes à être accomplies pas à pas.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/procedures">
              Voir les {PROCEDURES.length} démarches <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((p, i) => (
            <Link
              key={p.key}
              href={`/procedures/${p.key}`}
              className="fade-up group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-xs font-medium text-primary">
                {CATEGORY_LABELS[p.category]}
              </span>
              <h3 className="mt-1.5 font-serif text-lg font-semibold leading-snug">
                {p.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {p.summary}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{p.duration}</span>
                <span>{p.cost}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground shadow-lg">
          <div className="texture-paper absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
              La prochaine démarche qui vous fait peur ?
              <br />
              Accomplissez-la ensemble.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80">
              Créez votre compte en quelques secondes et accédez à votre tableau de
              bord, vos démarches sauvegardées et votre assistant personnel.
            </p>
            <Button
              size="lg"
              className="mt-7 h-12 bg-card text-primary hover:bg-card/90"
              onClick={() => startLogin()}
            >
              Créer mon compte gratuit
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
