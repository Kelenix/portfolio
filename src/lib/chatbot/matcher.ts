export type FaqCandidate = {
  id: string;
  questions: string[];
  keywords: string[];
  answer: string;
};

export type MatchResult = {
  entry: FaqCandidate;
  score: number;
};

const DEFAULT_THRESHOLD = 0.3;
const STOP_WORDS = new Set([
  "le","la","les","de","des","du","un","une","et","à","au","aux","en","dans","sur",
  "pour","par","est","es","c'est","c","d","l","je","tu","il","elle","on","nous","vous",
  "ils","elles","ce","cet","cette","ces","ma","mon","mes","ta","ton","tes","sa","son","ses",
  "the","a","an","and","or","of","to","in","on","for","is","are","be","it","that","this","i","you",
  "il","lo","la","gli","le","di","del","della","e","o","con","su","per","è","sono","in","al","alla",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function bigrams(text: string): Set<string> {
  const t = normalize(text).replace(/\s/g, "");
  const grams = new Set<string>();
  for (let i = 0; i < t.length - 1; i++) {
    grams.add(t.slice(i, i + 2));
  }
  return grams;
}

function dice(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const g of a) if (b.has(g)) overlap++;
  return (2 * overlap) / (a.size + b.size);
}

export function parseKeywords(raw: string): string[] {
  return raw
    .split(/[,\n|]/)
    .map((k) => normalize(k))
    .filter((k) => k.length > 0);
}

export function findBestMatch(
  visitorMessage: string,
  entries: FaqCandidate[],
  threshold = DEFAULT_THRESHOLD
): MatchResult | null {
  if (!visitorMessage.trim() || entries.length === 0) return null;

  const messageGrams = bigrams(visitorMessage);
  const messageTokens = new Set(tokens(visitorMessage));

  let best: MatchResult | null = null;

  for (const entry of entries) {
    let score = 0;
    for (const q of entry.questions) {
      if (!q) continue;
      const s = dice(messageGrams, bigrams(q));
      if (s > score) score = s;
    }
    for (const kw of entry.keywords) {
      if (!kw) continue;
      const kwTokens = kw.split(" ");
      const allMatch = kwTokens.every((t) => messageTokens.has(t));
      if (allMatch) score += 0.25;
    }
    if (score > 1) score = 1;
    if (score >= threshold && (best === null || score > best.score)) {
      best = { entry, score };
    }
  }

  return best;
}

const ESCALATION_PATTERNS = [
  /\bhumain\b/,
  /\bpersonne\b/,
  /\bquelqu.?un\b/,
  /\bhuman\b/,
  /\bperson\b/,
  /\bsomeone\b/,
  /\bumano\b/,
  /\bpersona\b/,
  /\bparler\s+(a|à)\s+/,
  /\btalk\s+to\s+/,
];

export function looksLikeEscalationIntent(text: string): boolean {
  const n = normalize(text);
  return ESCALATION_PATTERNS.some((r) => r.test(n));
}
