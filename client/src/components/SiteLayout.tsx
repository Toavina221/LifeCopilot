import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Compass, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdUnit } from "@/components/AdUnit";
import { startLogin } from "@/lib/useAuth";
import { CONTACT_EMAIL } from "@/components/LegalPage";

const NAV_ITEMS = [
  { href: "/procedures", label: "Démarches" },
  { href: "/assistant", label: "Assistant IA" },
  { href: "/lettres", label: "Courriers" },
  { href: "/arnaques", label: "Anti-arnaque" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Compass className="h-5 w-5" />
      </span>
      <span className="font-serif text-xl font-semibold tracking-tight">
        LifeCopilot
      </span>
    </Link>
  );
}

export function SiteNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                location === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" asChild>
                <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                  Tableau de bord
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {user?.name
                          ? user.name
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "LC"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="font-medium">{user?.name ?? "Utilisateur"}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {user?.email ?? ""}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Tableau de bord</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profil">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" onClick={() => startLogin()} className="hidden sm:inline-flex">
              Se connecter
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border/70 bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  location === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Button
                size="sm"
                className="mt-1"
                onClick={() => {
                  setOpen(false);
                  startLogin();
                }}
              >
                Se connecter
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-card">
      <div className="container py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Compass className="h-4 w-4" />
              </span>
              <span className="font-serif text-lg font-semibold">LifeCopilot</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              L'assistant qui vous accompagne, pas à pas, dans toutes les démarches
              de la vie quotidienne. Pour tous les âges.
            </p>
          </div>
          <div className="flex gap-10">
            <div>
              <h4 className="mb-3 text-sm font-semibold">Découvrir</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/procedures" className="hover:text-foreground transition-colors">Démarches guidées</Link></li>
                <li><Link href="/assistant" className="hover:text-foreground transition-colors">Assistant IA</Link></li>
                <li><Link href="/lettres" className="hover:text-foreground transition-colors">Générateur de courriers</Link></li>
                <li><Link href="/arnaques" className="hover:text-foreground transition-colors">Détecteur d'arnaques</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Compte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Tableau de bord</Link></li>
                <li><Link href="/profil" className="hover:text-foreground transition-colors">Mon profil</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link></li>
                <li><Link href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
                <li><Link href="/cgu" className="hover:text-foreground transition-colors">CGU</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border/70 pt-6 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} LifeCopilot. Conçu pour rendre la vie administrative plus simple pour tous.
            {' · '}Contact : <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">{CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <AdUnit slot="banner" className="container mt-10" />
      <SiteFooter />
    </div>
  );
}
