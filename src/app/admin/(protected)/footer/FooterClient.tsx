"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Loader2, X, Check, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import type { FooterLink } from "@prisma/client";

const COLUMNS = [
  { value: "formations", label: "Formations & Articles" },
  { value: "products", label: "Produits" },
] as const;

type ColumnValue = (typeof COLUMNS)[number]["value"];

interface EditState {
  id: string;
  labelFr: string;
  labelEn: string;
  labelIt: string;
  url: string;
  column: string;
}

interface NewLinkState {
  labelFr: string;
  labelEn: string;
  labelIt: string;
  url: string;
  column: ColumnValue;
}

const emptyNew: NewLinkState = {
  labelFr: "",
  labelEn: "",
  labelIt: "",
  url: "",
  column: "formations",
};

export function FooterClient({ initialLinks }: { initialLinks: FooterLink[] }) {
  const [links, setLinks] = useState<FooterLink[]>(initialLinks);
  const [newLink, setNewLink] = useState<NewLinkState>(emptyNew);
  const [adding, setAdding] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const linksByColumn = (col: ColumnValue) =>
    links.filter((l) => l.column === col).sort((a, b) => a.order - b.order);

  const handleAdd = async () => {
    if (!newLink.labelFr.trim() || !newLink.url.trim()) {
      toast("error", "Le label FR et l'URL sont requis");
      return;
    }
    setAdding(true);
    try {
      const order = linksByColumn(newLink.column).length + 1;
      const res = await fetch("/api/admin/footer-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labelFr: newLink.labelFr.trim(),
          labelEn: newLink.labelEn.trim() || newLink.labelFr.trim(),
          labelIt: newLink.labelIt.trim() || newLink.labelFr.trim(),
          url: newLink.url.trim(),
          column: newLink.column,
          order,
        }),
      });
      if (!res.ok) throw new Error();
      const saved: FooterLink = await res.json();
      setLinks((prev) => [...prev, saved]);
      setNewLink(emptyNew);
      toast("success", "Lien ajouté");
    } catch {
      toast("error", "Une erreur est survenue");
    } finally {
      setAdding(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/footer-links/${editState.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labelFr: editState.labelFr,
          labelEn: editState.labelEn,
          labelIt: editState.labelIt,
          url: editState.url,
          column: editState.column,
        }),
      });
      if (!res.ok) throw new Error();
      const updated: FooterLink = await res.json();
      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setEditState(null);
      toast("success", "Mis à jour");
    } catch {
      toast("error", "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce lien ?")) return;
    try {
      const res = await fetch(`/api/admin/footer-links/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast("success", "Supprimé");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const togglePublished = async (link: FooterLink) => {
    try {
      const res = await fetch(`/api/admin/footer-links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !link.published }),
      });
      if (!res.ok) throw new Error();
      const updated: FooterLink = await res.json();
      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-mono font-bold mb-2" style={{ color: "var(--foreground)" }}>
        Footer
      </h1>
      <p className="text-xs font-mono mb-8" style={{ color: "var(--muted-foreground)" }}>
        Gère les liens des deux colonnes du pied de page.
      </p>

      {COLUMNS.map((col) => (
        <div key={col.value} className="mb-10">
          <p
            className="text-xs font-mono font-semibold mb-3 uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}
          >
            {col.label}
          </p>

          <div className="space-y-2">
            {linksByColumn(col.value).map((l) => (
              <div
                key={l.id}
                className="p-4 rounded-lg border"
                style={{ background: "var(--muted)", borderColor: "var(--border)" }}
              >
                {editState?.id === l.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        value={editState.labelFr}
                        onChange={(e) => setEditState((p) => p && { ...p, labelFr: e.target.value })}
                        placeholder="FR"
                        className="px-2 py-1 text-xs rounded border outline-none"
                        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      />
                      <input
                        value={editState.labelEn}
                        onChange={(e) => setEditState((p) => p && { ...p, labelEn: e.target.value })}
                        placeholder="EN"
                        className="px-2 py-1 text-xs rounded border outline-none"
                        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      />
                      <input
                        value={editState.labelIt}
                        onChange={(e) => setEditState((p) => p && { ...p, labelIt: e.target.value })}
                        placeholder="IT"
                        className="px-2 py-1 text-xs rounded border outline-none"
                        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={editState.column}
                        onChange={(e) => setEditState((p) => p && { ...p, column: e.target.value })}
                        className="px-2 py-1 text-xs font-mono rounded border outline-none"
                        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        value={editState.url}
                        onChange={(e) => setEditState((p) => p && { ...p, url: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 px-2 py-1 text-xs rounded border outline-none"
                        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="p-1.5 transition-opacity hover:opacity-70"
                        style={{ color: "var(--foreground)" }}
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        onClick={() => setEditState(null)}
                        className="p-1.5 hover:opacity-70"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0" style={{ opacity: l.published ? 1 : 0.5 }}>
                      <p className="text-xs font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                        {l.labelFr}
                        <span className="ml-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                          / {l.labelEn} / {l.labelIt}
                        </span>
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {l.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePublished(l)}
                        className="p-1.5 transition-opacity hover:opacity-70"
                        style={{ color: "var(--muted-foreground)" }}
                        title={l.published ? "Dépublier" : "Publier"}
                      >
                        {l.published ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button
                        onClick={() =>
                          setEditState({
                            id: l.id,
                            labelFr: l.labelFr,
                            labelEn: l.labelEn,
                            labelIt: l.labelIt,
                            url: l.url,
                            column: l.column,
                          })
                        }
                        className="p-1.5 transition-opacity hover:opacity-70"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="p-1.5 transition-opacity hover:opacity-70"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {linksByColumn(col.value).length === 0 && (
              <p className="text-xs font-mono py-3" style={{ color: "var(--muted-foreground)" }}>
                Aucun lien dans cette colonne.
              </p>
            )}
          </div>
        </div>
      ))}

      <div
        className="p-5 rounded-lg border"
        style={{ background: "var(--muted)", borderColor: "var(--border)" }}
      >
        <p className="text-xs font-mono font-semibold mb-4" style={{ color: "var(--muted-foreground)" }}>
          AJOUTER UN LIEN
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input
            value={newLink.labelFr}
            onChange={(e) => setNewLink((p) => ({ ...p, labelFr: e.target.value }))}
            placeholder="Label FR (requis)"
            className="px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <input
            value={newLink.labelEn}
            onChange={(e) => setNewLink((p) => ({ ...p, labelEn: e.target.value }))}
            placeholder="Label EN (optionnel)"
            className="px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <input
            value={newLink.labelIt}
            onChange={(e) => setNewLink((p) => ({ ...p, labelIt: e.target.value }))}
            placeholder="Label IT (optionnel)"
            className="px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex gap-2 mb-3">
          <select
            value={newLink.column}
            onChange={(e) => setNewLink((p) => ({ ...p, column: e.target.value as ColumnValue }))}
            className="px-3 py-2 text-xs font-mono rounded-lg border outline-none shrink-0"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {COLUMNS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            value={newLink.url}
            onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="https://..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !newLink.labelFr.trim() || !newLink.url.trim()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          Ajouter
        </button>
      </div>
    </div>
  );
}
