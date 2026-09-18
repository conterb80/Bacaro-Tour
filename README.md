# Bacaro Tour Venezia 2026 — RC1

Prima release funzionale della PWA condivisa.

## Già presente
- Grafica coerente con il mockup e logo ufficiale fornito.
- PWA installabile su Android/desktop.
- Home, Mappa, Tour, Diario Live.
- Mappa Leaflet/OpenStreetMap di tutta Venezia.
- Giorno 1 precaricato con struttura Prologo + Tour Cannaregio.
- Giorno 2 indipendente e costruibile da zero.
- Aggiunta/modifica/eliminazione/riordino tappe.
- Stato tappa: da fare / fatta / saltata.
- Bevute individuali per partecipante.
- Valutazione personale 1–5 stelle.
- Note personali.
- Top Event.
- Diario automatico e statistiche bevute.
- Link rapidi ACTV, Trenitalia e mappa pedonale.
- Backend predisposto per sincronizzazione Firebase Realtime Database.

## Modalità condivisa
La RC1 funziona subito in modalità demo locale. Per vedere le stesse modifiche su tutti i telefoni:

1. Crea o usa un progetto Firebase.
2. Abilita **Realtime Database**.
3. Abilita **Authentication > Anonymous**.
4. Registra una **Web App** Firebase e copia l'oggetto `firebaseConfig`.
5. Apri `firebase-config.js` e sostituisci `null` con l'oggetto Firebase.
6. Pubblica le regole di `firebase-rules.json` nel Realtime Database.
7. Pubblica la cartella su GitHub Pages/hosting HTTPS.

Con Firebase attivo l'intestazione mostra **Sincronizzazione LIVE**. Le modifiche vengono eseguite tramite transazioni sullo stato condiviso, così più telefoni possono aggiornare il tour senza usare conti economici o profili individuali.

## Nota mappa
Alcune tappe del PDF originale sono già posizionate; le tappe non ancora verificate appaiono come **Da posizionare** e possono essere modificate dall'app.


## RC2 - PWA install fix
Questa versione mette logo e icone PWA anche nella root della repository per evitare errori 404 negli upload da smartphone.
Carica TUTTI i file e le cartelle della RC2 nella root della repository GitHub. Dopo il deploy, attendi 1-2 minuti e ricarica la pagina in Chrome.
