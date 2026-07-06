# Portfolio

Portfolio personnel multilingue (FR · EN · IT) construit avec **Next.js 16**, **TypeScript**, **Prisma** et **Supabase**, avec un dashboard d'administration permettant d'éditer tout le contenu sans toucher au code.


![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-000?logo=auth0&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=white)

## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Administration](#administration)
- [Déploiement](#déploiement)
- [SEO et référencement](#seo-et-référencement)
- [Documentation détaillée](#documentation-détaillée)
- [Licence](#licence)

## Aperçu

Un portfolio entièrement éditable depuis un dashboard sécurisé. Le visiteur découvre un site multilingue, optimisé pour le SEO, avec sections projets, applications mobiles, accomplissements, tech stack, blog et formulaire de contact. Le propriétaire gère 100 % du contenu depuis `/admin` — aucun déploiement requis pour mettre à jour le site.

## Fonctionnalités

### Côté visiteur

- **Multilingue** — Français · Anglais · Italien, avec URLs localisées (`/fr`, `/en`, `/it`) et `hreflang` automatique
- **Hero dynamique** — photo de profil, nom, rôle et bio personnalisables
- **Accomplissements** — liste à puces avec liens contextuels traduits
- **Projets** — grille responsive avec liens GitHub / démo et tags
- **Applications mobiles** — vitrine avec icône, descriptions et boutons Play Store / App Store
- **Tech stack** — catégorisée (Frontend · Backend · DevOps · Outils) avec icônes
- **Blog** — articles multilingues, slugs SEO-friendly, page article dédiée
- **Formulaire de contact** — validation Zod, persistance en DB
- **Mode sombre** — pur noir, transition fluide, persistance par utilisateur
- **Footer dynamique** — colonnes "Formations" et "Produits" éditables depuis l'admin
- **Mentions légales et Politique de confidentialité** — pages générées multilingues, conformes RGPD

### Côté admin

Dashboard accessible sur `/admin/login` (authentification NextAuth).

| Section | Fonctions |
|---|---|
| Dashboard | Vue d'ensemble (5 stats : projets, accomplissements, skills, articles, messages) |
| Projets | CRUD multilingue, publier/dépublier, tags, liens |
| Apps mobiles | CRUD, upload d'icône, URLs Play Store / App Store, descriptions multilingues |
| Accomplissements | CRUD avec liens et labels multilingues |
| Tech Stack | CRUD par catégorie, 40+ icônes intégrées |
| Blog | CRUD, slug auto, publication différée, contenu multilingue |
| Réseaux sociaux | 8 plateformes supportées (GitHub, LinkedIn, X, YouTube, etc.) |
| Footer | Liens éditables par colonne (Formations / Produits), multilingues |
| Messages | Boîte de réception du formulaire de contact (lecture, suppression, marquage) |
| Paramètres | Profil multilingue, avatar, mot de passe |

### SEO

- Metadata dynamiques par page (depuis la DB)
- OpenGraph + Twitter Card complets
- **OG image dynamique** générée à la volée (`/[locale]/opengraph-image`)
- Structured data JSON-LD (Person, WebSite, BlogPosting)
- Sitemap XML avec `hreflang` par URL
- robots.txt avec exclusion des routes admin/api
- Web manifest pour installation PWA
- Canonical URLs et alternates localisés

## Stack technique

| Domaine | Choix |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Langage | **TypeScript 5** |
| UI | **Tailwind CSS 4**, **Framer Motion** |
| i18n | **next-intl** |
| Base de données | **PostgreSQL** via **Supabase** |
| ORM | **Prisma 5** |
| Auth | **NextAuth v5** (Credentials, JWT) |
| Storage | **Supabase Storage** (bucket `avatars`) |
| Validation | **Zod**, **react-hook-form** |
| Icônes | **lucide-react**, **react-icons** |
| Déploiement | **Vercel** |

## Démarrage rapide

### Prérequis

- Node.js **20+**
- Un compte **Supabase** (gratuit) pour la base de données et le storage
- Un compte **Vercel** (gratuit) pour le déploiement

### Installation locale

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd portfolio

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# → remplir le fichier .env (voir section suivante)

# 4. Synchroniser le schéma Prisma avec Supabase
npx prisma db push

# 5. Initialiser les données de démo
npm run db:seed

# 6. Lancer le serveur de développement
npm run dev
```

Le site est disponible sur **http://localhost:3000** et le dashboard sur **http://localhost:3000/admin/login**.

### Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Lance le build production |
| `npm run lint` | Vérification ESLint |
| `npm run db:push` | Synchronise le schéma Prisma vers la DB |
| `npm run db:migrate` | Crée une migration Prisma |
| `npm run db:seed` | Initialise les données par défaut |
| `npm run db:studio` | Ouvre Prisma Studio (UI base de données) |
| `npm run db:reset` | Reset complet + reseed |

## Variables d'environnement

Toutes obligatoires. Copier `.env.example` vers `.env` et remplir avec vos valeurs.

```env
# Base de données Supabase
# Project Settings → Database → Connection string → "Transaction pooler" (port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Session pooler (port 5432) — pour les migrations Prisma
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Authentification NextAuth
AUTH_SECRET=""                              # openssl rand -base64 32
AUTH_URL="http://localhost:3000"            # URL publique du site
NEXTAUTH_URL="http://localhost:3000"        # identique à AUTH_URL

# Compte administrateur (utilisé au seed initial)
ADMIN_EMAIL=""
ADMIN_PASSWORD=""

# Supabase Storage (uploads)
SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY=""                # Project Settings → API → service_role

# SEO (optionnel — fallback automatique sur NEXTAUTH_URL puis VERCEL_URL)
NEXT_PUBLIC_SITE_URL="https://ton-domaine.com"
```

> **Important** — si le mot de passe contient des caractères spéciaux (`@`, `#`, `/`, `?`, `&`, etc.), encoder en URL ou les éviter à la génération. Voir [docs/DEPLOY.md](./docs/DEPLOY.md#mots-de-passe-supabase).

## Structure du projet

```
.
├── prisma/
│   ├── schema.prisma          # Modèles de données
│   └── seed.ts                # Initialisation
├── messages/
│   ├── fr.json                # Traductions FR
│   ├── en.json                # Traductions EN
│   └── it.json                # Traductions IT
├── src/
│   ├── app/
│   │   ├── [locale]/          # Pages publiques multilingues
│   │   │   ├── page.tsx       # Home
│   │   │   ├── blog/          # Blog (liste + article)
│   │   │   ├── legal/         # Mentions légales
│   │   │   ├── privacy/       # Politique de confidentialité
│   │   │   └── opengraph-image.tsx  # OG image dynamique
│   │   ├── admin/
│   │   │   ├── login/         # Page de connexion
│   │   │   └── (protected)/   # Dashboard protégé par auth
│   │   ├── api/
│   │   │   ├── admin/         # Endpoints CRUD admin
│   │   │   ├── auth/          # NextAuth handler
│   │   │   ├── blog/          # API publique blog
│   │   │   └── contact/       # Formulaire de contact
│   │   ├── layout.tsx         # Root layout (metadataBase, theme)
│   │   ├── sitemap.ts         # Sitemap dynamique
│   │   ├── robots.ts          # Robots.txt
│   │   └── manifest.ts        # Web app manifest
│   ├── components/
│   │   ├── sections/          # Hero, Projects, MobileApps, etc.
│   │   ├── layout/            # Header, Footer
│   │   ├── admin/             # Sidebar, Toast
│   │   ├── ui/                # LanguageSwitcher, ThemeToggle
│   │   └── providers/         # ThemeProvider
│   ├── lib/
│   │   ├── auth.ts            # Config NextAuth
│   │   ├── db.ts              # Client Prisma singleton
│   │   ├── supabase.ts        # Client Supabase Storage
│   │   ├── seo.ts             # Helpers SEO (URLs, alternates)
│   │   └── utils.ts           # Utilitaires généraux
│   ├── i18n/
│   │   ├── routing.ts         # Config locales next-intl
│   │   ├── request.ts         # Provider serveur
│   │   └── navigation.ts      # Link/redirect localisés
│   └── proxy.ts               # Middleware next-intl (renommé "proxy" en Next 16)
├── docs/                      # Documentation détaillée
│   ├── DEPLOY.md
│   ├── ADMIN.md
│   └── ARCHITECTURE.md
├── next.config.ts
├── tailwind.config.ts
└── vercel.json
```

## Administration

Le dashboard se trouve sur **`/admin/login`**. Identifiants initiaux définis dans `.env` au seed.

Vue d'ensemble des sections : voir [docs/ADMIN.md](./docs/ADMIN.md).

### Premier lancement

1. Connecter le dashboard
2. Aller dans **Paramètres** → renseigner nom / rôle / bio en FR · EN · IT
3. Ajouter un avatar (upload Supabase)
4. Compléter **Tech Stack**, **Réseaux sociaux**, **Projets**
5. Optionnel : ajouter des **Apps mobiles**, du contenu de **Blog**, des liens de **Footer**

## Déploiement

Le projet est conçu pour **Vercel + Supabase** sans configuration serveur.

### Aperçu du flow

1. **Supabase** — créer le projet, récupérer les connection strings
2. **Variables Vercel** — ajouter `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `SUPABASE_*`, etc.
3. **GitHub** — push sur `main` → build et déploiement automatiques
4. **Bucket storage** — créer le bucket `avatars` (public) dans Supabase
5. **DNS** — pointer un domaine custom (optionnel)
6. **Post-déploiement** — soumettre le sitemap à Google Search Console

Procédure pas-à-pas : voir [docs/DEPLOY.md](./docs/DEPLOY.md).

### Build sur Vercel

Vercel auto-détecte Next.js. La commande de build est définie dans `package.json` :

```json
"build": "prisma generate && next build"
```

Le `postinstall` génère également le client Prisma après `npm ci`.

## SEO et référencement

Toutes les pratiques de référencement sont déjà en place :

- **Metadata** par page depuis la DB (titre = `Nom — Rôle`, description = bio)
- **OpenGraph** (1200×630) et **Twitter Cards** complets
- **OG image dynamique** générée à la volée par locale
- **JSON-LD** Person, WebSite, BlogPosting (Schema.org)
- **Sitemap XML** dynamique avec `hreflang` xhtml:link
- **robots.txt** : autorise tout sauf `/admin` et `/api`
- **Web manifest** (PWA)
- **Canonical URLs** localisés
- **hreflang** alternates sur chaque page

Une fois le site déployé, valider avec :
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [OpenGraph Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [PageSpeed Insights](https://pagespeed.web.dev/)

## Documentation détaillée

- [docs/DEPLOY.md](./docs/DEPLOY.md) — Guide de déploiement complet (Supabase + Vercel + DNS)
- [docs/ADMIN.md](./docs/ADMIN.md) — Manuel d'utilisation du dashboard
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Choix techniques et structure interne

## Licence

Projet personnel. Adaptation libre pour usage non commercial avec mention de l'auteur original.
