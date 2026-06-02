# Architecture

Vue d'ensemble des choix techniques, de la structure interne et des principaux flux du projet.

## Sommaire

- [Vue d'ensemble](#vue-densemble)
- [Routing et internationalisation](#routing-et-internationalisation)
- [Authentification](#authentification)
- [Base de données](#base-de-données)
- [Upload de fichiers](#upload-de-fichiers)
- [Server vs Client Components](#server-vs-client-components)
- [SEO](#seo)
- [Convention Next.js 16](#convention-nextjs-16)

## Vue d'ensemble

```
┌────────────────────────────────────────────────────────────────────────┐
│                            Browser                                     │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
               ▼                                          ▼
        Public pages                              /admin (protected)
        /[locale]/...                             /admin/...
               │                                          │
               │ next-intl middleware                     │ NextAuth session
               │ (src/proxy.ts)                           │
               ▼                                          ▼
        ┌─────────────────────────────────────────────────────────┐
        │              Server Components + RSC                     │
        │  - Prisma queries (lib/db.ts)                            │
        │  - getTranslations / getLocale (next-intl/server)        │
        │  - Metadata generation (SEO)                             │
        └─────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼───────────────────────────────────────────┐
        ▼             ▼                                           ▼
   ┌────────┐   ┌──────────┐                              ┌────────────┐
   │ Prisma │   │ Supabase │                              │  Vercel    │
   │  ORM   │──▶│ Postgres │                              │ ImageResp. │
   └────────┘   └──────────┘                              │ (OG image) │
                ┌──────────┐                              └────────────┘
                │ Supabase │
                │ Storage  │ (avatars, mobile-apps/)
                └──────────┘
```

## Routing et internationalisation

### Configuration locales

[`src/i18n/routing.ts`](../src/i18n/routing.ts) définit les locales supportées et la stratégie de préfixe URL :

```ts
{
  locales: ["fr", "en", "it"],
  defaultLocale: "fr",
  localePrefix: "always",
}
```

Toutes les URLs publiques sont préfixées : `/fr/...`, `/en/...`, `/it/...`. L'URL racine `/` redirige automatiquement vers `/fr` ([`src/app/page.tsx`](../src/app/page.tsx)).

### Middleware (renommé "proxy" en Next.js 16)

[`src/proxy.ts`](../src/proxy.ts) délègue à `next-intl/middleware` pour toutes les routes publiques, sauf `/admin` et `/api` qui passent directement (pas de préfixe de locale sur l'admin).

### Provider serveur

[`src/i18n/request.ts`](../src/i18n/request.ts) charge dynamiquement le fichier de messages JSON correspondant à la locale demandée (`messages/[locale].json`).

### Helpers

- `getTranslations("namespace")` — dans les Server Components
- `useTranslations("namespace")` — dans les Client Components
- `getLocale()` — récupérer la locale active côté serveur
- `useLocale()` — côté client
- `<Link>` / `usePathname()` depuis [`src/i18n/navigation.ts`](../src/i18n/navigation.ts) — navigation localisée

### Fallback multilingue

Quand une traduction est manquante en base, le code retombe systématiquement sur le FR :

```ts
const role = locale === "en"
  ? (profile.roleEn || profile.roleFr)
  : locale === "it"
  ? (profile.roleIt || profile.roleFr)
  : profile.roleFr;
```

## Authentification

### NextAuth v5 (Auth.js)

Configuration unique dans [`src/lib/auth.ts`](../src/lib/auth.ts). Stratégie **Credentials** avec validation Zod et hash **bcrypt** en DB.

```
POST /api/auth/[...nextauth]
       │
       ▼
  Credentials.authorize
       │
       ├─▶ Zod schema (email + password)
       ├─▶ prisma.user.findUnique({ email })
       └─▶ bcrypt.compare
              │
              ▼
      JWT signé (maxAge 30 jours)
```

### Protection des routes

- **Pages** : [`src/app/admin/(protected)/layout.tsx`](../src/app/admin/(protected)/layout.tsx) appelle `auth()` et redirige vers `/admin/login` si pas de session.
- **API** : chaque route `/api/admin/*` vérifie `await auth()` et retourne `401` si aucune session.

> Le layout admin force `export const dynamic = "force-dynamic"` car il fait un appel DB à chaque requête — ça empêche Next.js de tenter une pré-génération statique.

### Session côté client

`useSession()` n'est pas nécessaire dans le projet — la sidebar utilise `signOut()` de `next-auth/react` pour la déconnexion.

## Base de données

### Prisma + Supabase Postgres

[`src/lib/db.ts`](../src/lib/db.ts) exporte un singleton `PrismaClient` (pattern recommandé pour éviter les fuites de connexions en dev avec hot reload).

### Modèles principaux

Voir [`prisma/schema.prisma`](../prisma/schema.prisma) :

| Modèle | Rôle |
|---|---|
| `User` | Comptes administrateurs |
| `Profile` | Identité du propriétaire (singleton id `default`) |
| `Project` | Projets affichés sur la home |
| `MobileApp` | Applications mobiles |
| `Accomplishment` | Liste à puces "Ce que j'ai accompli" |
| `Skill` | Tech stack catégorisée |
| `SocialLink` | Liens réseaux sociaux |
| `FooterLink` | Liens éditables du footer (2 colonnes) |
| `BlogPost` | Articles de blog (multilingues, slug unique) |
| `ContactMessage` | Boîte de réception du formulaire |

### Patterns multilingues

Trois variantes selon le contexte :

1. **Champs en triplet** (`fieldFr`, `fieldEn`, `fieldIt`) — pour les contenus longs (titres, descriptions, bio). Le code sélectionne le bon champ selon la locale active.
2. **Champ unique avec fallback** (`linkLabel`, `linkLabelEn`, `linkLabelIt`) — `linkLabel` représente le FR ; EN et IT sont optionnels avec fallback sur FR.
3. **Champ neutre** (`name` pour MobileApp, `platform` pour SocialLink) — quand le contenu ne se traduit pas (ex : nom d'une plateforme).

### Connexions Supabase

Deux URLs distinctes :

| Variable | Port | Usage |
|---|---|---|
| `DATABASE_URL` | 6543 | Transaction pooler — runtime, requêtes courtes |
| `DIRECT_URL` | 5432 | Session pooler — migrations Prisma (`db push`) |

Le paramètre `?pgbouncer=true&connection_limit=1` sur `DATABASE_URL` est requis pour éviter les erreurs "prepared statement already exists" avec PgBouncer.

## Upload de fichiers

### Endpoint unifié

[`src/app/api/admin/upload/route.ts`](../src/app/api/admin/upload/route.ts) accepte un `multipart/form-data` :

| Champ | Optionnel | Comportement |
|---|---|---|
| `file` | non | Le fichier à uploader |
| `folder` | oui | Si vide → `avatars/avatar.{ext}` (upsert). Si défini → `avatars/{folder}/{hex}.{ext}` (filename unique) |

### Sécurité

- Session vérifiée via `auth()` → `401` si pas connecté
- `folder` sanitisé : seuls `[a-zA-Z0-9-_/]` sont conservés
- Bucket Supabase configuré avec `allowed_mime_types` côté Supabase pour double validation

### Bucket

Un seul bucket `avatars` (public) avec une organisation par sous-dossiers :
- `avatar.jpg` — avatar de profil
- `mobile-apps/{hex}.png` — icônes d'apps

## Server vs Client Components

### Server par défaut

Toutes les pages et layouts sont des **Server Components** (pas de directive `"use client"`). Cela permet :
- Requêtes Prisma directes dans le composant
- Pas de bundle JS envoyé au client pour le rendu initial
- Streaming RSC pour les latences DB

### Client quand nécessaire

Les Client Components sont limités à :
- Animations Framer Motion (`"use client"` en tête)
- Interactions utilisateur (formulaires, toggles, navigation)
- Composants utilisant `useState`, `useEffect`, hooks `next-intl` `useTranslations` (vs `getTranslations` côté serveur)

### Footer : exemple de séparation

Le composant [`Footer`](../src/components/layout/Footer.tsx) est **Server Component** : il fait une requête Prisma pour récupérer les `FooterLink` publiés, et utilise `getTranslations`/`getLocale`. Aucun JS client n'est nécessaire pour rendre le footer.

## SEO

Voir [README.md#seo-et-référencement](../README.md#seo-et-référencement) pour la liste complète.

### Helpers centralisés

[`src/lib/seo.ts`](../src/lib/seo.ts) expose :

```ts
getSiteUrl(): string                       // résolution intelligente de l'URL canonique
localizedPath(locale, path): string        // construit une URL absolue localisée
buildLanguageAlternates(path): Record       // génère le mapping hreflang complet
pickLocaleField(locale, { fr, en, it })   // helper de sélection multilingue typé
OG_LOCALES                                 // mapping locale → format OG (fr_FR, etc.)
```

### Résolution de l'URL du site

`getSiteUrl()` essaie dans l'ordre :

1. `NEXT_PUBLIC_SITE_URL`
2. `SITE_URL`
3. `NEXTAUTH_URL`
4. `VERCEL_URL` (auto-set par Vercel)
5. `http://localhost:3000` (fallback dev)

Le `/` final est toujours retiré pour éviter les doubles slashs.

### OG image dynamique

[`src/app/[locale]/opengraph-image.tsx`](../src/app/[locale]/opengraph-image.tsx) utilise `next/og` (`ImageResponse`) pour générer une image **1200×630 PNG** à la demande, avec le nom et le rôle du profil dans la langue active. L'image est mise en cache côté Vercel après la première génération.

### Sitemap avec hreflang

[`src/app/sitemap.ts`](../src/app/sitemap.ts) génère un sitemap dynamique incluant :
- Routes statiques (`/`, `/blog`, `/legal`, `/privacy`) pour chaque locale
- Tous les articles de blog publiés
- Balises `xhtml:link rel="alternate" hreflang="..."` sur chaque entrée

### JSON-LD

- **Page d'accueil** — schémas `Person` et `WebSite` injectés en `<script type="application/ld+json">`. Le `sameAs` du Person référence les réseaux sociaux (très utilisé par Google pour identifier l'auteur).
- **Article de blog** — schéma `BlogPosting` avec `headline`, `author`, `datePublished`, `dateModified`, `mainEntityOfPage`.

## Convention Next.js 16

### Middleware renommé en "proxy"

Next.js 16 a renommé le fichier `middleware.ts` en `proxy.ts`. C'est pourquoi le projet a [`src/proxy.ts`](../src/proxy.ts) et non `src/middleware.ts`. La sémantique est identique.

### `params` est une `Promise`

En Next.js 16, les params dynamiques sont des promesses :

```ts
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ...
}
```

Cela s'applique aussi aux `generateMetadata` et aux `searchParams`.

### Turbopack par défaut

`next dev` utilise Turbopack en mode dev. Aucune configuration nécessaire. Les builds production utilisent également Turbopack via `next build`.

### Pas de `vercel.json` requis

Vercel auto-détecte Next.js 16. Le fichier `vercel.json` présent dans le repo n'est utile que pour pinner la commande de build et choisir la région.
