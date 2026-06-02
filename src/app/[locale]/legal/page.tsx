import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Locale = "fr" | "en" | "it";

const titles: Record<Locale, string> = {
  fr: "Mentions légales",
  en: "Legal notice",
  it: "Note legali",
};

const sections: Record<
  Locale,
  Array<{ heading: string; body: (vars: { name: string; email: string }) => string }>
> = {
  fr: [
    {
      heading: "Éditeur du site",
      body: ({ name, email }) =>
        `Ce site est édité à titre personnel par ${name}. Pour toute question, contact : ${email}.`,
    },
    {
      heading: "Directeur de la publication",
      body: ({ name }) => `${name}.`,
    },
    {
      heading: "Hébergement",
      body: () =>
        "Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Site : vercel.com.",
    },
    {
      heading: "Propriété intellectuelle",
      body: () =>
        "L'ensemble du contenu présent sur ce site (textes, images, code, design) est protégé par le droit d'auteur. Toute reproduction, totale ou partielle, est interdite sans autorisation préalable écrite.",
    },
    {
      heading: "Responsabilité",
      body: () =>
        "Les informations diffusées sur ce site sont fournies à titre indicatif. L'éditeur ne saurait être tenu responsable des erreurs, omissions ou résultats obtenus à partir de l'usage de ces informations.",
    },
    {
      heading: "Liens externes",
      body: () =>
        "Ce site peut contenir des liens vers des sites tiers. L'éditeur n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.",
    },
    {
      heading: "Contact",
      body: ({ email }) => `Pour toute demande ou réclamation : ${email}.`,
    },
  ],
  en: [
    {
      heading: "Site editor",
      body: ({ name, email }) =>
        `This site is published on a personal basis by ${name}. For any question, contact: ${email}.`,
    },
    {
      heading: "Publication director",
      body: ({ name }) => `${name}.`,
    },
    {
      heading: "Hosting",
      body: () =>
        "The site is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United States. Website: vercel.com.",
    },
    {
      heading: "Intellectual property",
      body: () =>
        "All content on this site (text, images, code, design) is protected by copyright. Any reproduction, in whole or in part, is forbidden without prior written authorization.",
    },
    {
      heading: "Liability",
      body: () =>
        "Information published on this site is provided for informational purposes only. The editor cannot be held responsible for errors, omissions, or results obtained from the use of this information.",
    },
    {
      heading: "External links",
      body: () =>
        "This site may contain links to third-party sites. The editor has no control over these sites and disclaims any responsibility for their content.",
    },
    {
      heading: "Contact",
      body: ({ email }) => `For any request or claim: ${email}.`,
    },
  ],
  it: [
    {
      heading: "Editore del sito",
      body: ({ name, email }) =>
        `Questo sito è pubblicato a titolo personale da ${name}. Per qualsiasi domanda, contatto: ${email}.`,
    },
    {
      heading: "Direttore della pubblicazione",
      body: ({ name }) => `${name}.`,
    },
    {
      heading: "Hosting",
      body: () =>
        "Il sito è ospitato da Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, Stati Uniti. Sito: vercel.com.",
    },
    {
      heading: "Proprietà intellettuale",
      body: () =>
        "Tutti i contenuti presenti su questo sito (testi, immagini, codice, design) sono protetti da copyright. Qualsiasi riproduzione, totale o parziale, è vietata senza previa autorizzazione scritta.",
    },
    {
      heading: "Responsabilità",
      body: () =>
        "Le informazioni pubblicate su questo sito sono fornite a titolo informativo. L'editore non può essere ritenuto responsabile per errori, omissioni o risultati ottenuti dall'uso di queste informazioni.",
    },
    {
      heading: "Link esterni",
      body: () =>
        "Questo sito può contenere link a siti di terzi. L'editore non esercita alcun controllo su tali siti e declina ogni responsabilità riguardo al loro contenuto.",
    },
    {
      heading: "Contatto",
      body: ({ email }) => `Per qualsiasi richiesta o reclamo: ${email}.`,
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return { title: titles[locale] ?? titles.fr };
}

export default async function LegalPage() {
  const locale = (await getLocale()) as Locale;
  const profile = await prisma.profile.findFirst({ where: { id: "default" } });

  const name =
    locale === "en"
      ? profile?.nameEn || profile?.nameFr || "Portfolio"
      : locale === "it"
      ? profile?.nameIt || profile?.nameFr || "Portfolio"
      : profile?.nameFr || "Portfolio";

  const email = profile?.email || "";

  const t = titles[locale] ?? titles.fr;
  const items = sections[locale] ?? sections.fr;
  const updatedLabel =
    locale === "en" ? "Last updated" : locale === "it" ? "Ultimo aggiornamento" : "Dernière mise à jour";
  const updatedAt = new Date().toLocaleDateString(
    locale === "en" ? "en-US" : locale === "it" ? "it-IT" : "fr-FR",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1
        className="text-2xl font-mono font-bold mb-3"
        style={{ color: "var(--foreground)" }}
      >
        {t}
      </h1>
      <p className="text-xs font-mono mb-12" style={{ color: "var(--muted-foreground)" }}>
        {updatedLabel} : {updatedAt}
      </p>

      <div className="space-y-10">
        {items.map((s) => (
          <section key={s.heading}>
            <h2
              className="text-sm font-mono font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--foreground)" }}
            >
              {s.heading}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              {s.body({ name, email })}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
