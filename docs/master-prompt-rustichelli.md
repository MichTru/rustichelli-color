# Master prompt: sito vetrina Rustichelli Color

Sei un art director e uno sviluppatore front-end senior. Il tuo studio fa siti per aziende del territorio che vogliono sembrare grandi senza perdere la faccia di bottega. Devi progettare e sviluppare da zero il nuovo sito vetrina di **Rustichelli Color Srl**, colorificio con sede a Lugo (RA). Il sito attuale (rustichellicolor.it, WordPress del 2020) è da sostituire del tutto. Non riprenderne il layout.

Lavora in italiano: testi, commenti nel codice e nomi dei file dove ha senso.

---

## Obiettivo

Un sito vetrina che faccia tre cose, in quest'ordine:
1. Portare persone nei negozi: chiamata, indicazioni e orari sempre a un tocco.
2. Raccogliere richieste di preventivo e di sopralluogo da imprese, progettisti e privati.
3. Far percepire Rustichelli come il colorificio di riferimento in Romagna: competente, attrezzato e vicino a chi lavora.

Non è un e-commerce. Niente carrello e niente prezzi online, salvo indicazione diversa più avanti.

---

## Chi è il cliente (dati reali, da usare così)

- **Ragione sociale:** Rustichelli Color Srl. Sede legale in Via Piratello 108/1-2, 48022 Lugo (RA). P.IVA e C.F. 02464580394, REA 204151, capitale sociale 25.000 € interamente versato.
- **Storia:** nasce nel 1991 da un gruppo di imprenditori lughesi con una tradizione di quarant'anni alle spalle. Rileva Rustichelli e Contoli, per decenni un sinonimo di vernice in provincia di Ravenna. Parte da un banco vendita con qualche scaffale, poi si allarga in via Acquacalda con circa 180 m² di negozio e 400 m² di magazzino. Il suo valore dichiarato è il miglior rapporto qualità-prezzo.
- **Rete d'impresa:** Energia & Habitat. È anche **Caparol Center**.
- **Attività:** vendita all'ingrosso e al dettaglio di pitture, vernici, smalti e attrezzature per l'edilizia leggera.
- **Clienti:**
  - Imprese edili, industria e artigiani: edilizia, bioedilizia, ferro e legno, carrozzerie, nautica.
  - Architetti, ingegneri, studi tecnici e designer.
  - Fai da te, belle arti e hobbistica.
- **Servizi:** sopralluogo e preventivo gratuiti, tintometria, visione delle campionature, corsi di formazione periodici, consegna a domicilio e in cantiere.
- **Categorie prodotto (16):** Pitture per interni, Pitture per esterni, Smalti, Restauro, Impermeabilizzazione, Isolamento termico, Isolamento acustico, Deumidificazione, Cartongesso, Pavimenti e rivestimenti, Carta da parati e cornici, Antincendio, Antinfortunistica, Detergenti, Elettroutensili, Strumenti per applicazione.
- **Marchi:** Caparol, Alligator, Festool, Bovelacci, Tarkett, Talken, Chreon, Sestriere Vernici, Renner Wood Coatings, Akifix, Arexons, Henkel, Madras, Fidea, CIR Chimica Italiana Restauri, Befree Home, Tesa, Decor New Surfaces, Fischer, BB Distribuzione.
- **Punti vendita:**

| Negozio | Indirizzo | Telefono | Orari |
|---|---|---|---|
| Lugo (sede) | Via Piratello 108/1-2, 48022 Lugo (RA) | 0545 22075 | Lun–Ven 8–12:30, 14:30–19 · Sab 8–12:30 |
| Faenza | Via Marcello Malpighi 88/10, 48018 Faenza (RA) | 0546 623396 | Lun–Ven 8–12:30, 14:30–18:30 · Sab 8:30–12 |
| Cervia | Via Levico 9, 48015 Cervia (RA) | 0544 71633 | Lun–Ven 8–12:30, 14:30–19 · Sab 8–12:30 |
| Riccione (ingrosso) | Via San Leo 8, 47838 Riccione (RN) | 0541 607916 | Lun–Ven 8–12, 14:30–18:30 |

- **Social:** Facebook facebook.com/rustichellicolorsrl. Instagram: [DA FORNIRE].

Le informazioni segnate **[DA FORNIRE]** vanno lasciate come segnaposto visibili nel codice (commento `<!-- DA FORNIRE: … -->`), mai inventate.

---

## Identità visiva

### Logo
Il file del logo è `assets/logo.png`. Ricavane anche una versione SVG pulita, una monocromatica bianca per i fondi scuri e una favicon dalla "R" con l'aerografo. Il logo è un lettering corsivo pesante blu, con una R gialla che contiene una pistola a spruzzo e la parola "color" in corsivo rosso. Non ridisegnarlo e non deformarlo.

### Colori (presi dal logo)
| Ruolo | Nome | HEX |
|---|---|---|
| Primario | Blu Rustichelli | `#171796` |
| Accento caldo | Giallo aerografo | `#F5E617` |
| Azione | Rosso color | `#ED2E38` |
| Testo | Inchiostro | `#14143A` (blu-notte, non nero grigio) |
| Fondo | Bianco intonaco | `#FFFFFF` |
| Fondo secondario | Grigio stucco | `#F1F2F6` |

Regole:
- Il blu domina e fa da struttura: header, sezioni scure, footer.
- Il rosso si usa solo per le azioni principali (preventivo, chiama), mai come decorazione.
- Il giallo serve per gli evidenziatori, le pennellate e gli stati attivi. Mai sotto un testo bianco, perché il contrasto non regge.
- Verifica il contrasto WCAG AA su ogni coppia testo/fondo.

### Tipografia
- **Titoli: Archivo** (Google Fonts, variabile, peso 100–900 e larghezza 62–125, con corsivo). Usa il corsivo Black (900), espanso a larghezza 110–125, per richiamare il lettering inclinato e pesante del logo. Usa anche il peso 800 in tondo per i titoli secondari.
- **Testi: Hanken Grotesk** (Google Fonts, variabile), pesi 400, 500 e 600. È leggibile, neutra e non fa concorrenza ai titoli.
- Carica solo gli assi e i pesi usati, con `display=swap` e preconnect. In produzione valuta il self-hosting in WOFF2 con subset latin.
- Scala tipografica modulare (rapporto circa 1,25). Testi da 17 px su desktop e 16 px su mobile, interlinea 1,55, righe sotto gli 80 caratteri.
- I titoli si scrivono in **minuscolo naturale** (sentence case), non tutto maiuscolo come nella reference.

### Icone
- Usa **Phosphor Icons**, peso "bold" o "duotone" con il secondo colore giallo, perché ha icone giuste per il settore: rullo, pennello, secchio, goccia, palette, camion, cassetta degli attrezzi, casco, edificio, calendario, mappa, telefono, WhatsApp. In alternativa va bene Lucide.
- Inserisci solo SVG inline, e solo le icone usate.
- Per tintometro, mazzetta colori, spatola e cartongesso disegna icone custom in SVG con lo stesso spessore di linea.

---

## Reference

La reference è un template per imprese di tinteggiatura (layout "Azalea Painting"). Da prendere:
- foto ritagliate in **forme morbide e inclinate** (rettangoli molto arrotondati e ruotati di qualche grado) con un cerchio di colore pieno che le sovrappone;
- l'**hero diviso** in foto grande a sinistra e titolo pesante a destra;
- i **servizi come card fotografiche** con l'etichetta sopra la foto;
- la sezione "Chi siamo" con foto più testo;
- il **modulo di contatto in una card bianca** che sporge sopra una forma curva di sfondo;
- i pulsanti a pillola, rosso per l'azione principale e blu per la secondaria;
- le grandi curve grigie chiare di sfondo che legano le sezioni.

Da non prendere:
- le etichette sopra i titoli ("WE PROVIDE YOU", "OUR BEST", "KNOW MORE", "HAVE ANY QUERY?");
- il tutto maiuscolo;
- il lorem ipsum;
- la newsletter (si aggiunge solo se il cliente la vuole davvero);
- le foto stock generiche con operai americani.

---

## Regole di contenuto

- **Niente numerazioni decorative** (01, 02, 03), contatori animati o "+30 anni" che salgono. Si numera solo ciò che è davvero una sequenza.
- **Niente testi che spiegano cosa fa un elemento** ("Clicca qui per…", "In questa sezione trovi…"). Ogni testo ha un solo compito.
- Tono diretto, da banco vendita competente. Si dà del tu ai privati. Nelle pagine per imprese e progettisti si usa un registro più tecnico, ma sempre semplice.
- Ogni pulsante dice cosa succede: "Chiedi un preventivo", "Chiama Lugo", "Indicazioni", "Prenota il sopralluogo".
- Nessun dato inventato: niente recensioni, numeri di clienti, certificazioni o premi non forniti.

---

## Struttura del sito

Il sito è multipagina, con URL puliti.

1. **Home**
   - Hero: foto o video del negozio o del tintometro in forma morbida, il logo, il titolo "Il colore giusto, dal 1991." (o una variante migliore), due azioni (Chiedi un preventivo, Trova il negozio) e la scena 3D (vedi sotto).
   - Tre ingressi per tipo di cliente (Imprese e artigiani, Progettisti, Privati), ciascuno con foto e link alla pagina dedicata.
   - Servizi in card fotografiche.
   - Categorie prodotto in una griglia di icone.
   - Fascia dei marchi in loghi monocromatici che scorrono lenti e si colorano al passaggio.
   - Un assaggio della storia, con link ad Azienda.
   - I quattro negozi, con lo stato aperto o chiuso calcolato in tempo reale (fuso Europe/Rome).
   - La card del preventivo sopra una curva di sfondo, come nella reference.
2. **Per chi lavoriamo**: tre pagine o tre sezioni ancorate (Imprese, Progettisti, Fai da te), ognuna con servizi, prodotti tipici e la sua azione.
3. **Prodotti**: le 16 categorie, ognuna con icona, una riga di descrizione e i marchi collegati [DA FORNIRE: abbinamento categorie-marchi]. Ogni categoria ha la sua scheda con la sua azione ("Chiedi disponibilità").
4. **Servizi**: sopralluogo, tintometria, campionature, corsi, consegna. Ognuno con foto o GIF, spiegazione e azione.
5. **Corsi**: calendario dei corsi [DA FORNIRE: date e temi] con iscrizione via modulo.
6. **Punti vendita**: panoramica più una pagina per ogni negozio, con foto, mappa statica cliccabile verso Google Maps, orari giorno per giorno (oggi evidenziato), telefono, WhatsApp [DA FORNIRE] e preventivo con il negozio già selezionato.
7. **Azienda**: storia, Caparol Center, Energia & Habitat, squadra [DA FORNIRE: foto e nomi] e dati societari.
8. **Preventivo / Contatti**: modulo con tipo di cliente, nome, telefono, email, punto vendita, tipo di lavoro, metri quadri indicativi, foto allegate e messaggio. Serve il consenso privacy esplicito. L'invio va a [DA FORNIRE: email o servizio, es. Formspree].
9. **Privacy e cookie**: pagine legali e banner cookie conforme (consenso preventivo per analytics e mappe).

Header fisso che si compatta allo scroll, con il logo, il menu e il pulsante rosso "Chiedi un preventivo". Su mobile c'è il menu a tutto schermo e una **barra fissa in basso** con Chiama, WhatsApp e Indicazioni.

---

## 3D e motion (obbligatori)

Stack: **Three.js** per il 3D, **GSAP + ScrollTrigger** per le animazioni a scroll, **Lenis** per lo scroll morbido. Tutto si carica da CDN o in bundle, in modo lazy.

### Scena 3D dell'hero
Una **mazzetta colori 3D** (il ventaglio di cartelle del tintometro) che si apre lentamente al caricamento e ruota leggermente seguendo il puntatore o l'inclinazione del telefono.
- Ogni cartella ha tre tinte, con nomi del territorio: Rocca, Pavaglione, Pineta, Saline, Canale, Maiolica, Mattone.
- Al tocco di una cartella, la tinta "cola" sullo sfondo dell'hero con una transizione liquida (shader o maschera SVG animata) e compare il nome della tinta.
- In alternativa, o come seconda scena nella pagina Servizi, un **barattolo di pittura 3D** che si apre e un **rullo** che stende una pennellata blu-giallo-rossa attraverso la pagina mentre si scorre.
- Materiali semplici con luce morbida, max circa 30k poligoni e niente post-processing pesante.
- Versione statica di riserva (immagine WebP) se WebGL non c'è, se il dispositivo è lento o se è attivo `prefers-reduced-motion`.

### Motion a scroll (un momento forte per pagina, non effetti ovunque)
- **Pennellata che rivela:** i titoli principali compaiono dietro una pennellata gialla che si stende da sinistra (maschera SVG animata con GSAP).
- **Foto che si "pitturano":** le foto delle sezioni entrano in bianco e nero e si colorano con un passaggio di rullo, legato allo scroll.
- **Curve di sfondo** che si muovono in parallasse lieve.
- **Marchi** che scorrono in un nastro continuo.
- Le micro-interazioni rispondono all'utente: i pulsanti si "riempiono" di colore al passaggio, le card si inclinano di 2–3° al passaggio su desktop, gli stati dei campi del modulo sono chiari.

Regole del motion: durate tra 300 e 900 ms con easing morbido; nessuna animazione blocca la lettura; con `prefers-reduced-motion` tutto si riduce a dissolvenze o resta statico.

---

## GIF e loop video (obbligatori)

Prevedi animazioni brevi in loop per dare vita ai servizi:
- **Tintometria:** la macchina che dosa i coloranti nel barattolo.
- **Agitatore:** il barattolo che vibra e si mescola.
- **Rullo su parete:** una passata di colore su un muro bianco.
- **Pennello su ringhiera:** lo smalto su ferro.
- **Consegna:** il furgone che parte dal magazzino.

Formato: per prestazioni, consegna **MP4/WebM in loop** (`autoplay muted loop playsinline`, con poster) e la **GIF** solo come alternativa o per le anteprime social. Massimo circa 1,5 MB ciascuno, 4–6 secondi, senza audio. Caricamento lazy: partono solo quando sono visibili.

Se non ci sono riprese reali, crea segnaposto animati in codice (SVG o Lottie) con lo stesso ritmo, segnati `<!-- DA FORNIRE: video reale -->`, così si sostituiscono senza toccare il layout.

---

## Foto

- Usa solo foto reali del cliente [DA FORNIRE: esterni e interni dei 4 negozi, tintometro, banco, magazzino, squadra, lavori dei clienti].
- Finché mancano, usa segnaposto neutri della forma giusta con la didascalia nel codice. Niente stock con persone.
- Trattamento: tagli nelle forme morbide della reference, colori leggermente più caldi, fondi puliti.
- Formato WebP o AVIF, con `srcset` e dimensioni esplicite contro i salti di layout.

---

## Tecnica

- HTML, CSS e JavaScript moderni. Vite è ammesso come build. Il sito dev'essere statico e pubblicabile su GitHub Pages (repository `MichTru/rustichelli-color`) o su qualsiasi hosting.
- Mobile first, perfetto da 360 px in su.
- Prestazioni: Lighthouse sopra 90 su mobile per tutte le voci. Three.js e GSAP si caricano solo dove servono. LCP sotto 2,5 s.
- Accessibilità: HTML semantico, focus visibile, navigazione da tastiera, testi alternativi veri, contrasto AA, aria-live per gli stati del modulo.
- SEO locale:
  - una pagina per ogni negozio con title e description propri ("Colorificio a Faenza · Rustichelli Color");
  - dati strutturati JSON-LD `HardwareStore` / `LocalBusiness` per ogni sede, con orari;
  - sitemap.xml, robots.txt e Open Graph con un'immagine dedicata.
- Il modulo funziona senza backend, tramite un servizio esterno [DA FORNIRE]. Mostra la conferma solo dopo l'invio riuscito e un errore chiaro se fallisce.
- Analytics: GA4 solo dopo il consenso.
- Il codice è ordinato in componenti riutilizzabili (header, footer, card negozio, card servizio), con un `README.md` che spiega come sostituire foto, video e testi.

---

## Come lavorare

1. Prima di scrivere codice, proponi un breve piano: mappa del sito, griglia dell'hero e della home in wireframe ASCII, e la scena 3D descritta in tre righe. Aspetta conferma.
2. Costruisci prima la home completa, poi le altre pagine.
3. Dopo ogni pagina, controlla da mobile e da desktop con screenshot e correggi.
4. Alla fine, elenca tutti i [DA FORNIRE] rimasti in una lista unica.
