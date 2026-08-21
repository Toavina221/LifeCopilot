import { useState } from "react";
import { FileText, Send, Copy, Check, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";

type LetterType = "cancellation" | "complaint" | "reimbursement" | "admin_request";

const LETTER_TYPES: Array<{ value: LetterType; label: string; icon: typeof FileText; example: string }> = [
  {
    value: "cancellation",
    label: "Résiliation / Annulation",
    icon: CalendarDays,
    example: "Je souhaite résilier mon abonnement à une salle de sport dont le contrat arrive à échéance, ou annuler un service auquel je me suis abonné en ligne.",
  },
  {
    value: "complaint",
    label: "Réclamation",
    icon: FileText,
    example: "J'ai reçu un colis endommagé, une facture erronée, ou un service non conforme à ce qui a été promis, et je souhaite réclamer.",
  },
  {
    value: "reimbursement",
    label: "Demande de remboursement",
    icon: FileText,
    example: "J'ai avancé des frais de santé ou acheté un produit défectueux, et je souhaite obtenir le remboursement des sommes engagées.",
  },
  {
    value: "admin_request",
    label: "Courrier administratif",
    icon: FileText,
    example: "Je dois faire une demande à une administration, obtenir un document officiel ou signaler un changement de situation.",
  },
];

export default function Letters() {
  const [letterType, setLetterType] = useState<LetterType>("cancellation");
  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [situation, setSituation] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const utils = trpc.useUtils();
  const { data: history } = trpc.letters.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const generateMutation = trpc.letters.generate.useMutation({
    onSuccess: (res) => {
      setGenerated(res.content);
      utils.letters.list.invalidate();
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    },
    onError: (e) => toast.error(e.message),
  });

  const currentType = LETTER_TYPES.find((t) => t.value === letterType)!;

  const copyToClipboard = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    toast.success("Lettre copiée dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (situation.trim().length < 10) {
      toast.error("Décrivez votre situation plus en détail (10 caractères minimum).");
      return;
    }
    generateMutation.mutate({
      letterType,
      situation: situation.trim(),
      senderName: senderName.trim() || undefined,
      senderAddress: senderAddress.trim() || undefined,
      recipient: recipient.trim() || undefined,
      extraDetails: extraDetails.trim() || undefined,
    });
  };

  const loadHistory = (letter: NonNullable<typeof history>[number]) => {
    setLetterType(letter.letterType as LetterType);
    setGenerated(letter.content);
    toast.success("Courrier chargé depuis votre historique");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SiteLayout>
      <section className="container py-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Générateur de courriers
          </h1>
          <p className="mt-3 text-muted-foreground">
            Décrivez votre situation en quelques phrases et l'IA rédige une lettre
            formelle, prête à envoyer. Vos courriers générés sont sauvegardés dans
            votre historique lorsque vous êtes connecté.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <div>
            <h2 className="font-serif text-xl font-semibold">
              1. Choisissez le type de courrier
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {LETTER_TYPES.map((t) => {
                const Icon = t.icon;
                const active = t.value === letterType;
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      setLetterType(t.value);
                      setGenerated(null);
                    }}
                    className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? "border-primary bg-primary/[0.05] shadow-sm"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-serif font-semibold">{t.label}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {t.example}
                    </p>
                  </button>
                );
              })}
            </div>

            <h2 className="mt-8 font-serif text-xl font-semibold">
              2. Décrivez votre situation
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Votre nom (optionnel)</label>
                  <Input
                    placeholder="Marie Dupont"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Votre adresse (optionnel)</label>
                  <Input
                    placeholder="12 rue des Lilas, 75000 Paris"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Destinataire (optionnel)</label>
                  <Input
                    placeholder="Service client — Salle Fitness Plus"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-card"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Votre situation <span className="text-muted-foreground">(requis)</span>
                  </label>
                  <Textarea
                    placeholder="Ex. : je souhaite résilier mon abonnement à la salle de sport 'Fitness Plus' (contrat n° 12345) dont l'échéance annuelle arrive le 30 septembre. J'avais déjà envoyé un e-mail sans réponse."
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    className="min-h-36 bg-card"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Détails supplémentaires (optionnel)</label>
                  <Textarea
                    placeholder="Numéros de contrat, dates, montants, noms de conseillers…"
                    value={extraDetails}
                    onChange={(e) => setExtraDetails(e.target.value)}
                    className="min-h-20 bg-card"
                  />
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-6 h-12 px-8"
              onClick={handleSubmit}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>Génération en cours…</>
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  Générer mon courrier
                </>
              )}
            </Button>
          </div>

          {/* Result / history */}
          <aside className="space-y-4">
            {generated ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-20">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-semibold">Votre lettre</h3>
                  <Button variant="outline" size="sm" className="bg-background" onClick={copyToClipboard}>
                    {copied ? (
                      <>
                        <Check className="mr-1 h-3.5 w-3.5" /> Copié
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3.5 w-3.5" /> Copier
                      </>
                    )}
                  </Button>
                </div>
                <div className="prose prose-sm mt-4 max-h-[520px] overflow-y-auto rounded-xl bg-secondary/40 p-4">
                  <Streamdown>{generated}</Streamdown>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Relisez la lettre et complétez les éléments entre crochets avant
                  de l'envoyer (en recommandé avec accusé de réception de
                  préférence).
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Votre lettre apparaîtra ici une fois rédigée.
                </p>
              </div>
            )}

            {history && history.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-serif text-base font-semibold">
                  Historique ({history.length})
                </h3>
                <ul className="mt-3 space-y-2">
                  {history.slice(0, 8).map((l: any) => (
                    <li key={l.id}>
                      <button
                        onClick={() => loadHistory(l)}
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                      >
                        <div className="font-medium">{l.title ?? l.letterType}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(l.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
