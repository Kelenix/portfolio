"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import type { Accomplishment } from "@prisma/client";

const schema = z.object({
  textFr: z.string().min(1, "Requis"),
  textEn: z.string().min(1, "Required"),
  textIt: z.string().min(1, "Obbligatorio"),
  link: z.string().optional(),
  linkLabel: z.string().optional(),
  linkLabelEn: z.string().optional(),
  linkLabelIt: z.string().optional(),
  published: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;
type Tab = "fr" | "en" | "it";

export function AccomplishmentsClient({ initialItems }: { initialItems: Accomplishment[] }) {
  const [items, setItems] = useState<Accomplishment[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("fr");
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditId(null);
    reset({
      textFr: "",
      textEn: "",
      textIt: "",
      link: "",
      linkLabel: "",
      linkLabelEn: "",
      linkLabelIt: "",
      published: true,
    });
    setShowForm(true);
  };

  const openEdit = (a: Accomplishment) => {
    setEditId(a.id);
    reset({
      textFr: a.textFr,
      textEn: a.textEn,
      textIt: a.textIt,
      link: a.link ?? "",
      linkLabel: a.linkLabel ?? "",
      linkLabelEn: a.linkLabelEn ?? "",
      linkLabelIt: a.linkLabelIt ?? "",
      published: a.published,
    });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const body = {
        ...data,
        published: data.published ?? true,
        link: data.link || null,
        linkLabel: data.linkLabel || null,
        linkLabelEn: data.linkLabelEn || null,
        linkLabelIt: data.linkLabelIt || null,
        order: editId ? undefined : items.length,
      };
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/admin/accomplishments/${editId}` : "/api/admin/accomplishments";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const saved: Accomplishment = await res.json();
      if (editId) {
        setItems((prev) => prev.map((i) => (i.id === editId ? saved : i)));
        toast("success", "Mis à jour");
      } else {
        setItems((prev) => [...prev, saved]);
        toast("success", "Créé");
      }
      setShowForm(false);
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const togglePublish = async (a: Accomplishment) => {
    try {
      const res = await fetch(`/api/admin/accomplishments/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !a.published }),
      });
      if (!res.ok) throw new Error();
      const updated: Accomplishment = await res.json();
      setItems((prev) => prev.map((i) => (i.id === a.id ? updated : i)));
      toast("success", a.published ? "Dépublié" : "Publié");
    } catch {
      toast("error", "Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "Supprimer cet accomplissement ?" }))) return;
    try {
      await fetch(`/api/admin/accomplishments/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast("success", "Supprimé");
    } catch {
      toast("error", "Erreur");
    }
  };

  const tabs: Tab[] = ["fr", "en", "it"];
  const tabLabel: Record<Tab, string> = { fr: "Français", en: "English", it: "Italiano" };
  const fieldKey = (tab: Tab) => `text${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof FormData;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-mono font-bold" style={{ color: "var(--foreground)" }}>
          Accomplissements
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg border hover:opacity-80"
          style={{ background: "var(--foreground)", color: "var(--background)", borderColor: "var(--foreground)" }}
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {items.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            <p className="text-sm font-mono truncate flex-1 min-w-0" style={{ color: "var(--foreground)" }}>
              {a.textFr.slice(0, 80)}{a.textFr.length > 80 ? "…" : ""}
            </p>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <button onClick={() => togglePublish(a)} style={{ color: a.published ? "var(--accent)" : "var(--muted-foreground)" }}>
                {a.published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => openEdit(a)} style={{ color: "var(--muted-foreground)" }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(a.id)} style={{ color: "#ef4444" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm font-mono text-center py-8" style={{ color: "var(--muted-foreground)" }}>
            Aucun accomplissement. Cliquez sur Ajouter.
          </p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border p-6"
            style={{ background: "var(--background)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-mono font-bold" style={{ color: "var(--foreground)" }}>
                {editId ? "Modifier" : "Nouvel accomplissement"}
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
              {tabs.map((tab) => {
                const linkLabelKey =
                  tab === "fr" ? "linkLabel" : tab === "en" ? "linkLabelEn" : "linkLabelIt";
                const linkLabelPlaceholder =
                  tab === "fr" ? "Voir le lien" : tab === "en" ? "View link" : "Vedi link";
                return (
                  <div key={tab} className={activeTab === tab ? "space-y-3" : "hidden"}>
                    <div>
                      <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                        Texte ({tab.toUpperCase()}) — utiliser **gras** pour mettre en valeur
                      </label>
                      <textarea
                        {...register(fieldKey(tab))}
                        rows={3}
                        className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none"
                        style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                        Label du lien ({tab.toUpperCase()})
                      </label>
                      <input
                        {...register(linkLabelKey)}
                        className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                        style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        placeholder={linkLabelPlaceholder}
                      />
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>Lien (optionnel)</label>
                <input
                  {...register("link")}
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="https://..."
                />
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
