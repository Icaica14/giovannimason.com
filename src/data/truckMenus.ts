// Adapter dei menu del Biblio Truck a build-time.
// Espone getTruckMenus(): { food, drink } con gli URL dei due PDF.
//
// Fonte primaria: bucket pubblico `menus` di Supabase (chiavi stabili
// `food.pdf` / `drink.pdf`, caricabili/sostituibili dall'app gestione). Se il
// file esiste, usiamo il public URL (con cache-bust sull'updated_at, così la
// sostituzione dal pannello aggiorna davvero il link). Se Supabase non è
// configurato o il file non c'è, fallback ai PDF committati nel repo, così la
// pagina funziona da subito e anche se il build avviene prima del primo upload.

import { supabasePublic } from '../lib/supabasePublic';

const BUCKET = 'menus';
const FOOD_KEY = 'food.pdf';
const DRINK_KEY = 'drink.pdf';

// PDF di fallback committati nel repo (serviti da GitHub Pages).
const FOOD_FALLBACK = '/uploads/biblio-truck/menu-food.pdf';
const DRINK_FALLBACK = '/uploads/biblio-truck/menu-drink.pdf';

export type TruckMenus = { food: string; drink: string };

type ListedFile = { name: string; updated_at?: string | null };

/** URL pubblico del file nel bucket, con cache-bust se conosciamo updated_at. */
function publicUrl(key: string, updatedAt?: string | null): string | null {
  if (!supabasePublic) return null;
  const { data } = supabasePublic.storage.from(BUCKET).getPublicUrl(key);
  if (!data?.publicUrl) return null;
  const v = updatedAt ? `?v=${encodeURIComponent(updatedAt)}` : '';
  return `${data.publicUrl}${v}`;
}

export async function getTruckMenus(): Promise<TruckMenus> {
  if (!supabasePublic) {
    return { food: FOOD_FALLBACK, drink: DRINK_FALLBACK };
  }

  try {
    const { data, error } = await supabasePublic.storage.from(BUCKET).list('', { limit: 100 });
    if (error || !data) {
      if (error) console.warn('[truckMenus] list fallita, uso i PDF del repo:', error.message);
      return { food: FOOD_FALLBACK, drink: DRINK_FALLBACK };
    }

    const files = data as ListedFile[];
    const food = files.find((f) => f.name === FOOD_KEY);
    const drink = files.find((f) => f.name === DRINK_KEY);

    return {
      food: (food && publicUrl(FOOD_KEY, food.updated_at)) || FOOD_FALLBACK,
      drink: (drink && publicUrl(DRINK_KEY, drink.updated_at)) || DRINK_FALLBACK,
    };
  } catch (e) {
    console.warn('[truckMenus] errore inatteso, uso i PDF del repo:', e);
    return { food: FOOD_FALLBACK, drink: DRINK_FALLBACK };
  }
}
