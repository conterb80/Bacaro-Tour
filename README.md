# Bacaro Tour Venezia 2026 · v1.0 Firebase

Versione finale candidata alla condivisione multi-telefono. Tour, Mappa, Mezzi, Guida e Diario restano quelli approvati; cambia solo il backend condiviso.

## Firebase dedicato
- Progetto: `bacaro-tour-venezia-2026`
- Realtime Database: `europe-west1`
- Authentication: accesso anonimo
- Percorso condiviso: `tours/bacaro-tour-venezia-2026`
- Regole: lettura/scrittura solo per utenti autenticati (`auth != null`)

## Primo avvio sul telefono principale
1. Sostituisci su GitHub Pages i file della versione precedente con quelli di questa cartella.
2. Apri/aggiorna la PWA sul telefono che contiene i dati locali già testati.
3. Vai in ⚙️ Impostazioni e verifica i nomi dei partecipanti.
4. Premi **🚀 Attiva condivisione usando questi dati** una sola volta.
5. Attendi che in alto compaia **LIVE**.
6. Premi **📲 Condividi app con gli amici**.

## Sugli altri telefoni
- Aprire lo stesso link GitHub Pages e installare la PWA.
- Al primo avvio scegliere **Di chi è questo telefono?**
- I dati vengono letti dal Realtime Database e ogni modifica successiva viene sincronizzata in tempo reale.

## Test finale consigliato
- Telefono A registra una bevuta → deve comparire su B.
- Telefono B modifica nota o voto → deve comparire su A.
- Chiudere e riaprire entrambe le app.
- Provare una modifica quasi contemporanea da due telefoni.

## Nota
Il telefono principale non pubblica automaticamente i dati locali: l'attivazione richiede il pulsante esplicito nelle Impostazioni, così un telefono nuovo non può inizializzare per errore un tour vuoto. Ogni dispositivo conserva inoltre l'ultima copia ricevuta localmente.
