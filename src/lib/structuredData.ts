// ─────────────────────────────────────────────────────────────────────────────
// Dati strutturati (schema.org / JSON-LD) centralizzati.
//
// Un'unica fonte di verita' per i dati locali (NAP) e per la generazione dei
// nodi JSON-LD riusati dal Base layout (LocalBusiness + WebSite + Breadcrumb) e
// dalla pagina eventi (MusicEvent per ogni serata). Tenere allineato con il
// JSON-LD storico e con la pagina contatti.
// ─────────────────────────────────────────────────────────────────────────────
import { type Lang, routeMap, t } from '../i18n/ui';
import { type EventEntry, eventBlurb, eventStatus, genreLabel, tx } from '../data/eventi';

type Route = keyof typeof routeMap;

// NAP (Name-Address-Phone) + coordinate: una sola fonte, riusata ovunque.
export const BIZ = {
  name: 'Biblio',
  street: 'Via Armando Diaz 3/A',
  city: 'Treviso',
  region: 'TV',
  postalCode: '31100',
  country: 'IT',
  telephone: '+390422270575',
  email: 'biblio.bookcafe@gmail.com',
  // Coordinate approssimative di Via Armando Diaz 3/A, Treviso.
  // TODO go-live: verificare il pin esatto sulla scheda Google Business.
  latitude: 45.6662,
  longitude: 12.2427,
  instagram: 'https://www.instagram.com/biblio_treviso/',
} as const;

/** Rende assoluto un path interno; lascia stare gli URL gia' assoluti. */
function abs(siteOrigin: string, path: string): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${siteOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** PostalAddress schema.org del locale, riutilizzabile. */
function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: BIZ.street,
    postalCode: BIZ.postalCode,
    addressLocality: BIZ.city,
    addressRegion: BIZ.region,
    addressCountry: BIZ.country,
  };
}

/** Scheda LocalBusiness (BarOrPub) arricchita: geo, hasMenu, prenotazioni... */
export function localBusinessLd(siteOrigin: string, ogImage: string) {
  return {
    '@type': 'BarOrPub',
    '@id': `${siteOrigin}/#biblio`,
    name: BIZ.name,
    url: siteOrigin || undefined,
    image: siteOrigin ? ogImage : undefined,
    telephone: BIZ.telephone,
    email: BIZ.email,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card',
    servesCuisine: ['Italian', 'Cocktails', 'Wine'],
    address: postalAddress(),
    geo: { '@type': 'GeoCoordinates', latitude: BIZ.latitude, longitude: BIZ.longitude },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${BIZ.name}, ${BIZ.street}, ${BIZ.city}`,
    )}`,
    areaServed: { '@type': 'City', name: BIZ.city },
    acceptsReservations: true,
    hasMenu: siteOrigin ? `${siteOrigin}${routeMap.menu.it}` : undefined,
    // Orari coerenti con contatti.hours.body (lunedi chiuso -> assente).
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday'], opens: '18:00', closes: '01:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Thursday', 'Friday', 'Saturday'], opens: '18:00', closes: '02:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '18:00', closes: '01:00' },
    ],
    sameAs: [BIZ.instagram],
  };
}

/** Nodo WebSite, collegato come publisher al LocalBusiness via @id. */
export function webSiteLd(siteOrigin: string) {
  return {
    '@type': 'WebSite',
    '@id': `${siteOrigin}/#website`,
    url: siteOrigin || undefined,
    name: BIZ.name,
    inLanguage: ['it', 'en'],
    publisher: { '@id': `${siteOrigin}/#biblio` },
  };
}

/** Breadcrumb Home > Pagina per le sottopagine (non per la home). */
export function breadcrumbLd(currentRoute: Route, lang: Lang, siteOrigin: string, label: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t(lang, 'nav.home'), item: `${siteOrigin}${routeMap.home[lang]}` },
      { '@type': 'ListItem', position: 2, name: label, item: `${siteOrigin}${routeMap[currentRoute][lang]}` },
    ],
  };
}

// ── MusicEvent ──────────────────────────────────────────────────────────────

/** Offset Italia (Europe/Rome) per una data ISO: +02:00 in ora legale, +01:00 altrimenti. */
function italyOffset(dateISO: string): string {
  const [y, m, d] = dateISO.slice(0, 10).split('-').map(Number);
  const tms = Date.UTC(y, m - 1, d);
  const lastSunday = (year: number, month0: number) => {
    const lastDay = new Date(Date.UTC(year, month0 + 1, 0));
    return Date.UTC(year, month0, lastDay.getUTCDate() - lastDay.getUTCDay());
  };
  const dstStart = lastSunday(y, 2); // ultima domenica di marzo
  const dstEnd = lastSunday(y, 9); // ultima domenica di ottobre
  return tms >= dstStart && tms < dstEnd ? '+02:00' : '+01:00';
}

/** Costruisce lo startDate ISO 8601 con fuso; se l'ora non e' parsabile, data-only. */
function startDateIso(dateISO: string, time: string): string {
  const day = dateISO.slice(0, 10);
  const match = /^(\d{1,2})[:.](\d{2})/.exec((time || '').trim());
  if (!match) return day;
  const hh = match[1].padStart(2, '0');
  return `${day}T${hh}:${match[2]}:00${italyOffset(day)}`;
}

/**
 * MusicEvent JSON-LD per una singola serata. La location dipende dal venue:
 * Biblio (Bistrot) o i Giardinetti di Sant'Andrea. Ingresso libero.
 */
export function musicEventLd(ev: EventEntry, lang: Lang, siteOrigin: string) {
  const e = ev.data;
  const isGiardinetti = e.venue === 'giardinetti';
  const location = isGiardinetti
    ? {
        '@type': 'Place',
        name: 'Giardini di Sant’Andrea',
        address: {
          '@type': 'PostalAddress',
          addressLocality: BIZ.city,
          addressRegion: BIZ.region,
          postalCode: BIZ.postalCode,
          addressCountry: BIZ.country,
        },
      }
    : { '@type': 'Place', name: BIZ.name, address: postalAddress() };

  const url = `${siteOrigin}${routeMap.eventi[lang]}#${ev.id}`;
  const description = eventBlurb(e, lang) ?? `${tx(genreLabel[e.genre], lang)} · ${BIZ.name}, ${BIZ.city}`;

  // Stato evento per Google: annullato / rimandato si riflettono nei rich results.
  const status = eventStatus(e);
  const schemaStatus =
    status === 'cancelled'
      ? 'https://schema.org/EventCancelled'
      : status === 'postponed'
        ? 'https://schema.org/EventPostponed'
        : 'https://schema.org/EventScheduled';

  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: e.artist,
    startDate: startDateIso(e.date, e.time),
    eventStatus: schemaStatus,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    performer: { '@type': 'MusicGroup', name: e.artist },
    location,
    image: e.poster ? abs(siteOrigin, e.poster) : undefined,
    description,
    url,
    organizer: { '@type': 'Organization', name: BIZ.name, url: siteOrigin || undefined },
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url,
    },
  };
}
