import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

// Favicon généré dynamiquement à partir de la photo de profil (rond, comme
// l'avatar du site). Repli sur l'initiale du nom si la photo est absente ou
// impossible à charger.
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

  // On récupère nous-mêmes les octets de l'image et on les passe en data URL :
  // c'est bien plus fiable que de laisser next/og aller chercher l'URL distante.
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) return letterIcon(initial);
    const buffer = await res.arrayBuffer();
    const type = res.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: "50%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            width={64}
            height={64}
            alt=""
            style={{ width: "64px", height: "64px", objectFit: "cover" }}
          />
        </div>
      ),
      { ...size }
    );
  } catch {
    return letterIcon(initial);
  }
}
