-- 0006_fix_encoding.sql
-- Correzione una-tantum del mojibake da doppia codifica (UTF-8 letto come Mac Roman)
-- introdotto incollando i seed nel SQL Editor. Tutto il testo non-ASCII e' scritto
-- come escape \uXXXX: incollarlo non puo' ri-corromperlo.
-- Idempotente: rieseguendolo, le righe gia' pulite non vengono toccate
-- (la WHERE confronta col valore corrotto).

begin;

-- events: 3 righe da correggere
update public.events set
      blurb = E'Il blues spinto della band del venerd\u00ec: il bancone si muove.'
    where id = '3599ef51-fd27-4326-847a-bca7c21f4682'::uuid and (blurb = E'Il blues spinto della band del venerd\u221a\u00a8: il bancone si muove.');
update public.events set
      artist = E'Marco Trabucco & Matteo Alfonso \u00b7 Psychoosteria',
      blurb = E'Doppia serata Biblio Live: contrabbasso e piano gioved\u00ec, Psychoosteria venerd\u00ec.',
      date_label = E'Gioved\u00ec 23 + Venerd\u00ec 24 aprile'
    where id = '9172d535-5601-4eba-ac61-4b9defbb1cb4'::uuid and (artist = E'Marco Trabucco & Matteo Alfonso \u00ac\u2211 Psychoosteria' and blurb = E'Doppia serata Biblio Live: contrabbasso e piano gioved\u221a\u00a8, Psychoosteria venerd\u221a\u00a8.' and date_label = E'Gioved\u221a\u00a8 23 + Venerd\u221a\u00a8 24 aprile');
update public.events set
      blurb = E'Reading di poesia orale: \u00abNasci calamaro, muori frittura\u00bb.'
    where id = '6a2d63af-c7c0-4576-8025-d2c4639914fd'::uuid and (blurb = E'Reading di poesia orale: \u00ac\u00b4Nasci calamaro, muori frittura\u00ac\u00aa.');

-- menu_sections: 7 righe da correggere
update public.menu_sections set
      chapter_intro_it = E'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questo men\u00f9 celebriamo la straordinaria flessibilit\u00e0 della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.',
      chapter_intro_en = E'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u2019s remarkable flexibility, an unchanged structure whose soul shifts with the spirit at its core.',
      intro_it = E'La forma originaria del Negroni, spinta verso le possibilit\u00e0 di oggi. La spina dorsale di ginepro viene declinata attraverso la variet\u00e0 della distillazione contemporanea.',
      intro_en = E'The original Negroni, pushed into today\u2019s possibilities. The juniper backbone is reread through the breadth of contemporary distillation.'
    where id = E'negroni-gin' and (chapter_intro_it = E'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questo men\u221a\u03c0 celebriamo la straordinaria flessibilit\u221a\u2020 della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.' and chapter_intro_en = E'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u201a\u00c4\u00f4s remarkable flexibility, an unchanged structure whose soul shifts with the spirit at its core.' and intro_it = E'La forma originaria del Negroni, spinta verso le possibilit\u221a\u2020 di oggi. La spina dorsale di ginepro viene declinata attraverso la variet\u221a\u2020 della distillazione contemporanea.' and intro_en = E'The original Negroni, pushed into today\u201a\u00c4\u00f4s possibilities. The juniper backbone is reread through the breadth of contemporary distillation.');
update public.menu_sections set
      chapter_intro_it = E'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questo men\u00f9 celebriamo la straordinaria flessibilit\u00e0 della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.',
      chapter_intro_en = E'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u2019s remarkable flexibility, an unchanged structure whose soul shifts with the spirit at its core.'
    where id = E'negroni-whisky' and (chapter_intro_it = E'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questo men\u221a\u03c0 celebriamo la straordinaria flessibilit\u221a\u2020 della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.' and chapter_intro_en = E'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u201a\u00c4\u00f4s remarkable flexibility, an unchanged structure whose soul shifts with the spirit at its core.');
update public.menu_sections set
      chapter_intro_it = E'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questo men\u00f9 celebriamo la straordinaria flessibilit\u00e0 della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.',
      chapter_intro_en = E'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u2019s remarkable flexibility, an unchanged structure whose soul shifts with the spirit at its core.',
      intro_it = E'L\u2019incontro perfetto fra l\u2019agave messicana e l\u2019amaro italiano. Figlio della moderna evoluzione del bar, il Mezcal Negroni sostituisce le classiche botaniche del gin con sentori rustici, vegetali e affumicati del distillato artigianale.'
    where id = E'negroni-mezcal' and (chapter_intro_it = E'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questo men\u221a\u03c0 celebriamo la straordinaria flessibilit\u221a\u2020 della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.' and chapter_intro_en = E'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u201a\u00c4\u00f4s remarkable flexibility, an unchanged structure whose soul shifts with the spirit at its core.' and intro_it = E'L\u201a\u00c4\u00f4incontro perfetto fra l\u201a\u00c4\u00f4agave messicana e l\u201a\u00c4\u00f4amaro italiano. Figlio della moderna evoluzione del bar, il Mezcal Negroni sostituisce le classiche botaniche del gin con sentori rustici, vegetali e affumicati del distillato artigianale.');
update public.menu_sections set
      chapter_intro_it = E'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questo men\u00f9 celebriamo la straordinaria flessibilit\u00e0 della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.',
      chapter_intro_en = E'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u2019s remarkable flexibility, an unchanged structure whose soul shifts with the spirit at its core.',
      intro_it = E'Un classico moderno che unisce la struttura italiana alla complessit\u00e0 dei distillati di canna da zucchero. Il rum prende il posto del gin per regalare al Negroni inaspettate note di melassa, spezie e legno.'
    where id = E'negroni-rum' and (chapter_intro_it = E'Dal 1919, il bilanciamento tra amaro e vermouth ha reso il Negroni il cocktail italiano per eccellenza. In questo men\u221a\u03c0 celebriamo la straordinaria flessibilit\u221a\u2020 della sua ricetta: una struttura immutata che cambia anima a seconda del distillato principale.' and chapter_intro_en = E'Since 1919 the balance between bitter and vermouth has made the Negroni the quintessential Italian cocktail. Here we celebrate the recipe\u201a\u00c4\u00f4s remarkable flexibility, an unchanged structure whose soul shifts with the spirit at its core.' and intro_it = E'Un classico moderno che unisce la struttura italiana alla complessit\u221a\u2020 dei distillati di canna da zucchero. Il rum prende il posto del gin per regalare al Negroni inaspettate note di melassa, spezie e legno.');
update public.menu_sections set
      chapter_intro_it = E'L\u2019evoluzione del Milano-Torino che ha fatto la storia a cavallo del Novecento. La semplicit\u00e0 dell\u2019Americano viene reinterpretata attraverso bitter moderni e vermouth di carattere, per scoprire ogni possibile declinazione dell\u2019aperitivo.',
      title_it = E'Il men\u00f9'
    where id = E'americani-list' and (chapter_intro_it = E'L\u201a\u00c4\u00f4evoluzione del Milano-Torino che ha fatto la storia a cavallo del Novecento. La semplicit\u221a\u2020 dell\u201a\u00c4\u00f4Americano viene reinterpretata attraverso bitter moderni e vermouth di carattere, per scoprire ogni possibile declinazione dell\u201a\u00c4\u00f4aperitivo.' and title_it = E'Il men\u221a\u03c0');
update public.menu_sections set
      chapter_intro_it = E'Il classico britannico per eccellenza, nato come cura e diventato un rito. Una ricerca minuziosa dell\u2019incontro tra gin internazionali, toniche premium e guarnizioni specifiche, per trasformare due soli ingredienti in un\u2019esperienza di degustazione.'
    where id = E'gin-tonic-list' and (chapter_intro_it = E'Il classico britannico per eccellenza, nato come cura e diventato un rito. Una ricerca minuziosa dell\u201a\u00c4\u00f4incontro tra gin internazionali, toniche premium e guarnizioni specifiche, per trasformare due soli ingredienti in un\u201a\u00c4\u00f4esperienza di degustazione.');
update public.menu_sections set
      chapter_intro_it = E'Cicchetti gourmet pensati per accompagnare la musica e non interrompere la conversazione. Materie prime italiane, pochi piatti, ognuno con un\u2019identit\u00e0 precisa.',
      title_it = E'Il men\u00f9'
    where id = E'cucina-list' and (chapter_intro_it = E'Cicchetti gourmet pensati per accompagnare la musica e non interrompere la conversazione. Materie prime italiane, pochi piatti, ognuno con un\u201a\u00c4\u00f4identit\u221a\u2020 precisa.' and title_it = E'Il men\u221a\u03c0');

-- menu_items: 13 righe da correggere
update public.menu_items set
      desc_it = E'Affumicato e terroso: il carattere rustico dell\u2019agave si sposa con profumi erbacei, ricchi e tradizionali.'
    where id = '5565b5d2-be2a-46b8-9c54-7806717da5af'::uuid and (desc_it = E'Affumicato e terroso: il carattere rustico dell\u201a\u00c4\u00f4agave si sposa con profumi erbacei, ricchi e tradizionali.');
update public.menu_items set
      desc_it = E'Ricco e complesso: spiccano eleganti sentori di vaniglia, spezie e frutta secca che donano rotondit\u00e0.'
    where id = 'db43ca78-d2d4-42fa-ad9b-4b6482436e39'::uuid and (desc_it = E'Ricco e complesso: spiccano eleganti sentori di vaniglia, spezie e frutta secca che donano rotondit\u221a\u2020.');
update public.menu_items set
      desc_it = E'L\u2019espressione pi\u00f9 bilanciata: note pungenti del ginepro, sostenute da una ricca dolcezza vanigliata.'
    where id = '225b71f6-c293-4d07-bf3a-9dd72abec464'::uuid and (desc_it = E'L\u201a\u00c4\u00f4espressione pi\u221a\u03c0 bilanciata: note pungenti del ginepro, sostenute da una ricca dolcezza vanigliata.');
update public.menu_items set
      desc_it = E'Su letto di valeriana con chutney all\u2019albicocca.',
      desc_en = E'On a bed of lamb\u2019s lettuce with apricot chutney.'
    where id = '16bb73e0-91f0-4487-af97-2d0a2daa3423'::uuid and (desc_it = E'Su letto di valeriana con chutney all\u201a\u00c4\u00f4albicocca.' and desc_en = E'On a bed of lamb\u201a\u00c4\u00f4s lettuce with apricot chutney.');
update public.menu_items set
      desc_it = E'Morbido e dorato: la rotondit\u00e0 del bourbon si siede su un profilo dolce-amaro limpido e leggero.'
    where id = '58de5f67-a276-4f71-b08f-6e5c1b4c97d7'::uuid and (desc_it = E'Morbido e dorato: la rotondit\u221a\u2020 del bourbon si siede su un profilo dolce-amaro limpido e leggero.');
update public.menu_items set
      name = E'Hayman\u2019s Royal Dock'
    where id = '02aa6131-535f-4a15-923c-32abdf836b47'::uuid and (name = E'Hayman\u201a\u00c4\u00f4s Royal Dock');
update public.menu_items set
      desc_en = E'Smoked, on a bed of lamb\u2019s lettuce with mango chutney.'
    where id = 'a0a7deca-e3d3-4a49-89cb-cd7d3e880917'::uuid and (desc_en = E'Smoked, on a bed of lamb\u201a\u00c4\u00f4s lettuce with mango chutney.');
update public.menu_items set
      desc_en = E'Smoked, on a bed of lamb\u2019s lettuce with fig chutney.'
    where id = '8c8d119b-4e06-4e2b-b088-ad9dfec25db0'::uuid and (desc_en = E'Smoked, on a bed of lamb\u201a\u00c4\u00f4s lettuce with fig chutney.');
update public.menu_items set
      desc_it = E'Verticale e tagliente: il ginepro svetta sull\u2019intensit\u00e0 del bitter e sul rigore del Vermouth dry.'
    where id = '43e9ae0e-a627-4fde-856d-db02e0dc78fb'::uuid and (desc_it = E'Verticale e tagliente: il ginepro svetta sull\u201a\u00c4\u00f4intensit\u221a\u2020 del bitter e sul rigore del Vermouth dry.');
update public.menu_items set
      desc_it = E'Diretto e senza compromessi: l\u2019intensit\u00e0 del bitter incontra la finezza del vermouth dry.'
    where id = '47f9cf60-f9f1-46eb-b881-b7b802039031'::uuid and (desc_it = E'Diretto e senza compromessi: l\u201a\u00c4\u00f4intensit\u221a\u2020 del bitter incontra la finezza del vermouth dry.');
update public.menu_items set
      name = E'Bobby\u2019s'
    where id = '60394f69-9049-486e-aa77-e5373ccf8550'::uuid and (name = E'Bobby\u201a\u00c4\u00f4s');
update public.menu_items set
      desc_it = E'Frizzante, agrumato e luppolato: unisce l\u2019amarezza tipica dell\u2019aperitivo al tocco pungente della birra IPA.'
    where id = '86aba754-d8c4-4fb3-962c-518b0d6ce54a'::uuid and (desc_it = E'Frizzante, agrumato e luppolato: unisce l\u201a\u00c4\u00f4amarezza tipica dell\u201a\u00c4\u00f4aperitivo al tocco pungente della birra IPA.');
update public.menu_items set
      name = E'Crafter\u2019s Wild Forest'
    where id = '55f0a506-aca9-43bd-b4e7-26afa24b0647'::uuid and (name = E'Crafter\u201a\u00c4\u00f4s Wild Forest');

-- dati demo (bookings/applications da 0004): corregge solo se ancora corrotti.
-- Il valore atteso-corrotto e' calcolato dalla stessa doppia codifica del paste,
-- cosi' righe gia' pulite o modificate dal proprietario non vengono toccate.
update public.bookings set
      event_label = E'Venerd\u00ec Live'
    where id = 'd0000000-0000-4000-a000-0000000000b1' and (event_label = E'Venerd\u221a\u00a8 Live');
update public.applications set
      bio = E'Trio nato al Conservatorio Benedetto Marcello, attivo dal 2022 nei jazz club del nord-est. Sonorit\u00e0 intime, adatte a una serata da bistrot.',
      availability = E'Gioved\u00ec e venerd\u00ec sera',
      fee = E'250\u2013350 \u20ac a serata'
    where id = 'd0000000-0000-4000-a000-0000000000a1' and (bio = E'Trio nato al Conservatorio Benedetto Marcello, attivo dal 2022 nei jazz club del nord-est. Sonorit\u221a\u2020 intime, adatte a una serata da bistrot.' or availability = E'Gioved\u221a\u00a8 e venerd\u221a\u00a8 sera' or fee = E'250\u201a\u00c4\u00ec350 \u201a\u00c7\u00a8 a serata');
update public.applications set
      bio = E'Cantautrice trevigiana, due EP all''attivo. Repertorio acustico perfetto per gli aperitivi del gioved\u00ec.'
    where id = 'd0000000-0000-4000-a000-0000000000a2' and (bio = E'Cantautrice trevigiana, due EP all''attivo. Repertorio acustico perfetto per gli aperitivi del gioved\u221a\u00a8.');
update public.applications set
      availability = E'Tutte le sere tranne il luned\u00ec',
      fee = E'400 \u20ac a serata (full band)'
    where id = 'd0000000-0000-4000-a000-0000000000a3' and (availability = E'Tutte le sere tranne il luned\u221a\u00a8' or fee = E'400 \u201a\u00c7\u00a8 a serata (full band)');

commit;
