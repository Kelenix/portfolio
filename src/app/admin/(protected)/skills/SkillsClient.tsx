"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, X, Check } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import type { Skill } from "@prisma/client";

const CATEGORIES = ["frontend", "backend", "devops", "tools"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  tools: "Outils",
};

export const AVAILABLE_ICONS = [
  // Frontend
  { name: "SiReact", label: "React" },
  { name: "SiNextdotjs", label: "Next.js" },
  { name: "SiTypescript", label: "TypeScript" },
  { name: "SiJavascript", label: "JavaScript" },
  { name: "SiTailwindcss", label: "Tailwind CSS" },
  { name: "SiFramer", label: "Framer Motion" },
  { name: "SiVuedotjs", label: "Vue.js" },
  { name: "SiAngular", label: "Angular" },
  { name: "SiSvelte", label: "Svelte" },
  { name: "SiAstro", label: "Astro" },
  // Backend
  { name: "SiNodedotjs", label: "Node.js" },
  { name: "SiPrisma", label: "Prisma" },
  { name: "SiPostgresql", label: "PostgreSQL" },
  { name: "SiMongodb", label: "MongoDB" },
  { name: "SiMysql", label: "MySQL" },
  { name: "SiSqlite", label: "SQLite" },
  { name: "SiGraphql", label: "GraphQL" },
  { name: "SiPython", label: "Python" },
  { name: "SiDjango", label: "Django" },
  { name: "SiPhp", label: "PHP" },
  { name: "SiLaravel", label: "Laravel" },
  { name: "SiRust", label: "Rust" },
  { name: "SiGo", label: "Go" },
  { name: "SiRedis", label: "Redis" },
  { name: "SiSupabase", label: "Supabase" },
  { name: "SiFirebase", label: "Firebase" },
  // DevOps
  { name: "SiDocker", label: "Docker" },
  { name: "SiKubernetes", label: "Kubernetes" },
  { name: "SiVercel", label: "Vercel" },
  { name: "SiGithubactions", label: "GitHub Actions" },
  { name: "SiGit", label: "Git" },
  { name: "SiNginx", label: "Nginx" },
  { name: "SiLinux", label: "Linux" },
  { name: "SiGooglecloud", label: "Google Cloud" },
  // Tools
  { name: "TbBrandVscode", label: "VS Code" },
  { name: "SiFigma", label: "Figma" },
  { name: "SiPostman", label: "Postman" },
  { name: "TbApi", label: "REST API" },
  { name: "SiGithub", label: "GitHub" },
  { name: "SiNotion", label: "Notion" },
  { name: "SiJira", label: "Jira" },
] as const;

interface EditState {
  id: string;
  name: string;
  iconName: string;
  category: Category;
}

export function SkillsClient({ initialSkills }: { initialSkills: Skill[] }) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [activeCategory, setActiveCategory] = useState<Category>("frontend");
  const [showForm, setShowForm] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState<string>(AVAILABLE_ICONS[0].name);
  const [newCategory, setNewCategory] = useState<Category>("frontend");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const byCategory = CATEGORIES.reduce<Record<Category, Skill[]>>(
    (acc, cat) => {
      acc[cat] = skills.filter((s) => s.category === cat);
      return acc;
    },
    { frontend: [], backend: [], devops: [], tools: [] }
  );

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const catSkills = byCategory[newCategory];
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          iconName: newIcon,
          category: newCategory,
          order: catSkills.length,
        }),
      });
      if (!res.ok) throw new Error();
      const saved: Skill = await res.json();
      setSkills((prev) => [...prev, saved]);
      setNewName("");
      setShowForm(false);
      toast("success", "Technologie ajoutée");
    } catch {
      toast("error", "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/skills/${editState.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editState.name,
          iconName: editState.iconName,
          category: editState.category,
        }),
      });
      if (!res.ok) throw new Error();
      const updated: Skill = await res.json();
      setSkills((prev) => prev.map((s) => (s.id === editState.id ? updated : s)));
      setEditState(null);
      toast("success", "Mis à jour");
    } catch {
      toast("error", "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (skill: Skill) => {
    try {
      const res = await fetch(`/api/admin/skills/${skill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !skill.published }),
      });
      if (!res.ok) throw new Error();
      const updated: Skill = await res.json();
      setSkills((prev) => prev.map((s) => (s.id === skill.id ? updated : s)));
      toast("success", skill.published ? "Masqué" : "Visible");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "Supprimer cette technologie ?" }))) return;
    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSkills((prev) => prev.filter((s) => s.id !== id));
      toast("success", "Supprimé");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-mono font-bold" style={{ color: "var(--foreground)" }}>
          Tech Stack
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg border transition-all hover:opacity-80"
          style={{ background: "var(--foreground)", color: "var(--background)", borderColor: "var(--foreground)" }}
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ background: "var(--muted)" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 text-xs font-mono rounded-md transition-all"
            style={{
              background: activeCategory === cat ? "var(--background)" : "transparent",
              color: activeCategory === cat ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {CATEGORY_LABELS[cat]}
            <span
              className="ml-1.5 text-[10px] px-1 rounded"
              style={{ background: "var(--border)", color: "var(--muted-foreground)" }}
            >
              {byCategory[activeCategory === cat ? cat : cat].length}
            </span>
          </button>
        ))}
      </div>

      {/* Skills list */}
      <div className="space-y-2 max-w-xl">
        {byCategory[activeCategory].map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-3 p-3 rounded-lg border"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            {editState?.id === skill.id ? (
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <input
                  value={editState.name}
                  onChange={(e) => setEditState((prev) => prev && { ...prev, name: e.target.value })}
                  className="px-2 py-1 text-xs rounded border outline-none w-32"
                  style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="Nom"
                />
                <select
                  value={editState.iconName}
                  onChange={(e) => setEditState((prev) => prev && { ...prev, iconName: e.target.value })}
                  className="px-2 py-1 text-xs font-mono rounded border outline-none"
                  style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic.name} value={ic.name}>{ic.label}</option>
                  ))}
                </select>
                <select
                  value={editState.category}
                  onChange={(e) => setEditState((prev) => prev && { ...prev, category: e.target.value as Category })}
                  className="px-2 py-1 text-xs font-mono rounded border outline-none"
                  style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
                <button onClick={handleSaveEdit} disabled={saving} className="p-1 hover:opacity-70" style={{ color: "var(--foreground)" }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                </button>
                <button onClick={() => setEditState(null)} className="p-1 hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                  {skill.name}
                </p>
                <p className="text-[10px] mt-0.5 font-mono" style={{ color: "var(--muted-foreground)" }}>
                  {skill.iconName || "Pas d'icône"}
                </p>
              </div>
            )}

            {editState?.id !== skill.id && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePublish(skill)} style={{ color: skill.published ? "var(--accent)" : "var(--muted-foreground)" }}>
                  {skill.published ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button
                  onClick={() => setEditState({ id: skill.id, name: skill.name, iconName: skill.iconName, category: skill.category as Category })}
                  className="p-1.5 hover:opacity-70"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(skill.id)} className="p-1.5 hover:opacity-70" style={{ color: "#ef4444" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        ))}
        {byCategory[activeCategory].length === 0 && (
          <p className="text-sm font-mono text-center py-8" style={{ color: "var(--muted-foreground)" }}>
            Aucune technologie dans cette catégorie.
          </p>
        )}
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="w-full max-w-sm rounded-xl border p-6"
            style={{ background: "var(--background)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-mono font-bold" style={{ color: "var(--foreground)" }}>
                Nouvelle technologie
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: "var(--muted-foreground)" }}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>Nom</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="ex: React"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>Icône</label>
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic.name} value={ic.name}>{ic.label} ({ic.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>Catégorie</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-mono rounded-lg border"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving || !newName.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg disabled:opacity-50"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
