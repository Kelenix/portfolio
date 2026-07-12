import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Stockage Supabase (photos de profil, images projets/apps, blog…)
      { protocol: "https", hostname: "*.supabase.co" },
      // CDN Chariow (visuels des formations/produits)
      { protocol: "https", hostname: "images.chariowcdn.com" },
      { protocol: "https", hostname: "assets.chariowcdn.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
