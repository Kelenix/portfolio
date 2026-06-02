import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { buildLanguageAlternates, localizedPath } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Locale = "fr" | "en" | "it";

const titles: Record<Locale, string> = {
  fr: "Politique de confidentialité",
  en: "Privacy policy",
  it: "Informativa sulla privacy",
};

const sections: Record<
  Locale,
  Array<{ heading: string; body: (vars: { email: string }) => string }>
> = {
  fr: [
    {
      heading: "Préambule",
      body: () =>
        "Cette politique explique quelles données personnelles sont collectées sur ce site, comment elles sont utilisées et quels sont vos droits en application du Règlement Général sur la Protection des Données (RGPD).",
    },
    {
      heading: "Données collectées",
      body: () =>
        "Les seules données personnelles collectées le sont via le formulaire de contact : votre nom, votre adresse email et le contenu de votre message. Aucune autre donnée n'est collectée à votre insu.",
    },
    {
      heading: "Finalité du traitement",
      body: () =>
        "Ces données sont utilisées uniquement pour répondre à votre message. Elles ne sont jamais revendues, ni transmises à des tiers à des fins commerciales.",
    },
    {
      heading: "Conservation",
      body: () =>
        "Les messages reçus via le formulaire de contact sont conservés pour une durée maximale de 3 ans à compter du dernier contact, puis supprimés.",
    },
    {
      heading: "Hébergement des données",
      body: () =>
        "Les données sont stockées sur des serveurs gérés par Supabase (base de données PostgreSQL) et Vercel (hébergement applicatif). Ces prestataires sont conformes au RGPD.",
    },
    {
      heading: "Cookies",
      body: () =>
        "Ce site n'utilise aucun cookie de suivi publicitaire ni d'outil d'analyse tiers (Google Analytics, etc.). Seuls des cookies techniques nécessaires au fonctionnement de l'authentification administrateur peuvent être déposés.",
    },
    {
      heading: "Vos droits",
      body: () =>
        "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition au traitement de vos données. Pour exercer ces droits, contactez-nous à l'adresse indiquée ci-dessous.",
    },
    {
      heading: "Contact",
      body: ({ email }) =>
        `Pour toute question relative à la protection de vos données : ${email}.`,
    },
  ],
  en: [
    {
      heading: "Preamble",
      body: () =>
        "This policy explains what personal data is collected on this site, how it is used, and what your rights are under the General Data Protection Regulation (GDPR).",
    },
    {
      heading: "Data collected",
      body: () =>
        "The only personal data collected is via the contact form: your name, your email address, and the content of your message. No other data is collected without your knowledge.",
    },
    {
      heading: "Purpose of processing",
      body: () =>
        "This data is used only to reply to your message. It is never sold or transmitted to third parties for commercial purposes.",
    },
    {
      heading: "Retention",
      body: () =>
        "Messages received via the contact form are kept for a maximum of 3 years from the last contact, then deleted.",
    },
    {
      heading: "Data hosting",
      body: () =>
        "Data is stored on servers managed by Supabase (PostgreSQL database) and Vercel (application hosting). Both providers are GDPR-compliant.",
    },
    {
      heading: "Cookies",
      body: () =>
        "This site does not use any advertising tracking cookies or third-party analytics tools (Google Analytics, etc.). Only technical cookies required for the administrator authentication may be set.",
    },
    {
      heading: "Your rights",
      body: () =>
        "Under the GDPR, you have the right to access, rectify, delete, and object to the processing of your data. To exercise these rights, contact us at the address below.",
    },
    {
      heading: "Contact",
      body: ({ email }) =>
        `For any question regarding the protection of your data: ${email}.`,
    },
  ],
  it: [
    {
      heading: "Premessa",
      body: () =>
        "Questa informativa spiega quali dati personali sono raccolti su questo sito, come sono utilizzati e quali sono i tuoi diritti ai sensi del Regolamento Generale sulla Protezione dei Dati (GDPR).",
    },
    {
      heading: "Dati raccolti",
      body: () =>
        "Gli unici dati personali raccolti avvengono tramite il modulo di contatto: il tuo nome, il tuo indirizzo email e il contenuto del tuo messaggio. Nessun altro dato viene raccolto a tua insaputa.",
    },
    {
      heading: "Finalità del trattamento",
      body: () =>
        "Questi dati sono utilizzati esclusivamente per rispondere al tuo messaggio. Non sono mai rivenduti né trasmessi a terzi per scopi commerciali.",
    },
    {
      heading: "Conservazione",
      body: () =>
        "I messaggi ricevuti tramite il modulo di contatto sono conservati per un massimo di 3 anni dall'ultimo contatto, dopodiché vengono eliminati.",
    },
    {
      heading: "Hosting dei dati",
      body: () =>
        "I dati sono archiviati su server gestiti da Supabase (database PostgreSQL) e Vercel (hosting applicativo). Entrambi i fornitori sono conformi al GDPR.",
    },
    {
      heading: "Cookie",
      body: () =>
        "Questo sito non utilizza cookie di tracciamento pubblicitario né strumenti di analisi di terze parti (Google Analytics, ecc.). Possono essere depositati solo cookie tecnici necessari al funzionamento dell'autenticazione dell'amministratore.",
    },
    {
      heading: "I tuoi diritti",
      body: () =>
        "Ai sensi del GDPR, hai il diritto di accesso, rettifica, cancellazione e opposizione al trattamento dei tuoi dati. Per esercitare questi diritti, contattaci all'indirizzo indicato di seguito.",
    },
    {
      heading: "Contatto",
      body: ({ email }) =>
        `Per qualsiasi domanda relativa alla protezione dei tuoi dati: ${email}.`,
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const title = titles[locale] ?? titles.fr;
  return {
    title,
    alternates: {
      canonical: localizedPath(locale, "/privacy"),
      languages: buildLanguageAlternates("/privacy"),
    },
    openGraph: { title, type: "website" },
  };
}

export default async function PrivacyPage() {
  const locale = (await getLocale()) as Locale;
  const profile = await prisma.profile.findFirst({ where: { id: "default" } });

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
              {s.body({ email })}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
