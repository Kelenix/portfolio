import "server-only";

// Intégration lecture seule de l'API Chariow (https://chariow.dev). La clé API
// est lue côté serveur uniquement (jamais exposée au client).

const API_BASE = "https://api.chariow.com/v1";
const STORE_URL = (
  process.env.CHARIOW_STORE_URL || "https://ebookdev.mychariow.shop"
).replace(/\/+$/, "");

export interface ChariowProduct {
  id: string;
  name: string;
  type: string; // downloadable, course, coaching, service, license, bundle
  categoryLabel: string;
  thumbnail: string | null;
  /** Prix courant formaté (vide si gratuit). */
  price: string;
  /** Prix barré si le produit est en promo, sinon null. */
  original: string | null;
  isFree: boolean;
  /** Lien vers la page produit Chariow (checkout géré par Chariow). */
  url: string;
}

interface RawProduct {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  category?: { value: string; label: string };
  is_free?: boolean;
  pictures?: { thumbnail: string | null; cover: string | null };
  pricing?: {
    type: string;
    current_price?: { value: number; formatted: string };
    price?: { value: number; formatted: string };
  };
}

/**
 * Récupère les produits publiés de la boutique Chariow. Renvoie [] si la clé
 * est absente ou l'API indisponible (la page reste fonctionnelle).
 */
export async function getChariowProducts(): Promise<ChariowProduct[]> {
  const key = process.env.CHARIOW_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(`${API_BASE}/products?per_page=100`, {
      headers: { Authorization: `Bearer ${key}` },
      // Revalidation périodique : frais sans marteler l'API à chaque visite.
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];

    const json = await res.json();
    // L'API renvoie { data: [...], pagination }. On tolère aussi { data: { data: [...] } }.
    const raw = json?.data;
    const items: RawProduct[] = Array.isArray(raw) ? raw : (raw?.data ?? []);

    return items.map((p) => {
      const cur = p.pricing?.current_price;
      const base = p.pricing?.price;
      const onSale = !!cur && !!base && base.value > cur.value;
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        categoryLabel: p.category?.label ?? "",
        thumbnail: p.pictures?.thumbnail ?? null,
        price: p.is_free ? "" : (cur?.formatted ?? base?.formatted ?? ""),
        original: onSale ? (base?.formatted ?? null) : null,
        isFree: !!p.is_free,
        url: p.slug ? `${STORE_URL}/${p.slug}` : STORE_URL,
      };
    });
  } catch {
    return [];
  }
}
