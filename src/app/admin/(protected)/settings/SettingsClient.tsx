"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState } from "react";
import { Loader2, Upload, X, Lock } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import type { Profile } from "@prisma/client";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Requis"),
    newPassword: z.string().min(8, "8 caractères minimum"),
    confirmPassword: z.string().min(1, "Requis"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

const profileSchema = z.object({
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  nameIt: z.string().min(1),
  roleFr: z.string().min(1),
  roleEn: z.string().min(1),
  roleIt: z.string().min(1),
  bioFr: z.string().min(1),
  bioEn: z.string().min(1),
  bioIt: z.string().min(1),
  email: z.string().email(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type Tab = "fr" | "en" | "it";

export function SettingsClient({ profile }: { profile: Profile | null }) {
  const [activeTab, setActiveTab] = useState<Tab>("fr");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nameFr: profile?.nameFr ?? "",
      nameEn: profile?.nameEn ?? "",
      nameIt: profile?.nameIt ?? "",
      roleFr: profile?.roleFr ?? "",
      roleEn: profile?.roleEn ?? "",
      roleIt: profile?.roleIt ?? "",
      bioFr: profile?.bioFr ?? "",
      bioEn: profile?.bioEn ?? "",
      bioIt: profile?.bioIt ?? "",
      email: profile?.email ?? "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      let photoUrl = profile?.photoUrl ?? null;

      if (photoFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", photoFile);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload échoué");
        const json = await res.json();
        photoUrl = json.url;
        setUploading(false);
      } else if (!photoPreview) {
        photoUrl = null;
      }

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, photoUrl }),
      });
      if (!res.ok) throw new Error();
      setPhotoFile(null);
      toast("success", "Profil mis à jour");
    } catch {
      setUploading(false);
      toast("error", "Une erreur est survenue");
    }
  };

  const {
    register: regPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { isSubmitting: pwdSubmitting, errors: pwdErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast("error", err.error ?? "Erreur lors du changement");
        return;
      }
      resetPwd();
      toast("success", "Mot de passe mis à jour");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const tabs: Tab[] = ["fr", "en", "it"];
  const tabLabel: Record<Tab, string> = { fr: "Français", en: "English", it: "Italiano" };

  const fields: { key: "name" | "role" | "bio"; label: Record<Tab, string> }[] = [
    { key: "name", label: { fr: "Nom", en: "Name", it: "Nome" } },
    { key: "role", label: { fr: "Rôle", en: "Role", it: "Ruolo" } },
    { key: "bio", label: { fr: "Bio", en: "Bio", it: "Bio" } },
  ];

  const fieldKey = (field: string, tab: Tab) =>
    `${field}${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof ProfileForm;

  const busy = isSubmitting || uploading;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-mono font-bold mb-8" style={{ color: "var(--foreground)" }}>
        Paramètres du profil
      </h1>

      <div className="p-6 rounded-xl border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
        {/* Language tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: "var(--background)" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-1.5 text-xs font-mono rounded-md transition-all"
              style={{
                background: activeTab === tab ? "var(--muted)" : "transparent",
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
              {fields.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                    {label[tab]}
                  </label>
                  {key === "bio" ? (
                    <textarea
                      {...register(fieldKey(key, tab))}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none"
                      style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  ) : (
                    <input
                      {...register(fieldKey(key, tab))}
                      className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                      style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
              Email de contact
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          {/* Photo de profil */}
          <div>
            <label className="block text-xs font-mono mb-3" style={{ color: "var(--muted-foreground)" }}>
              Photo de profil
            </label>
            <div className="flex items-center gap-4">
              {/* Avatar preview */}
              <div
                className="relative w-16 h-16 rounded-full overflow-hidden shrink-0"
                style={{ border: "2px solid var(--border)" }}
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-xl font-mono font-bold"
                    style={{ background: "var(--background)", color: "var(--muted-foreground)" }}
                  >
                    ?
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-lg border cursor-pointer transition-opacity hover:opacity-70"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  <Upload size={12} />
                  {photoPreview ? "Changer la photo" : "Choisir un fichier"}
                </label>
                <input
                  ref={fileInputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {photoFile && (
                  <span className="text-xs font-mono truncate max-w-45" style={{ color: "var(--muted-foreground)" }}>
                    {photoFile.name}
                  </span>
                )}
                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="inline-flex items-center gap-1.5 text-xs font-mono transition-opacity hover:opacity-70 w-fit"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <X size={11} />
                    Supprimer la photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              {busy && <Loader2 size={12} className="animate-spin" />}
              {uploading ? "Upload en cours…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs font-mono mt-4" style={{ color: "var(--muted-foreground)" }}>
        Pour gérer les réseaux sociaux, rendez-vous dans{" "}
        <a href="/admin/social" className="underline" style={{ color: "var(--foreground)" }}>
          Réseaux sociaux
        </a>.
      </p>

      {/* Password change section */}
      <div className="mt-8">
        <h2 className="text-base font-mono font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
          <Lock size={14} />
          Changer le mot de passe
        </h2>

        <div className="p-6 rounded-xl border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
          <form onSubmit={handlePwdSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                Mot de passe actuel
              </label>
              <input
                {...regPwd("currentPassword")}
                type="password"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              {pwdErrors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{pwdErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                Nouveau mot de passe
              </label>
              <input
                {...regPwd("newPassword")}
                type="password"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              {pwdErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{pwdErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
                Confirmer le nouveau mot de passe
              </label>
              <input
                {...regPwd("confirmPassword")}
                type="password"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              {pwdErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{pwdErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={pwdSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                {pwdSubmitting && <Loader2 size={12} className="animate-spin" />}
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
