"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit2, Loader2, X, Check, Eye, EyeOff, Upload } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import type { MobileApp } from "@prisma/client";

interface FormState {
  name: string;
  descFr: string;
  descEn: string;
  descIt: string;
  iconUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
}

const emptyForm: FormState = {
  name: "",
  descFr: "",
  descEn: "",
  descIt: "",
  iconUrl: "",
  playStoreUrl: "",
  appStoreUrl: "",
};

export function MobileAppsClient({ initialApps }: { initialApps: MobileApp[] }) {
  const [apps, setApps] = useState<MobileApp[]>(initialApps);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const startEdit = (app: MobileApp) => {
    setEditId(app.id);
    setForm({
      name: app.name,
      descFr: app.descFr,
      descEn: app.descEn,
      descIt: app.descIt,
      iconUrl: app.iconUrl,
      playStoreUrl: app.playStoreUrl ?? "",
      appStoreUrl: app.appStoreUrl ?? "",
    });
  };

  const handleUploadIcon = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "mobile-apps");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setForm((p) => ({ ...p, iconUrl: url }));
      toast("success", "Icône téléchargée");
    } catch {
      toast("error", "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.iconUrl.trim()) {
      toast("error", "Nom et icône requis");
      return;
    }
    if (!form.playStoreUrl.trim() && !form.appStoreUrl.trim()) {
      toast("error", "Au moins un store (Play Store ou App Store) est requis");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        descFr: form.descFr.trim(),
        descEn: form.descEn.trim() || form.descFr.trim(),
        descIt: form.descIt.trim() || form.descFr.trim(),
        iconUrl: form.iconUrl.trim(),
        playStoreUrl: form.playStoreUrl.trim() || null,
        appStoreUrl: form.appStoreUrl.trim() || null,
      };

      if (editId) {
        const res = await fetch(`/api/admin/mobile-apps/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated: MobileApp = await res.json();
        setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast("success", "Mis à jour");
      } else {
        const res = await fetch("/api/admin/mobile-apps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, order: apps.length + 1 }),
        });
        if (!res.ok) throw new Error();
        const created: MobileApp = await res.json();
        setApps((prev) => [...prev, created]);
        toast("success", "App ajoutée");
      }
      resetForm();
    } catch {
      toast("error", "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette application ?")) return;
    try {
      const res = await fetch(`/api/admin/mobile-apps/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setApps((prev) => prev.filter((a) => a.id !== id));
      if (editId === id) resetForm();
      toast("success", "Supprimé");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const togglePublished = async (app: MobileApp) => {
    try {
      const res = await fetch(`/api/admin/mobile-apps/${app.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !app.published }),
      });
      if (!res.ok) throw new Error();
      const updated: MobileApp = await res.json();
      setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-mono font-bold mb-2" style={{ color: "var(--foreground)" }}>
        Apps mobiles
      </h1>
      <p className="text-xs font-mono mb-8" style={{ color: "var(--muted-foreground)" }}>
        Gère les applications mobiles affichées sur ton portfolio.
      </p>

      <div className="space-y-3 mb-10">
        {apps.map((app) => (
          <div
            key={app.id}
            className="flex items-center gap-4 p-4 rounded-lg border"
            style={{
              background: "var(--muted)",
              borderColor: "var(--border)",
              opacity: app.published ? 1 : 0.55,
            }}
          >
            <div
              className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0"
              style={{ background: "var(--background)" }}
            >
              {app.iconUrl ? (
                <Image src={app.iconUrl} alt={app.name} fill sizes="48px" className="object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                {app.name}
              </p>
              <div className="flex gap-3 mt-1">
                {app.playStoreUrl && (
                  <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                    Play Store
                  </span>
                )}
                {app.appStoreUrl && (
                  <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                    App Store
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => togglePublished(app)}
                className="p-1.5 transition-opacity hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
                title={app.published ? "Dépublier" : "Publier"}
              >
                {app.published ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <button
                onClick={() => startEdit(app)}
                className="p-1.5 transition-opacity hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => handleDelete(app.id)}
                className="p-1.5 transition-opacity hover:opacity-70"
                style={{ color: "#ef4444" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {apps.length === 0 && (
          <p className="text-xs font-mono py-3" style={{ color: "var(--muted-foreground)" }}>
            Aucune app pour l'instant. Ajoutes-en une ci-dessous.
          </p>
        )}
      </div>

      <div
        className="p-5 rounded-lg border"
        style={{ background: "var(--muted)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-mono font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {editId ? "MODIFIER L'APP" : "AJOUTER UNE APP"}
          </p>
          {editId && (
            <button
              onClick={resetForm}
              className="text-xs font-mono hover:opacity-70"
              style={{ color: "var(--muted-foreground)" }}
            >
              Annuler
            </button>
          )}
        </div>

        <div className="flex items-start gap-4 mb-3">
          <div
            className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border"
            style={{ background: "var(--background)", borderColor: "var(--border)" }}
          >
            {form.iconUrl ? (
              <Image src={form.iconUrl} alt="Icon preview" fill sizes="80px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                icon
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nom de l'app"
              className="w-full px-3 py-2 text-xs rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <div className="flex gap-2">
              <input
                value={form.iconUrl}
                onChange={(e) => setForm((p) => ({ ...p, iconUrl: e.target.value }))}
                placeholder="URL de l'icône (ou utilise Upload)"
                className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none"
                style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadIcon(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-lg border transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                Upload
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <textarea
            value={form.descFr}
            onChange={(e) => setForm((p) => ({ ...p, descFr: e.target.value }))}
            placeholder="Description FR (optionnel)"
            rows={2}
            className="px-3 py-2 text-xs rounded-lg border outline-none resize-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <textarea
            value={form.descEn}
            onChange={(e) => setForm((p) => ({ ...p, descEn: e.target.value }))}
            placeholder="Description EN"
            rows={2}
            className="px-3 py-2 text-xs rounded-lg border outline-none resize-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <textarea
            value={form.descIt}
            onChange={(e) => setForm((p) => ({ ...p, descIt: e.target.value }))}
            placeholder="Description IT"
            rows={2}
            className="px-3 py-2 text-xs rounded-lg border outline-none resize-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <input
            value={form.playStoreUrl}
            onChange={(e) => setForm((p) => ({ ...p, playStoreUrl: e.target.value }))}
            placeholder="URL Play Store"
            className="px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <input
            value={form.appStoreUrl}
            onChange={(e) => setForm((p) => ({ ...p, appStoreUrl: e.target.value }))}
            placeholder="URL App Store"
            className="px-3 py-2 text-xs rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !form.name.trim() || !form.iconUrl.trim()}
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
