"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import type { Profile } from "@prisma/client";

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
  photoUrl: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type Tab = "fr" | "en" | "it";

export function SettingsClient({ profile }: { profile: Profile | null }) {
  const [activeTab, setActiveTab] = useState<Tab>("fr");
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
      photoUrl: profile?.photoUrl ?? "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, photoUrl: data.photoUrl || null }),
      });
      if (!res.ok) throw new Error();
      toast("success", "Profil mis à jour");
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

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "var(--muted-foreground)" }}>
              URL photo de profil
            </label>
            <input
              {...register("photoUrl")}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              {isSubmitting && <Loader2 size={12} className="animate-spin" />}
              Enregistrer
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
    </div>
  );
}
