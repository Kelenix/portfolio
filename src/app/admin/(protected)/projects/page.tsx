import { prisma } from "@/lib/db";
import { ProjectsClient } from "./ProjectsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projets" };

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  return <ProjectsClient initialProjects={projects} />;
}
