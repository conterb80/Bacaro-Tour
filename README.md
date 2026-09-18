# Bacaro Tour Venezia 2026 — RC3

Release di test focalizzata su utilizzo reale durante il tour.

## Novità RC3
- **Bevute visibili dentro ogni bacaro**, divise per partecipante e tipo.
- Pulsante **−** per correggere/cancellare una bevuta inserita per errore.
- Il pulsante bevuta mostra il conteggio del partecipante selezionato in quel bacaro.
- La prima bevuta segna automaticamente il bacaro come **Fatto**.
- **Altro** chiede il nome reale della bevuta (es. Bellini, Select, Grappa...).
- Diario ricostruito dai dati reali: eliminando una bevuta sparisce anche dalla cronologia.
- Top Event visibili nella scheda del bacaro, modificabili e cancellabili.
- Voto/note, Top Event e gestione tappa sono ora sezioni richiudibili per rendere la scheda più rapida.
- **Posizionamento tappa migliorato**: dalla scheda premi “Posiziona/Sposta sulla mappa” e poi tocchi il punto.
- Nuova sezione **🧭 Guida Venezia** con luoghi da vedere, bacari, botteghe e itinerari; ogni elemento può essere aggiunto a Giorno 1 o Giorno 2.
- Nuova sezione **🚤 Mappa Vaporetti** con schema orientativo, nodi principali, linee utili, mini-planner e link agli orari ACTV.
- Home con **Prossima tappa**.
- Grafica più calda: meno bianco puro, più crema/beige mantenendo bordeaux, verde, oro, icone ed emoji.
- Versione visibile nelle impostazioni e pulsante **Aggiorna app**.
- Migrazione dati: mantiene le prove locali salvate dalla RC2 usando lo stesso localStorage.

## Vaporetti
La schermata è volutamente una guida orientativa, non sostituisce l'orario ufficiale. Le indicazioni rapide sono costruite sulle linee ACTV correnti consultate a settembre 2026; per partenze, banchine e variazioni usare sempre il pulsante **Orari ACTV** nell'app.

## Firebase
La RC3 resta utilizzabile in modalità demo locale. Quando i test funzionali saranno chiusi, si può attivare Firebase Realtime Database senza rifare l'interfaccia.

## Installazione su GitHub Pages
Caricare **tutti** i file della cartella nella root della repository, lasciando Pages su `main / (root)`. Dopo il deploy aprire l'app, andare in Impostazioni e premere **Aggiorna app** se il telefono continua a mostrare la RC2.
