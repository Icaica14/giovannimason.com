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

    'site.title':     'Biblio — musica dal vivo · cicchetti & drink · Treviso',
    'site.description': 'Tre sere a settimana di musica dal vivo a Treviso: jazz, blues, soul e voci emergenti. Cicchetti gourmet, vini selezionati e drink d\'autore in una cornice antiquaria.',

    'hero.tagline':   'art · food · drink',
    'hero.lede':      'Tre sere a settimana il palco si accende. Sotto le lampade d\'epoca, drink d\'autore e cicchetti gourmet — a Treviso, dietro la quinta di un antiquario.',
    'hero.cta.book':  'Prenota un tavolo',
    'hero.cta.menu':  'Sfoglia il menu',

    'home.intro.eyebrow':  'L\'anima del locale',
    'home.intro.title':    'Prima di tutto, la musica',
    'home.intro.body':     'Biblio nasce per ascoltare. Tre sere a settimana — giovedì, venerdì, domenica — sul palco al primo piano salgono musicisti veri: jazz, blues, soul e voci emergenti che si raccontano dal vivo, due set ogni serata. Il pubblico si distribuisce fra il bancone e i divanetti, qualcuno resta in piedi vicino al palco.',
    'home.intro.body2':    'La cornice è un antiquario raccolto: lampade d\'epoca, legno scuro, tappeti che smorzano i rumori della via. Le librerie ci sono — il nome non è un caso — ma sono lo sfondo, non il protagonista. Al bancone, drink d\'autore figli della grande tradizione italiana; in cucina, cicchetti gourmet pensati per non interrompere la conversazione.',

    'home.eventi.eyebrow': 'La settimana di Biblio',
    'home.eventi.title':   'Tre sere fisse, ogni volta diverse',
    'home.eventi.intro':   'Dal giovedì alla domenica la musica dal vivo è di casa. Programmazione fissa di generi, artisti che cambiano ogni settimana e firmano la serata.',
    'home.eventi.cta':     'Vedi tutti gli eventi',

    'home.gallery.eyebrow': 'Atmosfera',
    'home.gallery.title':   'Uno sguardo dentro',
    'home.gallery.cta':     'Vieni a trovarci',

    'home.cta.title':       'Trova il tuo posto',
    'home.cta.body':        'Tavoli al bancone, divanetti vicino alle librerie, posti riservati al primo piano per le serate live. Dicci tu come ti immagini la sera, troviamo lo spazio giusto.',
    'home.cta.btn':         'Prenota ora',

    'evento.gio.day':       'Giovedì',
    'evento.gio.title':     'Jazz Night',
    'evento.gio.note':      'Standard, swing e libertà. Due set, il jazz si racconta dal vivo.',
    'evento.ven.day':       'Venerdì',
    'evento.ven.title':     'Blues & Soul',
    'evento.ven.note':      'Voci profonde, chitarre calde. Le band che fanno ballare il bancone.',
    'evento.dom.day':       'Domenica',
    'evento.dom.title':     'Voci Emergenti',
    'evento.dom.note':      'Cantautori e band giovani al primo palco. Spesso sono i nomi di domani.',

    'menu.title':           'Il menu',
    'menu.lede':            'Drink d\'autore, vini selezionati e cicchetti gourmet. Una carta che evolve con le stagioni e accompagna la musica.',
    'menu.tab.drink':       'Drink & Vini',
    'menu.tab.food':        'Cicchetti & Cucina',
    'menu.note':            'Le sere di musica dal vivo (giovedì, venerdì, domenica) si applica un coperto fino a € 5 a persona.',
    'menu.toc.title':       'In questa carta',
    'menu.section.from':    'Tutti a €',
    'menu.back':            '↑ Torna su',
    'menu.cta.title':       'Pronti a scegliere il posto?',
    'menu.cta.body':        'Per le sere live conviene prenotare in anticipo: il primo piano si riempie presto.',
    'menu.cta.btn':         'Prenota un tavolo',

    'eventi.title':         'Eventi & musica dal vivo',
    'eventi.lede':          'Tre sere fisse a settimana, ogni volta artisti diversi. Pubblichiamo qui le locandine non appena fissate — le trovi anche su Instagram.',
    'eventi.upcoming.title':'In arrivo',
    'eventi.upcoming.empty':'Stiamo finalizzando i prossimi appuntamenti. Torna nei prossimi giorni o seguici su Instagram.',
    'eventi.past.title':    'Già passati',
    'eventi.past.intro':    'L\'archivio recente delle locandine: jazz del giovedì, blues e soul del venerdì, voci emergenti della domenica e qualche fuori-rotta.',
    'eventi.posters.title': 'Le ultime locandine',
    'eventi.weekly.title':  'La programmazione settimanale',
    'eventi.weekly.intro':  'Tre sere fisse, generi che cambiano artista ogni settimana. La cucina apre dalle 18:00 e accompagna il concerto fino a tardi.',
    'eventi.follow':        'Segui @bookcafebiblio su Instagram',
    'eventi.cta.title':     'Vieni a sentirli',
    'eventi.cta.body':      'Per le sere live conviene prenotare in anticipo: il primo piano si riempie presto.',
    'eventi.cta.btn':       'Prenota un tavolo',
    'eventi.poster.alt':    'Locandina',

    'prenota.title':        'Prenota un tavolo',
    'prenota.lede':         'Compila il modulo, rispondiamo a mano in poche ore. Per le sere di musica live conviene prenotare in anticipo: il primo piano si riempie.',
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

    'site.title':     'Biblio — live music · small plates & drinks · Treviso',
    'site.description': 'Three nights a week of live music in Treviso: jazz, blues, soul and emerging voices. Gourmet small plates, hand-picked wines and signature drinks in an antique-shop setting.',

    'hero.tagline':   'art · food · drink',
    'hero.lede':      'Three nights a week the stage lights up. Under vintage lamps, signature drinks and gourmet small plates — in Treviso, behind the curtain of an antique shop.',
    'hero.cta.book':  'Book a table',
    'hero.cta.menu':  'See the menu',

    'home.intro.eyebrow':  'The soul of the place',
    'home.intro.title':    'Music first',
    'home.intro.body':     'Biblio was built for listening. Three nights a week — Thursday, Friday, Sunday — real musicians take the upstairs stage: jazz, blues, soul and emerging voices, two live sets each evening. The crowd splits between the counter and the sofas; some stand close to the stage.',
    'home.intro.body2':    'The setting is a tucked-away antique shop: vintage lamps, dark wood, rugs that soften the noise of the street. The bookshelves are there — the name isn\'t accidental — but they\'re the backdrop, not the protagonist. At the counter, signature drinks rooted in Italian tradition; from the kitchen, gourmet small plates designed not to interrupt the conversation.',

    'home.eventi.eyebrow': 'A week at Biblio',
    'home.eventi.title':   'Three nights, every time different',
    'home.eventi.intro':   'From Thursday to Sunday live music is at home here. A fixed schedule of genres, artists that change every week and shape the evening.',
    'home.eventi.cta':     'See all events',

    'home.gallery.eyebrow': 'Atmosphere',
    'home.gallery.title':   'A glimpse inside',
    'home.gallery.cta':     'Come find us',

    'home.cta.title':       'Find your spot',
    'home.cta.body':        'Counter stools, sofas tucked beside the shelves, reserved tables upstairs for live nights. Tell us how you picture the evening and we\'ll find the right space.',
    'home.cta.btn':         'Book now',

    'evento.gio.day':       'Thursday',
    'evento.gio.title':     'Jazz Night',
    'evento.gio.note':      'Standards, swing and freedom. Two sets — jazz tells its story live.',
    'evento.ven.day':       'Friday',
    'evento.ven.title':     'Blues & Soul',
    'evento.ven.note':      'Deep voices, warm guitars. The bands that get the counter swaying.',
    'evento.dom.day':       'Sunday',
    'evento.dom.title':     'Emerging Voices',
    'evento.dom.note':      'Young songwriters and new bands on the upstairs stage. Often the names of tomorrow.',

    'menu.title':           'The menu',
    'menu.lede':            'Signature drinks, hand-picked wines and gourmet small plates. A list that follows the seasons and the music.',
    'menu.tab.drink':       'Drinks & Wine',
    'menu.tab.food':        'Small plates & Kitchen',
    'menu.note':            'A cover charge up to € 5 per person applies on live music nights (Thursday, Friday, Sunday).',
    'menu.toc.title':       'On this list',
    'menu.section.from':    'All at €',
    'menu.back':            '↑ Back to top',
    'menu.cta.title':       'Ready to pick your spot?',
    'menu.cta.body':        'On live nights it pays to book ahead — the upstairs floor fills up quickly.',
    'menu.cta.btn':         'Reserve a table',

    'eventi.title':         'Events & Live Music',
    'eventi.lede':          'Three fixed nights every week, different artists each time. We post the posters here as soon as they\'re confirmed — also on Instagram.',
    'eventi.upcoming.title':'Coming up',
    'eventi.upcoming.empty':'We\'re finalising the next dates. Come back in a few days or follow us on Instagram.',
    'eventi.past.title':    'Recent nights',
    'eventi.past.intro':    'A recent archive of posters: Thursday jazz, Friday blues and soul, Sunday emerging voices and a few off-track evenings.',
    'eventi.posters.title': 'Latest posters',
    'eventi.weekly.title':  'The weekly schedule',
    'eventi.weekly.intro':  'Three fixed nights, with the genre staying and the artist changing every week. The kitchen opens at 6 PM and stays alongside the music until late.',
    'eventi.follow':        'Follow @bookcafebiblio on Instagram',
    'eventi.cta.title':     'Come and hear them',
    'eventi.cta.body':      'On live nights it pays to book ahead — the upstairs floor fills up quickly.',
    'eventi.cta.btn':       'Reserve a table',
    'eventi.poster.alt':    'Poster',

    'prenota.title':        'Reserve a table',
    'prenota.lede':         'Fill in the form, we reply personally within a few hours. On live music nights it pays to book ahead — the upstairs floor fills up.',
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
