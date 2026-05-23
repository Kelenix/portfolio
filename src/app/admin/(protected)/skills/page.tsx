import { prisma } from "@/lib/db";
import { SkillsClient } from "./SkillsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tech Stack" };

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
  return <SkillsClient initialSkills={skills} />;
}
