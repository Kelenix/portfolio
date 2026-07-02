"use client";

import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { Mail } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface ProfileData {
  name: string;
  role: string;
  bio: string;
  email: string;
  photoUrl?: string | null;
  socials: SocialLink[];
}

const iconMap: Record<string, React.ReactNode> = {
  GitHub: <FaGithub size={13} />,
  LinkedIn: <FaLinkedinIn size={13} />,
  Twitter: <FaXTwitter size={13} />,
  YouTube: <FaYoutube size={13} />,
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Hero({ profile }: { profile: ProfileData }) {
  const t = useTranslations("hero");

  return (
    <section className="mx-auto max-w-5xl px-6 pt-12 pb-8">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">

        {/* Photo + Name */}
        <motion.div variants={item} className="flex items-center gap-5">
          <div
            className="relative w-16 h-16 rounded-full overflow-hidden shrink-0"
            style={{ border: "2px solid var(--border)" }}
          >
            {profile.photoUrl ? (
              <Image src={profile.photoUrl} alt={profile.name} fill sizes="64px" className="object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-mono font-bold"
                style={{ background: "var(--muted)", color: "var(--foreground)" }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1
              className="text-2xl md:text-3xl font-mono font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              {profile.name}
            </h1>
            <p className="text-sm font-mono mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {profile.role}
            </p>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.p
          variants={item}
          className="text-base max-w-2xl"
          style={{ color: "var(--muted-foreground)", lineHeight: "1.8" }}
        >
          {profile.bio}
        </motion.p>

        {/* Social badges */}
        <motion.div variants={item} className="flex flex-wrap gap-2">
          {profile.socials.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 hover:opacity-60"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {iconMap[social.platform] ?? null}
              {social.platform}
            </a>
          ))}
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 hover:opacity-60"
            style={{ borderColor: "var(--foreground)", color: "var(--foreground)" }}
          >
            <Mail size={13} strokeWidth={1.5} />
            {t("contact")}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
