"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/admin/Toast";

const schema = z.object({
  questionFr: z.string().min(1, "Requis"),
  questionEn: z.string().min(1, "Required"),
  questionIt: z.string().min(1, "Obbligatorio"),
  answerFr: z.string().min(1, "Requis"),
  answerEn: z.string().min(1, "Required"),
  answerIt: z.string().min(1, "Obbligatorio"),
  keywords: z.string(),
  order: z.number().int(),
  published: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;
type Tab = "fr" | "en" | "it";

const tabLabel: Record<Tab, string> = { fr: "Français", en: "English", it: "Italiano" };

type FaqEntry = {
  id: string;
  questionFr: string;
  questionEn: string;
  questionIt: string;
  answerFr: string;
  answerEn: string;
  answerIt: string;
  keywords: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export function ChatbotClient({ initialEntries }: { initialEntries: FaqEntry[] }) {
  const [entries, setEntries] = useState<FaqEntry[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("fr");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const tabs: Tab[] = ["fr", "en", "it"];

  const openCreate = () => {
    setEditId(null);
    reset({
      questionFr: "",
      questionEn: "",
      questionIt: "",
      answerFr: "",
      answerEn: "",
      answerIt: "",
      keywords: "",
      order: entries.length * 10 + 10,
      published: true,
    });
    setActiveTab("fr");
    setShowForm(true);
  };

  const openEdit = (entry: FaqEntry) => {
    setEditId(entry.id);
    reset({
      questionFr: entry.questionFr,
      questionEn: entry.questionEn,
      questionIt: entry.questionIt,
      answerFr: entry.answerFr,
      answerEn: entry.answerEn,
      answerIt: entry.answerIt,
      keywords: entry.keywords,
      order: entry.order,
      published: entry.published,
    });
    setActiveTab("fr");
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const method = editId ? "PATCH" : "POST";
      const url = editId ? `/api/admin/chatbot/${editId}` : "/api/admin/chatbot";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, published: data.published ?? true }),
      });
      if (!res.ok) throw new Error();
      const saved: FaqEntry = await res.json();
      if (editId) {
        setEntries((prev) => prev.map((e) => (e.id === editId ? saved : e)));
        toast("success", "Entrée mise à jour");
      } else {
        setEntries((prev) => [...prev, saved].sort((a, b) => a.order - b.order));
        toast("success", "Entrée créée");
      }
      setShowForm(false);
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const togglePublish = async (entry: FaqEntry) => {
    try {
      const res = await fetch(`/api/admin/chatbot/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !entry.published }),
      });
      if (!res.ok) throw new Error();
      const updated: FaqEntry = await res.json();
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)));
      toast("success", entry.published ? "Désactivée" : "Activée");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette entrée FAQ ?")) return;
    try {
      const res = await fetch(`/api/admin/chatbot/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast("success", "Supprimée");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-mono font-bold" style={{ color: "var(--foreground)" }}>
            Chatbot FAQ
          </h1>
          <p className="text-xs font-mono mt-1" style={{ color: "var(--muted-foreground)" }}>
            Réponses automatiques appliquées aux nouveaux messages du chat public.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg border transition-all hover:opacity-80"
          style={{ background: "var(--foreground)", color: "var(--background)", borderColor: "var(--foreground)" }}
        >
          <Plus size={14} /> Nouvelle entrée
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-start justify-between p-4 rounded-lg border gap-4"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-mono font-semibold truncate" style={{ color: "var(--foreground)" }}>
                  {e.questionFr}
                </p>
                {e.published ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--accent)", color: "white" }}>
                    Actif
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                    Désactivé
                  </span>
                )}
              </div>
              <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                {e.answerFr}
              </p>
              {e.keywords && (
                <p className="text-[11px] font-mono mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Mots-clés : {e.keywords}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => togglePublish(e)} style={{ color: e.published ? "var(--accent)" : "var(--muted-foreground)" }}>
                {e.published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => openEdit(e)} style={{ color: "var(--muted-foreground)" }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(e.id)} style={{ color: "#ef4444" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-sm font-mono text-center py-12" style={{ color: "var(--muted-foreground)" }}>
            Aucune entrée FAQ. Le bot ne répond pas automatiquement.
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
                {editId ? "Modifier l'entrée" : "Nouvelle entrée"}
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
                const qField = `question${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof FormData;
                const aField = `answer${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof FormData;
                return (
                  <div key={tab} className={activeTab === tab ? "space-y-3" : "hidden"}>
                    <div>
                      <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                        Question ({tab.toUpperCase()})
                      </label>
                      <input
                        {...register(qField)}
                        className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                        style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        placeholder={tab === "fr" ? "Ex : Quels sont tes tarifs ?" : ""}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                        Réponse ({tab.toUpperCase()})
                      </label>
                      <textarea
                        {...register(aField)}
                        rows={4}
                        className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-y"
                        style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      />
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Mots-clés (séparés par une virgule)
                </label>
                <input
                  {...register("keywords")}
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none font-mono"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="tarif, prix, coût, rate, price"
                />
                <p className="text-[11px] font-mono mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Les mots-clés boostent la détection au-delà de la similarité de phrase.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                    Ordre
                  </label>
                  <input
                    type="number"
                    {...register("order", { valueAsNumber: true })}
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none font-mono"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <label className="flex items-end gap-2 text-xs font-mono cursor-pointer pb-2" style={{ color: "var(--muted-foreground)" }}>
                  <input type="checkbox" {...register("published")} className="w-3.5 h-3.5" defaultChecked />
                  Publié
                </label>
              </div>

              {Object.keys(errors).length > 0 && (
                <p className="text-xs text-red-500 font-mono">Vérifie que tous les champs FR/EN/IT sont remplis.</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-mono rounded-lg border"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg border"
                  style={{ background: "var(--foreground)", color: "var(--background)", borderColor: "var(--foreground)" }}
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
