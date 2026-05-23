import { prisma } from "@/lib/db";
import { BlogClient } from "./BlogClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return <BlogClient initialPosts={posts} />;
}
