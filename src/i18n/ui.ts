// Stringhe UI italiane / inglesi.
// Tutto ciò che è scritto nel sito passa di qui per restare bilingue coerente.

export const languages = {
  it: 'Italiano',
  en: 'English',
} as const;

export const defaultLang = 'it' as const;

export type Lang = keyof typeof languages;

export const ui = {
  it: {
    'nav.home':       'Home',
    'nav.menu':       'Menu',
    'nav.eventi':     'Eventi',
    'nav.prenota':    'Prenota',
    'nav.contatti':   'Contatti',
    'nav.lang.it':    'IT',
    'nav.lang.en':    'EN',

    'site.title':     'Biblio — art, food and drink · Treviso',
    'site.description': 'Cicchetti gourmet, vini e drink d\'autore, musica dal vivo. Una biblioteca calda e accogliente nel cuore di Treviso.',

    'hero.tagline':   'art · food · drink',
    'hero.lede':      'Una libreria che si fa salotto, un bancone che si fa palco. A Treviso, fra il fruscio delle pagine e il timbro di un calice.',
    'hero.cta.book':  'Prenota un tavolo',
    'hero.cta.menu':  'Sfoglia il menu',

    'home.intro.eyebrow':  'Un\'altra dimensione',
    'home.intro.title':    'Dove i libri sussurrano e la musica risponde',
    'home.intro.body':     'Varcata la soglia di Biblio, il tempo cambia passo. Lampade dorate filtrano luce calda sulle librerie, il legno antico parla di sere passate e quelle che verranno. Al bancone, mani esperte traducono la grande tradizione italiana in cocktail moderni; in cucina, cicchetti gourmet pensati per accompagnare un sorso, una pagina, una conversazione.',
    'home.intro.body2':    'Sopra il soppalco, raggiungibile dalle scale all\'ingresso, batte il cuore musicale del locale: ogni settimana una band sale sul palco e regala dal vivo jazz, blues, soul e nuove voci emergenti. Un piccolo teatro letterario, sospeso fra Treviso e altrove.',

    'home.eventi.eyebrow': 'La settimana di Biblio',
    'home.eventi.title':   'Tre serate, tre umori',
    'home.eventi.intro':   'Dal giovedì alla domenica, la musica dal vivo è di casa. Programmazione fissa con artisti che cambiano ogni settimana.',
    'home.eventi.cta':     'Tutti gli eventi',

    'home.gallery.eyebrow': 'Atmosfera',
    'home.gallery.title':   'Uno sguardo dentro',
    'home.gallery.cta':     'Vieni a trovarci',

    'home.cta.title':       'Riserva il tuo angolo',
    'home.cta.body':        'Tavoli al bancone, divanetti accanto alle librerie, posti riservati per le serate live: dicci tu, troviamo il tuo posto.',
    'home.cta.btn':         'Prenota ora',

    'evento.gio.day':       'Giovedì',
    'evento.gio.title':     'Jazz Night',
    'evento.gio.note':      'Standard, swing, contaminazioni. Lo storytelling parla la lingua del jazz.',
    'evento.ven.day':       'Venerdì',
    'evento.ven.title':     'Blues & Soul',
    'evento.ven.note':      'Voci profonde, chitarre calde, gruppi che fanno ballare il bancone.',
    'evento.dom.day':       'Domenica',
    'evento.dom.title':     'Voci Emergenti',
    'evento.dom.note':      'Cantautori e band giovani che debuttano sul palco di Biblio.',

    'menu.title':           'Il menu',
    'menu.lede':            'Drink d\'autore, vini selezionati e cicchetti gourmet. Una carta che evolve con le stagioni.',
    'menu.tab.drink':       'Drink & Vini',
    'menu.tab.food':        'Cicchetti & Cucina',
    'menu.note':            'Durante le serate di musica live si applica un coperto fino a € 5 a persona.',

    'eventi.title':         'Eventi & Musica live',
    'eventi.lede':          'Tre sere fisse a settimana, ogni volta artisti diversi. Le locandine in arrivo le pubblichiamo qui e su Instagram.',
    'eventi.posters.title': 'Le ultime locandine',
    'eventi.weekly.title':  'La programmazione fissa',
    'eventi.follow':        'Segui @bookcafebiblio su Instagram',

    'prenota.title':        'Prenota un tavolo',
    'prenota.lede':         'Compila il modulo: rispondiamo personalmente entro poche ore. Per richieste urgenti chiamaci o scrivici su WhatsApp.',
    'prenota.form.name':    'Nome e cognome',
    'prenota.form.email':   'Email',
    'prenota.form.phone':   'Telefono',
    'prenota.form.date':    'Data',
    'prenota.form.time':    'Ora',
    'prenota.form.guests':  'Numero di persone',
    'prenota.form.note':    'Note (allergie, occasione, richieste speciali)',
    'prenota.form.submit':  'Invia richiesta',
    'prenota.form.privacy': 'Trattiamo i tuoi dati solo per gestire la prenotazione.',
    'prenota.alt.title':    'O più rapido:',
    'prenota.alt.whatsapp': 'Scrivici su WhatsApp',
    'prenota.alt.call':     'Chiamaci ora',
    'prenota.alt.email':    'Mandaci una mail',

    'contatti.title':       'Contatti & Come arrivare',
    'contatti.address.label': 'Indirizzo',
    'contatti.hours.label':   'Orari',
    'contatti.phone.label':   'Telefono / WhatsApp',
    'contatti.email.label':   'Email',
    'contatti.social.label':  'Seguici',
    'contatti.hours.body':    'Chiuso il lunedì\nMar–Mer: 18:00 – 01:00\nGio–Sab: 18:00 – 02:00\nDomenica: 18:00 – 01:00',
    'contatti.reviews.title': 'Cosa dicono i lettori',

    'footer.tagline':       'art · food and drink · Treviso',
    'footer.nav.title':     'Naviga',
    'footer.contatti.title': 'Trovaci',
    'footer.copyright':     'Biblio Treviso — Tutti i diritti riservati',
  },
  en: {
    'nav.home':       'Home',
    'nav.menu':       'Menu',
    'nav.eventi':     'Events',
    'nav.prenota':    'Reservations',
    'nav.contatti':   'Contact',
    'nav.lang.it':    'IT',
    'nav.lang.en':    'EN',

    'site.title':     'Biblio — art, food and drink · Treviso',
    'site.description': 'Gourmet small plates, signature drinks and live music in a warmly-lit literary bar in the heart of Treviso.',

    'hero.tagline':   'art · food · drink',
    'hero.lede':      'A library turned living room, a counter turned stage. In Treviso, between the rustle of pages and the chime of a glass.',
    'hero.cta.book':  'Book a table',
    'hero.cta.menu':  'See the menu',

    'home.intro.eyebrow':  'Another dimension',
    'home.intro.title':    'Where books whisper and music answers',
    'home.intro.body':     'Step into Biblio and time slows down. Golden lamps spill warm light across the bookshelves; the old wood remembers the evenings that were and the ones to come. At the counter, skilled hands translate Italian tradition into modern cocktails; from the kitchen, gourmet small plates made for sipping, reading and conversation.',
    'home.intro.body2':    'Above on the mezzanine — reached by the staircase right by the door — beats the musical heart of the place: every week a band takes the stage with live jazz, blues, soul and emerging voices. A tiny literary theatre, suspended somewhere between Treviso and elsewhere.',

    'home.eventi.eyebrow': 'A week at Biblio',
    'home.eventi.title':   'Three evenings, three moods',
    'home.eventi.intro':   'From Thursday to Sunday, live music is at home here. A fixed weekly schedule with artists that change every week.',
    'home.eventi.cta':     'See all events',

    'home.gallery.eyebrow': 'Atmosphere',
    'home.gallery.title':   'A glimpse inside',
    'home.gallery.cta':     'Come find us',

    'home.cta.title':       'Save your seat',
    'home.cta.body':        'Counter stools, sofas tucked beside the bookshelves, reserved tables for live nights: tell us what you need and we\'ll find your place.',
    'home.cta.btn':         'Book now',

    'evento.gio.day':       'Thursday',
    'evento.gio.title':     'Jazz Night',
    'evento.gio.note':      'Standards, swing, modern crossovers. Storytelling in the language of jazz.',
    'evento.ven.day':       'Friday',
    'evento.ven.title':     'Blues & Soul',
    'evento.ven.note':      'Deep voices, warm guitars, bands that get the counter swaying.',
    'evento.dom.day':       'Sunday',
    'evento.dom.title':     'Emerging Voices',
    'evento.dom.note':      'Young songwriters and new bands making their debut on the Biblio stage.',

    'menu.title':           'The menu',
    'menu.lede':            'Signature drinks, hand-picked wines and gourmet small plates. A list that follows the seasons.',
    'menu.tab.drink':       'Drinks & Wine',
    'menu.tab.food':        'Small plates & Kitchen',
    'menu.note':            'A cover charge up to € 5 per person applies on live music nights.',

    'eventi.title':         'Events & Live Music',
    'eventi.lede':          'Three fixed evenings every week, with different artists each time. Posters drop here and on Instagram.',
    'eventi.posters.title': 'Latest posters',
    'eventi.weekly.title':  'The weekly schedule',
    'eventi.follow':        'Follow @bookcafebiblio on Instagram',

    'prenota.title':        'Reserve a table',
    'prenota.lede':         'Fill in the form: we reply personally within a few hours. For urgent requests, call us or message us on WhatsApp.',
    'prenota.form.name':    'Full name',
    'prenota.form.email':   'Email',
    'prenota.form.phone':   'Phone',
    'prenota.form.date':    'Date',
    'prenota.form.time':    'Time',
    'prenota.form.guests':  'Number of guests',
    'prenota.form.note':    'Notes (allergies, occasion, special requests)',
    'prenota.form.submit':  'Send request',
    'prenota.form.privacy': 'Your data is used only to handle the booking.',
    'prenota.alt.title':    'Or, more quickly:',
    'prenota.alt.whatsapp': 'WhatsApp us',
    'prenota.alt.call':     'Call us',
    'prenota.alt.email':    'Email us',

    'contatti.title':       'Contact & How to find us',
    'contatti.address.label': 'Address',
    'contatti.hours.label':   'Hours',
    'contatti.phone.label':   'Phone / WhatsApp',
    'contatti.email.label':   'Email',
    'contatti.social.label':  'Follow us',
    'contatti.hours.body':    'Closed on Mondays\nTue–Wed: 6:00 PM – 1:00 AM\nThu–Sat: 6:00 PM – 2:00 AM\nSunday: 6:00 PM – 1:00 AM',
    'contatti.reviews.title': 'What our readers say',

    'footer.tagline':       'art · food and drink · Treviso',
    'footer.nav.title':     'Browse',
    'footer.contatti.title': 'Find us',
    'footer.copyright':     'Biblio Treviso — All rights reserved',
  },
} as const;

export type UIKey = keyof typeof ui['it'];

export function t(lang: Lang, key: UIKey): string {
  return (ui[lang] as Record<string, string>)[key] ?? (ui[defaultLang] as Record<string, string>)[key];
}

// Mappa rotte equivalenti tra lingue per il selettore di lingua.
// (in IT le rotte sono /menu, /eventi, /prenota, /contatti)
// (in EN restano sotto /en/menu, /en/eventi, /en/prenota, /en/contatti per semplicità di mapping diretto)
export const routeMap: Record<string, { it: string; en: string }> = {
  home:     { it: '/',          en: '/en/' },
  menu:     { it: '/menu/',     en: '/en/menu/' },
  eventi:   { it: '/eventi/',   en: '/en/eventi/' },
  prenota:  { it: '/prenota/',  en: '/en/prenota/' },
  contatti: { it: '/contatti/', en: '/en/contatti/' },
};
