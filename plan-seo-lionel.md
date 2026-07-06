# Plan d'indexation Google — Lionel Djouaka Kelefack

## 1. Le problème principal : incohérence de nom

Google traite ces trois identités comme **séparées** tant qu'elles ne sont pas reliées explicitement :

- Site web : "Lionel Djouaka" (sans "Kelefack")
- LinkedIn : "Lionel Djouaka Kelefack"
- Google Play : "Kelenixdev"

**Objectif** : faire apparaître "Djouaka Kelefack Lionel" (ou une variante cohérente) textuellement sur chaque plateforme, et relier ces plateformes entre elles avec des liens réciproques + des données structurées.

---

## 2. Corrections techniques à faire sur lionel-dev.site

- [ ] Remplacer les liens `yourhandle` (GitHub, Twitter) par les vrais liens, ou les supprimer.
- [ ] Corriger le lien "Play Store" de SkillMock (il pointe actuellement vers une recherche Brave).
- [ ] Ajouter un lien direct vers la page développeur Google Play : `https://play.google.com/store/apps/developer?id=Kelenixdev`
- [ ] Ajouter "Djouaka Kelefack Lionel" dans le H1/sous-titre, le `<title>`, la meta-description et les mots-clés.
- [ ] Ajouter le bloc JSON-LD ci-dessous dans le `<head>` de la page d'accueil.
- [ ] Vérifier le sitemap.xml et le soumettre dans Google Search Console.

---

## 3. Bloc JSON-LD "Person" à coller dans le `<head>`

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Lionel Djouaka Kelefack",
  "alternateName": [
    "Djouaka Kelefack Lionel",
    "Lionel Djouaka",
    "Kelenixdev"
  ],
  "givenName": "Lionel",
  "familyName": "Djouaka Kelefack",
  "jobTitle": "Développeur Logiciel",
  "description": "Ingénieur informatique et développeur logiciel (Java, Spring Boot, Salesforce Apex, SQL), créateur d'applications mobiles sous le pseudonyme Kelenixdev.",
  "url": "https://lionel-dev.site",
  "image": "https://lionel-dev.site/images/lionel-djouaka.jpg",
  "nationality": "Cameroonian",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ancona",
    "addressRegion": "Marche",
    "addressCountry": "IT"
  },
  "alumniOf": {
    "@type": "CollegeOrUniversity",
    "name": "Università Politecnica delle Marche"
  },
  "knowsAbout": [
    "Java",
    "Spring Boot",
    "Salesforce Apex",
    "SQL",
    "Développement mobile Android"
  ],
  "sameAs": [
    "https://www.linkedin.com/in/lioneldjouaka/",
    "https://play.google.com/store/apps/developer?id=Kelenixdev",
    "https://github.com/REMPLACER_PAR_TON_VRAI_HANDLE",
    "https://dev.to/REMPLACER_PAR_TON_VRAI_HANDLE"
  ]
}
</script>
```

**À faire avant de coller ce bloc :**
- Remplacer `image` par une vraie URL de photo hébergée sur ton site.
- Remplacer les URL GitHub / DEV Community par tes vrais liens (ou retirer les lignes correspondantes s'ils n'existent pas).
- Garder la liste `sameAs` à jour à chaque nouveau profil créé (YouTube, Twitter/X, etc.).

---

## 4. Métadonnées corrigées (balises `<head>`)

```html
<title>Lionel Djouaka Kelefack — Développeur Logiciel & Créateur d'Applications (Kelenixdev)</title>

<meta name="description" content="Lionel Djouaka Kelefack (Kelenixdev), ingénieur informatique basé à Ancône, Italie. Développeur Java / Spring Boot / Salesforce Apex, créateur d'applications mobiles sur Google Play : AfriMap Explorer, DayUp, ScoolFree.">

<meta name="keywords" content="Lionel Djouaka Kelefack, Djouaka Kelefack Lionel, Kelenixdev, développeur Java, Spring Boot, Salesforce Apex, Ancona, Università Politecnica delle Marche">

<meta property="og:title" content="Lionel Djouaka Kelefack — Développeur Logiciel">
<meta property="og:description" content="Ingénieur informatique, développeur Java/Spring Boot/Salesforce Apex, créateur d'applications mobiles (Kelenixdev).">
<meta property="og:url" content="https://lionel-dev.site">
<meta property="og:type" content="profile">
<meta property="og:image" content="https://lionel-dev.site/images/lionel-djouaka.jpg">
```

---

## 5. Checklist de maillage entre plateformes

| Plateforme | Contient le nom complet ? | Lien vers le site ? |
|---|---|---|
| lionel-dev.site | À corriger (étape 2) | — |
| LinkedIn | ✅ Oui | À ajouter dans "Informations de contact" |
| Google Play (Kelenixdev) | ❌ Non | À ajouter dans la description du profil développeur |
| GitHub | À vérifier | À ajouter dans la bio |

---

## 6. Étapes Google Search Console

1. Vérifier la propriété du domaine `lionel-dev.site`.
2. Soumettre/mettre à jour le sitemap.xml.
3. Utiliser "Inspection de l'URL" → "Demander une indexation" sur la page d'accueil après avoir appliqué les corrections ci-dessus.
4. Revenir vérifier l'indexation sous 1 à 2 semaines.

---

## 7. Pour aller plus loin (moyen terme)

- Publier régulièrement sur le blog du site en citant ton nom complet dans les articles.
- Ajouter un lien vers le site dans la bio de chaque réseau (Twitter/X, GitHub, DEV Community).
- Une fois le maillage stable, Google peut construire automatiquement un panneau de connaissances ("Knowledge Panel") si le volume de signaux est suffisant.
