import { useState } from "react";
import { ShieldCheck, MessageSquareText, Mail, FileSignature, CircleDot, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";

type ScamKind = "sms" | "email" | "contract" | "other";

const KINDS: Array<{ value: ScamKind; label: string; icon: typeof MessageSquareText; hint: string }> = [
  {
    value: "sms",
    label: "SMS suspect",
    icon: MessageSquareText,
    hint: "Un message urgent vous demandant de payer, de confirmer un colis ou vos identifiants ?",
  },
  {
    value: "email",
    label: "E-mail douteux",
    icon: Mail,
    hint: "Un e-mail de votre « banque » ou de Netflix vous demandant de mettre à jour vos informations ?",
  },
  {
    value: "contract",
    label: "Clause de contrat",
    icon: FileSignature,
    hint: "Une petite ligne dans un contrat ou des conditions d'utilisation qui vous semble étrange ?",
  },
  {
    value: "other",
    label: "Autre contenu",
    icon: CircleDot,
    hint: "Une offre trop belle, un appel bizarre, une annonce suspecte ?",
  },
];

const EXAMPLES: Record<ScamKind, string> = {
  sms: "URGENT : votre colis est bloqué à la douane. Payez 2,90 € de frais de dédouanement via ce lien http://colis-xxxx.xyz sous 24h sinon il sera détruit.",
  email: "Bonjour, votre compte sera suspendu demain. Cliquez ici pour confirmer vos coordonnées bancaires et éviter la fermeture : compte-securite@banque-verification.com",
  contract: "En cas de résiliation anticipée, le client s'engage à régler l'intégralité des mensualités restantes du contrat, majorées d'une indemnité de 45 % et d'une pénalité de rupture de 300 €, payable sous 8 jours.",
  other: "Félicitations ! Vous avez été sélectionné pour recevoir un iPhone 16 gratuit. Répondez avec votre adresse et vos coordonnées bancaires pour les frais de port de seulement 4,99 €.",
};

export default function Arnaques() {
  const [kind, setKind] = useState<ScamKind>("sms");
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);

  const analyzeMutation = trpc.scams.analyze.useMutation({
    onSuccess: (res) => {
      setAnalysis(res.analysis);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (content.trim().length < 10) {
      toast.error("Collez le contenu suspect (10 caractères minimum).");
      return;
    }
    analyzeMutation.mutate({ kind, content: content.trim() });
  };

  return (
    <SiteLayout>
      <section className="container py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Analyse propulsée par l'IA
            </div>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Détecteur d'arnaques
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Collez un SMS, un e-mail ou une clause de contrat qui vous met mal à
              l'aise : LifeCopilot analyse le contenu, repère les signaux d'alerte
              et vous explique exactement quoi faire. Gratuit et sans
              enregistrement de vos données personnelles.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {KINDS.map((k) => {
                const Icon = k.icon;
                const active = k.value === kind;
                return (
                  <button
                    key={k.value}
                    onClick={() => {
                      setKind(k.value);
                      setAnalysis(null);
                    }}
                    className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? "border-primary bg-primary/[0.05] shadow-sm"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-serif font-semibold">{k.label}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {k.hint}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium">
                Collez le contenu suspect
              </label>
              <Textarea
                placeholder={EXAMPLES[kind]}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-40 bg-card"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="h-12 px-8"
                  onClick={handleSubmit}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    "Analyse en cours…"
                  ) : (
                    <>
                      <ScanSearch className="mr-1.5 h-4 w-4" />
                      Analyser le contenu
                    </>
                  )}
                </Button>
                <button
                  onClick={() => {
                    setContent(EXAMPLES[kind]);
                    setAnalysis(null);
                  }}
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  Essayer un exemple type
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar — good reflexes */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-serif text-base font-semibold">
                Les 5 réflexes anti-arnaque
              </h3>
              <ol className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2.5">
                  <span className="font-serif font-semibold text-primary">1.</span>
                  Ne jamais cliquer sur un lien dans un message non sollicité.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-serif font-semibold text-primary">2.</span>
                  Aucune organisation sérieuse ne demande vos codes ou votre carte par SMS/e-mail.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-serif font-semibold text-primary">3.</span>
                  Se méfier de l'urgence : « sous 24h », « dernier avis », « compte bloqué ».
                </li>
                <li className="flex gap-2.5">
                  <span className="font-serif font-semibold text-primary">4.</span>
                  Vérifier l'expéditeur : adresse e-mail bizarre, numéro étranger, fautes d'orthographe.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-serif font-semibold text-primary">5.</span>
                  En cas de doute, contacter l'organisme par un canal officiel (site web tapé à la main, numéro du dos de la carte).
                </li>
              </ol>
            </div>
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-5">
              <p className="text-sm text-muted-foreground">
                Victime d'une fraude ? Contactez votre banque immédiatement et
                déposez plainte. En France, signalez sur{" "}
                <a
                  href="https://www.internet-signalement.gouv.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  internet-signalement.gouv.fr
                </a>
                .
              </p>
            </div>
          </aside>
        </div>

        {analysis && (
          <div className="mt-10">
            <h2 className="font-serif text-2xl font-semibold">Résultat de l'analyse</h2>
            <div className="prose prose-sm mt-4 max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Streamdown>{analysis}</Streamdown>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Cette analyse est informative et ne constitue pas un avis juridique.
              En cas de préjudice réel, consultez un professionnel.
            </p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
