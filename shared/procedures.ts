/**
 * LifeCopilot procedure catalog.
 * 25 guided life-admin procedures across 5 categories:
 * health, finance, housing, school, digital.
 * Shared constants — imported by both client and server.
 */

export type ProcedureCategory =
  | "health"
  | "finance"
  | "housing"
  | "school"
  | "digital";

export interface ProcedureStep {
  title: string;
  description: string;
  tip?: string;
}

export interface Procedure {
  key: string;
  title: string;
  category: ProcedureCategory;
  audience: Array<"junior" | "teen" | "adult" | "senior">;
  summary: string;
  duration: string;
  cost: string;
  documents: string[];
  steps: ProcedureStep[];
}

export const CATEGORY_LABELS: Record<ProcedureCategory, string> = {
  health: "Santé",
  finance: "Finances",
  housing: "Logement",
  school: "École & famille",
  digital: "Numérique",
};

export const CATEGORY_ICONS: Record<ProcedureCategory, string> = {
  health: "heart-pulse",
  finance: "banknote",
  housing: "house",
  school: "graduation-cap",
  digital: "smartphone",
};

export const PROCEDURES: Procedure[] = [
  {
    key: "health-rdv-medecin",
    title: "Prendre un rendez-vous médical",
    category: "health",
    audience: ["teen", "adult", "senior"],
    summary:
      "Trouver un médecin, le contacter et obtenir un rendez-vous rapidement, même quand il est débordé.",
    duration: "15–30 min",
    cost: "Gratuit (consultation remboursée selon mutuelle)",
    documents: ["Carte vitale / assurance", "Motif de consultation"],
    steps: [
      {
        title: "Définissez votre besoin",
        description:
          "Notez vos symptômes et leur durée. En cas d'urgence vitale (douleur thoracique, hémorragie, difficulté à respirer), appelez immédiatement le 15 (SAMU) — ne passez pas par cette procédure.",
      },
      {
        title: "Identifiez le bon professionnel",
        description:
          "Médecin généraliste pour un premier diagnostic ; spécialiste pour un problème précis. Vérifiez s'il accepte de nouveaux patients sur les annuaires en ligne (Doctolib, annuaire Santé) ou par téléphone.",
      },
      {
        title: "Appelez ou réservez en ligne",
        description:
          "Sur les plateformes en ligne, choisissez un créneau. Par téléphone, appelez tôt le matin (8h–9h) : c'est le moment où les secrétariats libèrent les rendez-vous.",
        tip: "Astuce : si aucune place n'est disponible, demandez à être inscrit sur la liste d'annulation.",
      },
      {
        title: "Préparez votre consultation",
        description:
          "Prenez votre carte d'assurance, la liste de vos traitements actuels et vos résultats d'analyses récents. Notez vos 3 questions les plus importantes pour ne rien oublier.",
      },
      {
        title: "Suivez et rangez",
        description:
          "Conservez l'ordonnance et le compte rendu. Ajoutez le prochain rendez-vous de suivi à votre agenda LifeCopilot.",
      },
    ],
  },
  {
    key: "health-remboursement-sante",
    title: "Demander un remboursement de soins",
    category: "health",
    audience: ["teen", "adult", "senior"],
    summary:
      "Se faire rembourser des frais médicaux non pris en charge automatiquement par l'assurance.",
    duration: "30 min de démarches",
    cost: "Variable selon les soins",
    documents: ["Factures et reçus", "Ordonnances", "Carte d'assurance", "RIB"],
    steps: [
      {
        title: "Vérifiez vos garanties",
        description:
          "Consultez votre contrat d'assurance ou de mutuelle pour connaître les remboursements possibles (optique, dentaire, kinésithérapie, etc.).",
      },
      {
        title: "Rassemblez les justificatifs",
        description:
          "Regroupez factures acquittées, ordonnances et feuilles de soins. Les documents doivent mentionner votre nom, la date et le montant payé.",
        tip: "Astuce : photographiez chaque document au moment du paiement — vous aurez toujours une copie.",
      },
      {
        title: "Envoyez le dossier",
        description:
          "Déposez les pièces via l'espace en ligne de votre assurance ou par courrier recommandé. Conservez la preuve d'envoi.",
      },
      {
        title: "Suivez le dossier",
        description:
          "Notez le délai annoncé (souvent 2 à 4 semaines). Si aucune réponse au-delà, relancez par téléphone ou message sécurisé.",
      },
    ],
  },
  {
    key: "health-declarer-naissance",
    title: "Déclarer une naissance",
    category: "health",
    audience: ["adult"],
    summary:
      "Déclarer la naissance d'un enfant à l'état civil dans les délais légaux.",
    duration: "30 min + rendez-vous mairie",
    cost: "Gratuit",
    documents: [
      "Certificat médical d'accouchement",
      "Pièces d'identité des parents",
      "Livret de famille (si existant)",
      "Acte de reconnaissance anticipée",
    ],
    steps: [
      {
        title: "Respectez le délai légal",
        description:
          "La déclaration doit être faite dans les jours qui suivent la naissance (3 à 5 jours selon le pays) auprès de la mairie du lieu de naissance.",
      },
      {
        title: "Préparez les documents",
        description:
          "Réunissez le certificat médical, les pièces d'identité et, si le père n'est pas marié à la mère, l'acte de reconnaissance.",
      },
      {
        title: "Choisissez les prénoms et le nom",
        description:
          "Décidez ensemble du ou des prénoms et du nom de famille à transmettre. La déclaration d'un seul prénom ou d'un choix tardif crée des démarches supplémentaires.",
      },
      {
        title: "Faites la déclaration et mettez à jour",
        description:
          "Le père, la mère ou une personne mandatée fait la déclaration à la mairie. Ensuite, demandez le livret de famille et déclarez l'enfant auprès de l'assurance maladie et de l'employeur (allocations).",
      },
    ],
  },
  {
    key: "health-carte-mutuelle",
    title: "Choisir et activer une mutuelle santé",
    category: "health",
    audience: ["teen", "adult", "senior"],
    summary:
      "Comparer les mutuelles et choisir celle qui correspond à ses besoins et à son budget.",
    duration: "1–2 h de comparaison",
    cost: "10–100 €/mois selon le niveau de garantie",
    documents: ["Devis comparés", "Carte vitale actuelle"],
    steps: [
      {
        title: "Listez vos besoins réels",
        description:
          "Soins dentaires, optique, hospitalisation, médicaments : notez ce que vous utilisez vraiment plutôt que de choisir le niveau maximum.",
      },
      {
        title: "Comparez au moins 3 devis",
        description:
          "Utilisez les comparateurs officiels et les assureurs directs. Comparez le niveau de remboursement par poste, pas seulement le prix.",
        tip: "Astuce : un tarif bas cache parfois des franchises élevées. Vérifiez le « reste à charge » réel.",
      },
      {
        title: "Souscrivez et transmettez",
        description:
          "Après signature, transmettez vos coordonnées à votre mutuelle : vous recevrez une carte ou un numéro de tiers payant.",
      },
    ],
  },
  {
    key: "finance-ouvrir-compte-bancaire",
    title: "Ouvrir un compte bancaire",
    category: "finance",
    audience: ["teen", "adult"],
    summary:
      "Ouvrir son premier compte courant ou compte jeune, en ligne ou en agence.",
    duration: "30 min à 1 semaine",
    cost: "Souvent gratuit (compte jeune) ou 0–15 €/mois",
    documents: ["Pièce d'identité", "Justificatif de domicile ou de scolarité", "Numéro fiscal"],
    steps: [
      {
        title: "Choisissez le type de compte",
        description:
          "Compte jeune (gratuit, avec plafond de retrait) ou compte courant classique. À partir de 18 ans, la loi garantit le droit au compte dans la plupart des pays.",
      },
      {
        title: "Comparez banques traditionnelles et néobanques",
        description:
          "Les néobanques s'ouvrent en quelques minutes via l'application ; les banques traditionnelles offrent des agences physiques.",
        tip: "Astuce : vérifiez les frais cachés — carte, découvert, virements internationaux.",
      },
      {
        title: "Constituez votre dossier",
        description:
          "Pièce d'identité en cours de validité, justificatif de domicile, et parfois de scolarité pour un mineur.",
      },
      {
        title: "Finalisez et sécurisez",
        description:
          "Activez votre carte, configurez votre application, activez les notifications et repérez l'assurance liée au compte.",
      },
    ],
  },
  {
    key: "finance-budget-mensuel",
    title: "Créer et tenir un budget mensuel",
    category: "finance",
    audience: ["junior", "teen", "adult"],
    summary:
      "Mettre en place un système simple pour savoir où va son argent chaque mois.",
    duration: "1 h de mise en place, puis 15 min/semaine",
    cost: "Gratuit",
    documents: ["Relevés des 3 derniers mois", "Liste des abonnements"],
    steps: [
      {
        title: "Listez vos revenus",
        description:
          "Salaire, allocations, argent de poche, petits boulots : notez tout ce qui entre chaque mois.",
      },
      {
        title: "Listez vos dépenses fixes",
        description:
          "Loyer, transports, abonnements, assurances, téléphone. Additionnez-les — elles partent en premier.",
      },
      {
        title: "Définissez des enveloppes",
        description:
          "Répartissez le reste en catégories (courses, sorties, épargne). La règle 50/30/20 est un bon point de départ : 50 % besoins, 30 % envies, 20 % épargne.",
        tip: "Astuce : virez votre épargne dès la réception du revenu, pas à la fin du mois.",
      },
      {
        title: "Suivez chaque semaine",
        description:
          "Prenez 10 minutes par semaine pour noter vos dépenses dans un tableau ou une application. Ajustez les enveloppes au besoin.",
      },
    ],
  },
  {
    key: "finance-contester-facture",
    title: "Contester une facture incorrecte",
    category: "finance",
    audience: ["teen", "adult", "senior"],
    summary:
      "Contester formellement une facture d'énergie, de télécom ou autre prestation mal calculée.",
    duration: "45 min",
    cost: "Gratuit",
    documents: ["Facture contestée", "Contrat ou relevé de compteur", "Correspondances"],
    steps: [
      {
        title: "Vérifiez la facturation",
        description:
          "Comparez la facture avec votre contrat : tarifs, consommations, dates de relèvement. Repérez précisément la ligne contestée.",
      },
      {
        title: "Contactez le service client",
        description:
          "Appelez ou écrivez via l'espace client en citant le numéro de facture et le montant contesté. Notez la date, l'interlocuteur et la référence du dossier.",
      },
      {
        title: "Envoyez une réclamation écrite",
        description:
          "Si le premier contact échoue, utilisez le générateur de courriers LifeCopilot pour rédiger une réclamation formelle en recommandé avec accusé de réception.",
      },
      {
        title: "Escaladez si nécessaire",
        description:
          "En cas d'absence de réponse sous 2 mois, saisissez le médiateur du secteur (médiateur de l'énergie, des communications, etc.) — gratuit pour le consommateur.",
      },
    ],
  },
  {
    key: "finance-dossier-aide-financiere",
    title: "Demander une aide financière",
    category: "finance",
    audience: ["teen", "adult", "senior"],
    summary:
      "Constituer un dossier pour une allocation, une bourse ou une aide au logement.",
    duration: "1–3 h + délais d'instruction",
    cost: "Gratuit",
    documents: [
      "Justificatifs de revenus",
      "Justificatif de domicile",
      "Pièce d'identité",
      "RIB",
    ],
    steps: [
      {
        title: "Identifiez les aides auxquelles vous avez droit",
        description:
          "Simulateurs en ligne officiels : aides au logement, bourses, revenu minimum, aides d'urgence. Listez toutes celles qui vous concernent.",
      },
      {
        title: "Réunissez les justificatifs",
        description:
          "Avis d'imposition ou fiches de paie, justificatif de domicile de moins de 3 mois, pièce d'identité. Préparez des copies PDF lisibles.",
        tip: "Astuce : un justificatif illisible retarde le dossier de plusieurs semaines.",
      },
      {
        title: "Déposez le dossier en ligne",
        description:
          "Créez votre compte sur le portail officiel, remplissez le formulaire et téléversez les pièces. Imprimez ou sauvegardez la confirmation de dépôt.",
      },
      {
        title: "Suivez l'instruction",
        description:
          "Notez le numéro de dossier et répondez rapidement à toute demande de pièce complémentaire. Les délais d'instruction varient de 2 à 8 semaines.",
      },
    ],
  },
  {
    key: "finance-dossier-pret",
    title: "Préparer un dossier d'emprunt",
    category: "finance",
    audience: ["adult"],
    summary:
      "Constituer un dossier solide pour demander un crédit (logement, voiture, études).",
    duration: "1–2 semaines de préparation",
    cost: "Gratuit (hors frais de dossier bancaires)",
    documents: [
      "3 derniers bulletins de salaire",
      "2 derniers avis d'imposition",
      "Justificatif de domicile",
      "Relevés de compte 3 mois",
    ],
    steps: [
      {
        title: "Évaluez votre capacité d'emprunt",
        description:
          "Les banques plafonnent généralement les mensualités à 35 % des revenus. Calculez votre capacité avant de démarcher.",
      },
      {
        title: "Nettoyez votre situation",
        description:
          "Apurez les découverts, regroupez vos comptes, et vérifiez qu'aucune opération suspecte ne figure sur vos relevés récents.",
      },
      {
        title: "Constituez le dossier type",
        description:
          "Préparez une fois pour toutes : pièces d'identité, justificatifs de revenus, avis d'imposition, relevés. Ce dossier sert pour toutes les banques.",
      },
      {
        title: "Comparez les offres",
        description:
          "Demandez au moins 3 offres écrites (TAEG obligatoire). Comparez le coût total, pas seulement la mensualité, et négociez les frais de dossier.",
      },
    ],
  },
  {
    key: "housing-cherche-logement",
    title: "Chercher et visiter un logement",
    category: "housing",
    audience: ["teen", "adult"],
    summary:
      "Conduire efficacement une recherche de logement : alertes, visites et comparaison.",
    duration: "2–8 semaines selon le marché",
    cost: "Gratuit (hors caution)",
    documents: [
      "Dossier locataire complet",
      "Pièce d'identité",
      "Justificatifs de revenus",
      "Garant si possible",
    ],
    steps: [
      {
        title: "Préparez votre dossier locataire",
        description:
          "Pièce d'identité, 3 derniers bulletins de salaire ou justificatifs de ressources, avis d'imposition. Un dossier complet et prêt fait toute la différence face à la concurrence.",
      },
      {
        title: "Activez les alertes",
        description:
          "Configurez des alertes sur les portails immobiliers avec vos critères (zone, budget, surface). Répondez dans les premières heures.",
        tip: "Astuce : les annonces publiées le matin sont souvent répondues en moins de 24 h sur les marchés tendus.",
      },
      {
        title: "Visitez et notez",
        description:
          "À chaque visite, vérifiez l'état réel : fenêtres, chauffage, humidité, bruit. Prenez des photos et notez les défauts pour comparer objectivement.",
      },
      {
        title: "Déposez votre candidature",
        description:
          "Envoyez immédiatement votre dossier complet après une bonne visite. Proposez, si possible, une garantie (caution parentale ou garantie publique).",
      },
    ],
  },
  {
    key: "housing-signer-bail",
    title: "Comprendre et signer un bail locatif",
    category: "housing",
    audience: ["teen", "adult"],
    summary:
      "Lire un contrat de location, vérifier ses clauses et le signer en toute sécurité.",
    duration: "1 h de relecture",
    cost: "Frais d'agence encadrés par la loi",
    documents: [
      "Le bail complet",
      "L'état des lieux d'entrée",
      "Liste des charges",
    ],
    steps: [
      {
        title: "Vérifiez les mentions obligatoires",
        description:
          "Le bail doit mentionner : durée, loyer, charges, dépôt de garantie, congé et préavis. Ces mentions sont encadrées par la loi selon le type de location.",
      },
      {
        title: "Contrôlez le dépôt de garantie",
        description:
          "Il est plafonné par la loi (1 mois pour location nue, 2 mois meublée). Toute demande au-delà est illégale.",
        tip: "Astuce : faites scanner chaque anomalie de l'état des lieux par le générateur d'arnaque — certaines clauses déguisent des frais illicites.",
      },
      {
        title: "Faites l'état des lieux avec soin",
        description:
          "Photographiez tout, même les détails. Ce document déterminera la restitution de votre caution au départ.",
      },
      {
        title: "Signez et archivez",
        description:
          "Ne signez qu'après relecture complète. Conservez une copie signée et enregistrez la date dans votre tableau de bord LifeCopilot.",
      },
    ],
  },
  {
    key: "housing-etat-des-lieux",
    title: "Faire un état des lieux de sortie",
    category: "housing",
    audience: ["adult"],
    summary:
      "Préparer et conduire un état des lieux de départ pour récupérer sa caution.",
    duration: "1–2 h",
    cost: "Gratuit",
    documents: ["État des lieux d'entrée", "Photos datées", "Factures de réparations"],
    steps: [
      {
        title: "Remettez le logement en état",
        description:
          "Nettoyez, réparez les menus dégâts d'usure courante. L'usure normale ne peut pas être facturée au locataire.",
      },
      {
        title: "Reprenez l'état des lieux d'entrée",
        description:
          "Comparez pièce par pièce avec le document d'entrée. Préparez vos photos datées pour chaque point de désaccord potentiel.",
      },
      {
        title: "Assistez à la visite conjointe",
        description:
          "Soyez présent, notez les réserves émises et refusez de signer une réserve injustifiée. Faites vos observations par écrit.",
      },
      {
        title: "Récupérez le dépôt",
        description:
          "La restitution est due sous 1 mois si l'état des lieux est conforme, 2 mois sinon. En cas de retenue injustifiée, une lettre de mise en demeure suffit souvent.",
      },
    ],
  },
  {
    key: "housing-probleme-logement",
    title: "Signaler un problème dans son logement",
    category: "housing",
    audience: ["adult", "senior"],
    summary:
      "Signaler officiellement un défaut au propriétaire : fuite, chauffage, moisissure, sécurité.",
    duration: "30 min + délais de réparation",
    cost: "Gratuit",
    documents: ["Photos du problème", "Date de première alerte", "Correspondances"],
    steps: [
      {
        title: "Documentez le problème",
        description:
          "Photographiez et datez le défaut. Notez la première date où vous l'avez signalé : ces preuves sont essentielles.",
      },
      {
        title: "Signalez au propriétaire par écrit",
        description:
          "Un signalement écrit (message ou courrier) fait courir les délais légaux et constitue une preuve. Le générateur de courriers LifeCopilot peut rédiger cette demande.",
      },
      {
        title: "Rappelez les obligations légales",
        description:
          "Le propriétaire doit assurer un logement décent et sûr (chauffage, eau, électricité, absence de nuisibles). Citez les articles de loi pertinents dans votre courrier.",
        tip: "Astuce : en cas de danger immédiat (gaz, électricité), appelez d'abord les secours, puis signalez.",
      },
      {
        title: "Escaladez si pas de réponse",
        description:
          "Sans réponse sous un délai raisonnable, saisissez la commission départementale ou le tribunal compétent. Les associations de locataires offrent souvent une aide gratuite.",
      },
    ],
  },
  {
    key: "school-choix-etablissement",
    title: "Choisir et inscrire son enfant à l'école",
    category: "school",
    audience: ["adult"],
    summary:
      "Naviguer les démarches d'inscription scolaire : sectorisation, dossier, délais.",
    duration: "1–2 h",
    cost: "Gratuit (école publique)",
    documents: [
      "Livret de famille",
      "Carnet de vaccination",
      "Justificatif de domicile",
      "Certificat médical",
    ],
    steps: [
      {
        title: "Identifiez l'école de secteur",
        description:
          "La scolarisation en école publique dépend de votre adresse. Vérifiez la sectorisation sur le site de votre mairie ou de l'académie.",
      },
      {
        title: "Respectez les calendriers d'inscription",
        description:
          "Les inscriptions se font généralement entre janvier et juin pour la rentrée suivante. Notez les dates dans votre tableau de bord LifeCopilot.",
      },
      {
        title: "Préparez le dossier",
        description:
          "Livret de famille, justificatif de domicile, carnet de vaccination, certificat médical. Préparez aussi la demande de cantine et de garderie si besoin.",
      },
      {
        title: "Préparez la rentrée",
        description:
          "Liste de fournitures, rendez-vous avec l'enseignant, information sur les transports scolaires. Installez avec votre enfant une routine de rentrée.",
      },
    ],
  },
  {
    key: "school-bourse-scolarite",
    title: "Demander une bourse scolaire ou étudiante",
    category: "school",
    audience: ["teen", "adult"],
    summary:
      "Constituer un dossier de bourse : critères, calendrier et pièces justificatives.",
    duration: "1–2 h de dossier",
    cost: "Gratuit",
    documents: [
      "Avis d'imposition des parents",
      "Justificatifs de charges",
      "Attestation de scolarité",
    ],
    steps: [
      {
        title: "Vérifiez votre éligibilité",
        description:
          "Les bourses dépendent du revenu fiscal, du nombre d'enfants à charge et de la distance au domicile. Utilisez le simulateur officiel.",
      },
      {
        title: "Respectez la campagne de candidature",
        description:
          "Le dépôt se fait sur une période précise (souvent avril–juin). Une candidature tardive est irrecevable.",
        tip: "Astuce : créez votre compte sur le portail officiel plusieurs semaines avant l'ouverture pour préparer vos identifiants.",
      },
      {
        title: "Remplissez le dossier avec soin",
        description:
          "Chaque champ déclaré doit correspondre aux justificatifs. Une incohérence suspend l'instruction.",
      },
      {
        title: "Suivez l'attribution",
        description:
          "Les résultats tombent en été. En cas de changement de situation (perte d'emploi, déménagement), déclarez-le immédiatement : cela peut ouvrir des droits.",
      },
    ],
  },
  {
    key: "school-parents-eleves",
    title: "Participer à la vie scolaire de son enfant",
    category: "school",
    audience: ["adult"],
    summary:
      "S'inscrire aux instances de parents, suivre la scolarité et dialoguer avec l'établissement.",
    duration: "Quelques heures par année scolaire",
    cost: "Gratuit",
    documents: ["Élections de représentants", "Espace parents en ligne"],
    steps: [
      {
        title: "Activez l'espace parents",
        description:
          "La plupart des établissements proposent un portail en ligne : notes, emploi du temps, absences. Créez vos accès dès la rentrée.",
      },
      {
        title: "Candidaturez aux élections de représentants",
        description:
          "Les élections de parents délégués ont lieu chaque année en octobre. Candidater est simple et donne une voix dans les conseils d'école.",
      },
      {
        title: "Préparez vos rendez-vous enseignants",
        description:
          "Notez vos questions à l'avance : progression, comportement, aides possibles. Un rendez-vous préparé est deux fois plus utile.",
        tip: "Astuce : si la communication est difficile, demandez un échange écrit ou la présence d'un médiateur.",
      },
      {
        title: "Archivez les documents scolaires",
        description:
          "Bulletin, attestations, diplômes : numérisez et classez chaque document dans votre coffre LifeCopilot.",
      },
    ],
  },
  {
    key: "school-reorientation",
    title: "Préparer une réorientation scolaire",
    category: "school",
    audience: ["teen", "adult"],
    summary:
      "Évaluer et engager un changement de parcours scolaire ou de formation.",
    duration: "2–6 semaines",
    cost: "Gratuit (orientation publique)",
    documents: ["Bulletins", "Bilan d'orientation", "Fiches de vœux"],
    steps: [
      {
        title: "Faites un bilan honnête",
        description:
          "Qu'est-ce qui ne fonctionne pas : matière, ambiance, méthode d'apprentissage ? Un conseiller d'orientation aide à objectiver la situation.",
      },
      {
        title: "Explorez les alternatives",
        description:
          "Filières générales, technologiques, professionnelles, apprentissage, écoles spécialisées. Visitez les établissements et les journées portes ouvertes.",
      },
      {
        title: "Constituez le dossier de changement",
        description:
          "Demande écrite à l'établissement, avis du conseil de classe, lettres de motivation si demandé. Le générateur LifeCopilot peut rédiger la demande.",
      },
      {
        title: "Assurez la transition",
        description:
          "Validez le calendrier de transfert de dossier, les équivalences de cours et le suivi pédagogique de la nouvelle structure.",
      },
    ],
  },
  {
    key: "digital-securiser-comptes",
    title: "Sécuriser ses comptes en ligne",
    category: "digital",
    audience: ["junior", "teen", "adult", "senior"],
    summary:
      "Renforcer la sécurité de ses comptes : mots de passe, double authentification, vigilance.",
    duration: "1 h de mise en place",
    cost: "Gratuit",
    documents: ["Liste de vos comptes principaux"],
    steps: [
      {
        title: "Inventoriez vos comptes",
        description:
          "Listez vos comptes importants : banque, e-mail, réseaux sociaux, impôts, santé. Ce sont les comptes prioritaires à sécuriser.",
      },
      {
        title: "Renouvelez les mots de passe faibles",
        description:
          "Utilisez des phrases de passe longues (4 mots aléatoires) ou un gestionnaire de mots de passe. Ne réutilisez jamais le même mot de passe sur deux sites.",
        tip: "Astuce : un mot de passe est fort s'il est long, pas s'il est compliqué. « ChevalBleuPizzaLune » vaut mieux que « P@$$w0rd ».",
      },
      {
        title: "Activez la double authentification",
        description:
          "Partout où c'est possible (banque, e-mail, réseaux sociaux), activez la vérification en deux étapes via application ou SMS.",
      },
      {
        title: "Vérifiez vos sessions actives",
        description:
          "Dans les paramètres de chaque compte, déconnectez les appareils inconnus et vérifiez les dernières connexions.",
      },
    ],
  },
  {
    key: "digital-reclamer-donnees",
    title: "Exercer ses droits sur ses données personnelles",
    category: "digital",
    audience: ["teen", "adult", "senior"],
    summary:
      "Demander l'accès, la correction ou la suppression de ses données chez un service en ligne.",
    duration: "30 min + délai de réponse légal",
    cost: "Gratuit",
    documents: ["Pièce d'identité", "Identifiant du compte concerné"],
    steps: [
      {
        title: "Identifiez le responsable du traitement",
        description:
          "Cherchez la page « Confidentialité » ou « Données personnelles » du service. Elle indique qui traiter votre demande.",
      },
      {
        title: "Formulez votre demande par écrit",
        description:
          "Précisez votre droit (accès, rectification, suppression, portabilité) et le compte concerné. Le générateur LifeCopilot rédige cette lettre.",
      },
      {
        title: "Envoyez et attendez le délai légal",
        description:
          "Le responsable doit répondre généralement sous 1 mois. Conservez la preuve d'envoi.",
      },
      {
        title: "Saisissez l'autorité de protection",
        description:
          "Sans réponse ou réponse insatisfaisante, déposez une plainte auprès de l'autorité nationale de protection des données (CNIL, etc.). C'est gratuit.",
      },
    ],
  },
  {
    key: "digital-abonnement-resilier",
    title: "Résilier un abonnement",
    category: "digital",
    audience: ["teen", "adult", "senior"],
    summary:
      "Mettre fin proprement à un abonnement (salle, streaming, assurance, box) sans frais cachés.",
    duration: "30 min",
    cost: "Gratuit (sauf frais de résiliation prévus au contrat)",
    documents: ["Contrat d'abonnement", "Identifiant client", "RIB"],
    steps: [
      {
        title: "Relisez les conditions de résiliation",
        description:
          "Localisez dans votre contrat : préavis, frais éventuels, modalité (lettre recommandée ou résiliation en ligne).",
      },
      {
        title: "Rédigez votre demande",
        description:
          "Utilisez le générateur de courriers LifeCopilot (type « annulation ») : nom, référence client, date d'effet souhaitée.",
      },
      {
        title: "Envoyez et conservez la preuve",
        description:
          "Recommandé avec accusé de réception ou via le formulaire officiel du service. La preuve d'envoi fait foi en cas de litige.",
      },
      {
        title: "Vérifiez le dernier prélèvement",
        description:
          "Contrôlez vos comptes le mois suivant. Si un prélèvement persiste, contestez-le auprès de votre banque dans les 8 semaines.",
        tip: "Astuce : résiliez quelques jours avant le renouvellement pour ne pas payer une période supplémentaire.",
      },
    ],
  },
  {
    key: "digital-signaler-arnaque",
    title: "Signaler une arnaque en ligne",
    category: "digital",
    audience: ["teen", "adult", "senior"],
    summary:
      "Signaler une escroquerie subie ou tentée aux autorités compétentes.",
    duration: "30 min",
    cost: "Gratuit",
    documents: ["Copies des messages", "Preuves de paiement", "Coordonnées de l'escroc"],
    steps: [
      {
        title: "Ne coupez pas le contact immédiatement",
        description:
          "Conservez tous les messages, numéros, adresses e-mail et URLs. Ces preuves sont indispensables pour l'enquête.",
      },
      {
        title: "Bloquez et signalez sur la plateforme",
        description:
          "Utilisez les fonctions de signalement du réseau social, de la messagerie ou du site concerné.",
      },
      {
        title: "Déposez un signalement officiel",
        description:
          "Dans la plupart des pays, un portail public permet de signaler les arnaques en ligne (cybermalveillance, fraude). Vous obtiendrez un numéro de signalement.",
      },
      {
        title: "Contactez votre banque si vous avez payé",
        description:
          "Agissez vite : la contestation d'une opération frauduleuse est plus efficace dans les premières heures et jusqu'à 8 semaines pour les prélèvements.",
      },
    ],
  },
  {
    key: "digital-premiere-carte",
    title: "Gérer son argent avec sa première carte",
    category: "digital",
    audience: ["junior", "teen"],
    summary:
      "Apprendre à utiliser une carte bancaire ou un compte jeune en toute sécurité.",
    duration: "30 min d'apprentissage",
    cost: "Gratuit",
    documents: ["Carte bancaire", "Application mobile de la banque"],
    steps: [
      {
        title: "Découvre ta carte",
        description:
          "Ta carte a un numéro, une date de validité et un code secret (CVV). Ne partage JAMAIS ces informations, même avec des « amis » en ligne.",
      },
      {
        title: "Installe l'application avec un adulte",
        description:
          "Fais-toi aider pour installer l'application de ta banque. Active les notifications : tu sauras immédiatement quand de l'argent sort de ton compte.",
        tip: "Règle d'or : si on te demande ton code secret, c'est TOUJOURS une arnaque. Même la banque ne te le demandera jamais.",
      },
      {
        title: "Fixe ton budget avec tes parents",
        description:
          "Décide avec eux du montant mensuel et de ce qu'il couvre (sorties, jeux, vêtements). Utilise le module budget de LifeCopilot pour suivre.",
      },
      {
        title: "Vérifie ton compte chaque semaine",
        description:
          "Prends 5 minutes par semaine pour regarder ce qui a été dépensé. Si tu vois une opération inconnue, dis-le immédiatement à tes parents.",
      },
    ],
  },
  {
    key: "digital-premiers-pas-numeriques",
    title: "Premiers pas sur internet en sécurité",
    category: "digital",
    audience: ["junior"],
    summary:
      "Les règles essentielles pour un enfant qui découvre internet et les écrans.",
    duration: "À lire avec un adulte : 20 min",
    cost: "Gratuit",
    documents: [],
    steps: [
      {
        title: "La règle des 4 secrets",
        description:
          "On ne donne jamais : son vrai nom complet, son adresse, son école et ses photos à des inconnus sur internet. Même si la personne a l'air gentille.",
      },
      {
        title: "Parle à un adulte de confiance",
        description:
          "Si quelque chose te met mal à l'aise en ligne — un message bizarre, une photo strange, une demande — raconte-le à un parent ou un enseignant. Tu ne seras jamais puni pour avoir parlé.",
        tip: "Rappel : ce n'est JAMAIS ta faute si un adulte en ligne te demande des choses bizarres.",
      },
      {
        title: "Le temps d'écran",
        description:
          "Avec tes parents, définissez ensemble combien de temps tu peux passer sur les écrans et à quels moments (pas pendant les devoirs ni juste avant de dormir).",
      },
      {
        title: "Vérifie avant de croire",
        description:
          "Tout ce qu'on lit sur internet n'est pas vrai. Si une information te surprend, demande à un adulte ou cherche-la sur un site sérieux.",
      },
    ],
  },
  {
    key: "digital-senior-visio-sante",
    title: "Faire une téléconsultation médicale",
    category: "digital",
    audience: ["senior"],
    summary:
      "Consulter un médecin à distance par visioconférence, simplement et sans stress.",
    duration: "30–45 min (installation + consultation)",
    cost: "Gratuit (consultation remboursée)",
    documents: ["Carte vitale / assurance", "Liste des médicaments"],
    steps: [
      {
        title: "Faites-vous aider pour l'installation",
        description:
          "Un proche, un aidant ou le mode accompagnement de LifeCopilot peut installer l'application avec vous. Une seule installation suffit : elle resservira à chaque consultation.",
      },
      {
        title: "Testez avant le rendez-vous",
        description:
          "La veille, faites un appel test avec un proche : caméra, micro, connexion. Prévoyez une pièce bien éclairée, assis confortablement.",
        tip: "Astuce : posez votre appareil sur une pile de livres à hauteur des yeux — le médecin vous verra bien et vos mains seront libres pour prendre des notes.",
      },
      {
        title: "Préparez vos notes",
        description:
          "Écrivez avant la consultation : vos symptômes, depuis quand, vos médicaments actuels et vos 3 questions. Lisez-les pendant l'appel, c'est tout à fait normal.",
      },
      {
        title: "Après la consultation",
        description:
          "L'ordonnance est envoyée par e-mail ou disponible dans l'application. Faites-la lire par votre pharmacie, qui peut aussi vous aider à la récupérer.",
      },
    ],
  },
  {
    key: "digital-heritage-numerique",
    title: "Organiser son héritage numérique",
    category: "digital",
    audience: ["adult", "senior"],
    summary:
      "Préparer la transmission ou la gestion de ses comptes et données en cas d'absence.",
    duration: "2–3 h",
    cost: "Gratuit",
    documents: ["Inventaire des comptes", "Instructions de transmission"],
    steps: [
      {
        title: "Inventoriez vos comptes importants",
        description:
          "Banque, e-mail, assurances, réseaux sociaux, impôts, fichiers. Notez où se trouve chaque compte sans écrire les mots de passe sur ce document.",
      },
      {
        title: "Choisissez vos contacts de confiance",
        description:
          "Désignez une ou deux personnes de confiance (conjoint, enfant) qui pourront agir en votre absence. Informez-les de leur rôle.",
      },
      {
        title: "Configurez les options de legacy",
        description:
          "Plusieurs services (Google, Apple, Meta) proposent des « contacts légataires » ou comptes mémoriaux. Activez-les dans les paramètres.",
        tip: "Astuce : un gestionnaire de mots de passe avec partage d'urgence (ex. « accès d'urgence ») est la solution la plus propre.",
      },
      {
        title: "Mettez à jour chaque année",
        description:
          "Revoyez votre inventaire une fois par an et après chaque changement de situation. Enregistrez la date de la prochaine revue dans LifeCopilot.",
      },
    ],
  },
];

export const PROCEDURES_BY_KEY: Record<string, Procedure> = Object.fromEntries(
  PROCEDURES.map((p) => [p.key, p])
);
