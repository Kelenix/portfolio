import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || null;
  const adminName = process.env.ADMIN_NAME || "Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD env vars are required to seed the admin user. " +
        "Set them (see docs/DEPLOY.md) before running the seed."
    );
  }
  if (adminPassword.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters long."
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      username: adminUsername,
      name: adminName,
    },
    create: {
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      name: adminName,
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

  const skills = [
    // Frontend
    { id: "skill-react", name: "React", iconName: "SiReact", category: "frontend", order: 1 },
    { id: "skill-nextjs", name: "Next.js", iconName: "SiNextdotjs", category: "frontend", order: 2 },
    { id: "skill-typescript", name: "TypeScript", iconName: "SiTypescript", category: "frontend", order: 3 },
    { id: "skill-tailwind", name: "Tailwind CSS", iconName: "SiTailwindcss", category: "frontend", order: 4 },
    { id: "skill-framer", name: "Framer Motion", iconName: "SiFramer", category: "frontend", order: 5 },
    // Backend
    { id: "skill-nodejs", name: "Node.js", iconName: "SiNodedotjs", category: "backend", order: 1 },
    { id: "skill-prisma", name: "Prisma", iconName: "SiPrisma", category: "backend", order: 2 },
    { id: "skill-postgresql", name: "PostgreSQL", iconName: "SiPostgresql", category: "backend", order: 3 },
    { id: "skill-sqlite", name: "SQLite", iconName: "SiSqlite", category: "backend", order: 4 },
    { id: "skill-graphql", name: "GraphQL", iconName: "SiGraphql", category: "backend", order: 5 },
    // DevOps
    { id: "skill-vercel", name: "Vercel", iconName: "SiVercel", category: "devops", order: 1 },
    { id: "skill-docker", name: "Docker", iconName: "SiDocker", category: "devops", order: 2 },
    { id: "skill-ghactions", name: "GitHub Actions", iconName: "SiGithubactions", category: "devops", order: 3 },
    { id: "skill-git", name: "Git", iconName: "SiGit", category: "devops", order: 4 },
    // Tools
    { id: "skill-vscode", name: "VS Code", iconName: "TbBrandVscode", category: "tools", order: 1 },
    { id: "skill-figma", name: "Figma", iconName: "SiFigma", category: "tools", order: 2 },
    { id: "skill-postman", name: "Postman", iconName: "SiPostman", category: "tools", order: 3 },
    { id: "skill-api", name: "REST API", iconName: "TbApi", category: "tools", order: 4 },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { id: skill.id },
      update: {},
      create: skill,
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
