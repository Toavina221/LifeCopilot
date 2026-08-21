# QA visuelle — screenshots (2026-08-20)

Pages OK : /, /procedures, /assistant (accueil mode adulte affiché), /lettres, /arnaques, /dashboard (connecté, "Bonjour Rovamampionina"), /profil (données utilisateur chargées depuis OAuth).

Problème : /procedures/ask-cancellation-subscription → erreur React "Cannot read properties of null (reading 'useState')" dans ThemeProvider/ThemeContext.tsx:11:29, reproduit seulement sur cette route (les autres pages rendent avec le même layout sans erreur). Probablement rendu SSR/prerender vite-plugin-manus sur une route à paramètre dynamique avec erreur de bundle stale, OU le problème est transient (route ouverte avant que le HMR compile ProcedureDetail). Hypothèse principale : page ouverte en parallèle avant compilation complète de ProcedureDetail.tsx. À re-vérifier après compilation.

Correctif cosmétique à faire : dans Assistant.tsx, "les25 démarches" → espace manquant : "en détail les 25 démarches".
Correctif cosmétique 2 : /procedures détail page n'a pas encore été re-capturée après fix.

Actions restantes :
1. Réécrire server/lifecopilot.test.ts : il n'y a PAS de router procedures.list/byKey (les procédures sont importées statiquement depuis @shared/procedures côté client). Routers réels : auth, chat.complete, letters.generate/list, scams.analyze, saved.list/save/markSteps, tasks.list/create/setStatus/remove, profile.get/update. Tous sont publicProcedure (auth via ctx.user optionnel). Tests = mocks du db + validation des contraintes zod.
2. Ajouter router procedures ? Optionnel — pas requis, les pages utilisent l'import statique.
3. pnpm check + pnpm test.
4. Checkpoint unique, livraison.
