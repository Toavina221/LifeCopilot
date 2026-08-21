import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { Input } from "@/components/ui/input";
import {
  HeartPulse,
  Banknote,
  House,
  GraduationCap,
  Smartphone,
  Search,
  Clock,
  ArrowRight,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import {
  PROCEDURES,
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

const ALL: ProcedureCategory[] = ["health", "finance", "housing", "school", "digital"];

export default function Procedures() {
  const search = useSearch();
  const initialCat =
    (new URLSearchParams(search).get("cat") as ProcedureCategory | null) ?? null;
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<ProcedureCategory | "all">(
    initialCat ?? "all"
  );

  const filtered = useMemo(() => {
    return PROCEDURES.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          CATEGORY_LABELS[p.category].toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, cat]);

  return (
    <SiteLayout>
      <section className="container py-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Le catalogue des démarches
          </h1>
          <p className="mt-3 text-muted-foreground">
            {PROCEDURES.length} démarches guidées pas à pas, de la prise de
            rendez-vous médical à la sécurisation de vos comptes. Choisissez-en
            une et laissez LifeCopilot vous guider.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une démarche…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pl-9 bg-card"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCat("all")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                cat === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Tout
            </button>
            {ALL.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    cat === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {CATEGORY_LABELS[c]}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              Aucune démarche ne correspond à « {query} ». Essayez un autre terme.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const Icon = CATEGORY_ICONS[p.category];
              return (
                <Link
                  key={p.key}
                  href={`/procedures/${p.key}`}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-primary">
                      <Icon className="h-4 w-4" />
                      {CATEGORY_LABELS[p.category]}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h2 className="mt-2.5 font-serif text-lg font-semibold leading-snug">
                    {p.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {p.summary}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {p.duration}
                    </span>
                    <span>{p.cost}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
