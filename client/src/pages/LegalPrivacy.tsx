import { LegalPage } from "@/components/LegalPage";

const SECTIONS = [
  {
    heading: "Données collectées",
    content:
      "Dans le cadre de l'utilisation de LifeCopilot, nous collectons uniquement les données strictement nécessaires au fonctionnement du service : votre identifiant de connexion, votre adresse électronique, les informations de profil que vous renseignez volontairement (prénom, tranche d'âge, pays), ainsi que les contenus que vous créez dans le service (démarches sauvegardées, tâches, lettres générées, messages envoyés à l'assistant). Nous ne collectons aucune donnée bancaire ou financière.",
  },
  {
    heading: "Utilisation des données",
    content:
      "Vos données sont utilisées pour : créer et sécuriser votre compte, adapter le ton de l'assistant IA à votre tranche d'âge, sauvegarder votre historique et vos préférences, améliorer le service de manière agrégée et anonyme. Vos contenus personnels ne sont ni vendus ni cédés à des tiers à des fins commerciales. Les échanges avec les modèles d'intelligence artificielle transitent par des prestataires techniques sous-traitants strictement encadrés, dans le seul but de rendre les fonctionnalités du service (assistant, génération de lettres, analyse de contenus).",
  },
  {
    heading: "Conservation des données",
    content:
      "Les données de votre compte sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et de l'ensemble de vos données à tout moment en nous contactant à **{{CONTACT_EMAIL}}**. Après suppression, les données sont effacées de nos systèmes dans un délai raisonnable.",
  },
  {
    heading: "Sécurité",
    content:
      "Nous mettons en œuvre des mesures techniques et organisationnelles visant à protéger vos données contre l'accès non autorisé, la modification ou la destruction accidentelle : connexion chiffrée (HTTPS), authentification sécurisée, restrictions d'accès aux données côté serveur. Toutefois, aucune mesure de sécurité n'offre une garantie absolue.",
  },
  {
    heading: "Cookies et suivi",
    content:
      "LifeCopilot utilise un cookie de session strictement nécessaire à l'authentification, ainsi que des outils de mesure d'audience anonymisés pour comprendre l'utilisation générale du service. Aucun profil publicitaire n'est établi à partir de votre navigation.",
  },
  {
    heading: "Minors",
    content:
      "LifeCopilot s'adresse également aux jeunes utilisateurs. Le mode « junior » propose un langage simplifié et des conseils de prudence. Les jeunes utilisateurs sont invités à ne partager aucune information personnelle sensible (adresse exacte, documents d'identité, numéros de téléphone) dans les conversations avec l'assistant, et à demander l'aide d'un adulte pour toute démarche officielle.",
  },
  {
    heading: "Vos droits",
    content:
      "Conformément aux principes généraux de protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, écrivez à **{{CONTACT_EMAIL}}** en précisant « Données personnelles » dans l'objet du message.",
  },
  {
    heading: "Contact",
    content:
      "Pour toute question relative à la protection de vos données : **{{CONTACT_EMAIL}}**.",
  },
];

export default function LegalPrivacy() {
  return <LegalPage title="Politique de confidentialité" subtitle="Comment LifeCopilot collecte, utilise et protège vos données personnelles." sections={SECTIONS} />;
}
