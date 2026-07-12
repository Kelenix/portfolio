"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import type { Platform } from "@prisma/client";

interface FormState {
  title: string;
  descFr: string;
  descEn: string;
  descIt: string;
  url: string;
  badge: string;
}

const emptyForm: FormState = {
  title: "",
  descFr: "",
  descEn: "",
  descIt: "",
  url: "",
  badge: "",
};

export function PlatformsClient({ initialPlatforms }: { initialPlatforms: Platform[] }) {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const startEdit = (p: Platform) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      descFr: p.descFr,
      descEn: p.descEn,
      descIt: p.descIt,
      url: p.url ?? "",
      badge: p.badge ?? "",
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast("error", "Le titre est requis");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        descFr: form.descFr.trim(),
        descEn: form.descEn.trim() || form.descFr.trim(),
        descIt: form.descIt.trim() || form.descFr.trim(),
        url: form.url.trim() || null,
        badge: form.badge.trim() || null,
      };

      if (editId) {
        const res = await fetch(`/api/admin/platforms/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated: Platform = await res.json();
        setPlatforms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast("success", "Mise à jour");
      } else {
        const res = await fetch("/api/admin/platforms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, order: platforms.length + 1 }),
        });
        if (!res.ok) throw new Error();
        const created: Platform = await res.json();
        setPlatforms((prev) => [...prev, created]);
        toast("success", "Plateforme ajoutée");
      }
      resetForm();
    } catch {
      toast("error", "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "Supprimer cette plateforme ?" }))) return;
    try {
      const res = await fetch(`/api/admin/platforms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPlatforms((prev) => prev.filter((p) => p.id !== id));
      if (editId === id) resetForm();
      toast("success", "Supprimé");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const togglePublished = async (p: Platform) => {
    try {
      const res = await fetch(`/api/admin/platforms/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !p.published }),
      });
      if (!res.ok) throw new Error();
      const updated: Platform = await res.json();
      setPlatforms((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const inputStyle = {
    background: "var(--background)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-mono font-bold mb-2" style={{ color: "var(--foreground)" }}>
        Plateformes
      </h1>
      <p className="text-xs font-mono mb-8" style={{ color: "var(--muted-foreground)" }}>
        Gère les plateformes de formation affichées sur la page Cours. Sans URL, la carte s’affiche « bientôt ».
      </p>

      <div className="space-y-3 mb-10">
        {platforms.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 p-4 rounded-lg border"
            style={{
              background: "var(--muted)",
              borderColor: "var(--border)",
              opacity: p.published ? 1 : 0.55,
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                {p.title}
                {p.badge && (
                  <span
                    className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded border"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  >
                    {p.badge}
                  </span>
                )}
              </p>
              <p className="text-xs font-mono mt-1 truncate" style={{ color: "var(--muted-foreground)" }}>
                {p.url ?? "— bientôt (pas d'URL)"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => togglePublished(p)}
                className="p-1.5 transition-opacity hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
                title={p.published ? "Dépublier" : "Publier"}
              >
                {p.published ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <button
                onClick={() => startEdit(p)}
                className="p-1.5 transition-opacity hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 transition-opacity hover:opacity-70"
                style={{ color: "#ef4444" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {platforms.length === 0 && (
          <p className="text-xs font-mono py-3" style={{ color: "var(--muted-foreground)" }}>
            Aucune plateforme pour l’instant. Ajoutes-en une ci-dessous.
          </p>
        )}
      </div>

      <div className="p-5 rounded-lg border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-mono font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {editId ? "MODIFIER LA PLATEFORME" : "AJOUTER UNE PLATEFORME"}
          </p>
          {editId && (
            <button onClick={resetForm} className="text-xs font-mono hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
              Annuler
            </button>
          )}
        </div>

        <div className="space-y-2 mb-3">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Titre de la plateforme"
            className="w-full px-3 py-2 text-xs rounded-lg border outline-none"
            style={inputStyle}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              placeholder="URL (vide = bientôt)"
              className="px-3 py-2 text-xs rounded-lg border outline-none"
              style={inputStyle}
            />
            <input
              value={form.badge}
              onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
              placeholder="Badge (optionnel, ex. nouveau)"
              className="px-3 py-2 text-xs rounded-lg border outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <textarea
            value={form.descFr}
            onChange={(e) => setForm((p) => ({ ...p, descFr: e.target.value }))}
            placeholder="Description FR"
            rows={2}
            className="px-3 py-2 text-xs rounded-lg border outline-none resize-none"
            style={inputStyle}
          />
          <textarea
            value={form.descEn}
            onChange={(e) => setForm((p) => ({ ...p, descEn: e.target.value }))}
            placeholder="Description EN (optionnel)"
            rows={2}
            className="px-3 py-2 text-xs rounded-lg border outline-none resize-none"
            style={inputStyle}
          />
          <textarea
            value={form.descIt}
            onChange={(e) => setForm((p) => ({ ...p, descIt: e.target.value }))}
            placeholder="Description IT (optionnel)"
            rows={2}
            className="px-3 py-2 text-xs rounded-lg border outline-none resize-none"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : editId ? <Check size={12} /> : <Plus size={12} />}
          {editId ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
