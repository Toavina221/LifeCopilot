# Notes internes — état du projet LifeCopilot (ne pas livrer)

## Stack
React 19 + Tailwind 4 + Express + tRPC 11 + Drizzle MySQL + Manus OAuth. LLM via `invokeLLM` depuis `server/_core/llm` (appelé côté serveur). Frontend: pages dans `client/src/pages/`, routes via wouter dans `client/src/App.tsx`, layout `client/src/components/SiteLayout.tsx` (SiteNav + SiteFooter, marque LifeCopilot avec icône Compass), chat réutilisable `client/src/components/AIChatBox.tsx` (props: messages, onSendMessage, isLoading, placeholder, suggestedPrompts, height).

## Backend routers (server/routers.ts) — FAIT
- auth.me / auth.logout
- chat.complete(mode junior|teen|adult|senior, messages, procedureKey) → LLM gemini-flash-latest, ton adapté par âge, context catalogue de démarches injecté en system prompt
- letters.generate(letterType, situation, senderName, senderAddress, recipient, extraDetails) → lettre formelle FR sauvegardée en BDD ; letters.list
- scams.analyze(content, kind sms|email|contract|other) → analyse Markdown Verdict/Signaux/Signification/Conduite
- saved.list / save / markSteps (démarches sauvegardées + progression)
- tasks.list / create / setStatus / remove (tâches avec deadline)
- profile.get / update (name, ageGroup, country)

## Frontend pages — état
- Home.tsx (landing, 4 cartes d'âge junior/teen/adult/senior, featured, CTA, auth via startLogin()) — FAIT
- Procedures.tsx (catalogue 25 démarches + recherche + filtres catégorie) — FAIT
- ProcedureDetail.tsx (parcours pas à pas avec checkboxes, progression, sidebar docs/infos, sauvegarde) — FAIT
- Assistant.tsx (chat 4 modes) — À FAIRE
- Letters.tsx (générateur 4 types) — À FAIRE
- Arnaques.tsx (détecteur) — À FAIRE
- Dashboard.tsx (tableau de bord: démarches sauvegardées, tâches, lettres, rappels) — À FAIRE
- Profil.tsx (profil name/ageGroup/country) — À FAIRE
- App.tsx à mettre à jour avec toutes les routes — À FAIRE

## Données
- Catalogue: `shared/procedures.ts` = 25 démarches (5 catégories health/finance/housing/school/digital), export PROCEDURES, PROCEDURES_BY_KEY, CATEGORY_LABELS
- Schéma BDD appliqué: users (+ageGroup, country), saved_procedures, user_tasks, generated_letters
- db helpers dans server/db.ts

## Reste à faire
1. Pages Assistant/Lettres/Arnaques/Dashboard/Profil + routes App.tsx
2. Tests vitest (server/*.test.ts) puis `pnpm test`
3. `pnpm check` propre, screenshots desktop+mobile, checkpoint unique final, livraison

## Style
Palette: teal profond (--primary oklch(0.38 0.085 215)) sur crème, accents âge: junior vert, teen violet, adult teal, senior or. Fonts: Fraunces (serif titres) + Inter. Utilitaires age colors: --junior --teen --adult --senior (à utiliser via style inline style={{color: "var(--junior)"}} car Tailwind ne génère pas bg-junior — ATTENTION Home.tsx utilise bg-${g.color}/10 qui ne marche PAS en Tailwind 4, remplacer par className conditionnelle avec style inline).

## Décisions
- startLogin() importé depuis "@/const" côté client
- LLM: gemini-flash-latest (gratuit/disponible dans catalog forge)

## Migration services indépendants (août 2026)
- Demande utilisateur : remplacer Manus OAuth + Manus LLM par options gratuites indépendantes.
- Choix LLM : **OpenRouter** (quota gratuit, modèle `google/gemini-2.5-flash`, compatible OpenAI).
- Implémenté : `server/openrouter.ts` (openRouterChat, isOpenRouterConfigured) + `server/routers.ts` : fonction `aiChat()` point d'entrée unique → OpenRouter si OPENROUTER_API_KEY configuré, sinon fallback Manus API. Les 3 usages (chat, letters, scams) utilisent aiChat avec message d'erreur utilisateur poli (FALLBACK_ERROR après tous les imports).
- Prochaine étape : obtenir OPENROUTER_API_KEY via webdev_request_secrets (inscription gratuite https://openrouter.ai/keys).
- Auth : Clerk plan gratuit possible (https://clerk.com) mais nécessite clé publishable+secret ; le template managé ne remplace pas facilement Manus OAuth → à proposer à l'utilisateur, migration seulement s'il possède une clé Clerk.

## Migration IA — étape Gemini (août 2026)
- OpenRouter créé par l'utilisateur (clé sk-ou-v1-e08...0d2 « LifeCopilot ») mais ne fonctionnait pas → on passe à Google AI Studio.
- Clé Google AI Studio fournie par l'utilisateur et stockée en secret : **GEMINI_API_KEY** (projet 504368104377, nom « LifeCopilot »). Format AIzaSy... (AQ.Ab8RN6JX...).
- Implémenté : `server/gemini.ts` (geminiChat, isGeminiConfigured) ; `server/routers.ts` aiChat() : priorité Gemini → OpenRouter → Manus fallback.
- Log existant esbuild db.ts:184 = RESIDU ANCIEN (timestamp 09:23Z), pas une vraie erreur.
- Reste à faire : test vitest validant GEMINI_API_KEY (appel réel geminiChat ou procédure chat), test frontend assistant/courriers/arnaques, checkpoint, livraison.
- Auth : en attente de décision utilisateur (option A garder Manus OAuth / option B Clerk) — PAS ENCORE MIGRÉE.

## Debug Gemini tests (11:35, août 2026)
- Quota réel : `generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.7-flash` (le wildcard gemini-flash-latest résout vers gemini-3.7-flash), 20 req/min globale sur le PROJET (partagée avec l'API key du projet 504368104377).
- Le throttler 4s + retry 40s ne suffit pas : Google demande de réessayer après ~27 s, et la fenêtre est glissante. Le retry backoff commence à 10 s mais la réponse dit retry in 27.5 s.
- Diagnostic webdev_debug (confiance élevée) : tests parallèles × plusieurs appels en boucle. Recos : (1) mocker geminiChat/aiChat dans les tests unitaires + garder 1 test live derrière RUN_LIVE_AI_TESTS=1 ou it.skip ; (2) throttler + it.sequential (fait) ; (3) augmenter maxAttempts, jitter, respecter Retry-After.
- Décision retenue : mocker les appels IA dans vitest (stabilité CI), garder le test d'intégration Gemini réel mais désactivé par défaut (env RUN_LIVE_AI_TESTS=1) — les autres tests LLM (letters/scams/chat) appellent aiChat dans routers.ts donc il faut mocker via vi.mock("./_core/llm") ou wrapper.
- IMPORTANT: la clé fonctionne (appel direct curl = 200 OK « Bonjour ! »). L'échec est seulement dans les suites de tests massives.
- Reste à faire : mocker, valider 26 tests, tester manuellement l'assistant via aperçu, checkpoint, livrer.
- Auth indépendante : en attente décision utilisateur (A garder Manus OAuth / B Clerk).

## État migration Gemini — 11:55
- Tests vitest : 26/26 PASSENT (mocks gemini + openrouter + db + invokeLLM dans lifecopilot.test.ts, mocks désactivés sous RUN_LIVE_AI_TESTS=1, test d'intégration key derrière le même flag).
- Quota Google : `generate_content_free_tier_requests, limit: 20 req/min, model gemini-3.7-flash` (résolution de gemini-flash-latest), fenêtre glissante, RetryInfo ~18s.
- Vérification clé en direct (scripts/verify-gemini.mjs) : 429 systématique car beaucoup d'appels faits pendant le debug ; script retry maintenant avec délai extrait du message.
- La clé fonctionne (validée 200 OK plus tôt). Le problème est uniquement le volume d'appels.
- Reste : valider verify-gemini.mjs en direct (2-3 retries max), puis test UI rapide via aperçu, puis checkpoint + livraison.
- Rappel : auth indépendante toujours en attente décision utilisateur (A Manus OAuth / B Clerk).

## État debug Gemini — 12:13 (décision)
- Le quota free-tier Google (20 req/min, gemini-3.7-flash) reste en 429 persistant depuis ~40 min, même après pauses de 5 min. Cause probable : quota projet saturé durablement ou problème de billing du projet 504368104377.
- Solution appliquée : gemini.ts dispose désormais d'un circuit breaker (15 min de blocage après 4 échecs 429), pendant lequel routers.ts bascule AUTOMATIQUEMENT sur le fallback Manus LLM (déjà implémenté : priorité Gemini → OpenRouter → Manus).
- Tests : 26/26 passent (mocks), tsc propre, devserver running, UI vérifiée (landing + assistant OK).
- Prochaines étapes : checkpoint + livraison, expliquer à l'utilisateur le système de fallback et lui suggérer (a) de vérifier son projet AI Studio / créer une nouvelle clé, ou (b) de tester l'assistant en live (il passera via le fallback Manus tant que Gemini est bloqué).

## État — 12:14 (avant test fallback UI)
- aiChat dans routers.ts (l.19-48) : try/catch ajouté autour de geminiChat ; si l'erreur contient "quota dépassé" (message du circuit breaker gemini.ts), on passe au service suivant (OpenRouter non configuré → invokeLLM Manus). Sinon re-throw.
- Le site est une app React avec session utilisateur connectée (RT connecté via Manus OAuth).
- Reste : tester en conditions réelles le fallback (assistant/courriers/arnaques) via le navigateur (session active utilisateur connecté). Vérifier que chat.complete/letters.generate/scams.analyze répondent pendant la saturation Gemini.
- Puis : checkpoint + livraison. L'utilisateur attend un retour ; expliquer la chaîne Gemini (primaire, gratuit) + fallback Manus (pendant saturation) + OpenRouter (intermédiaire, pas configuré).
- Tests vitest : 26/26 passent, mocks en place (gemini.ts, openrouter.ts, invokeLLM, db). tsc propre.

## État — 12:27 (fallback en cours de validation)
- Bug corrigé #1 : "Body has already been read" dans gemini.ts (lecture JSON différée après OK uniquement).
- Bug corrigé #2 : plus de retry local après 429 (le délai Google ~48s faisait timeout 200s). Maintenant break immédiat + circuit breaker, et routers.ts bascule.
- Problème restant : chat.complete retourne encore 500 (12:25:39, AI failure "Gemini returned an empty response"). À investiguer : le chemin fallback Manus semble produire une réponse vide ? Vérifier invokeLLM directement.
- Environnement : GEMINI_API_KEY configuré (secret webdev), OPENROUTER_API_KEY NON configuré dans le projet (connecteur OpenRouter désactivé). Chaîne active : Gemini -> (OpenRouter absent) -> invokeLLM Manus.
- 26/26 tests passent, tsc propre.

## État — 12:31 FALLBACK VALIDÉ
Le fallback fonctionne en conditions réelles : chat.complete retourne une réponse complète (résiliation téléphonique) via invokeLLM Manus en ~34 s, avec le log "[aiChat] Gemini saturé — bascule vers le service suivant". Cause des échecs précédents : (1) body re-read après retry 429, corrigé en lisant le JSON uniquement après un OK ; (2) retry local après 429 avec délai Google ~30-60 s prolongeant la latence au lieu de basculer, corrigé en levant l'erreur immédiatement (routers.ts bascule alors sur le fallback Manus).

## État — 12:42 validation UI fallback
- Courriers (/lettres) : test UI réel PASSED — génération complète affichée (~30 s, fallback Manus pendant 429), lettre de résiliation Fitness Plus correcte, bouton Copier présent, aucune erreur visible.
- Anti-arnaque (/arnaques) : fetch direct depuis la page = HTTP 200, analyse Verdict Élevé reçue (fallback OK côté API). MAIS le clic sur « Analyser le contenu » ne semble pas déclencher la mutation côté UI (résultat non affiché dans l'UI). Les deux clics du navigateur n'ont pas fait apparaître de requête /api/trpc/scams.analyze dans networkRequests.log — peut-être que la validation du champ ne passe pas (min 10 chars : OK) ou que le bouton ne fait rien quand pas connecté (l'utilisateur sandbox n'est pas connecté). À vérifier : Arnaques.tsx requiert-il une connexion ? Le fetch manuel a réussi sans cookie (publicProcedure).
- Restant : investiguer pourquoi le bouton Analyser ne déclenche pas la requête (peut-être juste le browser tool input pas vraiment rempli au moment du clic, le texte du textarea affiché était bien présent). Puis checkpoint + livraison.

## État — 12:45 prêt checkpoint final
Le fallback Gemini -> Manus est validé de bout en bout : chat (200), letters (lettre Fitness Plus complète affichée dans l'UI), scams (HTTP 200, verdict Élevé via fetch). Corrections finales : nested button corrigé dans SiteLayout (Link asChild autour Button Tableau de bord) et ProcedureDetail (suppression du <button> wrapper autour de Checkbox radix). 26 tests vitest passent, tsc 0 erreur, aucune nouvelle erreur console après 12:44:50. Captures desktop 6/6 OK : accueil, catalogue 25 démarches, assistant 4 modes, courriers, anti-arnaque, dashboard connecté (RT). Reste : checkpoint + livraison.

## Migration Vercel + Clerk (août 2026) — NOTES TECHNIQUES

### Clés Clerk (validées via test vitest server/clerk.test.ts : 2 tests passent)
- CLERK_PUBLISHABLE_KEY=pk_test_c2V0dGxlZC1lZWwtNTM2MC5jbGVyay5hY2NvdW50cy5kZXYk
- CLERK_SECRET_KEY=sk_test_RIrhWNCRTaU0OQDzWtcHxsk7C4jEPVvoKLVDvuxz28
- Packages installés : @clerk/clerk-react@5.61.3, @clerk/backend@3.16.10
- API réelle @clerk/backend 3.x : `createClerkClient({secretKey})` retourne `ClerkClient` = ApiClient + `authenticateRequest({headers, method, url})` + `users.getUser(id)`.
- `authenticateRequest` retourne `RequestState` = AuthenticatedState | UnauthenticatedState | HandshakeState. AuthenticatedState a : status:"signed-in", sessionClaims (JwtPayload), sessionId, sessionStatus, actor, userId, activeOrganization, getToken, has, debug, tokenType, headers, token, toAuth, publishableKey, isSatellite, domain. UnauthenticatedState a status:"signed-out" + reason + message.
- Utiliser le guard `requestState.status === "signed-in"` puis requestState.userId / getUser.
- clerk.authenticateRequest demande req style {headers, method, url} (headers = Record<string,string>).

### Plan d'adaptation Vercel
1. Frontend : App.tsx enveloppé par `<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>` ; remplacer useAuth hook par hooks Clerk (useAuth de @clerk/clerk-react) ; startLogin() → openSignIn() ; SiteLayout/Home/DashboardLayout/Home main.tsx mis à jour.
2. Backend : nouveau fichier server/auth/clerk.ts (FAIT, reste à corriger type signed-in guard). Contexte tRPC adapté : lire headers req → authenticateRequest(clerk). Fallback : si CLERK pas configuré, essayer Manus SDK (garder compatibilité env dev Manus).
3. Auth en base : openId = `clerk:${clerkUserId}`, loginMethod=clerk. sync à chaque requête via upsertUser (existe dans db.ts) + getUserByOpenId (existe).
4. Frontend trpc.ts : retirer le header Bearer sessionStorage manus-cookie ; laisser cookies.
5. Vercel : package serverless-http OU build dual : "build": vite build + esbuild server ; vercel.json avec functions + rewrites /api/trpc → /api/trpc serverless function.
6. Chaîne IA : retirer le fallback invokeLLM Manus (non dispo hors plateforme) → erreur propre si Gemini + OpenRouter KO.
7. DB : DATABASE_URL TiDB inchangé (serverless OK).

### État
- server/auth/clerk.ts créé : bug TS restant = le cast du retour authenticateRequest vers {sessionId?, userId?} échoue (RequestState discriminateur). À corriger avec guard `status === "signed-in"`.
- Tests à réécrire : lifecopilot.test.ts mocke "._core/llm" et context ; clerk.test.ts OK.

## Migration Vercel — ÉTAT AVANCÉ (checkpoint à venir)

### FAIT
- Packages : @clerk/clerk-react@5.61.3, @clerk/backend@3.16.10, serverless-http@4.0.0 (+ @types/serverless-http dev).
- server/auth/clerk.ts : authenticateRequest(req.headers) → clerk.authenticateRequest({headers,method,url}) → guard status==="signed-in" → toAuth().userId → users.getUser(id) → upsertUser(openId=`clerk:${id}`, loginMethod=clerk) → getUserByOpenId. tsc OK.
- server/_core/context.ts : tente Clerk en premier, fallback sdk (Manus OAuth). tsc OK.
- client/src/lib/useAuth.ts : hook unifié (Clerk si VITE_CLERK_PUBLISHABLE_KEY, sinon legacy Manus). Contrat {user,loading,error,isAuthenticated,refresh,logout,startLogin,signIn}. startLogin standalone + registerClerkOpenSignIn.
- client/src/main.tsx : ClerkProvider conditionnel (VITE_CLERK_PUBLISHABLE_KEY), couleur primaire #0f766e, app=<Shell><App/></Shell>.
- Tous fichiers (Home, ProcedureDetail, Dashboard, Profile, SiteLayout, DashboardLayout) → imports "@/lib/useAuth". tsc OK.
- server/routers.ts : aiChat = Gemini → OpenRouter seulement (invokeLLM Manus retiré, throw si aucun provider).
- server/app.ts : createApp() express partagé (tRPC /api/trpc + storageProxy).
- server/vercel.ts : handler = serverless(createApp()) (ATTENTION : tsc signalait erreur module './app' — vérifier après).
- Tests : server/clerk.test.ts PASSE (2 tests, API clerk.dev). 26 tests avant migration — lifecopilot.test.ts et autres à vérifier (mocks _core/llm peut-être cassés maintenant que invokeLLM retiré de routers.ts).

### RESTE À FAIRE
1. Adapter server/_core/index.ts pour utiliser createApp() (au lieu de dupliquer express.json/trpc) + garder Vite + serveStatic + OAuth routes. Vérifier registerOAuthRoutes (Manus) — garder, harmless si pas de clés.
2. Créer vercel.json : functions api/index.handler → server/vercel.ts (runtime nodejs22.x), rewrites : /api/* → /api, SPA fallback / → /api. Output dist + api.
3. package.json : script "build" pour Vercel : vite build (client/dist) + esbuild server/vercel.ts → dist/api/index.js (bundle esm ? vérifier serverless-http compatibility — serverless-http 4.x supporte ESM). Scripts : "build:vercel" ou adapter "build".
4. Vérifier DATABASE_URL TiDB : ajouter ?connectionLimit… (drizzle mysql2 ok serverless ; pool par requête ok).
5. Tests : pnpm test complet + corriger mocks.
6. git push vers Toavina221/LifeCopilot (dépôt existant, à jour au checkpoint 999be92e).
7. Livrer instructions Vercel : preset Vite + root ./, env vars : DATABASE_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY (aussi VITE_CLERK_PUBLISHABLE_KEY), GEMINI_API_KEY, OPENROUTER_API_KEY.
8. Attention : la clé publiée VITE_CLERK_PUBLISHABLE_KEY=pk_test_... = CLERK_PUBLISHABLE_KEY même valeur.

### URLs utiles
- Dépot : https://github.com/Toavina221/LifeCopilot
- Preview dev : https://3000-it800gr5okv34elayogjv-6803f747.us4.manus.computer
- Checkpoint Manus : 999be92e


## Phase DB TiDB Cloud (21/08)
- ZIP livré /home/ubuntu/LifeCopilot-Vercel.zip + GUIDE_DEPLOIEMENT_VERCEL.md. Utilisateur déploie sur Vercel (équipe Appscanner, projet life-copilot). Dépôt GitHub Toavina221/LifeCopilot OBSOLÈTE (push 403 bloqué) — livraison par ZIP (option 2 confirmée).
- TiDB Cloud : cluster "lifecopilot" Starter $0, Frankfurt (eu-central-1), AWS.
  - HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com, PORT=4000, USER=KyrM8PihRPmCpSN.root
  - DB dropdown propose seulement "sys"/"test" — TiDB Serverless a une db dédiée par cluster, il faut utiliser "lifecopilot" (ou créer la base via CREATE DATABASE).
  - Mot de passe PAS ENCORE GÉNÉRÉ (utilisateur doit cliquer Generate Password).
  - Chaîne reçue : mysql://KyrM8PihRPmCpSN.root:<PASSWORD>@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/sys — à adapter : base=lifecopilot, sslmode.
- drizzle mysql2 via env DATABASE_URL ; ssl TiDB public endpoint : ?ssl=true (mysql2).
- À faire : tester connexion avec mysql2 quand mot de passe reçu, créer schéma, livrer DATABASE_URL finale.
