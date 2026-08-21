import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Baby, GraduationCap, User, Armchair } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/lib/useAuth";

const AGE_OPTIONS = [
  { value: "junior", label: "Enfant (8–12 ans)", icon: Baby },
  { value: "teen", label: "Ado (13–19 ans)", icon: GraduationCap },
  { value: "adult", label: "Adulte (20–59 ans)", icon: User },
  { value: "senior", label: "Senior (60 ans et +)", icon: Armchair },
];

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: profile, isLoading } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<string>("adult");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAgeGroup(profile.ageGroup ?? "adult");
      setCountry(profile.country ?? "");
    }
  }, [profile]);

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.profile.get.invalidate();
      toast.success("Profil mis à jour. L'assistant adaptera son langage.");
    },
    onError: (e) => toast.error(e.message),
  });

  const save = () => {
    updateMutation.mutate({
      name: name.trim() || undefined,
      ageGroup: ageGroup as "junior" | "teen" | "adult" | "senior",
      country: country.trim() || undefined,
    });
  };

  if (!loading && !isAuthenticated) {
    return (
      <SiteLayout>
        <div className="container flex flex-col items-center py-24 text-center">
          <h1 className="mt-5 text-2xl font-semibold">Connectez-vous pour gérer votre profil</h1>
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
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">Mon profil</h1>
          <p className="mt-3 text-muted-foreground">
            Indiquez votre tranche d'âge et votre pays : l'assistant
            LifeCopilot adaptera automatiquement son langage, et les démarches
            pertinentes pour votre pays seront mises en avant.
          </p>
        </div>

        <div className="mt-8 max-w-xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Votre prénom</label>
            <Input
              placeholder="Marie"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Tranche d'âge</label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGE_OPTIONS.map((o) => {
                  const Icon = o.icon;
                  return (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {o.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              Ce réglage influence le ton de l'assistant IA et l'affichage de
              l'interface.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Pays</label>
            <Input
              placeholder="France"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="border-t border-border pt-5 text-sm text-muted-foreground">
            <div className="flex justify-between gap-4">
              <span className="shrink-0">Compte</span>
              <span className="min-w-0 truncate text-right font-medium text-foreground">{user?.email ?? "—"}</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={save}
            disabled={updateMutation.isPending || isLoading}
          >
            {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
