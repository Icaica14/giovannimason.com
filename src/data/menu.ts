// Menu di Biblio — fonte unica per IT + EN.
// I nomi propri (cocktail, gin, piatti) restano in italiano: sono il prodotto.
// Le descrizioni e gli intro sono bilingui.

import type { Lang } from '../i18n/ui';

export type Bilingual = { it: string; en: string };

export type MenuItem = {
  name: string;
  origin?: string;            // es. "(UK)", "(Giappone)"
  profile?: Bilingual;        // riga corta a tre aggettivi (gin)
  desc?: Bilingual;           // descrizione lunga (negroni, americano, piatti)
  price?: string;             // override prezzo per item, es. "12"
};

export type MenuRow = {
  // Per le voci "semplici" (vini, birre, bibite): label + prezzo
  label: string;
  price?: string;
  desc?: Bilingual;
};

export type MenuSection = {
  id: string;
  title: Bilingual;
  intro?: Bilingual;
  defaultPrice?: string;      // prezzo unico di sezione (es. Negroni €10)
  // Una sezione può avere "rows" semplici (vini/birre) o "items" descritti.
  rows?: MenuRow[];
  items?: MenuItem[];
};

export type MenuChapter = {
  id: string;
  title: Bilingual;
  intro?: Bilingual;
  sections: MenuSection[];
};

// ---------------------------------------------------------------------------

export const menu: MenuChapter[] = [
  // =========================================================================
  // 1. LE NOSTRE BEVANDE — wine, beer, soft
  // =========================================================================
  {
    id: 'bevande',
    title: { it: 'Le nostre bevande', en: 'Wines, beers & sodas' },
    intro: {
      it: 'Vini di territorio, birre artigianali alla spina e bibite italiane di carattere. La base ampia che accompagna la sera, dalla cena al concerto.',
      en: 'Wines from the territory, craft beers on tap and characterful Italian sodas. The everyday backbone of the evening — from dinner through the live set.',
    },
    sections: [
      {
        id: 'vini-bianchi',
        title: { it: 'Vini bianchi', en: 'White wines' },
        defaultPrice: '5',
        rows: [
          { label: 'Friulano' },
          { label: 'Gewurztraminer' },
          { label: 'Ribolla' },
        ],
      },
      {
        id: 'vini-rossi',
        title: { it: 'Vini rossi', en: 'Red wines' },
        defaultPrice: '5',
        rows: [
          { label: 'Pinot Nero' },
          { label: 'Valpolicella Ripasso' },
          { label: 'Carmenere' },
        ],
      },
      {
        id: 'bollicine',
        title: { it: 'Bollicine', en: 'Sparkling' },
        rows: [
          { label: 'Prosecco Brut', price: '4' },
          { label: 'Trento Doc', price: '6' },
        ],
      },
      {
        id: 'birre-spina',
        title: { it: 'Birre Baroh — alla spina', en: 'Baroh beers — on tap' },
        rows: [
          { label: 'Bionda 0.2 L', price: '3' },
          { label: 'Bionda 0.4 L', price: '6' },
          { label: 'IPA 0.2 L',    price: '4' },
          { label: 'IPA 0.4 L',    price: '7' },
        ],
      },
      {
        id: 'birre-bottiglia',
        title: { it: 'Birre in bottiglia 0.5 L', en: 'Bottled beers 0.5 L' },
        defaultPrice: '8',
        rows: [
          { label: 'Bianca' },
          { label: 'Session IPA' },
          { label: 'Rossa' },
          { label: 'Nera' },
        ],
      },
      {
        id: 'bibite',
        title: { it: 'Bibite Cortese', en: 'Cortese sodas' },
        defaultPrice: '4',
        rows: [
          { label: 'Arancia Rossa' },
          { label: 'Chinotto' },
          { label: 'Cedrata' },
          { label: 'Cortesino' },
          { label: 'Lemon' },
          { label: 'Soda Pompelmo' },
          { label: 'Ginger Beer' },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. I NOSTRI NEGRONI — €10
  // =========================================================================
  {
    id: 'negroni',
    title: { it: 'I nostri Negroni', en: 'Our Negroni' },
    intro: {
      it: 'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questa carta celebriamo la straordinaria flessibilità della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.',
      en: 'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u2019s remarkable flexibility — an unchanged structure whose soul shifts with the spirit at its core.',
    },
    sections: [
      {
        id: 'negroni-gin',
        title: { it: 'Con gin', en: 'With gin' },
        defaultPrice: '10',
        intro: {
          it: 'La forma originaria del Negroni, spinta verso le possibilità di oggi. La spina dorsale di ginepro viene declinata attraverso la varietà della distillazione contemporanea.',
          en: 'The original Negroni, pushed into today\u2019s possibilities. The juniper backbone is reread through the breadth of contemporary distillation.',
        },
        items: [
          { name: 'Perfect Three', desc: {
            it: 'L\u2019espressione più bilanciata: note pungenti del ginepro, sostenute da una ricca dolcezza vanigliata.',
            en: 'The most balanced expression — pungent juniper notes carried by a rich vanilla sweetness.',
          } },
          { name: 'Contessa', desc: {
            it: 'Raffinato e setoso, unisce la struttura di un gin tradizionale a sfumature dolci e morbidamente floreali.',
            en: 'Refined and silky, blending the frame of a traditional gin with soft, floral, sweet shades.',
          } },
          { name: 'Austero', desc: {
            it: 'Imponente e senza compromessi: la gradazione elevata esalta una struttura scura, amara e tostata.',
            en: 'Bold and uncompromising — high proof draws out a dark, bitter, toasted structure.',
          } },
          { name: 'Tropicale', desc: {
            it: 'Floreale e avvolgente, con sentori botanici esotici che si fondono a una base ricca ma vellutata.',
            en: 'Floral and enveloping, with exotic botanicals melting into a rich yet velvety base.',
          } },
          { name: 'Via della Seta', desc: {
            it: 'Esotico e speziato, unisce sentori orientali di citronella a un cuore erbaceo artigianale.',
            en: 'Exotic and spiced, weaving Eastern lemongrass into an artisanal herbal heart.',
          } },
          { name: 'Clandestino', desc: {
            it: 'Un trionfo di erbe e resine artigianali: un sorso profondo e complesso, unico nel suo genere.',
            en: 'A triumph of artisanal herbs and resins — deep, complex, one of a kind.',
          } },
          { name: 'Soprano', desc: {
            it: 'Verticale e tagliente: il ginepro svetta sull\u2019intensità del bitter e sul rigore del Vermouth dry.',
            en: 'Vertical and sharp — juniper rising over bitter intensity and the rigour of dry Vermouth.',
          } },
          { name: 'Tokyo Zen', desc: {
            it: 'Limpido e meditativo, un sorso estremamente leggero con un delicato sentore vegetale.',
            en: 'Clean and meditative — an exceptionally light sip with a delicate vegetal hint.',
          } },
          { name: 'Kyoto Flower', desc: {
            it: 'Delicato e floreale: il fiore di ciliegio fa da protagonista su un sorso rotondo e morbido.',
            en: 'Delicate and floral — cherry blossom takes the lead over a round, soft sip.',
          } },
          { name: 'Boschivo', desc: {
            it: 'Balsamico e profumato, con sfumature montane che si fondono in un sorso fresco.',
            en: 'Balsamic and fragrant, with mountain shades melting into a fresh, clean sip.',
          } },
        ],
      },
      {
        id: 'negroni-whisky',
        title: { it: 'Con whisky', en: 'With whisky' },
        defaultPrice: '10',
        intro: {
          it: 'Nato nei bar parigini durante il proibizionismo, il Boulevardier dimostra come il whisky sappia reinventare il classico italiano vestendolo con sentori caldi e legnosi.',
          en: 'Born in Paris bars during Prohibition, the Boulevardier shows how whisky can rework the Italian classic, dressing it in warm, woody notes.',
        },
        items: [
          { name: 'Grand Soir', desc: {
            it: 'Caldo e legnoso: le note di caramello e rovere del whiskey abbracciano la classica struttura dolce-amara.',
            en: 'Warm and woody — caramel and oak from whiskey wrap around the classic bittersweet frame.',
          } },
          { name: 'Revolution', desc: {
            it: 'Oscuro e ribelle: la nota torbata dello scotch si lega al fondo scuro in un sorso profondo e terroso.',
            en: 'Dark and rebellious — peated scotch ties into the dark base for a deep, earthy sip.',
          } },
          { name: 'Golden Age', desc: {
            it: 'Morbido e dorato: la rotondità del bourbon si siede su un profilo dolce-amaro limpido e leggero.',
            en: 'Soft and golden — the round body of bourbon settles on a clean, light bittersweet profile.',
          } },
        ],
      },
      {
        id: 'negroni-mezcal',
        title: { it: 'Con mezcal', en: 'With mezcal' },
        defaultPrice: '10',
        intro: {
          it: 'L\u2019incontro perfetto fra l\u2019agave messicana e l\u2019amaro italiano. Figlio della moderna evoluzione del bar, il Mezcal Negroni sostituisce le classiche botaniche del gin con sentori rustici, vegetali e affumicati del distillato artigianale.',
          en: 'The perfect meeting of Mexican agave and Italian amaro. A child of the modern bar, the Mezcal Negroni replaces the classic gin botanicals with rustic, vegetal, smoky notes from the artisanal spirit.',
        },
        items: [
          { name: 'Rojo', desc: {
            it: 'Affumicato e terroso: il carattere rustico dell\u2019agave si sposa con profumi erbacei, ricchi e tradizionali.',
            en: 'Smoky and earthy — the rustic character of agave marries rich, traditional herbal aromas.',
          } },
          { name: 'Dorado', desc: {
            it: 'Fumoso e avvolgente: calde note speziate si fondono a sentori terrosi, un sorso intenso e persistente.',
            en: 'Smoky and enveloping — warm spiced notes meet earthy hints in an intense, persistent sip.',
          } },
          { name: 'Bianco', desc: {
            it: 'Luminoso e vibrante: sfumature erbacee incontrano una spinta minerale, per un sorso fumoso e asciutto.',
            en: 'Bright and vibrant — herbal shades meet a mineral push for a smoky, dry sip.',
          } },
        ],
      },
      {
        id: 'negroni-rum',
        title: { it: 'Con rum', en: 'With rum' },
        defaultPrice: '10',
        intro: {
          it: 'Un classico moderno che unisce la struttura italiana alla complessità dei distillati di canna da zucchero. Il rum prende il posto del gin per regalare al Negroni inaspettate note di melassa, spezie e legno.',
          en: 'A modern classic uniting Italian structure with the complexity of cane spirits. Rum takes the place of gin to give the Negroni unexpected notes of molasses, spice and wood.',
        },
        items: [
          { name: 'Brisa', desc: {
            it: 'Trasparente e puro ma sorprendentemente complesso: fresco, floreale, vivace e dissetante.',
            en: 'Clear and pure yet surprisingly complex — fresh, floral, lively and thirst-quenching.',
          } },
          { name: 'Solera', desc: {
            it: 'Profondo e suadente, dominato da note di melassa, legno tostato e frutta matura: un sorso pieno.',
            en: 'Deep and persuasive, led by molasses, toasted wood and ripe fruit — a full-bodied sip.',
          } },
          { name: 'Siesta', desc: {
            it: 'Limpido e dorato ma avvolgente e caldo: amabile, meditativo, rilassante e irresistibile.',
            en: 'Clear and golden yet warm and enveloping — easy-going, meditative, relaxing, irresistible.',
          } },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. I NOSTRI AMERICANI — €8
  // =========================================================================
  {
    id: 'americani',
    title: { it: 'I nostri Americani', en: 'Our Americano' },
    intro: {
      it: 'L\u2019evoluzione del Milano-Torino che ha fatto la storia a cavallo del Novecento. La semplicità dell\u2019Americano viene reinterpretata attraverso bitter moderni e vermouth di carattere, per scoprire ogni possibile declinazione dell\u2019aperitivo.',
      en: 'The evolution of the Milano-Torino that shaped a century of Italian aperitivo. The simplicity of the Americano is rewritten through modern bitters and characterful vermouth, exploring every possible reading of the cocktail.',
    },
    sections: [
      {
        id: 'americani-list',
        title: { it: 'La carta', en: 'The list' },
        defaultPrice: '8',
        items: [
          { name: 'Opulento', desc: {
            it: 'Ricco e complesso: spiccano eleganti sentori di vaniglia, spezie e frutta secca che donano rotondità.',
            en: 'Rich and complex — elegant notes of vanilla, spice and dried fruit lend roundness.',
          } },
          { name: 'Tradizionale', desc: {
            it: 'Autentico e fortemente legato al territorio piemontese: sprigiona note erbacee, calde e speziate.',
            en: 'Authentic and rooted in Piedmont — herbal, warm, spiced notes throughout.',
          } },
          { name: 'Balsamico', desc: {
            it: 'Estremamente aromatico, dominato da sentori di erbe officinali e resine artigianali.',
            en: 'Highly aromatic, led by medicinal herbs and artisanal resins.',
          } },
          { name: 'Radicale', desc: {
            it: 'Scuro, intenso e terroso, con spiccate note di china, rabarbaro e un forte retrogusto amaro.',
            en: 'Dark, intense and earthy, with pronounced cinchona, rhubarb and a strong bitter finish.',
          } },
          { name: 'Ambrato', desc: {
            it: 'Morbido ed elegante: accarezza il palato con note agrumate e speziate sottili e un finale setoso.',
            en: 'Soft and elegant — citrus and subtle spice graze the palate with a silky finish.',
          } },
          { name: 'Rosato', desc: {
            it: 'Fresco, fruttato e amichevole: combina profumi delicati con un tocco di Americano beverino.',
            en: 'Fresh, fruity and friendly — delicate aromatics meet an easy-drinking Americano touch.',
          } },
          { name: 'Candido', desc: {
            it: 'Delicato e rinfrescante, si distingue per la limpidezza e per le eleganti sfumature dolci.',
            en: 'Delicate and refreshing — clean, with elegantly sweet shades.',
          } },
          { name: 'Secco', desc: {
            it: 'Nitido e affilato: unisce la nota vinosa secca del vermouth dry alle sfumature agrumate e dolci.',
            en: 'Crisp and sharp — the dry, wine-like vermouth meets citrus and sweet shades.',
          } },
          { name: 'Onesto', desc: {
            it: 'Diretto e senza compromessi: l\u2019intensità del bitter incontra la finezza del vermouth dry.',
            en: 'Direct and uncompromising — bitter intensity meets the finesse of dry vermouth.',
          } },
          { name: 'Bianco-cano', desc: {
            it: 'Inaspettato e dissetante, si bilancia fra vermouth bianco, bitter e la freschezza luppolata della pilsner.',
            en: 'Unexpected and refreshing — balanced between white vermouth, bitter and the hoppy lift of pilsner.',
          } },
          { name: 'IPA-cano', desc: {
            it: 'Frizzante, agrumato e luppolato: unisce l\u2019amarezza tipica dell\u2019aperitivo al tocco pungente della birra IPA.',
            en: 'Sparkling, citrus-driven and hoppy — classic aperitivo bitterness meets the bite of an IPA.',
          } },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. GIN & TONIC
  // =========================================================================
  {
    id: 'gin-tonic',
    title: { it: 'Gin & Tonic', en: 'Gin & Tonic' },
    intro: {
      it: 'Il classico britannico per eccellenza, nato come cura e diventato un rito. Una ricerca minuziosa dell\u2019incontro tra gin internazionali, toniche premium e guarnizioni specifiche, per trasformare due soli ingredienti in un\u2019esperienza di degustazione.',
      en: 'The quintessential British classic, born as a cure and turned into a ritual. A careful pairing of international gins, premium tonics and specific garnishes — turning two ingredients into a tasting experience.',
    },
    sections: [
      {
        id: 'gin-tonic-list',
        title: { it: 'La selezione', en: 'The selection' },
        items: [
          { name: 'No. 3',                origin: '(UK)',                price: '10', profile: { it: 'Secco, citrico, tagliente',          en: 'Dry, citric, sharp' } },
          { name: '50 Pounds',            origin: '(UK)',                price: '10', profile: { it: 'Secco, morbido, elegante',           en: 'Dry, soft, elegant' } },
          { name: 'Hayman\u2019s Royal Dock', origin: '(UK)',             price: '12', profile: { it: 'Secco, alcolico, pungente',          en: 'Dry, high-proof, pungent' } },
          { name: 'Junipero',             origin: '(USA)',               price: '10', profile: { it: 'Secco, intenso, pungente',           en: 'Dry, intense, pungent' } },
          { name: 'Roku',                 origin: '(Giappone)',          price: '10', profile: { it: 'Secco, pepato, setoso',              en: 'Dry, peppery, silky' } },
          { name: 'Ukiyo Yuzu',           origin: '(Giappone)',          price: '12', profile: { it: 'Agrumato, acidulo, fresco',          en: 'Citric, tart, fresh' } },
          { name: 'Marconi 42',           origin: '(Italia — Veneto)',   price: '10', profile: { it: 'Mediterraneo, erbaceo, balsamico',   en: 'Mediterranean, herbal, balsamic' } },
          { name: 'Clandestino',          origin: '(Italia — Emilia)',   price: '10', profile: { it: 'Aromatico, resinoso, speziato',      en: 'Aromatic, resinous, spiced' } },
          { name: 'Ukiya Blossom',        origin: '(Giappone)',          price: '12', profile: { it: 'Morbido, floreale, fresco',          en: 'Soft, floral, fresh' } },
          { name: 'Mellifera',            origin: '(Francia)',           price: '10', profile: { it: 'Floreale, balsamico, setoso',        en: 'Floral, balsamic, silky' } },
          { name: 'Bobby\u2019s',         origin: '(Olanda)',            price: '10', profile: { it: 'Speziato, fresco, secco',            en: 'Spiced, fresh, dry' } },
          { name: 'Elephant',             origin: '(Germania)',          price: '10', profile: { it: 'Terroso, erbaceo, strutturato',      en: 'Earthy, herbal, structured' } },
          { name: 'Sahena',               origin: '(Thailandia)',        price: '12', profile: { it: 'Fruttato, speziato, esotico',        en: 'Fruity, spiced, exotic' } },
          { name: 'Crafter\u2019s Wild Forest', origin: '(Estonia)',     price: '12', profile: { it: 'Boschivo, resinoso, fresco',         en: 'Forest, resinous, fresh' } },
          { name: 'Old Man Project 3',    origin: '(Germania)',          price: '12', profile: { it: 'Fruttato, morbido, vivace',          en: 'Fruity, soft, lively' } },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. I NOSTRI PIATTI — Cucina
  // =========================================================================
  {
    id: 'cucina',
    title: { it: 'I nostri piatti', en: 'Our plates' },
    intro: {
      it: 'Cicchetti gourmet pensati per accompagnare la musica e non interrompere la conversazione. Materie prime italiane, pochi piatti, ognuno con un\u2019identità precisa.',
      en: 'Gourmet small plates built to ride alongside the music and not interrupt the conversation. Italian ingredients, a short list, each plate with a clear identity.',
    },
    sections: [
      {
        id: 'cucina-list',
        title: { it: 'La carta', en: 'The list' },
        defaultPrice: '15',
        items: [
          { name: 'Tartare di Fassona', desc: {
            it: 'Con stracciatella artigianale e granella di pistacchi.',
            en: 'With artisanal stracciatella and pistachio crumble.',
          } },
          { name: 'Carpaccio di Black Angus', desc: {
            it: 'Su letto di valeriana con chutney all\u2019albicocca.',
            en: 'On a bed of lamb\u2019s lettuce with apricot chutney.',
          } },
          { name: 'Tagliata di Pollo', desc: {
            it: 'Sous vide e affumicata, con patate al forno e salsa allo yogurt.',
            en: 'Sous vide and smoked, with roast potatoes and yoghurt sauce.',
          } },
          { name: 'Carpaccio di Pesce Spada', desc: {
            it: 'Affumicato, su letto di valeriana con chutney di mango.',
            en: 'Smoked, on a bed of lamb\u2019s lettuce with mango chutney.',
          } },
          { name: 'Carpaccio di Tonno', desc: {
            it: 'Affumicato, su letto di valeriana con chutney al fico.',
            en: 'Smoked, on a bed of lamb\u2019s lettuce with fig chutney.',
          } },
          { name: 'Gazpacho', desc: {
            it: 'Con burrata artigianale e alici del Mar Cantabrico.',
            en: 'With artisanal burrata and Cantabrian anchovies.',
          } },
          { name: 'Humus e Friarielli', desc: {
            it: 'Humus di ceci, friarielli napoletani e pomodorini semi-secchi.',
            en: 'Chickpea hummus, Neapolitan friarielli greens and semi-dried cherry tomatoes.',
          } },
        ],
      },
    ],
  },
];

// Helper di estrazione bilingue per non sporcare i template.
export function tx(node: Bilingual, lang: Lang): string {
  return node[lang] ?? node.it;
}
