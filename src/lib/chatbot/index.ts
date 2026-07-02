import { prisma } from "@/lib/db";
import type { AppLocale } from "@/lib/seo";
import {
  detectMessageLocale,
  findBestMatch,
  looksLikeEscalationIntent,
  parseKeywords,
  type FaqCandidate,
  type MatchResult,
} from "./matcher";

export type BotLocale = AppLocale;

export { detectMessageLocale };

const FALLBACK: Record<BotLocale, string> = {
  fr: "Je n'ai pas de réponse toute prête. Cliquez sur « Parler à un humain » pour joindre Lionel directement.",
  en: "I don't have an answer ready. Click \"Talk to a human\" and Lionel will reply.",
  it: "Non ho una risposta pronta. Clicca su « Parla con un umano » per contattare Lionel.",
};

const ESCALATION_ACK: Record<BotLocale, string> = {
  fr: "D'accord, je transmets à Lionel. Il vous répondra dès que possible.",
  en: "Got it, transferring to Lionel. He'll reply as soon as possible.",
  it: "Ok, passo a Lionel. Ti risponderà appena possibile.",
};

export function botLocaleFromAcceptLanguage(header: string | null): BotLocale {
  if (!header) return "fr";
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("en")) return "en";
  if (first.startsWith("it")) return "it";
  return "fr";
}

async function loadFaqCandidates(locale: BotLocale): Promise<FaqCandidate[]> {
  const rows = await prisma.faqEntry.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return rows.map<FaqCandidate>((r) => ({
    id: r.id,
    questions: [r.questionFr, r.questionEn, r.questionIt],
    keywords: parseKeywords(r.keywords),
    answer:
      locale === "en"
        ? r.answerEn || r.answerFr
        : locale === "it"
          ? r.answerIt || r.answerFr
          : r.answerFr,
  }));
}

export type BotDecision =
  | { kind: "match"; reply: string; entryId: string; score: number }
  | { kind: "escalate"; reply: string }
  | { kind: "fallback"; reply: string };

export async function decideBotReply(
  visitorMessage: string,
  widgetLocale: BotLocale
): Promise<BotDecision & { replyLocale: BotLocale }> {
  const replyLocale = detectMessageLocale(visitorMessage, widgetLocale);

  if (looksLikeEscalationIntent(visitorMessage)) {
    return { kind: "escalate", reply: ESCALATION_ACK[replyLocale], replyLocale };
  }

  const candidates = await loadFaqCandidates(replyLocale);
  const match: MatchResult | null = findBestMatch(visitorMessage, candidates);

  if (match) {
    return {
      kind: "match",
      reply: match.entry.answer,
      entryId: match.entry.id,
      score: match.score,
      replyLocale,
    };
  }

  return { kind: "fallback", reply: FALLBACK[replyLocale], replyLocale };
}

export const ESCALATION_MESSAGES = ESCALATION_ACK;
