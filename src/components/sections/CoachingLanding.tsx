"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Sparkles,
  Rocket,
  Globe,
  Code2,
  Bot,
  Zap,
  Check,
  Calendar,
  Users,
  Clock,
  User,
} from "lucide-react";

// Lien d'invitation du groupe WhatsApp du coaching
const WHATSAPP_URL = "https://chat.whatsapp.com/E8D59Elk0FhJvxmmciSN24";

const WHATSAPP_GREEN = "#25D366";

const benefits = [
  {
    icon: Globe,
    title: "Un site web pro, en ligne",
    desc: "De l'idée à la mise en ligne : ton propre site web moderne, rapide et responsive.",
  },
  {
    icon: Bot,
    title: "Piloté par l'IA",
    desc: "Apprends à faire travailler l'IA pour toi : contenu, design, code et déploiement.",
  },
  {
    icon: Zap,
    title: "Sans être développeur",
    desc: "Aucune compétence technique requise au départ. On avance étape par étape.",
  },
  {
    icon: Rocket,
    title: "En seulement 2 semaines",
    desc: "Un plan d'action clair, du concret chaque jour, un résultat en ligne à la fin.",
  },
];

const week1 = [
  "Cadrer ton projet et ton objectif",
  "Choisir les bons outils IA (gratuits et payants)",
  "Générer le design et le contenu de ton site",
  "Construire les premières pages avec l'IA",
];

const week2 = [
  "Ajouter les fonctionnalités clés",
  "Connecter un formulaire / paiement / base de données",
  "Optimiser le référencement (SEO) et la vitesse",
  "Mettre ton site en ligne et le partager au monde",
];

const audience = [
  "Entrepreneurs & indépendants qui veulent leur site sans agence",
  "Créateurs de contenu qui veulent une vitrine pro",
  "Débutants curieux de l'IA et du web",
  "Toute personne qui veut lancer un projet en ligne vite et bien",
];

function CTAButton({ large = false }: { large?: boolean }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-3 rounded-full font-semibold text-white shadow-lg transition-transform hover:scale-[1.03] ${
        large ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"
      }`}
      style={{ background: WHATSAPP_GREEN }}
    >
      <FaWhatsapp size={large ? 22 : 18} />
      Rejoindre le groupe WhatsApp
    </a>
  );
}

export function CoachingLanding() {
  const [coachImgOk, setCoachImgOk] = useState(true);
  return (
    <div className="overflow-hidden">
      {/* ===================== HERO ===================== */}
      <section className="relative">
        {/* halo décoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 80% 10%, rgba(99,102,241,0.20), transparent 70%), radial-gradient(50% 50% at 10% 90%, rgba(168,85,247,0.16), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Texte */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-widest"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)",
                }}
              >
                <Sparkles size={13} /> Coaching en ligne
              </span>

              <h1
                className="mt-5 text-4xl font-bold leading-[1.1] md:text-5xl lg:text-6xl"
                style={{ color: "var(--foreground)" }}
              >
                Lance ton{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg,#3b82f6,#a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  site web
                </span>{" "}
                avec l'IA en 2 semaines
              </h1>

              <p
                className="mt-5 max-w-xl text-base leading-relaxed md:text-lg"
                style={{ color: "var(--muted-foreground)" }}
              >
                Un accompagnement pas à pas pour transformer ton idée en un vrai
                site web en ligne — grâce à l'intelligence artificielle, même si
                tu débutes de zéro.
              </p>

              {/* Badge date bien voyant */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-7 inline-flex items-center gap-3 rounded-2xl px-5 py-3 shadow-lg"
                style={{
                  background: "linear-gradient(90deg,#3b82f6,#a855f7)",
                }}
              >
                <Calendar size={22} className="shrink-0 text-white" />
                <span className="text-left leading-tight text-white">
                  <span className="block text-[11px] font-semibold uppercase tracking-widest opacity-90">
                    Démarrage
                  </span>
                  <span className="block text-xl font-extrabold md:text-2xl">
                    10 juillet 2026
                  </span>
                </span>
              </motion.div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <CTAButton large />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#a855f7" }}
                >
                  🔥 Places limitées
                </span>
              </div>

              {/* mini stats */}
              <div className="mt-10 flex flex-wrap gap-8">
                {[
                  { k: "2", v: "semaines" },
                  { k: "0", v: "code au départ" },
                  { k: "1", v: "site en ligne" },
                ].map((s) => (
                  <div key={s.v}>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {s.k}
                    </div>
                    <div
                      className="text-xs font-mono uppercase tracking-wide"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Image couverture (PNG transparent qui flotte) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative mx-auto w-full max-w-sm"
            >
              {/* halo derrière la couverture */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 45%, rgba(99,102,241,0.45), transparent 65%)",
                }}
              />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative aspect-[3/4] w-full"
              >
                <Image
                  src="/coaching/cover.png"
                  alt="Coaching : Lance ton site web avec l'IA en 2 semaines"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="object-contain drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== BÉNÉFICES ===================== */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-xl border p-5"
              style={{ borderColor: "var(--border)", background: "var(--background)" }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--muted)", color: "#a855f7" }}
              >
                <b.icon size={20} strokeWidth={1.75} />
              </div>
              <h3
                className="mb-1.5 text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {b.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== PROGRAMME ===================== */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-10 text-center">
          <span
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Calendar size={14} /> Le programme
          </span>
          <h2
            className="mt-3 text-2xl font-bold md:text-3xl"
            style={{ color: "var(--foreground)" }}
          >
            2 semaines, un plan clair
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            { label: "Semaine 1", title: "Poser les fondations", items: week1 },
            { label: "Semaine 2", title: "Construire & mettre en ligne", items: week2 },
          ].map((w, i) => (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="rounded-2xl border p-6 md:p-8"
              style={{ borderColor: "var(--border)", background: "var(--muted)" }}
            >
              <div
                className="mb-1 text-xs font-mono uppercase tracking-widest"
                style={{ color: "#a855f7" }}
              >
                {w.label}
              </div>
              <h3
                className="mb-5 text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {w.title}
              </h3>
              <ul className="space-y-3">
                {w.items.map((it) => (
                  <li key={it} className="flex items-start gap-3">
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      className="mt-0.5 shrink-0"
                      style={{ color: WHATSAPP_GREEN }}
                    />
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--foreground)" }}
                    >
                      {it}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== POUR QUI ===================== */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div
          className="grid items-center gap-10 rounded-2xl border p-8 md:grid-cols-2 md:p-12"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          <div>
            <span
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Users size={14} /> Pour qui ?
            </span>
            <h2
              className="mt-3 text-2xl font-bold md:text-3xl"
              style={{ color: "var(--foreground)" }}
            >
              Ce coaching est fait pour toi si…
            </h2>
            <ul className="mt-6 space-y-3">
              {audience.map((a) => (
                <li key={a} className="flex items-start gap-3">
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className="mt-0.5 shrink-0"
                    style={{ color: WHATSAPP_GREEN }}
                  />
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    {a}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coach */}
          <div className="flex flex-col items-center text-center">
            <div
              className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border shadow-lg"
              style={{ borderColor: "var(--border)", background: "var(--muted)" }}
            >
              {coachImgOk ? (
                <Image
                  src="/coaching/leo.jpg"
                  alt="Ton coach"
                  fill
                  sizes="160px"
                  className="object-cover"
                  onError={() => setCoachImgOk(false)}
                />
              ) : (
                <User
                  size={56}
                  strokeWidth={1.25}
                  style={{ color: "var(--muted-foreground)" }}
                />
              )}
            </div>
            <p
              className="mt-4 text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Lionel · Ton coach
            </p>
            <p
              className="mt-1 max-w-xs text-xs leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              Développeur & créateur. Je t'accompagne au quotidien dans le
              groupe pour que tu ne restes jamais bloqué.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border px-8 py-14 text-center md:px-16 md:py-20"
          style={{ borderColor: "var(--border)", background: "var(--muted)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(50% 80% at 50% 0%, rgba(99,102,241,0.18), transparent 70%)",
            }}
          />
          <Code2
            size={32}
            strokeWidth={1.5}
            className="mx-auto mb-5"
            style={{ color: "#a855f7" }}
          />
          <h2
            className="mx-auto max-w-2xl text-2xl font-bold leading-tight md:text-4xl"
            style={{ color: "var(--foreground)" }}
          >
            Prêt à lancer ton site web avec l'IA ?
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed md:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            Rejoins le groupe WhatsApp privé du coaching. C'est là que tout se
            passe : accompagnement, ressources et lancement de ton projet.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <div
              className="inline-flex items-center gap-2.5 rounded-2xl px-5 py-2.5 shadow-lg"
              style={{ background: "linear-gradient(90deg,#3b82f6,#a855f7)" }}
            >
              <Calendar size={18} className="shrink-0 text-white" />
              <span className="text-base font-extrabold text-white md:text-lg">
                Démarrage le 10 juillet 2026
              </span>
            </div>
            <CTAButton large />
            <span
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "#a855f7" }}
            >
              <Clock size={14} /> 🔥 Places limitées
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
