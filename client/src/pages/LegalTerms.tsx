import { LegalPage } from "@/components/LegalPage";

const SECTIONS = [
  {
    heading: "Acceptation des conditions",
    content:
      "En accédant au site LifeCopilot et en utilisant ses services, vous acceptez les présentes conditions générales d'utilisation (CGU). Si vous n'acceptez pas ces conditions, vous devez cesser d'utiliser le service. Nous nous réservons le droit de modifier ces CGU à tout moment ; la version en vigueur est celle publiée sur le site.",
  },
  {
    heading: "Description du service",
    content:
      "LifeCopilot est un service gratuit en ligne qui aide ses utilisateurs à comprendre et accomplir les démarches de la vie quotidienne : parcours guidés pas à pas, assistant conversationnel basé sur l'intelligence artificielle, générateur de lettres et analyseur de contenus suspects. Le service est destiné à un public de tous âges, des jeunes aux personnes âgées.",
  },
  {
    heading: "Compte utilisateur",
    content:
      "L'accès à certaines fonctionnalités (sauvegarde des démarches, tableau de bord, historique des lettres) nécessite un compte, créé via la connexion sécurisée proposée sur le site. Vous êtes responsable de la confidentialité de votre compte et des activités réalisées depuis celui-ci.",
  },
  {
    heading: "Utilisation acceptable",
    content:
      "Vous vous engagez à utiliser le service conformément à sa destination, sans porter atteinte à son bon fonctionnement, sans tenter de contourner ses mesures de sécurité, et sans y collecter de données en masse. Il est interdit de soumettre des contenus illicites ou portant atteinte aux droits d'autrui. LifeCopilot se réserve le droit de suspendre tout compte en cas d'usage abusif.",
  },
  {
    heading: "Nature des contenus générés par IA",
    content:
      "Les réponses de l'assistant, les lettres générées et les analyses de contenus sont produites à l'aide de modèles d'intelligence artificielle. Ces contenus sont fournis **à titre indicatif** et peuvent contenir des erreurs ou des imprécisions. Ils ne remplacent pas un conseil professionnel qualifié (juridique, financier, médical). Il vous appartient de vérifier toute information auprès des sources officielles avant de l'utiliser dans une démarche engageante.",
  },
  {
    heading: "Limitation de responsabilité",
    content:
      "LifeCopilot s'efforce de maintenir le service disponible et fiable, mais ne garantit pas une disponibilité ininterrompue ni l'absence totale d'erreurs. LifeCopilot ne peut être tenu responsable des dommages résultant de l'utilisation du service, dans la mesure permise par la loi applicable, notamment lorsqu'un utilisateur suit un conseil généré par IA sans vérification préalable auprès de l'organisme compétent.",
  },
  {
    heading: "Sécurité et vigilance",
    content:
      "Le détecteur d'arnaques est un outil d'aide à la vigilance : il ne constitue ni une garantie d'authenticité ni une analyse juridique. Face à un contenu suspect, ne partagez jamais vos informations personnelles, coordonnées bancaires ou codes d'accès, et signalez les fraudes avérées aux autorités compétentes de votre pays.",
  },
  {
    heading: "Contact",
    content:
      "Pour toute question relative aux présentes CGU : **{{CONTACT_EMAIL}}**.",
  },
];

export default function LegalTerms() {
  return <LegalPage title="Conditions générales d'utilisation" subtitle="Règles d'utilisation du service LifeCopilot." sections={SECTIONS} />;
}
