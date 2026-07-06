import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import sharp from "sharp";

// Favicon généré dynamiquement à partir de la photo de profil (rond, comme
// l'avatar du site). La photo est d'abord redimensionnée en 64×64 avec sharp :
// next/og ne sait pas décoder une image lourde (plusieurs Mo) dans une fonction
// serverless, ce qui provoquait un repli silencieux sur l'initiale.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

function letterIcon(initial: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fff",
          fontSize: 42,
          fontWeight: 700,
          borderRadius: "50%",
        }}
      >
        {initial}
      </div>
    ),
    { ...size }
  );
}

export default async function Icon() {
  let photoUrl: string | null = null;
  let initial = "L";

  try {
    const profile = await prisma.profile.findFirst({ where: { id: "default" } });
    photoUrl = profile?.photoUrl ?? null;
    const name = profile?.nameFr || profile?.nameEn || profile?.nameIt || "";
    if (name.trim()) initial = name.trim().charAt(0).toUpperCase();
  } catch {
    return letterIcon(initial);
  }

  if (!photoUrl) return letterIcon(initial);

  try {
    const res = await fetch(photoUrl);
    if (!res.ok) return letterIcon(initial);

    const input = Buffer.from(await res.arrayBuffer());

    // Redimensionnement 64×64 + masque circulaire (coins transparents).
    const circle = Buffer.from(
      '<svg width="64" height="64"><circle cx="32" cy="32" r="32" fill="#fff"/></svg>'
    );
    const png = await sharp(input)
      .resize(64, 64, { fit: "cover" })
      .composite([{ input: circle, blend: "dest-in" }])
      .png()
      .toBuffer();

    const dataUrl = `data:image/png;base64,${png.toString("base64")}`;

    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} width={64} height={64} alt="" />
        </div>
      ),
      { ...size }
    );
  } catch {
    return letterIcon(initial);
  }
}
