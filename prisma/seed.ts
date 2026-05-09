import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@portfolio.com" },
    update: {},
    create: {
      email: "admin@portfolio.com",
      password: hashedPassword,
      name: "Admin",
    },
  });

  await prisma.profile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      nameFr: "Votre Nom",
      nameEn: "Your Name",
      nameIt: "Il Tuo Nome",
      roleFr: "Développeur Fullstack & Créateur",
      roleEn: "Fullstack Engineer & Creator",
      roleIt: "Ingegnere Fullstack & Creatore",
      bioFr:
        "Je construis des produits web modernes avec une attention particulière au design et à l'expérience utilisateur. Passionné par le code propre et les interfaces élégantes.",
      bioEn:
        "I build modern web products with a strong focus on design and user experience. Passionate about clean code and elegant interfaces.",
      bioIt:
        "Costruisco prodotti web moderni con grande attenzione al design e all'esperienza utente. Appassionato di codice pulito e interfacce eleganti.",
      email: "contact@example.com",
    },
  });

  const socialLinks = [
    { id: "social-github", platform: "GitHub", url: "https://github.com/yourhandle", order: 1 },
    { id: "social-linkedin", platform: "LinkedIn", url: "https://linkedin.com/in/yourprofile", order: 2 },
    { id: "social-twitter", platform: "Twitter", url: "https://x.com/yourhandle", order: 3 },
    { id: "social-youtube", platform: "YouTube", url: "https://youtube.com/@yourchannel", order: 4 },
  ];

  for (const link of socialLinks) {
    await prisma.socialLink.upsert({
      where: { id: link.id },
      update: {},
      create: link,
    });
  }

  const accomplishments = [
    {
      id: "acc-1",
      textFr: "Développé et lancé plus de 10 applications fullstack en production",
      textEn: "Built and shipped 10+ fullstack applications to production",
      textIt: "Sviluppato e lanciato oltre 10 applicazioni fullstack in produzione",
      order: 1,
    },
    {
      id: "acc-2",
      textFr: "Construit une communauté de **30k abonnés** sur YouTube",
      textEn: "Grew a community of **30k subscribers** on YouTube",
      textIt: "Creato una community di **30k iscritti** su YouTube",
      link: "https://youtube.com/@yourchannel",
      linkLabel: "Voir la chaîne",
      order: 2,
    },
    {
      id: "acc-3",
      textFr: "Contribué à des projets open source avec plus de **1000 étoiles** GitHub",
      textEn: "Contributed to open source projects with **1000+ GitHub stars**",
      textIt: "Contribuito a progetti open source con oltre **1000 stelle** su GitHub",
      order: 3,
    },
  ];

  for (const acc of accomplishments) {
    await prisma.accomplishment.upsert({
      where: { id: acc.id },
      update: {},
      create: acc,
    });
  }

  const projects = [
    {
      id: "proj-1",
      titleFr: "Portfolio Personnel",
      titleEn: "Personal Portfolio",
      titleIt: "Portfolio Personale",
      descFr: "Portfolio minimaliste avec Next.js, Tailwind et internationalisation FR/EN/IT.",
      descEn: "Minimalist portfolio with Next.js, Tailwind and FR/EN/IT internationalization.",
      descIt: "Portfolio minimalista con Next.js, Tailwind e internazionalizzazione FR/EN/IT.",
      url: "https://yourportfolio.com",
      github: "https://github.com/yourhandle/portfolio",
      tags: '["Next.js","TypeScript","Tailwind"]',
      order: 1,
    },
    {
      id: "proj-2",
      titleFr: "SaaS Starter Kit",
      titleEn: "SaaS Starter Kit",
      titleIt: "SaaS Starter Kit",
      descFr: "Template complet pour lancer un SaaS rapidement avec auth, paiements et dashboard.",
      descEn: "Complete template to launch a SaaS quickly with auth, payments and dashboard.",
      descIt: "Template completo per lanciare un SaaS rapidamente con auth, pagamenti e dashboard.",
      tags: '["Next.js","Stripe","Prisma"]',
      order: 2,
    },
    {
      id: "proj-3",
      titleFr: "CLI Developer Tools",
      titleEn: "CLI Developer Tools",
      titleIt: "Strumenti CLI per Sviluppatori",
      descFr: "Collection d'outils CLI pour automatiser les tâches de développement quotidiennes.",
      descEn: "Collection of CLI tools to automate daily development tasks.",
      descIt: "Raccolta di strumenti CLI per automatizzare le attività di sviluppo quotidiane.",
      github: "https://github.com/yourhandle/cli-tools",
      tags: '["Node.js","TypeScript","CLI"]',
      order: 3,
    },
  ];

  for (const proj of projects) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: {},
      create: proj,
    });
  }

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
