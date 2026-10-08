# Bacaro Tour Venezia 2026 — v1.0.2 Hard Update

Questa versione mantiene invariati Firebase e i dati condivisi e rende evidente/forzabile l'aggiornamento della PWA.

Modifiche:
- versione visibile `v1.0.2 · CONDIVISA`;
- cache PWA completamente nuova;
- CSS e JavaScript caricati con versione esplicita per evitare file vecchi in cache;
- pulsante `Aggiorna app` ora cancella cache e vecchi service worker e ricarica la versione online;
- confermato Map Fix: niente linea tratteggiata fittizia, marker numerati e ricerca luogo in Aggiungi/Modifica tappa;
- Firebase, sharedPath e chiavi di salvataggio restano invariati.

Per pubblicare: sostituire tutti i file nella root GitHub Pages. Dopo il deploy, aprire l'app e usare Impostazioni → Aggiorna app. La versione mostrata deve essere v1.0.2.
