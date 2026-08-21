import { LegalPage } from "@/components/LegalPage";

const SECTIONS = [
  {
    heading: "Éditeur du site",
    content:
      "Le site LifeCopilot est édité et exploité dans le cadre d'un service en ligne. Pour toute question, information ou réclamation, vous pouvez contacter l'éditeur à l'adresse électronique suivante : **{{CONTACT_EMAIL}}**. Les demandes de réponse sont généralement traitées dans un délai raisonnable.",
  },
  {
    heading: "Objet du site",
    content:
      "LifeCopilot est un service d'aide à la navigation dans les démarches de la vie quotidienne (administratives, financières, scolaires, de santé et numériques). Le service propose des parcours guidés, un assistant conversationnel alimenté par l'intelligence artificielle, un générateur de lettres et un outil d'analyse de contenus suspects. Le service s'adresse à un large public, incluant les jeunes, les adultes et les personnes âgées.",
  },
  {
    heading: "Responsabilité et limites du service",
    content:
      "Les informations, contenus et documents générés par LifeCopilot, y compris par ses fonctionnalités d'intelligence artificielle, sont fournis à titre informatif et d'aide générale. Ils ne constituent pas un conseil juridique, financier, médical ou professionnel. LifeCopilot ne peut être tenu responsable des décisions prises par un utilisateur sur la base de ces contenus. Il appartient à l'utilisateur de vérifier les informations auprès des organismes officiels compétents avant d'effectuer toute démarche officielle.",
  },
  {
    heading: "Propriété intellectuelle",
    content:
      "L'ensemble des éléments du site LifeCopilot (textes, graphismes, logiciels, base de données, identité visuelle) est la propriété de LifeCopilot ou de ses partenaires. Toute reproduction, représentation, modification, publication ou adaptation de ces éléments, quelle que soit la forme, est interdite sans autorisation écrite préalable.",
  },
  {
    heading: "Hébergement",
    content:
      "Le site est hébergé par Manus, prestataire d'hébergement cloud.\n\n**Manus** — Plateforme d'hébergement et de déploiement d'applications web.",
  },
  {
    heading: "Contact",
    content:
      "Pour toute question relative aux présentes mentions légales ou au fonctionnement du service, écrivez-nous à : **{{CONTACT_EMAIL}}**.",
  },
];

export default function LegalMentions() {
  return <LegalPage title="Mentions légales" subtitle="Informations relatives à l'éditeur et au fonctionnement du site LifeCopilot." sections={SECTIONS} />;
}
