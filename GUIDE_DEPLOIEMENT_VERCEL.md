# LifeCopilot — Guide de déploiement sur Vercel

Ce projet est entièrement adapté pour Vercel : frontend Vite (servi par le CDN Vercel), backend API serverless (fonction Node 22 via `api/index.mjs`), authentification Clerk, base de données MySQL/TiDB, et IA gratuite (Gemini → OpenRouter).

## 1. Prérequis

Un compte gratuit sur [vercel.com](https://vercel.com) et un compte gratuit sur [clerk.com](https://clerk.com) (déjà créé : application LifeCopilot).

## 2. Déployer sur Vercel

1. Décompressez le ZIP dans un dossier (ex. `LifeCopilot`).
2. Dans le dashboard Vercel : **Add New → Project → Import Third-Party Git Repository** → choisissez **Upload** (glissez le dossier décompressé, ou uploadez le ZIP tel quel).
3. Vercel détecte automatiquement :
   - Framework : `Vite`
   - Root Directory : `./`
   - Build Command : `npm run build`
   - Output Directory : `dist/public`
4. Ajoutez les **variables d'environnement** (section "Environment Variables", cliquez sur "Add" pour chaque ligne ci-dessous).
5. Cliquez sur **Deploy**.

## 3. Variables d'environnement (à remplir dans Vercel)

| Variable | Valeur | Rôle |
|---|---|---|
| `CLERK_PUBLISHABLE_KEY` | `pk_test_c2V0dGxlZC1lZWwtNTM2MC5jbGVyay5hY2NvdW50cy5kZXYk` | Clé publique Clerk (déjà intégrée, à remplacer par la clé production `pk_live_...` plus tard) |
| `CLERK_SECRET_KEY` | `sk_test_RIrhWNCRTaU0OQDzWtcHxsk7C4jEPVvoKLVDvuxz28` | Clé secrète Clerk (déjà intégrée, à remplacer par `sk_live_...` plus tard) |
| `GEMINI_API_KEY` | Votre clé Google AI Studio | Assistant IA — fournisseur principal (gratuit) |
| `OPENROUTER_API_KEY` | Votre clé OpenRouter (`AQ.Ab8RN6JX...`) | Fallback IA automatique quand Gemini est saturé |
| `DATABASE_URL` | Votre chaîne MySQL/TiDB | Base de données (utilisez votre base actuelle, ou créez-en une gratuite : TiDB Cloud, PlanetScale, Neon) |
| `JWT_SECRET` | Une chaîne aléatoire (ex. `openssl rand -hex 32`) | Signature des sessions |
| `VITE_ADSENSE_CLIENT` | `ca-pub-XXXXXXXXXXXXXXXX` (après approbation AdSense) | Publicités — laisser vide tant qu'AdSense n'est pas approuvé |

> **Important — base de données** : votre site actuel utilise la base TiDB de la plateforme Manus. Elle n'est pas accessible depuis Vercel. Créez une base MySQL gratuite (TiDB Cloud a un tier gratuit : [tidbcloud.com](https://tidbcloud.com), ou [planetscale.com](https://planetscale.com)). Créez le schéma avec la commande `npm run db:push` après l'installation (`pnpm install` puis `npx drizzle-kit generate`).

> **Important — Clerk production** : les clés `pk_test_` / `sk_test_` fonctionnent, mais il faudra passer aux clés `pk_live_` / `sk_live_` dans le dashboard Clerk (bouton en haut à droite : basculer l'environnement de "Development" à "Production") une fois le site en ligne, sinon les sessions ne seront pas valides pour vos visiteurs.

## 4. Activer les publicités AdSense

Les emplacements publicitaires sont déjà dans le code (bannière en bas de chaque page + encart dans les pages de démarches). Ils restent invisibles tant que `VITE_ADSENSE_CLIENT` est vide.

1. Mettez votre site en ligne sur Vercel et visitez-le quelques jours (AdSense exige un site actif avec du contenu).
2. Créez un compte sur [adsense.google.com](https://adsense.google.com) et soumettez votre site pour approbation.
3. Une fois approuvé, AdSense vous donne un identifiant de publication : `ca-pub-XXXXXXXXXXXXXXXX`.
4. Dans Vercel : Settings → Environment Variables → ajoutez `VITE_ADSENSE_CLIENT = ca-pub-XXXXXXXXXXXXXXXX`, puis redéployez (Vercel redéploie automatiquement).
5. (Optionnel) Créez des blocs d'annonces dans AdSense et remplacez les identifiants par défaut dans `client/src/components/AdUnit.tsx` (`AD_UNITS.banner` et `AD_UNITS.sidebar`) par vos vrais `data-ad-slot`.

## 5. Tests locaux (facultatif)

```bash
pnpm install
pnpm dev          # serveur de développement
npm run build     # build Vercel (client + API)
pnpm test         # 28 tests backend
```

## 6. Structure adaptée Vercel

| Fichier | Rôle |
|---|---|
| `vercel.json` | Configuration Vercel : rewrites `/api/*` → fonction serverless, SPA fallback |
| `api/index.mjs` | Point d'entrée de la fonction serverless (importe le bundle) |
| `scripts/build-api.mjs` | Bundle esbuild de l'API (produit `dist/api/index.mjs`) |
| `server/app.ts` | App Express partagée (tRPC, routes) |
| `server/vercel.ts` | Handler serverless (`serverless-http`) pour Vercel |
| `server/auth/clerk.ts` | Authentification Clerk (remplace Manus OAuth) |
| `client/src/components/AdUnit.tsx` | Composant publicitaire AdSense |
