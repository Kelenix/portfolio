"use client";

import { useRef, useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/admin/Toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import type { BlogPost } from "@prisma/client";

const schema = z.object({
  titleFr: z.string().min(1, "Requis"),
  titleEn: z.string().min(1, "Required"),
  titleIt: z.string().min(1, "Obbligatorio"),
  contentFr: z.string(),
  contentEn: z.string(),
  contentIt: z.string(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Uniquement lettres minuscules, chiffres et tirets"),
  published: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;
type Tab = "fr" | "en" | "it";

const tabLabel: Record<Tab, string> = { fr: "Français", en: "English", it: "Italiano" };

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("fr");
  const [uploadingTab, setUploadingTab] = useState<Tab | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingTabRef = useRef<Tab | null>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditId(null);
    reset({ titleFr: "", titleEn: "", titleIt: "", contentFr: "", contentEn: "", contentIt: "", slug: "", published: false });
    setActiveTab("fr");
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditId(post.id);
    reset({
      titleFr: post.titleFr,
      titleEn: post.titleEn,
      titleIt: post.titleIt,
      contentFr: post.contentFr,
      contentEn: post.contentEn,
      contentIt: post.contentIt,
      slug: post.slug,
      published: post.published,
    });
    setActiveTab("fr");
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/admin/blog/${editId}` : "/api/admin/blog";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, published: data.published ?? false }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }
      const saved: BlogPost = await res.json();

      if (editId) {
        setPosts((prev) => prev.map((p) => (p.id === editId ? saved : p)));
        toast("success", "Article mis à jour");
      } else {
        setPosts((prev) => [saved, ...prev]);
        toast("success", "Article créé");
      }
      setShowForm(false);
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) throw new Error();
      const updated: BlogPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
      toast("success", post.published ? "Dépublié" : "Publié");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "Supprimer cet article ?" }))) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast("success", "Article supprimé");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const tabs: Tab[] = ["fr", "en", "it"];
  const fieldName = (prefix: string, tab: Tab) =>
    `${prefix}${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof FormData;

  const pickImage = (tab: Tab) => {
    pendingTabRef.current = tab;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const insertAtCursor = (tab: Tab, snippet: string) => {
    const field = fieldName("content", tab);
    const textarea = document.getElementById(`content-${tab}`) as HTMLTextAreaElement | null;
    if (!textarea) {
      setValue(field, `${(document.getElementById(`content-${tab}`) as HTMLTextAreaElement | null)?.value ?? ""}${snippet}`);
      return;
    }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const needsLeadingBreak = before.length > 0 && !before.endsWith("\n\n");
    const prefix = needsLeadingBreak ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const suffix = after.startsWith("\n") ? "\n" : "\n\n";
    const finalSnippet = `${prefix}${snippet}${suffix}`;
    const next = before + finalSnippet + after;
    setValue(field, next, { shouldDirty: true });
    requestAnimationFrame(() => {
      textarea.focus();
      const caret = (before + finalSnippet).length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const tab = pendingTabRef.current;
    if (!file || !tab) return;

    if (!file.type.startsWith("image/")) {
      toast("error", "Format non supporté");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("error", "Image trop lourde (max 5 Mo)");
      return;
    }

    setUploadingTab(tab);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "blog");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = (await res.json()) as { url: string };
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      insertAtCursor(tab, `![${alt}](${url})`);
      toast("success", "Image insérée");
    } catch {
      toast("error", "Échec de l'upload");
    } finally {
      setUploadingTab(null);
      pendingTabRef.current = null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-mono font-bold" style={{ color: "var(--foreground)" }}>
          Blog
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg border transition-all hover:opacity-80"
          style={{ background: "var(--foreground)", color: "var(--background)", borderColor: "var(--foreground)" }}
        >
          <Plus size={14} />
          Nouvel article
        </button>
      </div>

      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono font-semibold truncate" style={{ color: "var(--foreground)" }}>
                  {post.titleFr}
                </p>
                {post.published && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--accent)", color: "white" }}>
                    Publié
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--muted-foreground)" }}>
                /{post.slug}
                {post.publishedAt && (
                  <> · {new Date(post.publishedAt).toLocaleDateString("fr-FR")}</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <button onClick={() => togglePublish(post)} style={{ color: post.published ? "var(--accent)" : "var(--muted-foreground)" }}>
                {post.published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => openEdit(post)} style={{ color: "var(--muted-foreground)" }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(post.id)} style={{ color: "#ef4444" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-sm font-mono text-center py-8" style={{ color: "var(--muted-foreground)" }}>
            Aucun article. Cliquez sur &quot;Nouvel article&quot;.
          </p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border p-6"
            style={{ background: "var(--background)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-mono font-bold" style={{ color: "var(--foreground)" }}>
                {editId ? "Modifier l'article" : "Nouvel article"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: "var(--muted-foreground)" }}>
                <X size={18} />
              </button>
            </div>

            {/* Language tabs */}
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
                      onBlur={(e) => {
                        if (tab === "fr" && !editId) {
                          setValue("slug", slugify(e.target.value));
                        }
                      }}
                    />
                    {tab === "fr" && errors.titleFr && (
                      <p className="text-xs text-red-500 mt-1">{errors.titleFr.message}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                        Contenu ({tab.toUpperCase()})
                      </label>
                      <button
                        type="button"
                        onClick={() => pickImage(tab)}
                        disabled={uploadingTab !== null}
                        className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono rounded border transition-all disabled:opacity-50"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--muted-foreground)",
                          background: "var(--background)",
                        }}
                      >
                        {uploadingTab === tab ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <ImageIcon size={11} />
                        )}
                        {uploadingTab === tab ? "Upload…" : "Insérer une image"}
                      </button>
                    </div>
                    <textarea
                      id={`content-${tab}`}
                      {...register(fieldName("content", tab))}
                      rows={12}
                      className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-y font-mono"
                      style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      placeholder={"# Titre\n## Sous-titre\n\nParagraphe avec **gras**, *italique* et `code`.\n\n> Citation\n\n- item de liste\n- autre item\n\n![légende](https://…) pour une image\n\n```js\nconst x = 42;\n```"}
                    />
                  </div>
                </div>
              ))}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleFileSelected}
              />

              <details
                className="rounded-lg border text-xs"
                style={{ borderColor: "var(--border)" }}
              >
                <summary
                  className="cursor-pointer px-3 py-2 font-mono select-none"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Syntaxe Markdown supportée
                </summary>
                <div
                  className="px-3 pb-3 pt-1 space-y-1 font-mono"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <div><code># Titre H1</code> · <code>## H2</code> · <code>### H3</code></div>
                  <div><code>**gras**</code> · <code>*italique*</code> · <code>`code inline`</code></div>
                  <div><code>[texte](https://…)</code></div>
                  <div><code>&gt; citation</code> (une ou plusieurs lignes)</div>
                  <div><code>- item</code> ou <code>1. item</code></div>
                  <div><code>![légende](url)</code> pour une image (ou utiliser le bouton ci-dessus)</div>
                  <div><code>```lang</code> … <code>```</code> pour un bloc de code</div>
                  <div>Ligne vide = nouveau paragraphe</div>
                </div>
              </details>

              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Slug (URL)
                </label>
                <input
                  {...register("slug")}
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none font-mono"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="mon-article-de-blog"
                />
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer" style={{ color: "var(--muted-foreground)" }}>
                  <input type="checkbox" {...register("published")} className="w-3.5 h-3.5" />
                  Publier maintenant
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
