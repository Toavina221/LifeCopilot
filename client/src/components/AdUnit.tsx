import { useEffect } from "react";

/**
 * Emplacements publicitaires Google AdSense.
 *
 * Le script AdSense est chargé dans `client/index.html` avec votre identifiant
 * de compte `ca-pub-7281717868974793`. Les blocs s'affichent dès maintenant ;
 * la valeur `VITE_ADSENSE_CLIENT` peut être définie dans les variables
 * d'environnement Vercel pour surcharger ce défaut si nécessaire.
 *
 * À faire après l'approbation AdSense :
 * 1. Créer des blocs d'annonces dans le dashboard AdSense et récupérer leurs
 *    identifiants `data-ad-slot`.
 * 2. Remplir AD_UNITS ci-dessous (actuellement "auto" : Google choisit
 *    automatiquement le format le plus adapté à chaque espace).
 * 3. Déployer.
 */
const AD_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined) ?? "ca-pub-7281717868974793";

export const AD_UNITS = {
  /** Bannière horizontale (leaderboard) — bas de page / entre sections */
  banner: "auto",
  /** Encart vertical (rectangle) — côté droit des pages procédures */
  sidebar: "auto",
} as const;

export type AdSlot = keyof typeof AD_UNITS;

let scriptInjected = false;

function ensureAdSenseScript() {
  if (!AD_CLIENT || typeof window === "undefined") return;
  if (scriptInjected) return;
  // Le script est déjà chargé via `client/index.html` (compte ca-pub),
  // ou injecté une première fois par un autre composant.
  if (
    document.head.querySelector('script[src*="googlesyndication.com"]') ||
    document.querySelector('script[data-adclient="googlesyndication"]')
  ) {
    scriptInjected = true;
    return;
  }
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(AD_CLIENT);
  script.setAttribute("data-adclient", "googlesyndication");
  document.head.appendChild(script);
  scriptInjected = true;
}

/**
 * Bloc d'annonce : affiche un espace réservé élégant tant qu'AdSense n'est pas
 * configuré, puis le véritable bloc Google une fois `VITE_ADSENSE_CLIENT`
 * rempli.
 */
export function AdUnit({
  slot = "banner",
  className = "",
}: {
  slot?: AdSlot;
  className?: string;
}) {
  useEffect(() => {
    if (!AD_CLIENT) return;
    ensureAdSenseScript();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* ignore duplicate push */
    }
  }, [slot]);

  if (!AD_CLIENT) {
    return null; // invisible tant qu'aucun identifiant AdSense n'est fourni
  }

  return (
    <div className={`w-full ${className}`} aria-label="Publicité">
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_UNITS[slot] === "auto" ? undefined : AD_UNITS[slot]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
