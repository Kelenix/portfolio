"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import type { Project } from "@prisma/client";

const schema = z.object({
  titleFr: z.string().min(1, "Requis"),
  titleEn: z.string().min(1, "Required"),
  titleIt: z.string().min(1, "Obbligatorio"),
  descFr: z.string().min(1, "Requis"),
  descEn: z.string().min(1, "Required"),
  descIt: z.string().min(1, "Obbligatorio"),
  url: z.string().optional(),
  github: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;
type Tab = "fr" | "en" | "it";

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("fr");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditId(null);
    reset({ titleFr: "", titleEn: "", titleIt: "", descFr: "", descEn: "", descIt: "", url: "", github: "", tags: "[]", published: true });
    setImageUrl(null);
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditId(p.id);
    reset({
      titleFr: p.titleFr,
      titleEn: p.titleEn,
      titleIt: p.titleIt,
      descFr: p.descFr,
      descEn: p.descEn,
      descIt: p.descIt,
      url: p.url ?? "",
      github: p.github ?? "",
      tags: p.tags,
      published: p.published,
    });
    setImageUrl(p.imageUrl ?? null);
    setShowForm(true);
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("error", "Format non supporté");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("error", "Image trop lourde (max 5 Mo)");
      return;
    }
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "projects");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = (await res.json()) as { url: string };
      setImageUrl(url);
      toast("success", "Image téléversée");
    } catch {
      toast("error", "Upload échoué");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const body = {
        ...data,
        tags: data.tags || "[]",
        published: data.published ?? true,
        url: data.url || null,
        github: data.github || null,
        imageUrl,
        order: editId ? undefined : projects.length,
      };

      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/admin/projects/${editId}` : "/api/admin/projects";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      const saved: Project = await res.json();

      if (editId) {
        setProjects((prev) => prev.map((p) => (p.id === editId ? saved : p)));
        toast("success", "Projet mis à jour");
      } else {
        setProjects((prev) => [...prev, saved]);
        toast("success", "Projet créé");
      }
      setShowForm(false);
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const togglePublish = async (p: Project) => {
    try {
      const res = await fetch(`/api/admin/projects/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !p.published }),
      });
      if (!res.ok) throw new Error();
      const updated: Project = await res.json();
      setProjects((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
      toast("success", p.published ? "Dépublié" : "Publié");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast("success", "Projet supprimé");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const tabs: Tab[] = ["fr", "en", "it"];
  const tabLabel: Record<Tab, string> = { fr: "Français", en: "English", it: "Italiano" };

  const fieldName = (prefix: string, tab: Tab) =>
    `${prefix}${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof FormData;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-mono font-bold" style={{ color: "var(--foreground)" }}>
          Projets
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg border transition-all hover:opacity-80"
          style={{ background: "var(--foreground)", color: "var(--background)", borderColor: "var(--foreground)" }}
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-mono font-semibold truncate" style={{ color: "var(--foreground)" }}>
                {p.titleFr}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
                {p.descFr.slice(0, 70)}{p.descFr.length > 70 ? "…" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <button onClick={() => togglePublish(p)} style={{ color: p.published ? "var(--accent)" : "var(--muted-foreground)" }}>
                {p.published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => openEdit(p)} style={{ color: "var(--muted-foreground)" }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(p.id)} style={{ color: "#ef4444" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-sm font-mono text-center py-8" style={{ color: "var(--muted-foreground)" }}>
            Aucun projet. Cliquez sur Ajouter.
          </p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border p-6"
            style={{ background: "var(--background)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-mono font-bold" style={{ color: "var(--foreground)" }}>
                {editId ? "Modifier le projet" : "Nouveau projet"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: "var(--muted-foreground)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: "var(--muted)" }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-1.5 text-xs font-mono rounded-md transition-all"
                  style={{
                    background: activeTab === tab ? "var(--background)" : "transparent",
                    color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {tabLabel[tab]}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {tabs.map((tab) => (
                <div key={tab} className={activeTab === tab ? "space-y-3" : "hidden"}>
                  <div>
                    <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Titre ({tab.toUpperCase()})
                    </label>
                    <input
                      {...register(fieldName("title", tab))}
                      className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                      style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Description ({tab.toUpperCase()})
                    </label>
                    <textarea
                      {...register(fieldName("desc", tab))}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none"
                      style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>URL projet</label>
                  <input
                    {...register("url")}
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>GitHub</label>
                  <input
                    {...register("github")}
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Tags (JSON, ex: ["Next.js","TypeScript"])
                </label>
                <input
                  {...register("tags")}
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none font-mono"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder='["Next.js","TypeScript"]'
                />
              </div>

              <div>
                <label className="block text-xs font-mono mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Image (thumbnail carré, 56×56 utilisé sur la home)
                </label>
                <div className="flex items-start gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl overflow-hidden border flex items-center justify-center shrink-0"
                    style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                  >
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={16} style={{ color: "var(--muted-foreground)" }} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(f);
                        if (imageInputRef.current) imageInputRef.current.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border disabled:opacity-50"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      {uploadingImage ? <Loader2 size={11} className="animate-spin" /> : <ImageIcon size={11} />}
                      {uploadingImage ? "Upload…" : imageUrl ? "Remplacer" : "Uploader"}
                    </button>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="text-[11px] font-mono hover:opacity-70 text-left"
                        style={{ color: "#ef4444" }}
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer" style={{ color: "var(--muted-foreground)" }}>
                  <input type="checkbox" {...register("published")} className="w-3.5 h-3.5" />
                  Publié
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-xs font-mono rounded-lg border"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg disabled:opacity-50"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}
                  >
                    {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                    Enregistrer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
