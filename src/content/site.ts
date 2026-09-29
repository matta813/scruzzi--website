// All personal content lives here; components only render it.

export type Link = { label: string; href: string };

export const site = {
  url: "https://scruzzi.com",
  firstName: "Mattia",
  lastName: "Scruzzi",
  fullName: "Mattia Scruzzi",
  role: "Plattformentwickler EFZ",
  jobTitle: "Plattformentwickler EFZ (in Ausbildung)",
  description:
    "Mattia, Plattformentwickler in Ausbildung: Kubernetes, GitOps, Automation und Self-Hosting-Infrastruktur.",
  email: "mattia@scruzzi.com",
  place: "Schweiz, CH",
  country: "CH",
  timeZone: "Europe/Zurich",
  // Geographic centre of Switzerland (Älggi-Alp), not a personal address.
  coordinates: ["46°48'05.0\"N", "8°13'37.0\"E"],
  sourceUrl: "https://github.com/matta813/scruzzi--website",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mattia-scruzzi-87b52a419" },
    { label: "GitHub", href: "https://github.com/matta813" },
  ] satisfies Link[],
} as const;

export const hero = {
  intro: {
    before: "Ich bin ein Lernender mit einer Schwäche für",
    red: "Hardware",
    middle: "und",
    code: "<automation/>",
    after: "Nichts begeistert mich mehr als Systeme, die nachts um drei einfach weiterlaufen.",
  },
  noteTop: "In Ausbildung",
  noteBottom: "Betreibt sein eigenes Cluster",
  stamp: "24/7",
};

export const manifesto = {
  text: "Gute Infrastruktur entsteht nicht durch Tools allein. Sie wächst durch Nachtschichten im Homelab, kaputte Deployments und einen Rollback zu viel.",
  aside: ["„Nur noch", "ein Deployment.“"],
};

export const stats = [
  { value: 3, label: "Nodes im Cluster" },
  { value: 5, label: "Systeme im Dauerbetrieb" },
  { value: 6, label: "Skill-Bereiche" },
  { value: 3, label: "Open-Source-Projekte" },
];

export const skills = [
  { title: "Container & Orchestrierung", items: ["Kubernetes (MicroK8s)", "Docker", "Helm"] },
  { title: "GitOps & CI/CD", items: ["FluxCD", "ArgoCD", "GitHub Actions", "GHCR"] },
  { title: "Infrastruktur & Storage", items: ["Longhorn", "NFS", "MetalLB", "TrueNAS / ZFS"] },
  { title: "Datenbanken", items: ["PostgreSQL", "Administration", "Tuning", "Backups"] },
  { title: "Monitoring & Security", items: ["Zabbix", "Wazuh (SIEM)", "VLAN-Segmentierung"] },
  { title: "Tooling & Automation", items: ["Reverse Proxys", "Secrets Management", "Dependabot"] },
];

export const operations = [
  {
    id: "cluster",
    short: "Kubernetes-Cluster",
    tag: "GitOps, App-of-Apps",
    dot: "K8S",
    title: "Mehrknotiger Kubernetes-Cluster",
    text: "Betrieb und Wartung eines Clusters mit mehreren Nodes. Alle Deployments laufen GitOps-basiert nach dem App-of-Apps-Pattern: jede Änderung ist versioniert, nachvollziehbar und wird automatisch ausgerollt.",
    result: "Reproduzierbare Deployments mit Git als nachvollziehbarer Quelle.",
  },
  {
    id: "database",
    short: "Datenbanken",
    tag: "PostgreSQL zentral",
    dot: "PGSQL",
    title: "Zentrale Datenbank-Infrastruktur",
    text: "Eine zentrale PostgreSQL-Instanz versorgt mehrere Applikationen. Dazu gehören Performance-Tuning, Rechteverwaltung und automatisierte, regelmässig geprüfte Backups.",
    result: "Gemeinsamer Datenbankbetrieb mit regelmässig geprüfter Wiederherstellung.",
  },
  {
    id: "storage",
    short: "Storage & Netz",
    tag: "Longhorn, NFS, VLAN",
    dot: "NAS",
    title: "Storage- & Netzwerk-Architektur",
    text: "Verteilter Block-Storage und NFS-Shares für persistente Workloads, Load Balancing für Dienste im Cluster und ein mit VLANs segmentiertes Netzwerk.",
    result: "Persistente Workloads und klar getrennte Netzwerkzonen.",
  },
  {
    id: "monitoring",
    short: "Monitoring & SIEM",
    tag: "Zabbix, Wazuh",
    dot: "SIEM",
    title: "Monitoring- & Security-Stack",
    text: "Zentrales Monitoring mit Alerting sowie ein SIEM für sicherheitsrelevante Ereignisse. Auffälligkeiten werden erkannt, gemeldet und systematisch nachverfolgt.",
    result: "Zentrale Sicht auf Betrieb und Sicherheitsereignisse.",
  },
  {
    id: "gpu",
    short: "GPU-Transcoding",
    tag: "Passthrough im Cluster",
    dot: "GPU",
    title: "GPU-beschleunigtes Media-Transcoding",
    text: "Hardware-beschleunigtes Transcoding direkt im Cluster, inklusive GPU-Passthrough, Ressourcen-Zuteilung und Anbindung an die bestehende Deployment-Pipeline.",
    result: "GPU-Ressourcen stehen containerisierten Workloads automatisiert bereit.",
  },
];

export const pipeline = [
  { name: "Git", text: "Versionierte Änderung" },
  { name: "FluxCD", text: "Automatischer Abgleich" },
  { name: "Kubernetes", text: "Orchestrierter Rollout" },
  { name: "Monitoring", text: "Zustand und Alerts" },
];

export const projects = [
  {
    name: "Velora DNS",
    tag: "Go + React",
    dot: "DNS",
    text: "Selbst gehosteter DNS-Server mit eigener Resolver-Pipeline, React-Verwaltungsoberfläche und sicheren Standardeinstellungen.",
    href: "https://github.com/matta813/velora-dns",
  },
  {
    name: "PGSentinel",
    tag: "PostgreSQL",
    dot: "PG",
    text: "Monitoring und Health-Analyse für PostgreSQL, die Auffälligkeiten erklärt und Untersuchungsansätze liefert.",
    href: "https://github.com/matta813/PGSentinel",
  },
  {
    name: "Channie in Ifigge",
    tag: "Website",
    dot: "LOFI",
    text: "Datenschutzfreundliche Lo-Fi-Stream-Seite mit zustimmungsbasierter YouTube-Einbindung.",
    href: "https://github.com/matta813/channieinifigge--website",
  },
];

export const about = {
  title: "Verantwortung für laufende Systeme",
  lead: "Mich fasziniert, was hinter den Kulissen von Software passiert: Server, Netzwerke, Deployments. Die Infrastruktur, auf der alles läuft.",
  paragraphs: [
    "Ich absolviere meine Lehre als Plattformentwickler EFZ bei einem IT-Unternehmen in der Schweiz. Daneben betreibe ich eine eigene Umgebung, die ich wie ein kleines Rechenzentrum führe: mit Change-Management über Git, Monitoring, Backups und klaren Sicherheitszonen.",
    "Dabei lerne ich nicht nur Tools kennen, sondern auch, was es heisst, Verantwortung für laufende Systeme zu tragen. Mich motiviert, wenn Dinge robust, automatisiert und nachvollziehbar funktionieren. Wiederkehrende Handgriffe sind für mich eine Einladung, sie zu automatisieren.",
  ],
  facts: [
    { label: "Ausbildung", value: "Plattformentwickler EFZ" },
    { label: "Standort", value: "Schweiz" },
    { label: "Schwerpunkt", value: "Infrastruktur, Automation, Self-Hosting" },
  ],
};

export const contact = {
  title: ["Lass uns gute", "Infrastruktur", "bauen"],
  text: "Fragen zu meinem Setup, Feedback oder berufliche Anknüpfungspunkte: ich freue mich über jede Nachricht.",
  wordmark: "Portfolio/Mattia",
};

export const navigation: Link[] = [
  { label: "Skills", href: "#skills" },
  { label: "Betrieb", href: "#betrieb" },
  { label: "Projekte", href: "#projekte" },
  { label: "Über mich", href: "#ueber-mich" },
  { label: "Kontakt", href: "#kontakt" },
];
