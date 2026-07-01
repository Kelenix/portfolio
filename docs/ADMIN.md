# Guide d'administration

Manuel d'utilisation du dashboard admin du portfolio. Toutes les sections sont accessibles depuis la sidebar de gauche après authentification.

## Sommaire

- [Connexion](#connexion)
- [Vue d'ensemble du dashboard](#vue-densemble-du-dashboard)
- [Paramètres (profil)](#paramètres-profil)
- [Projets](#projets)
- [Applications mobiles](#applications-mobiles)
- [Accomplissements](#accomplissements)
- [Tech Stack](#tech-stack)
- [Blog](#blog)
- [Réseaux sociaux](#réseaux-sociaux)
- [Footer](#footer)
- [Messages](#messages)
- [Bonnes pratiques](#bonnes-pratiques)

## Connexion

URL : `https://votre-domaine.com/admin/login`

Saisir **email ou username** + mot de passe. Les credentials proviennent des variables `ADMIN_EMAIL`, `ADMIN_PASSWORD` (et optionnellement `ADMIN_USERNAME`) définies au seed. Le mot de passe est hashé (bcrypt) en DB.

> Pour changer le mot de passe après le premier accès, aller dans **Paramètres** → **Changer le mot de passe**.

### Sécurité

| Mécanisme | Détail |
|---|---|
| Hash mot de passe | bcrypt (12 rounds) |
| Rate-limit login | 5 tentatives / 15 min par IP → verrouillage 15 min |
| Session | JWT signé (NextAuth v5), 30 jours, refresh max toutes les heures |
| Session expirée | Modale automatique + redirection vers `/admin/login?reason=expired` sur tout 401 admin |
| Garde-fou API | Middleware (`src/proxy.ts`) rejette toute requête `/api/admin/*` sans jeton valide |
| Journal | Table `AuditLog` — connexions, échecs, verrouillages — consultable dans **Journal** |
| CSRF | Géré nativement par NextAuth v5 sur les endpoints d'authentification |
| Seed | Refuse de démarrer sans `ADMIN_EMAIL` / `ADMIN_PASSWORD` ≥ 12 caractères |

Aucun couple d'identifiants par défaut n'existe. Le seul chemin d'accès admin est `/admin/login`.

### Journal

`/admin/audit` — lecture seule des 100 dernières entrées avec date, action, acteur, IP, détails. Permet d'auditer les connexions et les tentatives suspectes.

## Vue d'ensemble du dashboard

Le tableau de bord (`/admin`) affiche cinq compteurs :

| Stat | Description |
|---|---|
| Projets | Nombre de projets publiés |
| Accomplissements | Nombre d'accomplissements publiés |
| Tech Stack | Nombre de skills publiées |
| Articles | Nombre d'articles de blog publiés |
| Messages | Nombre de messages **non lus** dans la boîte de contact |

## Paramètres (profil)

`/admin/settings`

Édite l'identité visible sur le portfolio.

### Profil multilingue

Tous les champs textuels sont disponibles en **FR · EN · IT**. Si une traduction est vide, la version française est utilisée en fallback.

- **Nom** — affiché dans le hero et utilisé dans les titres SEO
- **Rôle** — sous-titre du hero (ex : "Développeur Fullstack & Créateur")
- **Bio** — paragraphe descriptif sous le hero

### Avatar

Upload via Supabase Storage (bucket `avatars`). Formats acceptés : PNG, JPEG, WebP, GIF — max 5 Mo.

### Email de contact

Apparaît sur le bouton "Me contacter" du hero. Aussi utilisé sur les pages **Mentions légales** et **Politique de confidentialité**.

### Changement de mot de passe

Section dédiée. Le mot de passe actuel est demandé pour valider.

## Projets

`/admin/projects`

Section "Ce que j'ai construit" sur la home.

| Champ | Notes |
|---|---|
| Titre (FR · EN · IT) | Requis |
| Description (FR · EN · IT) | Texte court |
| URL démo | Optionnel — affiche l'icône "Lien externe" |
| URL GitHub | Optionnel — affiche l'icône GitHub |
| Tags | Liste de strings, ex : `["Next.js", "Tailwind"]` |
| Ordre | Tri (croissant) |
| Publié | Toggle de visibilité |

## Applications mobiles

`/admin/mobile-apps`

Section "Mes applications mobiles" sur la home. **Masquée si aucune app n'est publiée**.

| Champ | Notes |
|---|---|
| Nom | Requis — généralement identique dans toutes les langues |
| Icône | Upload Supabase **ou** URL externe collée |
| Play Store URL | Optionnel |
| App Store URL | Optionnel |
| Description (FR · EN · IT) | Optionnel — affichée sous le nom si présente |
| Ordre | Tri |
| Publié | Toggle |

> Au moins **une** des deux URLs (Play Store ou App Store) doit être renseignée pour permettre l'enregistrement.

## Accomplissements

`/admin/accomplishments`

Section "Ce que j'ai accompli" — liste à puces.

| Champ | Notes |
|---|---|
| Texte (FR · EN · IT) | Requis. Utiliser `**gras**` pour mettre en valeur |
| Lien | URL optionnelle |
| Label du lien (FR · EN · IT) | Si vide, fallback sur la version FR |
| Ordre | Tri |
| Publié | Toggle |

Exemple : `Créé une communauté de **30k abonnés** sur YouTube` + lien `https://youtube.com/@...` + label `Voir la chaîne` (avec `View channel` en EN et `Vedi il canale` en IT).

## Tech Stack

`/admin/skills`

Section "Tech que j'aime" — affichée en grille catégorisée.

| Champ | Notes |
|---|---|
| Nom | Ex : `Next.js`, `PostgreSQL` |
| Icône | Sélection parmi 40+ icônes intégrées (`react-icons/si`) |
| Catégorie | `frontend` · `backend` · `devops` · `tools` |
| Ordre | Tri à l'intérieur de la catégorie |
| Publié | Toggle |

## Blog

`/admin/blog`

Liste des articles avec édition complète.

| Champ | Notes |
|---|---|
| Titre (FR · EN · IT) | Requis |
| Contenu (FR · EN · IT) | Markdown — voir syntaxe supportée ci-dessous |
| Slug | Auto-généré depuis le titre FR, modifiable |
| Date de publication | Manuelle |
| Publié | Toggle (articles non publiés invisibles côté public) |

> Les articles non publiés sont indexés mais retournent 404 sur la page publique. Les articles publiés alimentent automatiquement le sitemap et le flux JSON-LD.

### Syntaxe Markdown des articles

Le rendu est fait par un parseur maison (aucune dépendance externe, aucun `dangerouslySetInnerHTML`). La syntaxe supportée :

| Bloc | Notation |
|---|---|
| Titre H1 / H2 / H3 | `# Titre`, `## Titre`, `### Titre` |
| Paragraphe | Une ou plusieurs lignes ; une ligne vide sépare deux paragraphes |
| Citation | `> texte` (peut couvrir plusieurs lignes contiguës préfixées) |
| Liste à puces | `- item` ou `* item` |
| Liste ordonnée | `1. item` |
| Bloc de code | Trois backticks ` ``` ` (optionnellement suivis d'un nom de langage) puis fermé par ` ``` ` |

| Inline | Notation |
|---|---|
| Gras | `**texte**` |
| Italique | `*texte*` ou `_texte_` |
| Code inline | `` `code` `` |
| Lien | `[libellé](https://…)` — les URLs externes s'ouvrent dans un nouvel onglet automatiquement |

Le rendu respecte le thème clair / sombre via les variables CSS (`var(--foreground)`, `var(--muted)`, `var(--accent)`, `var(--border)`). Un pense-bête est disponible dans le formulaire admin (bloc "Syntaxe Markdown supportée").

## Réseaux sociaux

`/admin/social`

Badges affichés sur le hero et liens `sameAs` dans le JSON-LD (signal SEO important).

Plateformes pré-configurées (icônes incluses) :
- GitHub, LinkedIn, Twitter / X, YouTube, Instagram, TikTok, Discord, Twitch

| Champ | Notes |
|---|---|
| Plateforme | Sélection dans la liste |
| URL | URL publique du profil |
| Ordre | Tri d'affichage |

## Footer

`/admin/footer`

Gère les deux colonnes du pied de page : **Formations & Articles** et **Produits**. Les colonnes vides ne sont pas affichées.

| Champ | Notes |
|---|---|
| Label (FR · EN · IT) | Si EN ou IT vides, fallback sur FR |
| URL | Interne (`/blog`) ou externe (`https://...`) — détection automatique |
| Colonne | `Formations & Articles` ou `Produits` |
| Ordre | Tri dans la colonne |
| Publié | Toggle |

## Messages

`/admin/messages`

Boîte de réception des messages envoyés via le formulaire de contact.

Actions disponibles :
- **Marquer comme lu** / **non lu**
- **Supprimer**

Champs reçus : `name`, `email`, `message`, `createdAt`. Les messages non lus apparaissent en compteur sur le dashboard.

> Le formulaire de contact valide côté client + serveur via Zod (email, message non vide).

## Bonnes pratiques

### Multilingue

- Toujours commencer par la version **FR** puis traduire vers EN/IT
- Si une traduction est absente, le contenu FR est utilisé en fallback automatique
- Vérifier le rendu en changeant de langue via le sélecteur en haut à droite

### Ordre d'affichage

- Le champ `Ordre` est un entier croissant
- Pour réorganiser une liste, modifier les ordres individuellement (par ex : 10, 20, 30 pour laisser de la place à des insertions)

### Images

- Privilégier des images **carrées** pour les icônes d'apps (rendu en cercle arrondi)
- Format **WebP** ou **PNG** recommandé
- L'avatar de profil est optimisé en `64×64` dans le hero

### SEO

- Garder les titres concis (60 caractères max idéalement)
- Bio de 120–160 caractères pour une meta description optimale
- Mettre à jour le profil **avant** de soumettre le sitemap à Google
