"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Identifiants incorrects");
    } else {
      window.location.href = "/admin";
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-10 h-10 rounded-lg border flex items-center justify-center"
            style={{ borderColor: "var(--border)", color: "var(--accent)" }}
          >
            <Lock size={18} strokeWidth={1.5} />
          </div>
        </div>

        <h1
          className="text-xl font-mono font-bold text-center mb-8"
          style={{ color: "var(--foreground)" }}
        >
          Admin Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              className="block text-xs font-mono mb-1.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors focus:ring-1"
              style={{
                background: "var(--muted)",
                borderColor: errors.email ? "#ef4444" : "var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="admin@portfolio.com"
            />
          </div>

          <div>
            <label
              className="block text-xs font-mono mb-1.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              Mot de passe
            </label>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors"
              style={{
                background: "var(--muted)",
                borderColor: errors.password ? "#ef4444" : "var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-mono rounded-lg border transition-all duration-200 disabled:opacity-50"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              borderColor: "var(--foreground)",
            }}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
