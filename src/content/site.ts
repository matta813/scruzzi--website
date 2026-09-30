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
    "Mattia, Plattformentwickler EFZ im 3. Lehrjahr: Virtualisierung, Netzwerk, Automation und Self-Hosting im eigenen Homelab.",
  email: "mattia@scruzzi.com",
  contactEmail: "kontakt@scruzzi.com",
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
    before: "Ich bin Lernender mit einer Schwäche für",
    red: "Hardware",
    middle: "und",
    code: "<automation/>",
    after: "Nichts begeistert mich mehr als Systeme, die nachts um drei einfach weiterlaufen.",
  },
  noteTop: "3. Lehrjahr",
  noteBottom: "Betreibt sein eigenes Homelab",
  stamp: "24/7",
};

export const manifesto = {
  text: "Gute Infrastruktur entsteht nicht durch Tools allein. Sie wächst durch lange Abende, kaputte Updates und ein Backup, das man zum Glück nie gebraucht hat.",
  aside: ["„Nur noch", "ein Update.“"],
};

export const stats = [
  { value: 2, label: "Proxmox-Nodes" },
  { value: 14, label: "VMs & Container" },
  { value: 3, label: "Netzwerkzonen" },
  { value: 2, label: "Redundante Kerndienste" },
];

export const skills = [
  { title: "Virtualisierung & Container", items: ["Proxmox VE", "LXC", "Docker", "Docker Compose"] },
  { title: "Netzwerk & Dienste", items: ["VLAN-Segmentierung", "DNS", "Reverse Proxy", "NTP"] },
  { title: "Microsoft & Clients", items: ["Microsoft Intune", "Microsoft 365", "Active Directory / LDAP", "Softwarepaketierung"] },
  { title: "Backup & Security", items: ["Proxmox Backup Server", "Veeam", "Endpoint Security", "Passwortmanagement"] },
  { title: "Datenbanken", items: ["PostgreSQL", "SQL", "Datenmodellierung"] },
  { title: "Automation & Entwicklung", items: ["Bash", "Python", "Ansible", "Git", "GitHub Actions"] },
];

export const operations = [
  {
    id: "cluster",
    short: "Proxmox-Cluster",
    tag: "Fundament aller Dienste",
    dot: "PVE",
    title: "Zwei-Node-Proxmox-Cluster",
    text: "Jede Anwendung läuft isoliert in einer VM oder einem schlanken LXC-Container.",
    result: "Jeder Dienst lässt sich einzeln verschieben und neu starten.",
  },
  {
    id: "network",
    short: "Netzwerk & DNS",
    tag: "Zonen & Ausfallsicherheit",
    dot: "DNS",
    title: "Segmentiertes Netzwerk",
    text: "VLANs trennen Verwaltung, Proxy und übrige Dienste. DNS und Zeitserver laufen redundant auf beiden Nodes, ein zentraler Reverse Proxy veröffentlicht die Anwendungen.",
    result: "Namensauflösung und Zeit bleiben verfügbar, auch wenn ein Node ausfällt.",
  },
  {
    id: "cloud",
    short: "Eigene Cloud",
    tag: "Datenhoheit",
    dot: "CLOUD",
    title: "Self-Hosted statt Abo",
    text: "Dateisync, Fotoverwaltung und Passwortmanager laufen im eigenen Netz.",
    result: "Persönliche Daten bleiben unter meiner Kontrolle.",
  },
  {
    id: "compute",
    short: "Container & Datenbank",
    tag: "Apps & Backend",
    dot: "DB",
    title: "Anwendungsplattform",
    text: "Zwei Docker-Hosts betreiben containerisierte Anwendungen, ein dedizierter Datenbankserver liefert das Backend. Eine Entwicklungs-VM ergänzt das Setup.",
    result: "Neue Anwendungen sind schnell bereitgestellt, die Datenbank steht schon bereit.",
  },
  {
    id: "backup",
    short: "Backup",
    tag: "Notfallplan",
    dot: "PBS",
    title: "Sicherungen im eigenen Rechenzentrum",
    text: "Ein Proxmox Backup Server sichert alle VMs und Container. Aufbewahrung und Restore-Tests baue ich schrittweise aus.",
    result: "Einzelne Systeme lassen sich ohne kompletten Neuaufbau zurückholen.",
  },
];

export const pipeline = [
  { name: "Git", text: "Versionierte Änderung" },
  { name: "CI", text: "Lint, Tests und Build" },
  { name: "Scan", text: "Image-Prüfung mit Trivy" },
  { name: "Release", text: "Image in GHCR, automatischer Rollout" },
];

export const projects = [
  {
    name: "Velora DNS",
    tag: "Go + React",
    dot: "DNS",
    text: "Schlanker DNS-Server mit verschlüsselten Protokollen, Blocklisten und React-Oberfläche. Aktuell in der Beta.",
    href: "https://github.com/matta813/velora-dns",
  },
  {
    name: "PGSentinel",
    tag: "PostgreSQL",
    dot: "PG",
    text: "Monitoring und Health-Analyse für PostgreSQL, die erklärt, was nicht stimmt, warum es wichtig ist und wo man weitersucht.",
    href: "https://github.com/matta813/PGSentinel",
  },
  {
    name: "The Other Player",
    tag: "Godot",
    dot: "GAME",
    text: "Kooperatives Psychological-Horror-Game in Godot. Das erste Kapitel ist spielbar, das Projekt steht in der Pre-Alpha.",
    href: "https://github.com/matta813/THE-OTHER-PLAYER",
  },
];

export const about = {
  title: "Zwischen Betrieb und Serverschrank",
  lead: "Mich fasziniert, was hinter den Kulissen von Software passiert: Server, Netzwerke, Deployments. Die Infrastruktur, auf der alles läuft.",
  paragraphs: [
    "Meine Lehre mache ich bei einem IT-Dienstleister. Im Alltag geht es um Support, Clientmanagement mit Microsoft Intune, Backups und Security für Kundinnen und Kunden.",
    "Nebenbei baue ich mein Homelab aus. Dort probiere ich aus, was ich in Schule und Betrieb lerne, und mache die Fehler, die im Kundenumfeld teuer wären.",
  ],
  facts: [
    { label: "Ausbildung", value: "Plattformentwickler EFZ, 3. Lehrjahr" },
    { label: "Standort", value: "Nordwestschweiz" },
    { label: "Schwerpunkt", value: "Virtualisierung, Netzwerk, Automation" },
  ],
};

export const contact = {
  title: ["Lass uns", "reden"],
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
