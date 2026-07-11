// Palette monochrome de la scène 3D, calquée sur les variables de thème
// définies dans globals.css (light/dark). On la duplique ici en valeurs
// littérales car three.js ne lit pas les variables CSS au moment du rendu.

export interface Palette {
  deskTop: string;
  deskLeg: string;
  device: string;
  deviceDark: string;
  screen: string;
  screenGlow: string;
  accent: string;
  book1: string;
  book2: string;
  book3: string;
  mug: string;
  plantPot: string;
  plant: string;
  shadow: string;
  /** Couleurs du petit label (pastille) affiché au survol d'un objet. */
  labelBg: string;
  labelText: string;
  /** Couleur des lignes de rappel (callouts) objet → label. */
  line: string;
}

export function getPalette(dark: boolean): Palette {
  return dark
    ? {
        deskTop: "#3f3f46",
        deskLeg: "#27272a",
        device: "#e4e4e7",
        deviceDark: "#18181b",
        screen: "#09090b",
        screenGlow: "#a1a1aa",
        accent: "#ffffff",
        book1: "#52525b",
        book2: "#71717a",
        book3: "#3f3f46",
        mug: "#e4e4e7",
        plantPot: "#52525b",
        plant: "#a1a1aa",
        shadow: "#000000",
        labelBg: "#ffffff",
        labelText: "#000000",
        line: "#52525b",
      }
    : {
        deskTop: "#e4e4e7",
        deskLeg: "#d4d4d8",
        device: "#1f2937",
        deviceDark: "#111827",
        screen: "#111827",
        screenGlow: "#9ca3af",
        accent: "#111827",
        book1: "#a1a1aa",
        book2: "#71717a",
        book3: "#d4d4d8",
        mug: "#111827",
        plantPot: "#71717a",
        plant: "#52525b",
        shadow: "#111827",
        labelBg: "#111827",
        labelText: "#ffffff",
        line: "#c4c4c8",
      };
}
