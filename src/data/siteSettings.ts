// Adapter delle IMPOSTAZIONI del sito a build-time.
// Espone getSiteSettings(): legge la riga singola (id=1) della tabella
// `site_settings` di Supabase (anon read) e la mappa in un oggetto tipizzato.
//
// Fallback robusto: se Supabase non è configurato, o la tabella non esiste ancora
// (migrazione 0012 non applicata), o il fetch fallisce → restituisce i DEFAULT.
// Così il sito builda comunque e il carosello resta ATTIVO finché il proprietario
// non lo spegne dal pannello /gestione. Stesso schema di eventiRemote/truckMenus.

import { supabasePublic } from '../lib/supabasePublic';

export interface SiteSettings {
  /** Mostrare il carosello Biblio Truck nella hero della home. */
  truckCarouselActive: boolean;
}

const DEFAULTS: SiteSettings = {
  truckCarouselActive: true,
};

type SettingsRow = {
  truck_carousel_active: boolean | null;
};

/** Impostazioni del sito per il rendering build-time. Non lancia mai: fallback ai default. */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabasePublic) return DEFAULTS;

  try {
    const { data, error } = await supabasePublic
      .from('site_settings')
      .select('truck_carousel_active')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('[siteSettings] fetch fallito, uso i default:', error.message);
      return DEFAULTS;
    }

    const row = data as SettingsRow;
    return {
      truckCarouselActive: row.truck_carousel_active ?? DEFAULTS.truckCarouselActive,
    };
  } catch (e) {
    console.warn('[siteSettings] errore inatteso, uso i default:', e);
    return DEFAULTS;
  }
}
