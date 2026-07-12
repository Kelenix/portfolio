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
  /** Prix courant numérique (pour les données structurées SEO). */
  priceValue: number | null;
  /** Code devise ISO (ex. USD, XOF). */
  currency: string | null;
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
    current_price?: { value: number; formatted: string; currency?: string };
    price?: { value: number; formatted: string; currency?: string };
  };
}

export interface ChariowResult {
  products: ChariowProduct[];
  /** true si l'appel API a échoué (à distinguer d'un catalogue vide). */
  error: boolean;
}

/**
 * Récupère les produits publiés de la boutique Chariow. `error` distingue une
 * panne API d'un catalogue vide (clé absente = pas une erreur).
 */
export async function getChariowProducts(): Promise<ChariowResult> {
  const key = process.env.CHARIOW_API_KEY;
  if (!key) return { products: [], error: false };

  try {
    const res = await fetch(`${API_BASE}/products?per_page=100`, {
      headers: { Authorization: `Bearer ${key}` },
      // Revalidation périodique : frais sans marteler l'API à chaque visite.
      next: { revalidate: 600 },
    });
    if (!res.ok) return { products: [], error: true };

    const json = await res.json();
    // L'API renvoie { data: [...], pagination }. On tolère aussi { data: { data: [...] } }.
    const raw = json?.data;
    const items: RawProduct[] = Array.isArray(raw) ? raw : (raw?.data ?? []);

    const products = items.map((p) => {
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
        priceValue: p.is_free ? 0 : (cur?.value ?? base?.value ?? null),
        currency: cur?.currency ?? base?.currency ?? null,
        url: p.slug ? `${STORE_URL}/${p.slug}` : STORE_URL,
      };
    });

    return { products, error: false };
  } catch {
    return { products: [], error: true };
  }
}
