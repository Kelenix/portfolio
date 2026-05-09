"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Loader2, X, Check } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useToast } from "@/components/admin/Toast";
import type { SocialLink } from "@prisma/client";

const PLATFORMS = ["GitHub", "LinkedIn", "Twitter", "YouTube", "Instagram", "TikTok", "Discord", "Twitch"] as const;

const iconMap: Record<string, React.ReactNode> = {
  GitHub: <FaGithub size={16} />,
  LinkedIn: <FaLinkedinIn size={16} />,
  Twitter: <FaXTwitter size={16} />,
  YouTube: <FaYoutube size={16} />,
};

interface EditState {
  id: string;
  platform: string;
  url: string;
}

export function SocialClient({ initialSocials }: { initialSocials: SocialLink[] }) {
  const [socials, setSocials] = useState<SocialLink[]>(initialSocials);
  const [newPlatform, setNewPlatform] = useState<string>(PLATFORMS[0]);
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: newPlatform, url: newUrl.trim(), order: socials.length + 1 }),
      });
      if (!res.ok) throw new Error();
      const saved: SocialLink = await res.json();
      setSocials((prev) => [...prev, saved]);
      setNewUrl("");
      toast("success", "Réseau ajouté");
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
      const res = await fetch(`/api/admin/social/${editState.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: editState.platform, url: editState.url }),
      });
      if (!res.ok) throw new Error();
      const updated: SocialLink = await res.json();
      setSocials((prev) => prev.map((s) => (s.id === editState.id ? updated : s)));
      setEditState(null);
      toast("success", "Mis à jour");
    } catch {
      toast("error", "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce réseau ?")) return;
    try {
      const res = await fetch(`/api/admin/social/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSocials((prev) => prev.filter((s) => s.id !== id));
      toast("success", "Supprimé");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-mono font-bold mb-8" style={{ color: "var(--foreground)" }}>
        Réseaux sociaux
      </h1>

      {/* Existing links */}
      <div className="space-y-2 mb-8">
        {socials.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-4 rounded-lg border"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            <span style={{ color: "var(--muted-foreground)" }}>
              {iconMap[s.platform] ?? <span className="text-xs font-mono">{s.platform.slice(0, 2).toUpperCase()}</span>}
            </span>

            {editState?.id === s.id ? (
              <div className="flex-1 flex items-center gap-2">
                <select
                  value={editState.platform}
                  onChange={(e) => setEditState((prev) => prev && { ...prev, platform: e.target.value })}
                  className="px-2 py-1 text-xs font-mono rounded border outline-none"
                  style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <input
                  value={editState.url}
                  onChange={(e) => setEditState((prev) => prev && { ...prev, url: e.target.value })}
                  className="flex-1 px-2 py-1 text-xs rounded border outline-none"
                  style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="https://..."
                />
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="p-1 transition-opacity hover:opacity-70"
                  style={{ color: "var(--foreground)" }}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                </button>
                <button onClick={() => setEditState(null)} className="p-1 hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-semibold" style={{ color: "var(--foreground)" }}>{s.platform}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.url}</p>
              </div>
            )}

            {editState?.id !== s.id && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditState({ id: s.id, platform: s.platform, url: s.url })}
                  className="p-1.5 transition-opacity hover:opacity-70"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 transition-opacity hover:opacity-70"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        ))}

        {socials.length === 0 && (
          <p className="text-sm font-mono text-center py-6" style={{ color: "var(--muted-foreground)" }}>
            Aucun réseau social. Ajoutez-en un ci-dessous.
          </p>
        )}
      </div>

      {/* Add new */}
      <div
        className="p-5 rounded-lg border"
        style={{ background: "var(--muted)", borderColor: "var(--border)" }}
      >
        <p className="text-xs font-mono font-semibold mb-4" style={{ color: "var(--muted-foreground)" }}>
          AJOUTER UN RÉSEAU
        </p>
        <div className="flex gap-2 mb-3">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-lg border outline-none shrink-0"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="https://..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !newUrl.trim()}
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
