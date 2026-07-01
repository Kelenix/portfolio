# Guide de déploiement

Procédure complète pour déployer le portfolio en production : base de données Supabase, hébergement Vercel, domaine personnalisé, post-déploiement SEO.

## Sommaire

1. [Architecture cible](#architecture-cible)
2. [Préparer Supabase](#1-préparer-supabase)
3. [Variables d'environnement](#2-variables-denvironnement)
4. [Bucket Storage](#3-bucket-storage)
5. [Déploiement Vercel](#4-déploiement-vercel)
6. [Domaine personnalisé](#5-domaine-personnalisé-optionnel)
7. [Post-déploiement](#6-post-déploiement)
8. [Dépannage](#dépannage)

## Architecture cible

```
┌──────────────┐    push    ┌──────────────┐    build & deploy    ┌──────────────┐
│   GitHub     ├───────────▶│    Vercel    ├─────────────────────▶│   Production │
└──────────────┘            └──────┬───────┘                      └──────┬───────┘
                                   │                                     │
                                   │ env vars                            │ requests
                                   ▼                                     ▼
                            ┌──────────────┐                      ┌──────────────┐
                            │  Supabase    │◀─── Prisma queries ──│  Next.js 16  │
                            │ Postgres +   │                      │   (Vercel)   │
                            │  Storage     │                      └──────────────┘
                            └──────────────┘
```

- **GitHub** héberge le code source. Tout push sur `main` déclenche Vercel.
- **Vercel** build et héberge l'application Next.js (régions configurables).
- **Supabase** fournit PostgreSQL (pour Prisma) et Storage (pour les uploads).

## 1. Préparer Supabase

### 1.1 Créer le projet

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Choisir une région proche de votre audience (ex : `eu-west-1` Paris)
3. Définir un **mot de passe DB fort** *sans caractères spéciaux problématiques* (voir [Mots de passe Supabase](#mots-de-passe-supabase))
4. Patienter ~2 min pour le provisioning

### 1.2 Récupérer les connection strings

**Project Settings → Database → Connection string**

| Onglet | Variable cible | Notes |
|---|---|---|
| **Transaction pooler** (port 6543) | `DATABASE_URL` | Ajouter `?pgbouncer=true&connection_limit=1` |
| **Session pooler** (port 5432) | `DIRECT_URL` | À utiliser pour `directUrl` Prisma |

> Sur le plan gratuit, le **direct connection** (`db.[ref].supabase.co:5432`) est en **IPv6 only** — préférer **Session pooler** pour le `DIRECT_URL`, qui passe en IPv4 via le même pool.

Format final attendu :

```env
DATABASE_URL="postgresql://postgres.abcxyz:MotDePasse@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.abcxyz:MotDePasse@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
```

### 1.3 Récupérer les clés API

**Project Settings → API**

| Champ Supabase | Variable cible |
|---|---|
| **Project URL** | `SUPABASE_URL` |
| **service_role** (clé longue, secrète) | `SUPABASE_SERVICE_ROLE_KEY` |

> La clé `service_role` contourne les RLS — **ne jamais l'exposer côté client**. Elle reste server-side dans `/api/admin/upload`.

### 1.4 Initialiser le schéma

Depuis votre machine, après avoir rempli `.env` (dont `ADMIN_EMAIL` et `ADMIN_PASSWORD`) :

```bash
npx prisma db push      # crée les tables
npm run db:seed         # insère l'utilisateur admin + données par défaut
```

> Le seed **refuse de démarrer** si `ADMIN_EMAIL` ou `ADMIN_PASSWORD` sont manquants, ou si `ADMIN_PASSWORD` fait moins de 12 caractères. Aucun couple par défaut n'existe.

### Mots de passe Supabase

Les caractères suivants doivent être URL-encodés dans la connection string :

| Caractère | Encodage |
|---|---|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `&` | `%26` |
| `!` | `%21` |
| `*` | `%2A` |
| `$` | `%24` |

**Recommandation** — régénérer un mot de passe **uniquement alphanumérique** dans **Database → Reset database password** pour éviter ces problèmes.

## 2. Variables d'environnement

Ajouter dans **Vercel → Project Settings → Environment Variables** (cocher **Production**, **Preview** et **Development**) :

```env
DATABASE_URL=...                                   # voir §1.2
DIRECT_URL=...                                     # voir §1.2

AUTH_SECRET=...                                    # openssl rand -base64 32
AUTH_URL=https://ton-domaine.com                   # URL canonique sans /
NEXTAUTH_URL=https://ton-domaine.com               # identique

ADMIN_EMAIL=...                                    # email admin (identifiant de login possible)
ADMIN_PASSWORD=...                                 # min 12 caractères — imposé par le seed
ADMIN_USERNAME=...                                 # optionnel — permet un login par pseudo
ADMIN_NAME=...                                     # optionnel — nom affiché ("Admin" par défaut)

SUPABASE_URL=https://abcxyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

NEXT_PUBLIC_SITE_URL=https://ton-domaine.com       # optionnel mais recommandé
```

### Pièges fréquents

- **Ne pas mettre de guillemets** autour des valeurs dans l'UI Vercel (contrairement au fichier `.env` local).
- **Pas de `/` final** sur les URLs.
- Variables `NEXT_PUBLIC_*` sont **exposées au client**. Ne JAMAIS y mettre de secret.

## 3. Bucket Storage

Le projet utilise un bucket Supabase appelé `avatars` pour stocker :
- L'avatar de profil (`avatar.jpg`)
- Les icônes d'applications mobiles (`mobile-apps/{hex}.png`)

### Création via dashboard

**Storage → Create a new bucket**

| Paramètre | Valeur |
|---|---|
| Name | `avatars` |
| Public | ✓ |
| File size limit | 5 MB |
| Allowed MIME types | `image/png, image/jpeg, image/webp, image/gif` |

### Création via API (alternative)

```bash
curl -X POST "https://[ref].supabase.co/storage/v1/bucket" \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"avatars",
    "name":"avatars",
    "public":true,
    "file_size_limit":5242880,
    "allowed_mime_types":["image/png","image/jpeg","image/webp","image/gif"]
  }'
```

> Sans ce bucket, l'upload échoue avec une erreur **500** sur `/api/admin/upload`.

## 4. Déploiement Vercel

### 4.1 Import du dépôt

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Sélectionner le repo GitHub
3. Framework : **Next.js** (auto-détecté)
4. Root directory : `.` (défaut)
5. Build command : `prisma generate && next build` (auto via `package.json`)
6. Install command : `npm install`

### 4.2 Ajouter les variables d'environnement

Voir [§2](#2-variables-denvironnement). Toutes obligatoires sauf `NEXT_PUBLIC_SITE_URL` (fallback automatique).

### 4.3 Déclencher le premier déploiement

Vercel lance automatiquement le build après l'import. Suivre les logs dans **Deployments**.

### 4.4 Redéploiements

Tout push sur la branche `main` redéclenche un build et un déploiement automatique. Les autres branches créent des **Preview deployments** avec une URL distincte.

Pour forcer un rebuild sans cache : **Deployments → ⋯ → Redeploy → décocher "Use existing Build Cache"**.

## 5. Domaine personnalisé (optionnel)

### 5.1 Acheter le domaine

Auprès d'un registrar (OVH, Namecheap, Cloudflare, etc.). Vous pouvez aussi acheter directement via Vercel.

### 5.2 Lier le domaine à Vercel

**Project Settings → Domains → Add**

Vercel fournira les enregistrements DNS à créer chez votre registrar :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Propagation : 5 min à 24 h selon le registrar.

### 5.3 Mettre à jour les variables d'environnement

Une fois le domaine actif, **changer** sur Vercel :

```env
AUTH_URL=https://ton-domaine.com
NEXTAUTH_URL=https://ton-domaine.com
NEXT_PUBLIC_SITE_URL=https://ton-domaine.com
```

Puis redéployer.

## 6. Post-déploiement

### 6.1 Tester les routes critiques

```
https://ton-domaine.com/fr               → 200 (page d'accueil)
https://ton-domaine.com/en               → 200
https://ton-domaine.com/it               → 200
https://ton-domaine.com/robots.txt       → 200
https://ton-domaine.com/sitemap.xml      → 200
https://ton-domaine.com/manifest.webmanifest → 200
https://ton-domaine.com/admin/login      → 200
```

### 6.2 Compléter le profil

Se connecter au dashboard et remplir **Paramètres** (nom, rôle, bio, avatar) — le contenu par défaut "Votre Nom" est utilisé jusque-là pour l'affichage et le SEO.

### 6.3 Soumettre le sitemap

**Google Search Console** — [search.google.com/search-console](https://search.google.com/search-console)

1. **Ajouter une propriété** → entrer votre domaine
2. **Vérifier la propriété** (via enregistrement TXT DNS)
3. **Sitemaps** → soumettre `https://ton-domaine.com/sitemap.xml`

**Bing Webmaster Tools** — [bing.com/webmasters](https://www.bing.com/webmasters)

Procédure équivalente.

### 6.4 Valider le SEO

| Outil | URL |
|---|---|
| Rich Results (structured data) | https://search.google.com/test/rich-results |
| Mobile-Friendly Test | https://search.google.com/test/mobile-friendly |
| PageSpeed Insights | https://pagespeed.web.dev/ |
| OpenGraph Debugger (Meta) | https://developers.facebook.com/tools/debug/ |
| Twitter Card Validator | https://cards-dev.twitter.com/validator |

## Dépannage

### `Error: P1001: Can't reach database server`

La connection string ne mène nulle part. Vérifier :
- L'hostname (préférer `aws-0-[region].pooler.supabase.com` au lieu de `db.[ref].supabase.co`)
- Le port (`6543` pour `DATABASE_URL`, `5432` pour `DIRECT_URL`)
- Que le projet Supabase n'est **pas en pause** (free tier : pause après 7 jours d'inactivité)

### `Error: invalid domain character in database URL`

La connection string contient encore des placeholders comme `[ref]` ou `[password]`, **ou** un caractère spécial non encodé. Voir [Mots de passe Supabase](#mots-de-passe-supabase).

### `prisma generate` échoue avec EPERM sur Windows

Le serveur de dev tient le fichier `.dll` ouvert. Arrêter `npm run dev` avant de relancer `prisma generate`.

### Upload 500 — "Bucket not found"

Le bucket `avatars` n'existe pas. Voir [§3](#3-bucket-storage).

### Build Vercel échoue sur "Environment variable not found"

Vérifier que les 9 variables sont définies dans **Production** (la coche pour Preview/Development n'affecte pas le build prod).

### Le site affiche "Votre Nom" en production

Le profil n'a pas été personnalisé. Aller dans `/admin/settings` et remplir les champs.
