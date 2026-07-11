// Descripteurs sérialisables des objets cliquables du bureau. Construits côté
// serveur (page.tsx) à partir de la vraie data, puis passés au canvas client.

export type DeskTargetName = "monitor" | "phone" | "books" | "mug" | "plant";

export interface DeskLink {
  /** Libellé affiché au survol (déjà traduit). */
  label: string;
  /** anchor = scroll vers un id de section ; route = navigation interne ; external = nouvel onglet. */
  kind: "anchor" | "route" | "external";
  /** id de section (sans #), chemin interne, ou URL externe selon `kind`. */
  href: string;
}

export type DeskLinks = Partial<Record<DeskTargetName, DeskLink>>;
