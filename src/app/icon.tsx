import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

// Favicon généré dynamiquement à partir de la photo de profil (rond, comme
// l'avatar du site). Repli sur l'initiale du nom si aucune photo n'est définie.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Icon() {
  let photoUrl: string | null = null;
  let initial = "L";

  try {
    const profile = await prisma.profile.findFirst({ where: { id: "default" } });
    photoUrl = profile?.photoUrl ?? null;
    const name = profile?.nameFr || profile?.nameEn || profile?.nameIt || "";
    if (name.trim()) initial = name.trim().charAt(0).toUpperCase();
  } catch {
    /* DB indisponible pendant certaines étapes de build — on garde le repli */
  }

  if (!photoUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#fff",
            fontSize: 40,
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

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: "50%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          width={64}
          height={64}
          alt=""
          style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "50%" }}
        />
      </div>
    ),
    { ...size }
  );
}
