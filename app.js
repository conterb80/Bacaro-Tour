import { firebaseConfig, sharedPath } from './firebase-config.js';

const APP_VERSION = 'v1.0.1 · CONDIVISA';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const clone = (x) => JSON.parse(JSON.stringify(x));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const nowISO = () => new Date().toISOString();
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});

const guideCatalog = [
  {id:'iuav',category:'visit',icon:'🏛️',name:'IUAV · ingresso di Carlo Scarpa',area:'Tolentini',detour:'Sul percorso',query:'IUAV Tolentini Venezia',desc:'Una sosta di pochi minuti vicino all’inizio del tour.',type:'poi'},
  {id:'maredicarta',category:'shop',icon:'📚',name:'Mare di Carta',area:'Tolentini',detour:'Sul percorso',query:'Mare di Carta Venezia',desc:'Libreria dedicata al mare e alla laguna, comoda nella zona del prologo.',type:'poi'},
  {id:'ghetto',category:'visit',icon:'✡️',name:'Ghetto Ebraico',area:'Cannaregio',detour:'Sul percorso',query:'Ghetto Ebraico Venezia',desc:'Una delle zone più caratteristiche di Cannaregio, senza allontanarsi dal giro.',type:'poi'},
  {id:'torrefazione',category:'shop',icon:'☕',name:'Torrefazione Cannaregio',area:'Cannaregio',detour:'Deviazione breve',query:'Torrefazione Cannaregio Venezia',desc:'Pausa caffè facile da inserire mentre siete in zona.',type:'poi'},
  {id:'madonnaorto',category:'visit',icon:'⛪',name:"Madonna dell'Orto",area:'Cannaregio',detour:'Deviazione breve',query:"Chiesa Madonna dell'Orto Venezia",desc:'Chiesa legata a Tintoretto; da valutare solo se avete tempo e voglia.',type:'poi'},
  {id:'campomori',category:'visit',icon:'🗿',name:'Campo dei Mori',area:'Cannaregio',detour:'Sul percorso',query:'Campo dei Mori Venezia',desc:'Le statue dei fratelli Mastelli e il Sior Rioba: sosta veloce e curiosa.',type:'poi'},
  {id:'tintoretto',category:'visit',icon:'🎨',name:'Casa del Tintoretto',area:'Cannaregio',detour:'Sul percorso',query:'Casa del Tintoretto Venezia',desc:'Piccola deviazione naturale lungo il tratto più autentico del sestiere.',type:'poi'},
  {id:'pontechiodo',category:'visit',icon:'🌉',name:'Ponte Chiodo',area:'Cannaregio',detour:'Deviazione breve',query:'Ponte Chiodo Venezia',desc:'Uno dei rarissimi ponti veneziani ancora senza balaustre.',type:'poi'},
  {id:'forcolaio',category:'shop',icon:'🛶',name:'Il Forcolaio Matto',area:'Santa Sofia',detour:'Sul percorso',query:'Il Forcolaio Matto Venezia',desc:'Bottega artigiana di remi e forcole, perfetta come curiosità di passaggio.',type:'poi'},
  {id:'lele-guide',category:'bacaro',icon:'🍷',name:'Bacareto da Lele',area:'Tolentini',detour:'Tappa fissa',query:'Bacareto da Lele Venezia',desc:'Prologo fisso del gruppo.',type:'bacaro',fixed:true},
  {id:'lucafred-guide',category:'bacaro',icon:'🍷',name:'Luca e Fred',area:'Cannaregio',detour:'Sul percorso',query:'Luca e Fred Venezia',desc:'Bacaro già coerente con il percorso del Giorno 1.',type:'bacaro'},
  {id:'timon-guide',category:'bacaro',icon:'🍷',name:'Al Timon',area:'Ormesini',detour:'Sul percorso',query:'Al Timon Venezia',desc:'Sosta naturale lungo le fondamenta degli Ormesini.',type:'bacaro'},
  {id:'vedova-guide',category:'bacaro',icon:'🍷',name:"Ca' d'Oro · Alla Vedova",area:'Cannaregio',detour:'Sul percorso',query:"Ca' d'Oro Alla Vedova Venezia",desc:'Osteria storica comoda nella parte finale del giro.',type:'bacaro'}
];

const vapStops = {
  roma:{name:'P.le Roma',lat:45.4387,lng:12.3181,zone:'venice'},
  ferrovia:{name:'Ferrovia / S. Lucia',lat:45.4412,lng:12.3215,zone:'venice'},
  rivadebiasio:{name:'Riva de Biasio',lat:45.4423,lng:12.3240,zone:'venice'},
  sanmarcuola:{name:'S. Marcuola',lat:45.4440,lng:12.3272,zone:'venice'},
  sanstae:{name:'S. Stae',lat:45.4418,lng:12.3311,zone:'venice'},
  cadOro:{name:"Ca’ d’Oro",lat:45.4416,lng:12.3342,zone:'venice'},
  rialtomercato:{name:'Rialto Mercato',lat:45.4394,lng:12.3334,zone:'venice'},
  rialto:{name:'Rialto',lat:45.4381,lng:12.3358,zone:'venice'},
  sansilvestro:{name:'S. Silvestro',lat:45.4363,lng:12.3347,zone:'venice'},
  santangelo:{name:'S. Angelo',lat:45.4346,lng:12.3308,zone:'venice'},
  santoma:{name:'S. Tomà',lat:45.4344,lng:12.3264,zone:'venice'},
  carezzonico:{name:"Ca’ Rezzonico",lat:45.4332,lng:12.3265,zone:'venice'},
  accademia:{name:'Accademia',lat:45.4316,lng:12.3287,zone:'venice'},
  giglio:{name:'S. Maria del Giglio',lat:45.4326,lng:12.3324,zone:'venice'},
  salute:{name:'Salute',lat:45.4307,lng:12.3348,zone:'venice'},
  sanmarcovallaresso:{name:'S. Marco Vallaresso',lat:45.4324,lng:12.3370,zone:'venice'},
  sanmarco:{name:'S. Marco / S. Zaccaria',lat:45.4334,lng:12.3401,zone:'venice'},
  arsenale:{name:'Arsenale',lat:45.4336,lng:12.3500,zone:'venice'},
  giardini:{name:'Giardini',lat:45.4309,lng:12.3564,zone:'venice'},
  santelena:{name:'S. Elena',lat:45.4276,lng:12.3634,zone:'venice'},
  lido:{name:'Lido S.M.E.',lat:45.4177,lng:12.3686,zone:'lido'},
  ftnove:{name:'Fondamente Nove',lat:45.4459,lng:12.3425,zone:'venice'},
  sangiorgio:{name:'San Giorgio',lat:45.4296,lng:12.3430,zone:'giudecca'},
  zitelle:{name:'Zitelle',lat:45.4278,lng:12.3387,zone:'giudecca'},
  redentore:{name:'Redentore',lat:45.4264,lng:12.3340,zone:'giudecca'},
  palanca:{name:'Giudecca Palanca',lat:45.4263,lng:12.3284,zone:'giudecca'},
  zattere:{name:'Zattere',lat:45.4297,lng:12.3270,zone:'venice'},
  sanbasilio:{name:'San Basilio',lat:45.4308,lng:12.3198,zone:'venice'},
  murano:{name:'Murano Faro',lat:45.4584,lng:12.3524,zone:'murano'},
  burano:{name:'Burano',lat:45.4853,lng:12.4167,zone:'burano'},
  torcello:{name:'Torcello',lat:45.4987,lng:12.4177,zone:'torcello'}
};

const line1Order=['roma','ferrovia','rivadebiasio','sanmarcuola','sanstae','cadOro','rialtomercato','rialto','sansilvestro','santangelo','santoma','carezzonico','accademia','giglio','salute','sanmarcovallaresso','sanmarco','arsenale','giardini','santelena','lido'];
const line2Order=['sanmarco','sangiorgio','zitelle','redentore','palanca','zattere','sanbasilio','roma','ferrovia','rialto'];
const centralVapKeys=[...new Set([...line1Order,...line2Order,'ftnove'])];
const vapAliases={
  'arsenale':'arsenale','giardini':'giardini','biennale':'giardini','sant elena':'santelena','s. elena':'santelena','lido':'lido',
  'san marco':'sanmarco','s. marco':'sanmarco','san zaccaria':'sanmarco','s. zaccaria':'sanmarco','rialto':'rialto','rialto mercato':'rialtomercato',
  'ca d oro':'cadOro','ca’ d’oro':'cadOro','cà d’oro':'cadOro','san stae':'sanstae','s. stae':'sanstae','san marcuola':'sanmarcuola','s. marcuola':'sanmarcuola',
  'san toma':'santoma','san tomà':'santoma','s. tomà':'santoma','accademia':'accademia','salute':'salute','zattere':'zattere','san basilio':'sanbasilio',
  'piazzale roma':'roma','p.le roma':'roma','santa lucia':'ferrovia','s. lucia':'ferrovia','ferrovia':'ferrovia','fondamente nove':'ftnove','f.te nove':'ftnove',
  'san giorgio':'sangiorgio','zitelle':'zitelle','redentore':'redentore','giudecca palanca':'palanca','palanca':'palanca',
  'murano':'murano','burano':'burano','torcello':'torcello'
};

let vapGeo = null;


const starterState = {
  version: 4,
  config: {
    title: 'Bacaro Tour Venezia 2026',
    date: '2026-10-29',
    hotelName: 'Hotel / Check-in zona Rialto',
    hotelAddress: '',
    currentDay: 'day1'
  },
  participants: [{id:'andrea', name:'Andrea'}],
  tours: {
    day1: {
      name:'Giorno 1 · Bacaro Tour', subtitle:'Prologo + Tour Cannaregio',
      stops:[
        {id:'slucia',name:'Venezia S. Lucia',type:'transit',phase:'prologue',lat:45.4410,lng:12.3210,status:'todo',note:'Arrivo in treno'},
        {id:'lele',name:'Bacareto da Lele',type:'bacaro',phase:'prologue',lat:45.43755,lng:12.32126,status:'todo',fixed:true,note:'Tappa fissa del gruppo'},
        {id:'pre2',name:'Secondo bacaro pre-tour',type:'bacaro',phase:'prologue',lat:null,lng:null,status:'todo',fixed:true,note:'Da scegliere'},
        {id:'hotel',name:'Hotel / Check-in',type:'hotel',phase:'prologue',lat:null,lng:null,status:'todo',note:'Zona Rialto · da impostare'},
        {id:'vecio',name:'Hostaria Vecio Biavarol',type:'bacaro',phase:'official',lat:45.4387,lng:12.3214,status:'todo',optional:true},
        {id:'rivetta',name:'La Rivetta',type:'bacaro',phase:'official',lat:null,lng:null,status:'todo',optional:true,note:'Da verificare/posizionare'},
        {id:'lucafred',name:'Luca e Fred',type:'bacaro',phase:'official',lat:45.443718,lng:12.3262243,status:'todo'},
        {id:'docolonne',name:'Do Colonne',type:'bacaro',phase:'official',lat:45.4438,lng:12.3285,status:'todo'},
        {id:'cantina',name:'Cantina Aziende Agricole',type:'bacaro',phase:'official',lat:45.44476,lng:12.32897,status:'todo',optional:true},
        {id:'timon',name:'Al Timon',type:'bacaro',phase:'official',lat:45.4455545,lng:12.3284179,status:'todo'},
        {id:'adelaide',name:'Antica Adelaide',type:'bacaro',phase:'official',lat:45.4419918,lng:12.3341918,status:'todo'},
        {id:'vedova',name:"Ca' d'Oro · Alla Vedova",type:'bacaro',phase:'official',lat:45.4413942,lng:12.3345202,status:'todo'},
        {id:'promessi',name:'Ai Promessi Sposi',type:'bacaro',phase:'official',lat:45.4407458,lng:12.3359561,status:'todo'},
        {id:'apostoli',name:'Campo SS. Apostoli',type:'poi',phase:'official',lat:45.4407,lng:12.3370,status:'todo',note:'Fine tour ufficiale'}
      ]
    },
    day2: {name:'Giorno 2 · Isole & Venezia',subtitle:'Da costruire insieme',stops:[]}
  },
  drinks: [], ratings: {}, notes: {}, topEvents: [], activity: [], guideFavorites: [], customGuide: []
};

let state = clone(starterState);
let currentView = 'home';
let map = null;
let mapLayer = null;
let backendMode = 'local';
let firebaseApi = null;
let toastTimer = null;
let activeModalStopId = null;
let activeModalParticipantId = null;
let pendingPlaceStopId = null;
let guideFilter = 'all';
let hadLocalBeforeFirebase = false;
let lastSyncAt = null;
let ownerPromptShown = false;

const storageKey = 'bacaro-tour-2026-local';
const deviceParticipantKey = 'bacaro-tour-2026-device-person';

function normalizeState(raw){
  const out=clone(starterState); if(!raw || typeof raw!=='object') return out;
  out.config={...out.config,...(raw.config||{})};
  out.participants=Array.isArray(raw.participants)?raw.participants:out.participants;
  out.tours.day1={...out.tours.day1,...(raw.tours?.day1||{}),stops:Array.isArray(raw.tours?.day1?.stops)?raw.tours.day1.stops:out.tours.day1.stops};
  out.tours.day2={...out.tours.day2,...(raw.tours?.day2||{}),stops:Array.isArray(raw.tours?.day2?.stops)?raw.tours.day2.stops:out.tours.day2.stops};
  out.drinks=Array.isArray(raw.drinks)?raw.drinks:[];
  out.ratings=raw.ratings||{}; out.notes=raw.notes||{};
  out.topEvents=Array.isArray(raw.topEvents)?raw.topEvents:[];
  out.activity=Array.isArray(raw.activity)?raw.activity:[];
  out.guideFavorites=Array.isArray(raw.guideFavorites)?raw.guideFavorites:[];
  out.customGuide=Array.isArray(raw.customGuide)?raw.customGuide:[];
  out.version=4;
  return out;
}

function showToast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}
function iconForType(type){ return ({bacaro:'🍷',hotel:'🏨',poi:'📍',transit:'🚆'}[type]||'📍'); }
function phaseLabel(stop){ return stop.phase==='prologue'?'Prologo':'Tour ufficiale'; }
function participantName(id){ return state.participants.find(p=>p.id===id)?.name || 'Partecipante'; }
function deviceParticipantId(){ const id=localStorage.getItem(deviceParticipantKey); return state.participants.some(p=>p.id===id)?id:null; }
function stopById(id){ return [...state.tours.day1.stops,...state.tours.day2.stops].find(s=>s.id===id); }
function dayOfStop(id){ return state.tours.day1.stops.some(s=>s.id===id)?'day1':'day2'; }
function findStop(st,id){ return [...st.tours.day1.stops,...st.tours.day2.stops].find(s=>s.id===id); }

async function initBackend(){
  const saved = localStorage.getItem(storageKey);
  hadLocalBeforeFirebase = !!saved;
  if(saved){ try{ state=normalizeState(JSON.parse(saved)); }catch{} }
  const hasConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.databaseURL;
  if(!hasConfig){ backendMode='local'; updateSyncLabel(); return; }
  try{
    const [{initializeApp},{getDatabase,ref,onValue,runTransaction,get},{getAuth,signInAnonymously}] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')
    ]);
    const app=initializeApp(firebaseConfig);
    const auth=getAuth(app);
    await signInAnonymously(auth);
    const db=getDatabase(app); const rootRef=ref(db,sharedPath);
    firebaseApi={rootRef,runTransaction,onValue,get};

    const initial=await get(rootRef);
    if(initial.exists()){
      state=normalizeState(initial.val());
      localStorage.setItem(storageKey,JSON.stringify(state));
      backendMode='remote'; lastSyncAt=new Date();
    }else{
      // Non pubblichiamo nulla automaticamente: il telefono principale decide quando
      // migrare i dati RC6 su Firebase. In questo modo un telefono nuovo non può
      // inizializzare per errore un tour vuoto.
      backendMode='remote-wait';
    }

    onValue(rootRef, snap=>{
      if(snap.exists()){
        state=normalizeState(snap.val());
        localStorage.setItem(storageKey,JSON.stringify(state));
        backendMode='remote'; lastSyncAt=new Date();
        updateSyncLabel(); render();
        if(activeModalStopId && $('#modal')?.open) openStopModal(activeModalStopId,activeModalParticipantId);
        setTimeout(maybeAskDeviceOwner,180);
      }else{
        backendMode='remote-wait'; updateSyncLabel(); render();
      }
    });
  }catch(err){ console.error(err); backendMode='local'; updateSyncLabel('Firebase non disponibile · dati locali'); }
}

function updateSyncLabel(force){
  const el=$('#syncLabel'); if(!el) return;
  const txt = backendMode==='remote' ? `● ${APP_VERSION} · LIVE` : backendMode==='remote-wait' ? `● ${APP_VERSION} · Pronto` : `● ${APP_VERSION} · Locale`;
  el.textContent=force || txt;
  el.style.color=backendMode==='remote'?'#0d533b':backendMode==='remote-wait'?'#7d1027':'#8a6421';
}

async function activateSharing(){
  if(!firebaseApi){ showToast('Firebase non disponibile'); return; }
  if(backendMode==='remote'){ showToast('Condivisione già attiva'); return; }
  const snapshot=clone(state);
  try{
    await firebaseApi.runTransaction(firebaseApi.rootRef,current=>current || snapshot);
    showToast('Condivisione attivata');
  }catch(err){ console.error(err); showToast('Impossibile attivare la condivisione'); }
}

async function shareApp(){
  const url=`${location.origin}${location.pathname}`;
  const title='Bacaro Tour Venezia 2026';
  const text='Apri il Bacaro Tour condiviso e installalo sul telefono. Al primo avvio scegli il tuo nome.';
  try{
    if(navigator.share){ await navigator.share({title,text,url}); }
    else if(navigator.clipboard){ await navigator.clipboard.writeText(url); showToast('Link copiato'); }
    else{ prompt('Copia questo link',url); }
  }catch(err){ if(err?.name!=='AbortError') console.warn(err); }
}

function maybeAskDeviceOwner(){
  if(ownerPromptShown || backendMode!=='remote' || deviceParticipantId() || !state.participants?.length || $('#modal')?.open) return;
  ownerPromptShown=true; const m=$('#modal'); activeModalStopId=null;
  $('#modalBody').innerHTML=`<div class="modal-head"><div><div class="tiny muted">PRIMO AVVIO SU QUESTO TELEFONO</div><h2>📱 Di chi è questo telefono?</h2></div></div><div class="modal-content"><p class="muted">Serve solo per preselezionare la persona corretta quando registri una bevuta.</p><div class="owner-choice">${state.participants.map(p=>`<button class="primary-btn ghost" data-owner="${p.id}">${escapeHtml(p.name)}</button>`).join('')}</div><button class="small-btn" id="ownerLater">Più tardi</button></div>`;
  $$('[data-owner]',m).forEach(b=>b.addEventListener('click',()=>{localStorage.setItem(deviceParticipantKey,b.dataset.owner);m.close();showToast(`Telefono impostato: ${participantName(b.dataset.owner)}`);}));
  $('#ownerLater',m).addEventListener('click',()=>m.close()); if(!m.open)m.showModal();
}

async function mutate(mutator, activity=null){
  if(backendMode==='remote' && firebaseApi){
    await firebaseApi.runTransaction(firebaseApi.rootRef, current=>{
      const next=normalizeState(current||starterState); mutator(next); next.version=4;
      if(activity) next.activity=[...(next.activity||[]),{id:uid(),at:nowISO(),...activity}].slice(-350);
      return next;
    });
  }else{
    mutator(state); state.version=4;
    if(activity) state.activity=[...(state.activity||[]),{id:uid(),at:nowISO(),...activity}].slice(-350);
    localStorage.setItem(storageKey,JSON.stringify(state)); render();
  }
}

function render(){
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
  if(currentView==='home') renderHome();
  if(currentView==='map') renderMapView();
  if(currentView==='tour') renderTour();
  if(currentView==='diary') renderDiary();
  if(currentView==='guide') renderGuide();
  if(currentView==='vaporetto') renderVaporetto();
}

function renderHome(){
  const participants = state.participants?.length || 0;
  const completed=[...state.tours.day1.stops,...state.tours.day2.stops].filter(s=>s.status==='done'&&s.type==='bacaro').length;
  const next=(state.tours[state.config.currentDay||'day1'].stops||[]).find(s=>s.status==='todo');
  $('#mainView').innerHTML=`
    <div class="home-layout">
      <section class="hero"><div class="hero-inner">
        <img class="hero-logo" src="./logo.jpg" alt="Logo Bacaro Tour" />
        <h1>Bacaro Tour<br>Venezia 2026</h1>
        <p>29 ottobre · goliardia organizzata, mappa e diario condiviso.</p>
        <button class="primary-btn" data-go="tour">🍷 Entra nel Tour</button>
      </div></section>
      <div>
        ${next?`<section class="next-card"><div><span class="eyebrow">PROSSIMA TAPPA</span><h3>${escapeHtml(next.name)}</h3><div class="tiny muted">${state.config.currentDay==='day2'?'Giorno 2':phaseLabel(next)}</div></div><div class="next-actions"><button class="small-btn" data-open-next="${next.id}">Apri</button><button class="small-btn accent" data-nav-next="${next.id}">🚶 Vai</button></div></section>`:''}
        <div class="grid-4">
          <button class="quick-card" data-go="tour"><span>🍷</span><b>Tour 2026</b></button>
          <button class="quick-card" data-go="map"><span>🗺</span><b>Mappa</b></button>
          <button class="quick-card" data-go="guide"><span>🧭</span><b>Guida</b></button>
          <button class="quick-card" data-go="diary"><span>📖</span><b>Diario Live</b></button>
        </div>
        <h2 class="section-title">Servizi rapidi</h2>
        <div class="services">
          <button class="service" data-go="vaporetto"><span>🚤</span>Vaporetti</button>
          <a class="service" href="https://www.trenitalia.com/" target="_blank" rel="noopener"><span>🚆</span>Treni</a>
          <a class="service" href="https://www.google.com/maps/search/?api=1&query=Venezia" target="_blank" rel="noopener"><span>🚶</span>Mappa pedonale</a>
        </div>
        <section class="card day2-card" data-go="map" data-day="day2">
          <div class="day2-emoji">🏝️</div><div><h3>Giorno 2 · Isole</h3><div class="muted">Murano, Burano e tappe da creare.</div><div class="tiny" style="margin-top:4px">Mappa indipendente e modificabile</div></div>
        </section>
        <div class="stats-row" style="margin-top:14px">
          <div class="card stat"><b>${participants}</b><span>partecipanti</span></div>
          <div class="card stat"><b>${state.drinks?.length||0}</b><span>bevute</span></div>
          <div class="card stat"><b>${completed}</b><span>bacari fatti</span></div>
        </div>
      </div>
    </div>`;
  bindGoButtons();
  $('[data-open-next]')?.addEventListener('click',e=>openStopModal(e.currentTarget.dataset.openNext));
  $('[data-nav-next]')?.addEventListener('click',e=>navigateToStop(e.currentTarget.dataset.navNext));
}

function bindGoButtons(){
  $$('[data-go]').forEach(el=>el.addEventListener('click',()=>{
    if(el.dataset.day) state.config.currentDay=el.dataset.day;
    currentView=el.dataset.go; render();
  }));
}

function renderMapView(){
  const day=state.config.currentDay||'day1'; const placing=pendingPlaceStopId?stopById(pendingPlaceStopId):null;
  $('#mainView').innerHTML=`
    <div class="segmented"><button class="seg-btn ${day==='day1'?'active':''}" data-day="day1">Giorno 1</button><button class="seg-btn ${day==='day2'?'active':''}" data-day="day2">Giorno 2</button></div>
    ${placing?`<div class="placement-banner">📌 Tocca sulla mappa il punto di <strong>${escapeHtml(placing.name)}</strong><button id="cancelPlace">Annulla</button></div>`:''}
    <div class="map-toolbar">
      <button class="small-btn" id="locateBtn">📍 La mia posizione</button>
      <button class="small-btn" id="addStopBtn">➕ Aggiungi tappa</button>
      <button class="small-btn" id="listStopsBtn">☰ Modifica tour</button>
    </div>
    <div id="mapCanvas" aria-label="Mappa interattiva di Venezia"></div>
    <div class="map-legend"><span class="legend-chip">⭐ Fissa</span><span class="legend-chip">🍷 Bacaro</span><span class="legend-chip">🏨 Hotel</span><span class="legend-chip">📍 POI</span><span class="legend-chip">✓ Fatto</span></div>
    <div class="map-footer-actions"><button class="primary-btn wine" id="nextStopBtn">Prossima tappa</button><button class="primary-btn ghost" id="openExternalMapBtn">🚶 Mappa pedonale</button></div>`;
  $$('.seg-btn').forEach(b=>b.addEventListener('click',()=>{state.config.currentDay=b.dataset.day; pendingPlaceStopId=null; renderMapView();}));
  $('#locateBtn').addEventListener('click',locateMe);
  $('#addStopBtn').addEventListener('click',()=>openAddStopModal(day));
  $('#listStopsBtn').addEventListener('click',()=>openManageStops(day));
  $('#nextStopBtn').addEventListener('click',()=>focusNextStop(day));
  $('#openExternalMapBtn').addEventListener('click',()=>window.open('https://www.google.com/maps/search/?api=1&query=Venezia','_blank'));
  $('#cancelPlace')?.addEventListener('click',()=>{pendingPlaceStopId=null;renderMapView();});
  setTimeout(()=>initMap(day),0);
}

function initMap(day){
  const el=$('#mapCanvas'); if(!el || typeof L==='undefined'){ if(el) el.innerHTML='<div class="empty">Mappa non caricata. Controlla la connessione.</div>'; return; }
  if(map){ map.remove(); map=null; }
  map=L.map('mapCanvas',{zoomControl:true,doubleClickZoom:true}).setView([45.4416,12.3295],14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  mapLayer=L.layerGroup().addTo(map); drawTour(day);
  if(pendingPlaceStopId){
    map.getContainer().classList.add('placing');
    map.once('click',async e=>{
      const id=pendingPlaceStopId; pendingPlaceStopId=null;
      await mutate(st=>{const x=findStop(st,id); if(x){x.lat=e.latlng.lat;x.lng=e.latlng.lng;}},{kind:'system',title:'📌 Tappa posizionata',text:stopById(id)?.name||''});
      showToast('Tappa posizionata sulla mappa'); renderMapView();
    });
  }
}

function drawTour(day){
  if(!mapLayer) return; mapLayer.clearLayers();
  const stops=state.tours[day].stops||[]; const coords=[];
  stops.forEach((s,i)=>{
    if(s.lat==null||s.lng==null) return;
    const done=s.status==='done'; const skipped=s.status==='skipped';
    const pinSymbol=s.fixed?'⭐':iconForType(s.type);
    const icon=L.divIcon({className:'',html:`<div class="map-pin ${done?'done':skipped?'skip':''}"><span class="map-pin-symbol">${pinSymbol}</span><span class="map-seq">${i+1}</span></div>`,iconSize:[40,40],iconAnchor:[20,20]});
    const m=L.marker([s.lat,s.lng],{icon}).addTo(mapLayer);
    m.bindPopup(`<strong>${i+1}. ${escapeHtml(s.name)}</strong><br><span>${escapeHtml(phaseLabel(s))}</span><br><button onclick="window.__openStop('${s.id}')" style="margin-top:8px">Apri scheda</button>`);
    if(s.status!=='skipped') coords.push([s.lat,s.lng]);
  });
  // Non disegniamo linee rette tra le tappe: a Venezia sarebbero fuorvianti.
  // La navigazione reale a piedi resta affidata a “Portami qui / Mappa pedonale”.
  if(coords.length) map.fitBounds(coords,{padding:[25,25],maxZoom:15});
}
window.__openStop=(id)=>openStopModal(id);

function locateMe(){
  if(!navigator.geolocation){showToast('Geolocalizzazione non disponibile');return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    const ll=[pos.coords.latitude,pos.coords.longitude]; map?.setView(ll,16); L.circleMarker(ll,{radius:8,color:'#0d533b',fillColor:'#0d533b',fillOpacity:1}).addTo(map).bindPopup('Sei qui').openPopup();
  },()=>showToast('Posizione non disponibile: verifica i permessi'),{enableHighAccuracy:true,timeout:8000});
}

function focusNextStop(day){
  const s=(state.tours[day].stops||[]).find(x=>x.status==='todo'&&x.lat!=null);
  if(!s){showToast('Nessuna prossima tappa posizionata');return;} map?.setView([s.lat,s.lng],17); openStopModal(s.id);
}

function renderTour(){
  const day=state.config.currentDay||'day1'; const t=state.tours[day];
  $('#mainView').innerHTML=`
    <div class="segmented"><button class="seg-btn ${day==='day1'?'active':''}" data-day="day1">Giorno 1</button><button class="seg-btn ${day==='day2'?'active':''}" data-day="day2">Giorno 2</button></div>
    <h2 class="section-title" style="margin-top:6px">${escapeHtml(t.name)}</h2><p class="muted" style="margin-top:-7px">${escapeHtml(t.subtitle||'')}</p>
    <div class="actions-row" style="margin-bottom:12px"><button class="primary-btn green" id="addTourStop">➕ Aggiungi tappa</button><button class="primary-btn ghost" id="participantsBtn">👥 Partecipanti</button></div>
    <div class="stop-list">${t.stops.length?t.stops.map((s,i)=>stopCard(s,i)).join(''):'<div class="card empty">Nessuna tappa. Crea il Giorno 2 da zero con “Aggiungi tappa”.</div>'}</div>`;
  $$('.seg-btn').forEach(b=>b.addEventListener('click',()=>{state.config.currentDay=b.dataset.day; renderTour();}));
  $('#addTourStop').addEventListener('click',()=>openAddStopModal(day)); $('#participantsBtn').addEventListener('click',openSettings);
  $$('.stop-card').forEach(c=>c.addEventListener('click',e=>{if(!e.target.closest('button')) openStopModal(c.dataset.id)}));
  $$('[data-open-stop]').forEach(b=>b.addEventListener('click',()=>openStopModal(b.dataset.openStop)));
  $$('[data-nav-stop]').forEach(b=>b.addEventListener('click',()=>navigateToStop(b.dataset.navStop)));
}

function stopCard(s,i){
  const badges=[s.fixed?'<span class="badge fixed">⭐ Fissa</span>':'',s.phase==='prologue'?'<span class="badge prologue">Prologo</span>':'<span class="badge official">Tour</span>',s.optional?'<span class="badge optional">Opzionale</span>':'',s.status==='done'?'<span class="badge done">✓ Fatto</span>':'',s.status==='skipped'?'<span class="badge skip">Saltato</span>':''].join('');
  const drinks=(state.drinks||[]).filter(d=>d.stopId===s.id).length;
  const drinkText=s.type==='bacaro'?`${drinks} bevut${drinks===1?'a':'e'} registrat${drinks===1?'a':'e'}`:phaseLabel(s);
  return `<article class="card stop-card" data-id="${s.id}"><div class="stop-icon">${s.fixed?'⭐':iconForType(s.type)}</div><div><h3>${i+1}. ${escapeHtml(s.name)}</h3><div class="tiny muted">${s.lat==null?'📌 Da posizionare sulla mappa':drinkText}</div><div class="badges">${badges}</div></div><div class="stop-actions"><button class="mini-icon" data-open-stop="${s.id}" aria-label="Apri">›</button><button class="mini-icon" data-nav-stop="${s.id}" aria-label="Naviga">🚶</button></div></article>`;
}

function destinationQuery(s){ return s.lat!=null?`${s.lat},${s.lng}`:(s.mapQuery||`${s.name}, Venezia`); }
function navigateToStop(id,mode='walking'){
  const s=stopById(id); if(!s) return;
  if(mode==='transit'){
    $('#modal')?.close(); activeModalStopId=null; currentView='vaporetto';
    window.__vapPrefill={label:s.name,lat:s.lat,lng:s.lng,query:destinationQuery(s)}; render(); return;
  }
  const q=destinationQuery(s);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}&travelmode=walking`,'_blank');
}

function renderDiary(){
  const drinkEvents=(state.drinks||[]).map(d=>({at:d.at,title:`${participantName(d.participantId)} · ${d.type}`,text:stopById(d.stopId)?.name||'',kind:'drink'}));
  const topEvents=(state.topEvents||[]).map(e=>({at:e.at,title:`⭐ ${e.title||'Top Event'}`,text:`${stopById(e.stopId)?.name||''} · ${e.text||''}`,kind:'top'}));
  const generic=(state.activity||[]).filter(a=>!isLegacyDrinkActivity(a) && !String(a.title||'').startsWith('⭐'));
  const sorted=[...generic,...drinkEvents,...topEvents].sort((a,b)=>new Date(a.at)-new Date(b.at));
  const bacariDone=[...state.tours.day1.stops,...state.tours.day2.stops].filter(s=>s.type==='bacaro'&&s.status==='done').length;
  $('#mainView').innerHTML=`
    <h2 class="section-title" style="margin-top:4px">Diario Live</h2>
    <div class="stats-row"><div class="card stat"><b>${state.drinks?.length||0}</b><span>bevute registrate</span></div><div class="card stat"><b>${bacariDone}</b><span>bacari fatti</span></div><div class="card stat"><b>${state.topEvents?.length||0}</b><span>Top Event</span></div></div>
    <h3 class="section-title">Bevute per partecipante</h3>
    <div class="card summary-card">${state.participants.length?state.participants.map(p=>participantSummary(p)).join(''):'<div class="empty">Aggiungi i partecipanti.</div>'}</div>
    <h3 class="section-title">Cronologia</h3><div class="timeline">${sorted.length?sorted.map(activityEvent).join(''):'<div class="empty">Il diario si riempirà automaticamente durante il tour.</div>'}</div>`;
}

function isLegacyDrinkActivity(a){
  const t=String(a.title||''); const drinkNames=['Ombra bianca','Ombra rossa','Spritz','Birra','Prosecco','Altro'];
  return drinkNames.some(x=>t.endsWith(`· ${x}`) || t.includes(`· ${x} ·`));
}
function participantSummary(p){
  const ds=(state.drinks||[]).filter(d=>d.participantId===p.id); const counts={}; ds.forEach(d=>counts[d.type]=(counts[d.type]||0)+1);
  const detail=Object.entries(counts).map(([k,v])=>`${v} ${k}`).join(' · ') || 'Nessuna bevuta';
  return `<div class="person-summary"><strong>${escapeHtml(p.name)}</strong> <span>${ds.length}</span><div class="tiny muted">${escapeHtml(detail)}</div></div>`;
}
function activityEvent(a){ return `<div class="event"><time>${fmtTime(a.at)}</time><h4>${escapeHtml(a.title||'Evento')}</h4><p>${escapeHtml(a.text||'')}</p></div>`; }

function stopDrinkCounts(stopId,participantId){
  const counts={}; (state.drinks||[]).filter(d=>d.stopId===stopId&&d.participantId===participantId).forEach(d=>counts[d.type]=(counts[d.type]||0)+1); return counts;
}
function stopDrinkSummaryHtml(stopId){
  if(!state.participants.length) return '<div class="empty compact">Aggiungi i partecipanti.</div>';
  return state.participants.map(p=>{
    const counts=stopDrinkCounts(stopId,p.id); const entries=Object.entries(counts);
    return `<div class="drink-person-row"><div class="drink-person-name"><strong>${escapeHtml(p.name)}</strong><span>${entries.reduce((a,[,v])=>a+v,0)}</span></div><div class="drink-tags">${entries.length?entries.map(([type,n])=>`<span class="drink-tag">${escapeHtml(type)} ×${n}<button data-minus-drink="${attr(type)}" data-minus-person="${p.id}" title="Togli una bevuta">−</button></span>`).join(''):'<span class="tiny muted">Nessuna bevuta</span>'}</div></div>`;
  }).join('');
}
function drinkButtons(stopId,active){
  const defaults=['Ombra bianca','Ombra rossa','Spritz','Birra','Prosecco','Altro']; const counts=active?stopDrinkCounts(stopId,active):{};
  return defaults.map(x=>`<button class="drink-btn" data-drink="${x}"><strong>${x}</strong><span>${x==='Altro'?'＋':`＋ ${counts[x]||0}`}</span></button>`).join('');
}

function openStopModal(id,preferredParticipant=null){
  const s=stopById(id); if(!s) return; const day=dayOfStop(id); const participants=state.participants||[];
  activeModalStopId=id; activeModalParticipantId=preferredParticipant||activeModalParticipantId||deviceParticipantId()||participants[0]?.id||null;
  if(!participants.some(p=>p.id===activeModalParticipantId)) activeModalParticipantId=participants[0]?.id||null;
  const m=$('#modal'); const ratings=state.ratings?.[id]||{}; const notes=state.notes?.[id]||{};
  const tops=(state.topEvents||[]).filter(e=>e.stopId===id).sort((a,b)=>new Date(b.at)-new Date(a.at));
  $('#modalBody').innerHTML=`
    <div class="modal-head"><div><div class="tiny muted">${day==='day1'?'Giorno 1':'Giorno 2'} · ${escapeHtml(phaseLabel(s))}</div><h2>${escapeHtml(s.name)}</h2></div><button class="close-btn" data-close>✕</button></div>
    <div class="modal-content">
      <div class="actions-row"><button class="primary-btn ${s.status==='done'?'green':'wine'}" id="visitBtn">${s.status==='done'?'✓ Fatto':'🍷 Siamo qui'}</button><button class="primary-btn ghost" id="navBtn">🚶 A piedi</button><button class="primary-btn ghost" id="transitBtn">🚤 Vaporetto</button></div>
      ${s.type==='bacaro'?`
        <h3 class="section-title">Bevute in questo bacaro</h3><div class="drink-stop-summary" id="drinkStopSummary">${stopDrinkSummaryHtml(id)}</div>
        <h3 class="section-title">Registra bevuta</h3>
        <div class="participant-tabs">${participants.length?participants.map(p=>`<button class="pill ${p.id===activeModalParticipantId?'active':''}" data-person="${p.id}">${escapeHtml(p.name)}</button>`).join(''):'<button class="pill" id="addPeopleNow">+ Partecipanti</button>'}</div>
        <div class="drink-grid" id="drinkGrid" style="margin-top:10px">${drinkButtons(id,activeModalParticipantId)}</div>
        <details class="collapsible"><summary>⭐ Valutazione e nota personale</summary><div class="collapsible-body"><div class="rating" id="ratingStars">${[1,2,3,4,5].map(n=>`<button class="star" data-star="${n}">★</button>`).join('')}</div><div class="form-row"><label>Nota personale<textarea id="personalNote" placeholder="Una frase, un ricordo, una nota sul bacaro…"></textarea></label><button class="primary-btn ghost" id="saveNoteBtn">Salva nota</button></div></div></details>
        <details class="collapsible"><summary>🏆 Top Event ${tops.length?`<span class="summary-count">${tops.length}</span>`:''}</summary><div class="collapsible-body"><div class="top-event-box"><input id="topTitle" placeholder="Titolo del Top Event" /><textarea id="topText" placeholder="Che cosa è successo?"></textarea><button class="primary-btn gold" id="topEventBtn">⭐ Aggiungi Top Event</button></div>${tops.length?`<div class="top-list">${tops.map(e=>`<div class="top-item"><div><strong>⭐ ${escapeHtml(e.title)}</strong><div class="tiny muted">${fmtTime(e.at)} · ${escapeHtml(e.text)}</div></div><div><button class="mini-icon" data-edit-top="${e.id}">✏️</button><button class="mini-icon" data-delete-top="${e.id}">🗑</button></div></div>`).join('')}</div>`:''}</div></details>
      `:''}
      <details class="collapsible"><summary>⚙️ Gestione tappa</summary><div class="collapsible-body"><div class="actions-row"><button class="primary-btn ghost" id="skipBtn">${s.status==='skipped'?'↩ Ripristina':'Salta tappa'}</button><button class="primary-btn ghost" id="editStopBtn">✏️ Modifica</button><button class="primary-btn ghost" id="placeStopBtn">📌 ${s.lat==null?'Posiziona':'Sposta'} sulla mappa</button></div></div></details>
    </div>`;
  bindModalClose(m); $('#navBtn').addEventListener('click',()=>navigateToStop(id,'walking')); $('#transitBtn').addEventListener('click',()=>navigateToStop(id,'transit'));
  $('#visitBtn').addEventListener('click',async()=>{const was=s.status==='done';await mutate(st=>{const x=findStop(st,id); if(x)x.status=was?'todo':'done';},{kind:'status',title:was?`Tappa riaperta: ${s.name}`:`${s.name}`,text:s.type==='bacaro'?'Bacaro segnato come visitato':'Tappa completata'}); showToast('Aggiornato'); openStopModal(id,activeModalParticipantId);});
  $('#skipBtn').addEventListener('click',async()=>{const was=s.status==='skipped';await mutate(st=>{const x=findStop(st,id); if(x)x.status=was?'todo':'skipped';},{kind:'status',title:'Tour aggiornato',text:`${s.name}: ${was?'ripristinata':'saltata'}`});openStopModal(id,activeModalParticipantId);});
  $('#editStopBtn').addEventListener('click',()=>{m.close();activeModalStopId=null;openEditStopModal(id)});
  $('#placeStopBtn').addEventListener('click',()=>{m.close();activeModalStopId=null;pendingPlaceStopId=id;currentView='map';state.config.currentDay=day;render();});
  if(s.type==='bacaro') setupBacaroControls(id,participants,ratings,notes);
  if(!m.open) m.showModal();
}

function setupBacaroControls(stopId,participants,ratings,notes){
  let active=activeModalParticipantId||participants[0]?.id||null;
  const refreshPerson=()=>{
    activeModalParticipantId=active;
    $$('.pill[data-person]').forEach(x=>x.classList.toggle('active',x.dataset.person===active));
    const r=state.ratings?.[stopId]?.[active]||ratings?.[active]||0; $$('.star').forEach(x=>x.classList.toggle('on',Number(x.dataset.star)<=r));
    if($('#personalNote')) $('#personalNote').value=state.notes?.[stopId]?.[active]||notes?.[active]||'';
    if($('#drinkGrid')) $('#drinkGrid').innerHTML=drinkButtons(stopId,active);
    bindDrinkAddButtons(stopId,()=>active);
  };
  $$('.pill[data-person]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.person;refreshPerson();}));
  bindDrinkAddButtons(stopId,()=>active);
  $$('[data-minus-drink]').forEach(b=>b.addEventListener('click',async()=>{
    const person=b.dataset.minusPerson,type=b.dataset.minusDrink;
    await mutate(st=>{const matches=(st.drinks||[]).filter(d=>d.stopId===stopId&&d.participantId===person&&d.type===type).sort((a,b)=>new Date(b.at)-new Date(a.at)); const target=matches[0]; if(target) st.drinks=st.drinks.filter(d=>d.id!==target.id);});
    showToast(`Tolto 1 ${type}`); openStopModal(stopId,active);
  }));
  $$('.star').forEach(b=>b.addEventListener('click',async()=>{if(!active)return;const val=Number(b.dataset.star);await mutate(st=>{st.ratings=st.ratings||{};st.ratings[stopId]=st.ratings[stopId]||{};st.ratings[stopId][active]=val;});openStopModal(stopId,active);}));
  $('#saveNoteBtn')?.addEventListener('click',async()=>{if(!active)return;const txt=$('#personalNote').value.trim();await mutate(st=>{st.notes=st.notes||{};st.notes[stopId]=st.notes[stopId]||{};st.notes[stopId][active]=txt;});showToast('Nota salvata');});
  $('#topEventBtn')?.addEventListener('click',async()=>{const title=$('#topTitle').value.trim()||'Top Event';const text=$('#topText').value.trim();if(!text){showToast('Scrivi cosa è successo');return;}await mutate(st=>{st.topEvents=st.topEvents||[];st.topEvents.push({id:uid(),stopId,title,text,at:nowISO()});});showToast('Top Event aggiunto');openStopModal(stopId,active);});
  $$('[data-delete-top]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Eliminare questo Top Event?'))return;await mutate(st=>{st.topEvents=(st.topEvents||[]).filter(e=>e.id!==b.dataset.deleteTop);});openStopModal(stopId,active);}));
  $$('[data-edit-top]').forEach(b=>b.addEventListener('click',async()=>{const e=(state.topEvents||[]).find(x=>x.id===b.dataset.editTop);if(!e)return;const title=prompt('Titolo Top Event',e.title)||e.title;const text=prompt('Cosa è successo?',e.text);if(text===null)return;await mutate(st=>{const x=(st.topEvents||[]).find(y=>y.id===e.id);if(x){x.title=title;x.text=text;}});openStopModal(stopId,active);}));
  if($('#addPeopleNow')) $('#addPeopleNow').addEventListener('click',()=>{$('#modal').close();activeModalStopId=null;openSettings()});
  refreshPerson();
}

function bindDrinkAddButtons(stopId,getActive){
  $$('.drink-btn').forEach(b=>b.addEventListener('click',async()=>{
    const active=getActive(); if(!active){showToast('Aggiungi prima i partecipanti');return;}
    let type=b.dataset.drink; if(type==='Altro'){const custom=prompt('Cosa hai bevuto? (es. Bellini, Select, Grappa...)',''); if(!custom?.trim()) return; type=custom.trim();}
    const drinkId=uid(); await mutate(st=>{st.drinks=st.drinks||[];st.drinks.push({id:drinkId,stopId,participantId:active,type,at:nowISO()});const x=findStop(st,stopId);if(x&&x.type==='bacaro'&&x.status!=='done')x.status='done';});
    showToast(`${type} registrata · bacaro segnato fatto`); openStopModal(stopId,active);
  }));
}

async function searchVenicePlaces(query){
  const q=(query||'').trim(); if(!q) return [];
  const url=new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format','jsonv2');
  url.searchParams.set('q',`${q}, Venezia, Italia`);
  url.searchParams.set('limit','6');
  url.searchParams.set('countrycodes','it');
  url.searchParams.set('addressdetails','1');
  url.searchParams.set('accept-language','it');
  const r=await fetch(url.toString(),{headers:{'Accept':'application/json'}});
  if(!r.ok) throw new Error('Ricerca luogo non disponibile');
  return (await r.json()).map(x=>({lat:+x.lat,lng:+x.lon,label:x.display_name||q})).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lng));
}

function shortPlaceLabel(label){
  const parts=String(label||'').split(',').map(x=>x.trim()).filter(Boolean);
  return parts.slice(0,4).join(', ');
}

function bindStopPlaceSearch({inputId,buttonId,resultsId,statusId,onPick}){
  const input=$(inputId), button=$(buttonId), results=$(resultsId), status=$(statusId);
  const run=async()=>{
    const q=input?.value.trim(); if(!q){showToast('Scrivi prima il nome del luogo');return;}
    button.disabled=true; button.textContent='🔎 Cerco…';
    status.textContent='Ricerca in corso…'; results.innerHTML='';
    try{
      const found=await searchVenicePlaces(q);
      if(!found.length){status.textContent='Nessun risultato. Puoi comunque posizionarlo manualmente sulla mappa.';return;}
      status.textContent='Tocca il risultato corretto:';
      results.innerHTML=found.map((x,i)=>`<button class="place-result" data-place-result="${i}"><strong>${escapeHtml(shortPlaceLabel(x.label))}</strong><span>${escapeHtml(x.label)}</span></button>`).join('');
      $$('[data-place-result]',results).forEach(b=>b.addEventListener('click',()=>{
        const x=found[+b.dataset.placeResult]; if(!x)return; onPick(x);
        results.innerHTML=''; status.innerHTML=`✅ Posizione trovata: <strong>${escapeHtml(shortPlaceLabel(x.label))}</strong>`;
      }));
    }catch(e){status.textContent='Ricerca non disponibile. Usa “Posiziona sulla mappa”.';}
    finally{button.disabled=false; button.textContent='🔎 Trova sulla mappa';}
  };
  button?.addEventListener('click',run);
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}});
}

function openAddStopModal(day,latlng=null){
  const m=$('#modal'); activeModalStopId=null; let chosen=latlng?{lat:latlng.lat,lng:latlng.lng,label:''}:null;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Aggiungi tappa</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="form-row"><label>Nome<input id="newStopName" placeholder="Es. Trattoria Bar Pontini"></label><div class="place-search-row"><button class="primary-btn green" id="newFindPlace">🔎 Trova sulla mappa</button><div class="tiny muted" id="newPlaceStatus">Scrivi il nome: l’app prova a trovare automaticamente il punto esatto.</div></div><div id="newPlaceResults" class="place-results"></div><label>Tipo<select id="newStopType"><option value="bacaro">🍷 Bacaro</option><option value="poi">📍 Punto d'interesse</option><option value="hotel">🏨 Hotel</option><option value="transit">🚤/🚆 Trasporto</option></select></label><label>Fase<select id="newStopPhase"><option value="official">Tour</option><option value="prologue">Prologo</option></select></label><label>Nota<textarea id="newStopNote" placeholder="Facoltativo"></textarea></label></div><p class="tiny muted">Se la ricerca non trova il posto giusto, salvalo e usa poi “📌 Posiziona sulla mappa” per correggerlo a mano.</p><button class="primary-btn wine" id="saveNewStop">Salva tappa</button></div>`;
  bindModalClose(m);
  bindStopPlaceSearch({inputId:'#newStopName',buttonId:'#newFindPlace',resultsId:'#newPlaceResults',statusId:'#newPlaceStatus',onPick:x=>chosen=x});
  $('#saveNewStop').addEventListener('click',async()=>{const name=$('#newStopName').value.trim();if(!name){showToast('Inserisci il nome');return;}const obj={id:uid(),name,type:$('#newStopType').value,phase:$('#newStopPhase').value,lat:chosen?.lat??null,lng:chosen?.lng??null,mapQuery:chosen?.label||`${name}, Venezia`,status:'todo',note:$('#newStopNote').value.trim()};await mutate(st=>st.tours[day].stops.push(obj),{kind:'system',title:`Nuova tappa: ${name}`,text:day==='day1'?'Giorno 1':'Giorno 2'});m.close();showToast(chosen?'Tappa aggiunta e posizionata':'Tappa aggiunta · posizione da impostare');}); if(!m.open)m.showModal();
}

function openEditStopModal(id){
  const s=stopById(id), day=dayOfStop(id), m=$('#modal'); if(!s)return; activeModalStopId=null; let chosen=(s.lat!=null&&s.lng!=null)?{lat:s.lat,lng:s.lng,label:s.mapQuery||s.name}:null;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Modifica tappa</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="form-row"><label>Nome<input id="editName" value="${attr(s.name)}"></label><div class="place-search-row"><button class="primary-btn green" id="editFindPlace">🔎 Trova sulla mappa</button><div class="tiny muted" id="editPlaceStatus">${s.lat!=null?'📍 Posizione già impostata. Cerca di nuovo solo se vuoi correggerla.':'Cerca il luogo per posizionarlo automaticamente.'}</div></div><div id="editPlaceResults" class="place-results"></div><label>Tipo<select id="editType">${['bacaro','poi','hotel','transit'].map(x=>`<option value="${x}" ${s.type===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Nota<textarea id="editNote">${escapeHtml(s.note||'')}</textarea></label><label><input type="checkbox" id="editFixed" ${s.fixed?'checked':''}> Tappa fissa</label><label><input type="checkbox" id="editOptional" ${s.optional?'checked':''}> Opzionale</label></div><div class="actions-row"><button class="primary-btn wine" id="saveEdit">Salva</button><button class="primary-btn ghost" id="moveOnMap">📌 ${s.lat==null?'Posiziona':'Correggi'} a mano</button><button class="primary-btn ghost" id="deleteStop">🗑 Elimina</button></div></div>`;
  bindModalClose(m);
  bindStopPlaceSearch({inputId:'#editName',buttonId:'#editFindPlace',resultsId:'#editPlaceResults',statusId:'#editPlaceStatus',onPick:x=>chosen=x});
  $('#saveEdit').addEventListener('click',async()=>{await mutate(st=>{const x=findStop(st,id);x.name=$('#editName').value.trim()||x.name;x.type=$('#editType').value;x.note=$('#editNote').value.trim();x.fixed=$('#editFixed').checked;x.optional=$('#editOptional').checked;if(chosen){x.lat=chosen.lat;x.lng=chosen.lng;x.mapQuery=chosen.label||`${x.name}, Venezia`;}},{kind:'system',title:'Tappa modificata',text:$('#editName').value.trim()});m.close();showToast('Tappa salvata');});
  $('#moveOnMap').addEventListener('click',()=>{m.close();pendingPlaceStopId=id;currentView='map';state.config.currentDay=day;render();});
  $('#deleteStop').addEventListener('click',async()=>{if(!confirm('Eliminare questa tappa?'))return;await mutate(st=>{st.tours[day].stops=st.tours[day].stops.filter(x=>x.id!==id);st.drinks=(st.drinks||[]).filter(d=>d.stopId!==id);st.topEvents=(st.topEvents||[]).filter(e=>e.stopId!==id);},{kind:'system',title:'Tappa eliminata',text:s.name});m.close();}); if(!m.open)m.showModal();
}

function openManageStops(day){
  const t=state.tours[day],m=$('#modal'); activeModalStopId=null;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Modifica ordine</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><p class="muted tiny">Sposta le tappe su/giù. Le modifiche saranno condivise quando attiveremo Firebase.</p><div class="stop-list">${t.stops.map((s,i)=>`<div class="card stop-card"><div class="stop-icon">${i+1}</div><div><h3>${escapeHtml(s.name)}</h3><div class="tiny muted">${s.lat==null?'Da posizionare':'Posizionata'}</div></div><div class="stop-actions"><button class="mini-icon" data-move="up" data-id="${s.id}">↑</button><button class="mini-icon" data-move="down" data-id="${s.id}">↓</button></div></div>`).join('')}</div></div>`;
  bindModalClose(m); $$('[data-move]').forEach(b=>b.addEventListener('click',async()=>{await mutate(st=>{const arr=st.tours[day].stops,idx=arr.findIndex(x=>x.id===b.dataset.id),to=b.dataset.move==='up'?idx-1:idx+1;if(idx<0||to<0||to>=arr.length)return;[arr[idx],arr[to]]=[arr[to],arr[idx]];});m.close();openManageStops(day);})); if(!m.open)m.showModal();
}

function allGuideItems(){ return [...guideCatalog,...(state.customGuide||[])]; }
function renderGuide(){
  const cats=[['all','Tutto'],['visit','📍 Da vedere'],['bacaro','🍷 Bacari'],['shop','🛍 Botteghe'],['fav','❤️ Salvati']];
  const catalog=allGuideItems();
  const items=catalog.filter(x=>guideFilter==='all'?true:guideFilter==='fav'?state.guideFavorites.includes(x.id):x.category===guideFilter);
  $('#mainView').innerHTML=`<div class="page-head guide-focus"><div><span class="eyebrow">GIORNO 1 · VICINO AL TOUR</span><h2>🧭 Piccole deviazioni, zero stress</h2><p>Solo cose raggiungibili a piedi mentre siete già in zona. Niente vaporetti e niente giri che vi portano lontano.</p></div><button class="small-btn guide-add-custom" id="addGuideCustom">＋ Aggiungi luogo</button></div>
  <div class="guide-tabs">${cats.map(([id,label])=>`<button class="pill ${guideFilter===id?'active':''}" data-guide-filter="${id}">${label}</button>`).join('')}</div>
  <div class="guide-grid">${items.length?items.map(guideCard).join(''):'<div class="card empty">Nessun elemento in questa sezione.</div>'}</div>`;
  $$('[data-guide-filter]').forEach(b=>b.addEventListener('click',()=>{guideFilter=b.dataset.guideFilter;renderGuide();}));
  $$('[data-guide-map]').forEach(b=>b.addEventListener('click',()=>{const item=allGuideItems().find(x=>x.id===b.dataset.guideMap);if(!item)return;window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.query||item.name+', Venezia')}&travelmode=walking`,'_blank');}));
  $$('[data-guide-fav]').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.guideFav;await mutate(st=>{st.guideFavorites=st.guideFavorites||[];st.guideFavorites=st.guideFavorites.includes(id)?st.guideFavorites.filter(x=>x!==id):[...st.guideFavorites,id];});renderGuide();}));
  $$('[data-guide-add]').forEach(b=>b.addEventListener('click',async()=>{const item=allGuideItems().find(x=>x.id===b.dataset.guideAdd);if(item)await addGuidePlace(item,'day1');}));
  $$('[data-guide-delete]').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.guideDelete;if(!confirm('Eliminare questo luogo dalla Guida?'))return;await mutate(st=>{st.customGuide=(st.customGuide||[]).filter(x=>x.id!==id);st.guideFavorites=(st.guideFavorites||[]).filter(x=>x!==id);});renderGuide();}));
  $('#addGuideCustom')?.addEventListener('click',openAddGuideItemModal);
}
function guideCard(item){
  const fav=state.guideFavorites.includes(item.id), custom=!!item.custom;
  return `<article class="card guide-card"><div class="guide-icon">${item.icon||'📍'}</div><div class="guide-main"><div class="guide-meta">${escapeHtml(item.area||'Cannaregio')} · ${escapeHtml(item.detour||'Vicino al tour')}</div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.desc||'')}</p><div class="guide-actions"><button class="small-btn" data-guide-map="${item.id}">🚶 Portami qui</button><button class="small-btn accent" data-guide-add="${item.id}">＋ Tour</button><button class="small-btn ${fav?'active':''}" data-guide-fav="${item.id}">${fav?'♥':'♡'}</button>${custom?`<button class="small-btn" data-guide-delete="${item.id}">🗑</button>`:''}</div></div></article>`;
}
async function addGuidePlace(item,day='day1'){
  const exists=state.tours[day].stops.some(s=>s.guideId===item.id || s.name===item.name); if(exists){showToast('È già presente nel tour');return;}
  await mutate(st=>st.tours[day].stops.push({id:uid(),guideId:item.id,name:item.name,type:item.type||'poi',phase:'official',lat:item.lat??null,lng:item.lng??null,mapQuery:item.query||`${item.name}, Venezia`,status:'todo',fixed:!!item.fixed,note:item.desc||''}),{kind:'system',title:'Guida → Giorno 1',text:item.name});
  showToast(`${item.name} aggiunto al tour`);
}
function openAddGuideItemModal(){
  const m=$('#modal'); activeModalStopId=null;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>＋ Aggiungi alla Guida</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="form-row"><label>Nome<input id="guideNewName" placeholder="Es. una bottega, un bacaro, una curiosità"></label><label>Categoria<select id="guideNewCategory"><option value="visit">📍 Da vedere</option><option value="bacaro">🍷 Bacaro</option><option value="shop">🛍 Bottega</option></select></label><label>Zona<input id="guideNewArea" placeholder="Es. Cannaregio"></label><label>Ricerca Maps<input id="guideNewQuery" placeholder="Nome luogo + Venezia"></label><label>Nota<textarea id="guideNewDesc" placeholder="Perché vale una deviazione?"></textarea></label></div><button class="primary-btn wine" id="saveGuideNew">Salva nella Guida</button></div>`;
  bindModalClose(m);
  $('#saveGuideNew').addEventListener('click',async()=>{const name=$('#guideNewName').value.trim();if(!name){showToast('Inserisci il nome');return;}const cat=$('#guideNewCategory').value;const icons={visit:'📍',bacaro:'🍷',shop:'🛍️'};await mutate(st=>{st.customGuide=st.customGuide||[];st.customGuide.push({id:uid(),custom:true,category:cat,icon:icons[cat],name,area:$('#guideNewArea').value.trim()||'Cannaregio',detour:'Aggiunto da noi',query:$('#guideNewQuery').value.trim()||`${name}, Venezia`,desc:$('#guideNewDesc').value.trim(),type:cat==='bacaro'?'bacaro':'poi'});});m.close();showToast('Aggiunto alla Guida');renderGuide();});
  if(!m.open)m.showModal();
}

function renderVaporetto(){
  const fromOpts=`<option value="current">📍 Posizione attuale</option><option value="hotel">🏨 Hotel</option><option value="roma">🚏 P.le Roma</option><option value="ferrovia">🚆 Ferrovia / S. Lucia</option><option value="rialto">🌉 Rialto</option><option value="sanmarco">🦁 S. Marco / S. Zaccaria</option><option value="ftnove">🚤 Fondamente Nove</option><option value="murano">🏝️ Murano Faro</option><option value="burano">🏝️ Burano</option><option value="torcello">🏝️ Torcello</option>`;
  const toOpts=`<option value="burano">🏝️ Burano</option><option value="murano">🏝️ Murano Faro</option><option value="torcello">🏝️ Torcello</option><option value="ferrovia">🚆 Ferrovia / S. Lucia</option><option value="rialto">🌉 Rialto</option><option value="sanmarco">🦁 S. Marco / S. Zaccaria</option><option value="ftnove">🚤 Fondamente Nove</option><option value="arsenale">⚓ Arsenale</option><option value="giardini">🌳 Giardini / Biennale</option><option value="sangiorgio">⛪ San Giorgio</option><option value="redentore">⛪ Redentore</option><option value="palanca">📍 Giudecca Palanca</option><option value="free">🔎 Altro luogo…</option>`;
  const knownNames=Object.values(vapStops).map(x=>x.name);
  $('#mainView').innerHTML=`<div class="page-head transport-head compact"><div><h2>🚤 Mezzi · Muoviti veloce</h2><p>Imbarco giusto → linea → dove scendere.</p></div></div>
    <div class="quick-destinations"><button class="transport-chip" data-vap-quick="arsenale">⚓ Arsenale</button><button class="transport-chip" data-vap-quick="murano">🏝️ Murano</button><button class="transport-chip" data-vap-quick="burano">🏝️ Burano</button><button class="transport-chip" data-vap-quick="ftnove">🚤 F.te Nove</button><button class="transport-chip danger" data-vap-quick="ferrovia">🚆 S. Lucia</button></div>
    <section class="card planner-card transport-planner">
      <div class="planner-title"><div><span class="eyebrow">PERCORSO RAPIDO</span><h3>Da dove → dove</h3></div></div>
      <div class="planner-grid"><label>Partenza<select id="vapFrom">${fromOpts}</select></label><label>Destinazione<select id="vapTo">${toOpts}</select></label></div>
      <div id="vapFreeBox" class="free-destination" hidden><label>Scrivi il luogo<input id="vapFreeText" list="vapKnownPlaces" placeholder="Es. Arsenale, Accademia, Redentore…"></label><datalist id="vapKnownPlaces">${knownNames.map(n=>`<option value="${attr(n)}"></option>`).join('')}</datalist><button class="small-btn" id="vapPickMapBtn">🗺 Scegli sulla mappa</button></div>
      <button class="primary-btn green transport-calc" id="vapCalc">⚡ Calcola percorso</button>
      <div id="vapAdvice" class="transport-result"><div class="transport-placeholder">Scegli partenza e destinazione.</div></div>
    </section>`;
  $('#vapFrom').value='current'; $('#vapTo').value='burano';
  const pre=window.__vapPrefill;
  if(pre){ $('#vapTo').value='free'; $('#vapFreeBox').hidden=false; $('#vapFreeText').value=pre.label||''; if(pre.lat!=null&&pre.lng!=null) window.__vapCustomDest={lat:pre.lat,lng:pre.lng,label:pre.label||'Destinazione'}; else window.__vapCustomDest=null; window.__vapPrefill=null; }
  $('#vapCalc').addEventListener('click',calculateVapRoute);
  $('#vapPickMapBtn').addEventListener('click',openVapDestinationPicker);
  $$('[data-vap-quick]').forEach(b=>b.addEventListener('click',()=>{$('#vapTo').value=b.dataset.vapQuick;$('#vapFreeBox').hidden=true;window.__vapCustomDest=null;calculateVapRoute();}));
  $('#vapFrom').addEventListener('change',resetVapAdvice);
  $('#vapTo').addEventListener('change',()=>{const free=$('#vapTo').value==='free';$('#vapFreeBox').hidden=!free;if(!free)window.__vapCustomDest=null;resetVapAdvice();});
  $('#vapFreeText')?.addEventListener('input',()=>{window.__vapCustomDest=null;resetVapAdvice();});
  if(pre) setTimeout(calculateVapRoute,50);
}
function resetVapAdvice(){ const r=$('#vapAdvice');if(r)r.innerHTML='<div class="transport-placeholder">Premi <b>Calcola percorso</b>.</div>'; }
function normalizePlaceName(v=''){return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’'`]/g,' ').replace(/[^a-z0-9]+/g,' ').trim();}
function resolveKnownVapKey(text){
  const n=normalizePlaceName(text); if(!n)return null;
  for(const [alias,key] of Object.entries(vapAliases)){const a=normalizePlaceName(alias);if(n===a||n.includes(a))return key;}
  for(const [key,stop] of Object.entries(vapStops)){const sn=normalizePlaceName(stop.name);if(n===sn||n.includes(sn))return key;}
  return null;
}
function resolveVapDestination(){
  const selected=$('#vapTo').value;
  if(selected!=='free')return {key:selected,label:vapStops[selected]?.name||selected,custom:null};
  const text=$('#vapFreeText').value.trim();
  const known=resolveKnownVapKey(text); if(known)return {key:known,label:vapStops[known].name,custom:null};
  const custom=window.__vapCustomDest;
  if(custom?.lat!=null&&custom?.lng!=null){const key=nearestVapStop(custom,vapCandidatesForPoint(custom));return {key,label:custom.label||text||'Punto scelto',custom};}
  return null;
}
async function calculateVapRoute(){
  const btn=$('#vapCalc'),result=$('#vapAdvice'); if(!btn||!result)return;
  btn.disabled=true; btn.textContent='⏳ Calcolo…';
  const originalFrom=$('#vapFrom').value; let from=originalFrom; const dest=resolveVapDestination();
  if(!dest){result.innerHTML='<div class="route-advice warning"><b>🔎 Luogo non riconosciuto.</b><br>Scrivi una fermata/zona conosciuta oppure usa <b>Scegli sulla mappa</b>.</div>';btn.disabled=false;btn.textContent='⚡ Calcola percorso';return;}
  try{
    let startPoint=null;
    if(from==='current'){
      const pos=await getVapPosition(); vapGeo={lat:pos.coords.latitude,lng:pos.coords.longitude}; startPoint=vapGeo; from=nearestVapStop(vapGeo,vapCandidatesForPoint(vapGeo));
    }else if(from==='hotel'){
      const hotel=stopById('hotel'); if(hotel?.lat!=null&&hotel?.lng!=null){startPoint={lat:hotel.lat,lng:hotel.lng};from=nearestVapStop(startPoint,centralVapKeys);} else from='rialto';
    }else startPoint=vapStops[from]||null;

    if(dest.custom && startPoint && haversine(startPoint,dest.custom)<1.15){
      const plan={kind:'walk',title:'Meglio a piedi',summary:`${dest.label} è abbastanza vicino: il vaporetto non ti semplifica il giro.`,walkDirect:true,walkCustom:dest.custom};
      result.innerHTML=renderVapPlan(plan,originalFrom,dest.key,dest);bindVapPlanActions(plan,originalFrom,dest.key,dest);return;
    }
    let plan=buildVapPlan(from,dest.key);
    if(dest.custom && plan.kind!=='walk'){
      const d=haversine(vapStops[dest.key],dest.custom);
      if(d>0.14){plan=clone(plan);plan.steps=[...(plan.steps||[]),{icon:'🚶',title:`Continua a piedi fino a ${dest.label}`,text:'Ultimo tratto dalla fermata.',action:'walkCoords',from:dest.key,dest:dest.custom}];}
    }else if(dest.custom && plan.walkDirect){plan.walkCustom=dest.custom;plan.summary=`Vai direttamente a piedi fino a ${dest.label}.`;}
    result.innerHTML=renderVapPlan(plan,originalFrom,dest.key,dest);
    bindVapPlanActions(plan,originalFrom,dest.key,dest);
  }catch(err){
    console.warn(err); result.innerHTML='<div class="route-advice warning"><b>📍 Posizione non disponibile.</b><br>Seleziona manualmente il punto di partenza più vicino e riprova.</div>';
  }finally{btn.disabled=false;btn.textContent='⚡ Calcola percorso';}
}
function getVapPosition(){return new Promise((resolve,reject)=>{if(!navigator.geolocation)return reject(new Error('geolocation'));navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:8000,maximumAge:60000});});}
function vapCandidatesForPoint(point){
  if(point.lat<45.4302 && point.lng>12.323 && point.lng<12.346)return ['sangiorgio','zitelle','redentore','palanca'];
  if(point.lat>45.452 && point.lat<45.472 && point.lng>12.335 && point.lng<12.375)return ['murano'];
  if(point.lat>45.476 && point.lng>12.390)return ['burano','torcello'];
  return centralVapKeys;
}
function nearestVapStop(point,keys){const use=(keys&&keys.length?keys:vapCandidatesForPoint(point));return use.map(k=>({k,d:haversine(point,vapStops[k])})).sort((a,b)=>a.d-b.d)[0].k;}
function haversine(a,b){const r=6371,toRad=x=>x*Math.PI/180,dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng),la1=toRad(a.lat),la2=toRad(b.lat);return 2*r*Math.asin(Math.sqrt(Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2));}
function directLinePlan(line,order,from,to,directionForward,directionBack){
  const a=order.indexOf(from),b=order.indexOf(to);if(a<0||b<0||a===b)return null;
  const direction=b>a?directionForward:directionBack;
  return transitPlan(line,vapStops[from].name,null,vapStops[to].name,null,direction,from,to,'Diretto, senza cambi.');
}
function buildVapPlan(from,to){
  if(from===to)return {kind:'walk',title:'Sei già nella zona giusta',summary:`${vapStops[to].name}: continua a piedi.`,walkDirect:true};
  // Laguna nord: soluzione volutamente semplice.
  if(to==='burano'){
    if(from==='murano')return transitPlan('Linea 12','Murano Faro','A','Burano',null,'Burano / Treporti','murano','burano','Diretto, nessun cambio.');
    if(from==='torcello')return transitPlan('Linea 9','Torcello',null,'Burano',null,'Burano','torcello','burano','Collegamento diretto.');
    return transitPlan('Linea 12','Fondamente Nove','A','Burano',null,'Burano / Treporti','ftnove','burano','Raggiungi Fondamente Nove e parti da lì.');
  }
  if(to==='murano'){
    if(from==='burano')return transitPlan('Linea 12','Burano','C','Murano Faro',null,'Murano / F.te Nove','burano','murano','Diretto verso Murano.');
    if(from==='roma')return transitPlan('Linea 3','P.le Roma','D','Murano',null,'Murano','roma','murano','Diretto.');
    if(from==='ferrovia')return transitPlan('Linea 3','Ferrovia / S. Lucia','D','Murano',null,'Murano','ferrovia','Diretto dalla stazione.');
    if(from==='ftnove')return transitPlan('Linea 12','Fondamente Nove','A','Murano Faro',null,'Murano / Burano','ftnove','murano','Diretto.');
    return transitPlan('Linea 12','Fondamente Nove','A','Murano Faro',null,'Murano / Burano','ftnove','Prima raggiungi Fondamente Nove.');
  }
  if(to==='torcello'){
    if(from==='burano')return transitPlan('Linea 9','Burano','A','Torcello',null,'Torcello','burano','torcello','Collegamento diretto.');
    return {kind:'transfer',title:'🚤 Torcello',summary:'Due passaggi semplici.',steps:[{icon:'🚶',title:'Vai a Fondamente Nove · pontile A',text:'',action:'walk',target:'ftnove',pier:'A'},{icon:'🚤',title:'Linea 12 → Burano',text:'Direzione Burano / Treporti.'},{icon:'🔁',title:'A Burano vai al pontile A',text:''},{icon:'🚤',title:'Linea 9 → Torcello',text:''}],boardKey:'ftnove'};
  }
  if(['burano','torcello'].includes(from)){
    const first=from==='torcello'?[{icon:'🚤',title:'Linea 9 → Burano',text:''}]:[];
    return {kind:'return',title:`🚤 Verso ${vapStops[to].name}`,summary:'Prima rientra a Fondamente Nove, poi continua a piedi.',steps:[...first,{icon:'🚤',title:'Burano · pontile C → Linea 12',text:'Direzione Murano / F.te Nove.'},{icon:'📍',title:'Scendi a Fondamente Nove',text:''},{icon:'🚶',title:`Continua a piedi fino a ${vapStops[to].name}`,text:'',action:'walkFromTo',from:'ftnove',target:to}]};
  }
  if(from==='murano' && to==='ferrovia')return transitPlan('Linea 3','Murano Faro',null,'Ferrovia / S. Lucia',null,'Ferrovia / P.le Roma','murano','ferrovia','Diretto verso la stazione.');
  if(from==='murano')return {kind:'return',title:`🚤 Verso ${vapStops[to].name}`,summary:'Rientra a Fondamente Nove e continua da lì.',steps:[{icon:'🚤',title:'Linea 12 → Fondamente Nove',text:'Direzione Venezia.'},{icon:'🚶',title:`Continua a piedi fino a ${vapStops[to].name}`,text:'',action:'walkFromTo',from:'ftnove',target:to}]};

  // Giudecca: Linea 2 quando almeno una tappa è sul canale della Giudecca.
  const giudeccaKeys=['sangiorgio','zitelle','redentore','palanca','zattere','sanbasilio'];
  if(line2Order.includes(from)&&line2Order.includes(to)&&(giudeccaKeys.includes(from)||giudeccaKeys.includes(to)||(from==='rialto'&&['roma','ferrovia'].includes(to)))){
    const p=directLinePlan('Linea 2',line2Order,from,to,'Giudecca / P.le Roma / Rialto','S. Marco / S. Zaccaria');if(p)return p;
  }
  // Canal Grande + Arsenale/Giardini: Linea 1.
  if(line1Order.includes(from)&&line1Order.includes(to)){
    const p=directLinePlan('Linea 1',line1Order,from,to,'S. Marco / Arsenale / Lido','Rialto / Ferrovia / P.le Roma');if(p)return p;
  }
  // Cambio semplice a San Zaccaria tra Linea 1 e Linea 2.
  if(line1Order.includes(from)&&giudeccaKeys.includes(to))return {kind:'transfer',title:'🚤 Vaporetto',summary:'Un solo cambio a San Zaccaria.',steps:[{icon:'🚤',title:`Linea 1 → S. Marco / S. Zaccaria`,text:'Direzione S. Marco / Lido.'},{icon:'🔁',title:'A San Zaccaria cambia sulla Linea 2',text:'Direzione Giudecca.'},{icon:'📍',title:`Scendi a ${vapStops[to].name}`,text:''}]};
  if(giudeccaKeys.includes(from)&&line1Order.includes(to))return {kind:'transfer',title:'🚤 Vaporetto',summary:'Un solo cambio a San Zaccaria.',steps:[{icon:'🚤',title:'Linea 2 → S. Marco / S. Zaccaria',text:''},{icon:'🔁',title:'A San Zaccaria cambia sulla Linea 1',text:''},{icon:'📍',title:`Scendi a ${vapStops[to].name}`,text:''}]};
  if(from==='ftnove' || to==='ftnove')return {kind:'walk',title:'Meglio a piedi',summary:'Per questo tratto è più semplice camminare.',walkDirect:true};
  return {kind:'walk',title:'Meglio a piedi',summary:'Per questo tragitto il vaporetto non semplifica davvero il percorso.',walkDirect:true};
}
function transitPlan(line,boardName,boardPier,alightName,alightPier,direction,boardKey,alightKey,note){
  return {kind:'transit',title:'🚤 Vaporetto',summary:note,line,boardName,boardPier,alightName,alightPier,direction,boardKey,alightKey,steps:[{icon:'🚶',title:`Vai a ${boardName}${boardPier?` · pontile ${boardPier}`:''}`,text:'',action:'walk',target:boardKey,pier:boardPier},{icon:'🚤',title:`${line} → ${direction}`,text:''},{icon:'📍',title:`Scendi a ${alightName}${alightPier?` · ${alightPier}`:''}`,text:''}]};
}
function renderVapPlan(plan,originalFrom,to,dest=null){
  if(plan.walkDirect)return `<div class="transport-verdict walk"><span>🚶</span><div><b>${escapeHtml(plan.title)}</b><p>${escapeHtml(plan.summary)}</p></div></div><div class="transport-actions"><button class="primary-btn wine" data-walk-direct>🚶 Apri percorso a piedi</button></div>`;
  const steps=(plan.steps||[]).map((st,i)=>`<div class="transport-step"><div class="step-num">${i+1}</div><div class="step-icon">${st.icon}</div><div class="step-copy"><b>${escapeHtml(st.title)}</b>${st.text?`<p>${escapeHtml(st.text)}</p>`:''}${st.action==='walk'?`<div class="step-actions"><button class="small-btn accent" data-walk-target="${st.target}" data-pier="${st.pier||''}">🚶 Portami all’imbarco</button></div>`:''}${st.action==='walkFromTo'?`<button class="small-btn accent" data-walk-between="${st.from}|${st.target}">🚶 Apri tratto a piedi</button>`:''}${st.action==='walkCoords'?`<button class="small-btn accent" data-walk-coords="${st.from}" data-lat="${st.dest.lat}" data-lng="${st.dest.lng}">🚶 Continua a piedi</button>`:''}</div></div>`).join('');
  return `<div class="transport-verdict"><span>⚡</span><div><b>${escapeHtml(plan.title)}</b><p>${escapeHtml(plan.summary||'')}</p></div></div><div class="transport-steps">${steps}</div>`;
}
function bindVapPlanActions(plan,originalFrom,to,dest=null){
  $$('[data-walk-target]').forEach(b=>b.addEventListener('click',()=>openWalkingRoute(originalFrom,b.dataset.walkTarget,b.dataset.pier||'')));
  $$('[data-walk-between]').forEach(b=>b.addEventListener('click',()=>{const[a,z]=b.dataset.walkBetween.split('|');openWalkingRoute(a,z);}));
  $$('[data-walk-coords]').forEach(b=>b.addEventListener('click',()=>openWalkingCoords(b.dataset.walkCoords,{lat:Number(b.dataset.lat),lng:Number(b.dataset.lng)})));
  $('[data-walk-direct]')?.addEventListener('click',()=>{if(plan.walkCustom)openWalkingCoords(originalFrom,plan.walkCustom);else openWalkingRoute(originalFrom,to);});
}
function pierDestination(stopKey,pier=''){if(!pier)return vapStops[stopKey]?.name||'';const labels={roma:'Piazzale Roma',ferrovia:'Ferrovia Santa Lucia',rialto:'Rialto',ftnove:'Fondamente Nove',murano:'Murano Faro',burano:'Burano'};return `ACTV ${labels[stopKey]||vapStops[stopKey]?.name||''} approdo ${pier}, Venezia`;}
function openWalkingRoute(fromKey,toKey,pier=''){
  const target=vapStops[toKey]; if(!target)return; let origin='';
  if(fromKey==='current')origin='';else if(fromKey==='hotel')origin=state.config.hotelAddress||state.config.hotelName||'';else if(vapStops[fromKey])origin=`${vapStops[fromKey].lat},${vapStops[fromKey].lng}`;
  const destination=pier?pierDestination(toKey,pier):`${target.lat},${target.lng}`;
  const url=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking${origin?`&origin=${encodeURIComponent(origin)}`:''}`;window.open(url,'_blank');
}
function openWalkingCoords(fromKey,dest){
  let origin='';if(fromKey==='current')origin='';else if(fromKey==='hotel')origin=state.config.hotelAddress||state.config.hotelName||'';else if(vapStops[fromKey])origin=`${vapStops[fromKey].lat},${vapStops[fromKey].lng}`;
  const destination=`${dest.lat},${dest.lng}`;window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking${origin?`&origin=${encodeURIComponent(origin)}`:''}`,'_blank');
}
function openVapDestinationPicker(){
  const m=$('#modal'); activeModalStopId=null;
  $('#modalBody').innerHTML=`<div class="modal-head"><div><div class="tiny muted">DESTINAZIONE LIBERA</div><h2>🗺 Tocca dove vuoi andare</h2></div><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div id="vapPickMap"></div><p class="tiny muted">Non serve essere precisissimi: l’app sceglierà l’approdo utile più vicino e poi ti farà continuare a piedi.</p><button class="primary-btn wine" id="confirmVapPoint" disabled>Usa questo punto</button></div>`;
  bindModalClose(m);if(!m.open)m.showModal();
  setTimeout(()=>{const pick=L.map('vapPickMap',{zoomControl:true}).setView([45.4385,12.337],14);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(pick);let marker=null,chosen=null;pick.on('click',e=>{chosen=e.latlng;if(marker)marker.setLatLng(chosen);else marker=L.marker(chosen).addTo(pick);$('#confirmVapPoint').disabled=false;});$('#confirmVapPoint').addEventListener('click',()=>{if(!chosen)return;const label=$('#vapFreeText')?.value.trim()||'Punto scelto sulla mappa';window.__vapCustomDest={lat:chosen.lat,lng:chosen.lng,label};m.close();showToast('Destinazione impostata');resetVapAdvice();});setTimeout(()=>pick.invalidateSize(),100);},80);
}

function exportBackup(){
  const payload=JSON.stringify({...state,exportedAt:nowISO(),appVersion:APP_VERSION},null,2);
  const blob=new Blob([payload],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`bacaro-tour-2026-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Backup esportato');
}
function openSettings(){
  const m=$('#modal'); activeModalStopId=null; const deviceId=deviceParticipantId();
  const syncClass=backendMode==='remote'?'remote':backendMode==='remote-wait'?'wait':'local';
  const syncTitle=backendMode==='remote'?'✅ Condivisione LIVE attiva':backendMode==='remote-wait'?'☁️ Firebase pronto · tour non ancora pubblicato':'📱 Modalità locale';
  const syncText=backendMode==='remote'
    ? `Ogni modifica viene sincronizzata in tempo reale su tutti i telefoni${lastSyncAt?` · ultimo dato ${lastSyncAt.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}`:''}.`
    : backendMode==='remote-wait'
      ? (hadLocalBeforeFirebase?'Questo è il telefono principale: pubblica una sola volta i dati già testati, poi condividi il link agli amici.':'Il tour condiviso non è ancora stato creato. Aspetta che venga attivato dal telefono principale.')
      : 'La rete condivisa non è disponibile: l’app continua a usare la copia locale.';
  const syncAction=backendMode==='remote'
    ? `<button class="primary-btn green" id="shareAppBtn">📲 Condividi app con gli amici</button>`
    : backendMode==='remote-wait' && hadLocalBeforeFirebase
      ? `<button class="primary-btn wine" id="activateSharingBtn">🚀 Attiva condivisione usando questi dati</button><p class="tiny muted">Premilo solo sul telefono principale, dopo aver controllato i nomi dei partecipanti.</p>`
      : '';

  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Impostazioni Tour</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="sync-box ${syncClass}"><strong>${syncTitle}</strong><div class="tiny muted" style="margin-top:3px">${syncText}</div><div class="version-row"><span>Versione</span><strong>${APP_VERSION}</strong></div>${syncAction?`<div style="margin-top:10px">${syncAction}</div>`:''}</div>
  <h3 class="section-title">📱 Questo telefono è di…</h3><div class="form-row"><label>Partecipante<select id="devicePerson"><option value="">— Scegli —</option>${state.participants.map(p=>`<option value="${p.id}" ${p.id===deviceId?'selected':''}>${escapeHtml(p.name)}</option>`).join('')}</select></label></div><p class="tiny muted">È una preferenza solo di questo telefono. Serve a preselezionare la persona corretta nelle bevute.</p>
  <h3 class="section-title">Partecipanti</h3><div class="settings-list" id="peopleList">${state.participants.map(p=>`<div class="person-row"><input value="${attr(p.name)}" data-person-name="${p.id}"><button class="small-btn" data-remove-person="${p.id}">✕</button></div>`).join('')}</div><button class="small-btn" id="addPerson" style="margin-top:8px">＋ Aggiungi partecipante</button>
  <h3 class="section-title">Organizzazione</h3><div class="form-row"><label>Data<input type="date" id="tourDate" value="${attr(state.config.date)}"></label><label>Hotel<input id="hotelName" value="${attr(state.config.hotelName||'')}"></label><label>Indirizzo hotel<input id="hotelAddress" value="${attr(state.config.hotelAddress||'')}"></label></div><button class="primary-btn wine" id="saveSettings">Salva impostazioni</button>
  <hr><div class="actions-row"><button class="small-btn" id="backupApp">💾 Esporta backup</button><button class="small-btn" id="updateApp">🔄 Aggiorna app</button><button class="small-btn" id="resetLocal">Ripristina demo locale</button></div></div>`;
  bindModalClose(m);
  $('#addPerson').addEventListener('click',async()=>{await mutate(st=>st.participants.push({id:uid(),name:`Partecipante ${st.participants.length+1}`}));m.close();openSettings();});
  $$('[data-remove-person]').forEach(b=>b.addEventListener('click',async()=>{const removing=b.dataset.removePerson;if(removing===deviceParticipantId())localStorage.removeItem(deviceParticipantKey);await mutate(st=>{st.participants=st.participants.filter(p=>p.id!==removing);st.drinks=(st.drinks||[]).filter(d=>d.participantId!==removing);});m.close();openSettings();}));
  $('#saveSettings').addEventListener('click',async()=>{const names={};$$('[data-person-name]').forEach(i=>names[i.dataset.personName]=i.value.trim());const dev=$('#devicePerson').value;if(dev)localStorage.setItem(deviceParticipantKey,dev);else localStorage.removeItem(deviceParticipantKey);await mutate(st=>{st.participants.forEach(p=>p.name=names[p.id]||p.name);st.config.date=$('#tourDate').value;st.config.hotelName=$('#hotelName').value.trim();st.config.hotelAddress=$('#hotelAddress').value.trim();const h=findStop(st,'hotel');if(h){h.name=st.config.hotelName||'Hotel / Check-in';h.note=st.config.hotelAddress||'Zona Rialto · da impostare';h.mapQuery=st.config.hotelAddress||h.name+', Venezia';}});m.close();showToast('Impostazioni salvate');});
  $('#backupApp').addEventListener('click',exportBackup);
  $('#updateApp').addEventListener('click',async()=>{showToast('Controllo aggiornamenti…');try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();setTimeout(()=>location.reload(),600);}catch{location.reload();}});
  const activate=$('#activateSharingBtn'); if(activate) activate.addEventListener('click',async()=>{activate.disabled=true;activate.textContent='Attivazione…';await activateSharing();m.close();});
  const share=$('#shareAppBtn'); if(share) share.addEventListener('click',shareApp);
  $('#resetLocal').disabled=backendMode!=='local'; $('#resetLocal').addEventListener('click',()=>{if(backendMode!=='local')return;if(confirm('Ripristinare la demo? Verranno cancellate le prove locali.')){state=clone(starterState);localStorage.setItem(storageKey,JSON.stringify(state));localStorage.removeItem(deviceParticipantKey);m.close();render();}}); if(!m.open)m.showModal();
}

function bindModalClose(m){ $$('[data-close]',m).forEach(b=>b.addEventListener('click',()=>{activeModalStopId=null;m.close();})); }
function escapeHtml(v=''){ return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function attr(v=''){ return escapeHtml(v).replace(/`/g,'&#096;'); }

$$('.nav-btn').forEach(b=>b.addEventListener('click',()=>{activeModalStopId=null;currentView=b.dataset.view;render();}));
$('#settingsBtn').addEventListener('click',openSettings);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){activeModalStopId=null;$('#modal').close();}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__installPrompt=e;});

await initBackend(); updateSyncLabel(); render();
