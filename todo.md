# LifeCopilot — TODO

## Fondations
- [x] Schéma de base de données (users enrichis ageGroup/country, saved procedures, tasks in progress, letters, reminders)
- [x] Migration SQL appliquée
- [x] Design system global (typographie, palette premium, index.css)

## Fonctionnalités
- [x] Landing page publique : proposition de valeur + 4 entrées par tranche d'âge (junior/teen/adult/senior) + CTA de connexion
- [x] Catalogue de 25 démarches guidées (santé, finances, logement, école, numérique) avec recherche
- [x] Parcours interactif pas à pas pour chaque démarche (étapes, documents, pièges)
- [x] Assistant IA 4 modes (junior, teen, adult, senior) via LLM intégré, ton adapté
- [x] Générateur de courriers IA : annulation, réclamation, demande de remboursement, demande administrative
- [x] Détecteur d'arnaques IA : analyse SMS/email/clause contractuelle
- [x] Tableau de bord utilisateur : démarches sauvegardées, tâches en cours, historique de documents, rappels d'échéances (dérivés des deadlines des tâches côté Dashboard)
- [x] Profil utilisateur : nom, tranche d'âge, pays
- [x] Authentification Manus OAuth uniquement, session persistante

## Qualité
- [x] Navigation cohérente dans toute l'app, logo/nom LifeCopilot partout
- [x] Tests vitest du backend (28 tests passent, dont validation des clés Clerk)
- [x] Vérification visuelle de toutes les pages (desktop + mobile) et revue de style
- [x] TypeScript sans erreur, `pnpm check` propre
- [x] Captures /dashboard, /lettres, /profil (desktop + mobile) — toutes les pages rendent correctement ; correction mobile de la ligne Compte/Email dans le profil (troncation)
- [x] Checkpoint final (version 515a486a)

## Pages légales (demande utilisateur)
- [x] Page Mentions légales (avec email helpscannerapk@gmail.com)
- [x] Page Politique de confidentialité
- [x] Page CGU
- [x] Liens vers les pages légales dans le footer + routes ajoutées dans App.tsx
- [x] Vérification visuelle (desktop + mobile) + 25 tests passent + TypeScript propre
- [x] Checkpoint et livraison (version ff831926)

## Retours revue utilisateur
- [x] Bouton « Rédiger ma lettre » → « Générer mon courrier » (Letters.tsx)
- [x] Dashboard : messages d'état vide plus engageants (démarches, tâches, courriers)
- [x] Harmoniser tranche Enfant : landing déjà 8-12 ans (cohérente avec l'assistant) — aucun correctif nécessaire
- [x] Email de contact : taylorethan579te@gmail.com partout (footer + pages légales), centralisé dans CONTACT_EMAIL (client/src/components/LegalPage.tsx) — un seul endroit à modifier plus tard
- [x] Vérifications : 25 tests passent, TypeScript propre, captures dashboard + lettres OK

## Migration vers services gratuits indépendants de Manus
- [x] Analyse de faisabilité : auth alternative gratuite + API LLM indépendante (OpenRouter + Google AI Studio)
- [x] Clé Google AI Studio (GEMINI_API_KEY) fournie par l'utilisateur, stockée en secret — OpenRouter écarté sur demande de l'utilisateur (« ça ne marche pas, on passe à Google AI »)
- [x] server/gemini.ts : client Gemini (gemini-flash-latest) + throttler global (1 req/4 s) + retry 429/503 avec backoff
- [x] routers.ts : aiChat() priorité Gemini → OpenRouter → fallback Manus
- [x] Tests vitest adaptés : it.sequential + timeouts allongés + test d'intégration clé Gemini — en cours de validation
- [x] Validation de bout en bout : 26/26 tests passent, tsc propre, devserver sain, UI vérifiée (landing + assistant). Quota free-tier Google durablement en 429 — circuit breaker (15 min après 4 échecs 429) implémenté dans gemini.ts ; bascule automatique vers le fallback Manus pendant la saturation, sans interruption de service
- [ ] Évaluer la migration d'authentification (Clerk/Supabase Auth) — en attente de décision utilisateur (option A garder Manus OAuth / option B)
- [x] Tester en conditions réelles le fallback Gemini → Manus sur les 3 usages IA (assistant, courriers, anti-arnaque) pendant la saturation 429 — validé par appels tRPC réels (chat 200 OK, letters 200 OK, scams 200 OK) pendant le 429 Google
- [x] Vérification UI des pages courriers et anti-arnaque après activation du fallback (captures OK, aucun bug remonté)
- [x] Corrections fallback : lecture JSON unique après réponse OK ("Body already read"), pas de retry local après 429 (bascule immédiate), gestion du message "Gemini request failed" dans aiChat
- [x] Checkpoint final et livraison

## Migration vers hébergement Vercel (demande utilisateur)
- [x] Export du code complet vers GitHub (Toavina221/LifeCopilot) — dépôt déjà à jour (commit 27c9fbe = checkpoint final)
- [x] Adapter le backend pour Vercel : serverless functions / API routes — stratégie serverless-http + fetch adapter tRPC ; auth Manus OAuth → Clerk (clés reçues et validées) ; chaîne IA Gemini → OpenRouter (fallback Manus retiré hors plateforme)
- [x] Configurer vercel.json et compatibilité build Vite + server (api/index.mjs + scripts/build-api.mjs)
- [x] Tester le build Vercel localement (client + bundle API + handler testé)
- [x] Pousser la version finale vers GitHub — bloqué (token GitHub de la session en lecture seule, 403 confirmé) → livraison par ZIP `LifeCopilot-Vercel.zip` (option 2 confirmée par l'utilisateur), dépôt GitHub inchangé
- [x] Instructions de déploiement + variables d'environnement pour l'utilisateur (livré avec le ZIP)
- [x] Emplacements AdSense : bannière bas de page (SiteLayout) + encart procédures (ProcedureDetail)
- [x] Script AdSense officiel ca-pub-7281717868974793 intégré dans client/index.html
- [x] AdUnit activé avec client réel par défaut, slots en mode « auto », double chargement du script évité
- [x] Nouvelle livraison ZIP Vercel avec l'intégration AdSense (version e3f8ad69)
- [x] Build final OK (client + API bundle), tsc propre, 28 tests passent
- [x] Configurer la base TiDB Cloud de l'utilisateur (cluster lifecopilot, Frankfurt) : test connexion + création du schéma (script setup-tidb.mjs)
- [x] Adapter le projet : parsing `?ssl=true` dans DATABASE_URL + pool mysql2 TLS-safe pour Vercel serverless (server/db.ts)
- [x] Livrer les instructions TiDB à l'utilisateur (DATABASE_URL avec /lifecopilot?ssl=true, schéma appliqué, guide GUIDE_DEPLOIEMENT_VERCEL.md)

## Correctif bug assistant IA en production Vercel (rapporté : « is not valid JSON »)
- [x] Diagnostic : 500 FUNCTION_INVOCATION_FAILED sur toutes les routes API en prod — import `dotenv/config` absent du bundle esbuild crashait la fonction
- [x] Correctif : import dotenv retiré de server/_core/index.ts ; transformer superjson retiré des deux côtés (incompatibilité v1 serveur / format v2 client → input zod = undefined → 400) ; client main.tsx : httpLink sans superjson ; useAuth legacy rehydrate les dates string en Date
- [x] Vérifications : 28 tests vitest passent ; build client + bundle API OK ; invocation du bundle testée (erreur IA proprement formatée en français) ; screenshots /, /assistant, /procedures, /lettres, /arnaques OK
- [x] Sitemap.xml (33 URLs) + fichier de vérification Search Console dans client/public
- [x] Livraison ZIP Vercel avec correctif serverless + sitemap + fichier Google (LifeCopilot-Vercel.zip, checkpoint 5dbf1d07)
- [x] Correctif crash boot Vercel (OAuth Manus) : initialisation de l'OAuth Manus désactivée par défaut dans server/_core/index.ts, context.ts et sdk.ts si la variable OAUTH_SERVER_URL est absente. Le boot serverless réussit désormais sans cette variable.
- [x] Correctif final export serverless Vercel : `api/index.mjs` utilise désormais `export default handler` au lieu d'un export nommé, résolvant l'erreur « Exportation invalide trouvée dans le module ».
- [x] Livraison ZIP Vercel final corrigé (LifeCopilot-Vercel.zip, version 07:20)
- [x] Diagnostic TiDB : timeout de 5s ajouté à la connexion, logs de succès/erreur détaillés dans server/db.ts pour résoudre le 504 Vercel.
- [x] Livraison ZIP Vercel avec diagnostics (LifeCopilot-Vercel.zip, version 07:30)

## Restant côté utilisateur (pas de code)
- [ ] Évaluer la migration d'authentification Clerk en production complète (l'utilisateur passe lui-même les clés Clerk en Production)
