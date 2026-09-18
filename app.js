import { firebaseConfig, sharedPath } from './firebase-config.js';

const APP_VERSION = 'RC3';
const ACTV_TIMES_URL = 'https://avm.avmspa.it/it/content/orari-servizio-di-navigazione-0';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const clone = (x) => JSON.parse(JSON.stringify(x));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const nowISO = () => new Date().toISOString();
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});

const guideCatalog = [
  {id:'ghetto',category:'visit',icon:'✡️',name:'Ghetto Ebraico',area:'Cannaregio',query:'Ghetto Ebraico Venezia',desc:'Una delle tappe più caratteristiche del percorso di Cannaregio, tra Ghetto Novo e Ghetto Novissimo.',type:'poi'},
  {id:'madonnaorto',category:'visit',icon:'⛪',name:"Madonna dell'Orto",area:'Cannaregio',query:"Chiesa Madonna dell'Orto Venezia",desc:'Chiesa legata a Tintoretto, con opere del pittore e la sua tomba.',type:'poi'},
  {id:'campomori',category:'visit',icon:'🗿',name:'Campo dei Mori',area:'Cannaregio',query:'Campo dei Mori Venezia',desc:'Le statue dei fratelli Mastelli e il Sior Rioba con il celebre naso in ferro.',type:'poi'},
  {id:'tintoretto',category:'visit',icon:'🎨',name:'Casa del Tintoretto',area:'Cannaregio',query:'Casa del Tintoretto Venezia',desc:'Una sosta breve ma perfetta lungo il tratto più autentico del sestiere.',type:'poi'},
  {id:'pontechiodo',category:'visit',icon:'🌉',name:'Ponte Chiodo',area:'Cannaregio',query:'Ponte Chiodo Venezia',desc:'Uno dei rarissimi ponti veneziani ancora senza balaustre.',type:'poi'},
  {id:'iuav',category:'visit',icon:'🏛️',name:'IUAV · ingresso di Carlo Scarpa',area:'Tolentini',query:'IUAV Tolentini Venezia',desc:'Architettura contemporanea inserita nel tessuto storico dei Tolentini.',type:'poi'},
  {id:'maredicarta',category:'shop',icon:'📚',name:'Mare di Carta',area:'Tolentini',query:'Mare di Carta Venezia',desc:'Libreria dedicata al mare e alla laguna, con mappe, libri e oggetti realizzati anche con vecchie vele.',type:'poi'},
  {id:'torrefazione',category:'shop',icon:'☕',name:'Torrefazione Cannaregio',area:'Ormesini',query:'Torrefazione Cannaregio Venezia',desc:'Storica torrefazione cittadina: una deviazione perfetta per una pausa caffè.',type:'poi'},
  {id:'forcolaio',category:'shop',icon:'🛶',name:'Il Forcolaio Matto',area:'Santa Sofia',query:'Il Forcolaio Matto Venezia',desc:'Bottega artigiana di remi e forcole: un pezzo di Venezia da vedere anche senza comprare nulla.',type:'poi'},
  {id:'lele-guide',category:'bacaro',icon:'🍷',name:'Bacareto da Lele',area:'Tolentini',query:'Bacareto da Lele Venezia',desc:'Tappa fissa del gruppo e prologo naturale del tour.',type:'bacaro',fixed:true},
  {id:'lucafred-guide',category:'bacaro',icon:'🍷',name:'Luca e Fred',area:'Cannaregio',query:'Luca e Fred Venezia',desc:'Bacaro del percorso ufficiale, con ampia scelta di cicchetti.',type:'bacaro'},
  {id:'timon-guide',category:'bacaro',icon:'🍷',name:'Al Timon',area:'Ormesini',query:'Al Timon Venezia',desc:'Bacaro sulla fondamenta degli Ormesini, noto anche per il barcone sul canale.',type:'bacaro'},
  {id:'vedova-guide',category:'bacaro',icon:'🍷',name:"Ca' d'Oro · Alla Vedova",area:'Cannaregio',query:"Ca' d'Oro Alla Vedova Venezia",desc:'Osteria storica famosa per le polpette.',type:'bacaro'},
  {id:'itin-cannaregio',category:'route',icon:'🚶',name:'Cannaregio autentica',area:'Cannaregio',desc:'Ghetto → Ormesini → Madonna dell’Orto → Campo dei Mori → Misericordia.',routeQueries:['Ghetto Ebraico Venezia','Fondamenta degli Ormesini Venezia',"Chiesa Madonna dell'Orto Venezia",'Campo dei Mori Venezia','Fondamenta della Misericordia Venezia']},
  {id:'itin-rialto',category:'route',icon:'🛍️',name:'Rialto & botteghe',area:'Rialto',desc:'Santa Sofia → Forcolaio Matto → Mercato di Rialto: breve giro tra artigianato e cuore commerciale.',routeQueries:['Campo Santa Sofia Venezia','Il Forcolaio Matto Venezia','Mercato di Rialto Venezia']},
  {id:'itin-isole',category:'route',icon:'🏝️',name:'Isole classiche',area:'Laguna nord',desc:'Fondamente Nove → Murano → Burano, con Torcello opzionale.',routeQueries:['Fondamente Nove Venezia','Murano Venezia','Burano Venezia','Torcello Venezia']}
];

const vapStops = {
  roma:{name:'P.le Roma',lat:45.4387,lng:12.3181},
  ferrovia:{name:'Ferrovia',lat:45.4412,lng:12.3215},
  rialto:{name:'Rialto',lat:45.4381,lng:12.3358},
  sanmarco:{name:'S. Marco',lat:45.4334,lng:12.3360},
  ftnove:{name:'Fondamente Nove',lat:45.4459,lng:12.3425},
  murano:{name:'Murano Faro',lat:45.4584,lng:12.3524},
  burano:{name:'Burano',lat:45.4853,lng:12.4167},
  torcello:{name:'Torcello',lat:45.4987,lng:12.4177}
};

const starterState = {
  version: 3,
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
  drinks: [], ratings: {}, notes: {}, topEvents: [], activity: [], guideFavorites: []
};

let state = clone(starterState);
let currentView = 'home';
let map = null;
let mapLayer = null;
let vapMap = null;
let backendMode = 'local';
let firebaseApi = null;
let toastTimer = null;
let activeModalStopId = null;
let activeModalParticipantId = null;
let pendingPlaceStopId = null;
let guideFilter = 'all';

const storageKey = 'bacaro-tour-2026-local';

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
  out.version=3;
  return out;
}

function showToast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}
function iconForType(type){ return ({bacaro:'🍷',hotel:'🏨',poi:'📍',transit:'🚆'}[type]||'📍'); }
function phaseLabel(stop){ return stop.phase==='prologue'?'Prologo':'Tour ufficiale'; }
function participantName(id){ return state.participants.find(p=>p.id===id)?.name || 'Partecipante'; }
function stopById(id){ return [...state.tours.day1.stops,...state.tours.day2.stops].find(s=>s.id===id); }
function dayOfStop(id){ return state.tours.day1.stops.some(s=>s.id===id)?'day1':'day2'; }
function findStop(st,id){ return [...st.tours.day1.stops,...st.tours.day2.stops].find(s=>s.id===id); }

async function initBackend(){
  const saved = localStorage.getItem(storageKey);
  if(saved){ try{ state=normalizeState(JSON.parse(saved)); }catch{} }
  const hasConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.databaseURL;
  if(!hasConfig){ backendMode='local'; updateSyncLabel(); return; }
  try{
    const [{initializeApp},{getDatabase,ref,onValue,runTransaction},{getAuth,signInAnonymously}] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')
    ]);
    const app=initializeApp(firebaseConfig); const auth=getAuth(app); await signInAnonymously(auth);
    const db=getDatabase(app); const rootRef=ref(db,sharedPath);
    firebaseApi={rootRef,runTransaction,onValue}; backendMode='remote';
    onValue(rootRef, snap=>{
      if(snap.exists()) state=normalizeState(snap.val());
      else runTransaction(rootRef,()=>clone(starterState));
      updateSyncLabel(); render();
      if(activeModalStopId && $('#modal')?.open) openStopModal(activeModalStopId,activeModalParticipantId);
    });
  }catch(err){ console.error(err); backendMode='local'; updateSyncLabel('Firebase non disponibile · demo locale'); }
}

function updateSyncLabel(force){
  const el=$('#syncLabel'); if(!el) return;
  el.textContent=force || (backendMode==='remote'?`● ${APP_VERSION} · LIVE`:`● ${APP_VERSION} · Demo locale`);
  el.style.color=backendMode==='remote'?'#0d533b':'#8a6421';
}

async function mutate(mutator, activity=null){
  if(backendMode==='remote' && firebaseApi){
    await firebaseApi.runTransaction(firebaseApi.rootRef, current=>{
      const next=normalizeState(current||starterState); mutator(next); next.version=3;
      if(activity) next.activity=[...(next.activity||[]),{id:uid(),at:nowISO(),...activity}].slice(-350);
      return next;
    });
  }else{
    mutator(state); state.version=3;
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
    const icon=L.divIcon({className:'',html:`<div class="map-pin ${done?'done':skipped?'skip':''}">${s.fixed?'⭐':iconForType(s.type)}</div>`,iconSize:[36,36],iconAnchor:[18,18]});
    const m=L.marker([s.lat,s.lng],{icon}).addTo(mapLayer);
    m.bindPopup(`<strong>${i+1}. ${escapeHtml(s.name)}</strong><br><span>${escapeHtml(phaseLabel(s))}</span><br><button onclick="window.__openStop('${s.id}')" style="margin-top:8px">Apri scheda</button>`);
    if(s.status!=='skipped' && s.phase==='official') coords.push([s.lat,s.lng]);
  });
  if(coords.length>1) L.polyline(coords,{color:'#7d1027',weight:4,opacity:.72,dashArray:'8,8'}).addTo(mapLayer);
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
  const s=stopById(id); if(!s) return; const q=destinationQuery(s);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}&travelmode=${mode}`,'_blank');
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
  activeModalStopId=id; activeModalParticipantId=preferredParticipant||activeModalParticipantId||participants[0]?.id||null;
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

function openAddStopModal(day,latlng=null){
  const m=$('#modal'); activeModalStopId=null;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Aggiungi tappa</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="form-row"><label>Nome<input id="newStopName" placeholder="Nome del bacaro o punto d'interesse"></label><label>Tipo<select id="newStopType"><option value="bacaro">🍷 Bacaro</option><option value="poi">📍 Punto d'interesse</option><option value="hotel">🏨 Hotel</option><option value="transit">🚤/🚆 Trasporto</option></select></label><label>Fase<select id="newStopPhase"><option value="official">Tour</option><option value="prologue">Prologo</option></select></label><label>Nota<textarea id="newStopNote" placeholder="Facoltativo"></textarea></label></div><p class="tiny muted">Dopo il salvataggio puoi posizionare la tappa con un tocco sulla mappa.</p><button class="primary-btn wine" id="saveNewStop">Salva tappa</button></div>`;
  bindModalClose(m); $('#saveNewStop').addEventListener('click',async()=>{const name=$('#newStopName').value.trim();if(!name){showToast('Inserisci il nome');return;}const obj={id:uid(),name,type:$('#newStopType').value,phase:$('#newStopPhase').value,lat:latlng?.lat??null,lng:latlng?.lng??null,status:'todo',note:$('#newStopNote').value.trim()};await mutate(st=>st.tours[day].stops.push(obj),{kind:'system',title:`Nuova tappa: ${name}`,text:day==='day1'?'Giorno 1':'Giorno 2'});m.close();showToast('Tappa aggiunta');}); if(!m.open)m.showModal();
}

function openEditStopModal(id){
  const s=stopById(id), day=dayOfStop(id), m=$('#modal'); if(!s)return; activeModalStopId=null;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Modifica tappa</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="form-row"><label>Nome<input id="editName" value="${attr(s.name)}"></label><label>Tipo<select id="editType">${['bacaro','poi','hotel','transit'].map(x=>`<option value="${x}" ${s.type===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Nota<textarea id="editNote">${escapeHtml(s.note||'')}</textarea></label><label><input type="checkbox" id="editFixed" ${s.fixed?'checked':''}> Tappa fissa</label><label><input type="checkbox" id="editOptional" ${s.optional?'checked':''}> Opzionale</label></div><div class="actions-row"><button class="primary-btn wine" id="saveEdit">Salva</button><button class="primary-btn ghost" id="moveOnMap">📌 ${s.lat==null?'Posiziona':'Sposta'} sulla mappa</button><button class="primary-btn ghost" id="deleteStop">🗑 Elimina</button></div></div>`;
  bindModalClose(m); $('#saveEdit').addEventListener('click',async()=>{await mutate(st=>{const x=findStop(st,id);x.name=$('#editName').value.trim()||x.name;x.type=$('#editType').value;x.note=$('#editNote').value.trim();x.fixed=$('#editFixed').checked;x.optional=$('#editOptional').checked;},{kind:'system',title:'Tappa modificata',text:$('#editName').value.trim()});m.close();});
  $('#moveOnMap').addEventListener('click',()=>{m.close();pendingPlaceStopId=id;currentView='map';state.config.currentDay=day;render();});
  $('#deleteStop').addEventListener('click',async()=>{if(!confirm('Eliminare questa tappa?'))return;await mutate(st=>{st.tours[day].stops=st.tours[day].stops.filter(x=>x.id!==id);st.drinks=(st.drinks||[]).filter(d=>d.stopId!==id);st.topEvents=(st.topEvents||[]).filter(e=>e.stopId!==id);},{kind:'system',title:'Tappa eliminata',text:s.name});m.close();}); if(!m.open)m.showModal();
}

function openManageStops(day){
  const t=state.tours[day],m=$('#modal'); activeModalStopId=null;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Modifica ordine</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><p class="muted tiny">Sposta le tappe su/giù. Le modifiche saranno condivise quando attiveremo Firebase.</p><div class="stop-list">${t.stops.map((s,i)=>`<div class="card stop-card"><div class="stop-icon">${i+1}</div><div><h3>${escapeHtml(s.name)}</h3><div class="tiny muted">${s.lat==null?'Da posizionare':'Posizionata'}</div></div><div class="stop-actions"><button class="mini-icon" data-move="up" data-id="${s.id}">↑</button><button class="mini-icon" data-move="down" data-id="${s.id}">↓</button></div></div>`).join('')}</div></div>`;
  bindModalClose(m); $$('[data-move]').forEach(b=>b.addEventListener('click',async()=>{await mutate(st=>{const arr=st.tours[day].stops,idx=arr.findIndex(x=>x.id===b.dataset.id),to=b.dataset.move==='up'?idx-1:idx+1;if(idx<0||to<0||to>=arr.length)return;[arr[idx],arr[to]]=[arr[to],arr[idx]];});m.close();openManageStops(day);})); if(!m.open)m.showModal();
}

function renderGuide(){
  const cats=[['all','Tutto'],['visit','📍 Da vedere'],['bacaro','🍷 Bacari'],['shop','🛍 Botteghe'],['route','🚶 Itinerari'],['fav','❤️ Salvati']];
  const items=guideCatalog.filter(x=>guideFilter==='all'?true:guideFilter==='fav'?state.guideFavorites.includes(x.id):x.category===guideFilter);
  $('#mainView').innerHTML=`<div class="page-head"><div><span class="eyebrow">GUIDA PERSONALE</span><h2>🧭 Venezia a modo nostro</h2><p>Luoghi, bacari, botteghe e itinerari da aggiungere al volo ai due giorni.</p></div></div>
  <div class="guide-tabs">${cats.map(([id,label])=>`<button class="pill ${guideFilter===id?'active':''}" data-guide-filter="${id}">${label}</button>`).join('')}</div>
  <div class="guide-grid">${items.length?items.map(guideCard).join(''):'<div class="card empty">Nessun elemento in questa sezione.</div>'}</div>`;
  $$('[data-guide-filter]').forEach(b=>b.addEventListener('click',()=>{guideFilter=b.dataset.guideFilter;renderGuide();}));
  $$('[data-guide-map]').forEach(b=>b.addEventListener('click',()=>{const item=guideCatalog.find(x=>x.id===b.dataset.guideMap);window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.query||item.name+', Venezia')}`,'_blank');}));
  $$('[data-guide-fav]').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.guideFav;await mutate(st=>{st.guideFavorites=st.guideFavorites||[];st.guideFavorites=st.guideFavorites.includes(id)?st.guideFavorites.filter(x=>x!==id):[...st.guideFavorites,id];});renderGuide();}));
  $$('[data-guide-add]').forEach(b=>b.addEventListener('click',async()=>{const item=guideCatalog.find(x=>x.id===b.dataset.guideAdd),day=b.dataset.day;if(item.category==='route'){await addGuideRoute(item,day);return;}await addGuidePlace(item,day);}));
}
function guideCard(item){
  const fav=state.guideFavorites.includes(item.id);
  return `<article class="card guide-card"><div class="guide-icon">${item.icon}</div><div class="guide-main"><div class="guide-meta">${escapeHtml(item.area||'Venezia')}</div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.desc||'')}</p><div class="guide-actions">${item.category!=='route'?`<button class="small-btn" data-guide-map="${item.id}">📍 Mappa</button>`:''}<button class="small-btn" data-guide-add="${item.id}" data-day="day1">＋ G1</button><button class="small-btn" data-guide-add="${item.id}" data-day="day2">＋ G2</button><button class="small-btn ${fav?'active':''}" data-guide-fav="${item.id}">${fav?'♥':'♡'}</button></div></div></article>`;
}
async function addGuidePlace(item,day){
  const exists=state.tours[day].stops.some(s=>s.guideId===item.id || s.name===item.name); if(exists){showToast('È già presente nel tour');return;}
  await mutate(st=>st.tours[day].stops.push({id:uid(),guideId:item.id,name:item.name,type:item.type||'poi',phase:'official',lat:item.lat??null,lng:item.lng??null,mapQuery:item.query||`${item.name}, Venezia`,status:'todo',fixed:!!item.fixed,note:item.desc||''}),{kind:'system',title:`Guida → ${day==='day1'?'Giorno 1':'Giorno 2'}`,text:item.name});
  showToast(`${item.name} aggiunto al ${day==='day1'?'Giorno 1':'Giorno 2'}`);
}
async function addGuideRoute(item,day){
  const names=item.routeQueries||[]; let added=0;
  await mutate(st=>{names.forEach(q=>{const name=q.replace(' Venezia','');if(!st.tours[day].stops.some(s=>s.name===name)){st.tours[day].stops.push({id:uid(),name,type:'poi',phase:'official',lat:null,lng:null,mapQuery:q,status:'todo',note:`Da itinerario: ${item.name}`});added++;}});},{kind:'system',title:`Itinerario aggiunto: ${item.name}`,text:day==='day1'?'Giorno 1':'Giorno 2'});
  showToast(`${added} tappe aggiunte`);
}

function renderVaporetto(){
  $('#mainView').innerHTML=`<div class="page-head"><div><span class="eyebrow">ORIENTARSI AL VOLO</span><h2>🚤 Mappa Vaporetti</h2><p>Schema semplice dei nodi che useremo di più. Gli orari reali vanno sempre verificati su ACTV.</p></div></div>
    <div id="vapMap" aria-label="Mappa orientativa vaporetti"></div>
    <div class="vap-legend"><span><b>1</b> Canal Grande</span><span><b>12</b> Isole nord</span></div>
    <section class="card planner-card"><h3>Da dove → dove vuoi andare</h3><div class="planner-grid"><label>Partenza<select id="vapFrom"><option value="current">Posizione attuale</option><option value="ferrovia">Ferrovia / S. Lucia</option><option value="rialto">Rialto</option><option value="ftnove">Fondamente Nove</option><option value="hotel">Hotel</option></select></label><label>Destinazione<select id="vapTo"><option value="rialto">Rialto</option><option value="ftnove">Fondamente Nove</option><option value="murano">Murano</option><option value="burano">Burano</option><option value="torcello">Torcello</option><option value="ferrovia">Ferrovia / S. Lucia</option></select></label></div><div id="vapAdvice" class="route-advice"></div><div class="actions-row"><button class="primary-btn green" id="googleTransit">🧭 Percorso mezzi</button><a class="primary-btn ghost link-button" href="${ACTV_TIMES_URL}" target="_blank" rel="noopener">🕒 Orari ACTV</a></div></section>
    <h3 class="section-title">Linee da ricordare</h3><div class="route-cards"><div class="card route-card"><b>Linea 1</b><span>P.le Roma → Ferrovia → Rialto → S. Marco → Lido</span></div><div class="card route-card"><b>Linea 2 / 2/</b><span>Collegamenti rapidi lungo il Canal Grande; la 2/ copre P.le Roma ↔ Ferrovia ↔ Rialto.</span></div><div class="card route-card"><b>Linea 3</b><span>P.le Roma / Ferrovia ↔ Murano.</span></div><div class="card route-card"><b>Linea 12</b><span>Fondamente Nove → Murano → Mazzorbo / Torcello → Burano → Treporti.</span></div></div>
    <div class="info-note">ℹ️ Mappa orientativa: linee, banchine e orari possono cambiare. Prima di partire usa sempre “Orari ACTV”.</div>`;
  $('#vapFrom').addEventListener('change',updateVapAdvice); $('#vapTo').addEventListener('change',updateVapAdvice); $('#googleTransit').addEventListener('click',openTransitPlanner); updateVapAdvice(); setTimeout(initVapMap,0);
}
function initVapMap(){
  const el=$('#vapMap');if(!el||typeof L==='undefined')return;if(vapMap){vapMap.remove();vapMap=null;}
  vapMap=L.map('vapMap',{zoomControl:true}).setView([45.456,12.355],12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(vapMap);
  Object.entries(vapStops).forEach(([id,s])=>L.circleMarker([s.lat,s.lng],{radius:8,color:'#7d1027',fillColor:'#f7f0e4',fillOpacity:1,weight:3}).addTo(vapMap).bindTooltip(s.name,{permanent:false}));
  const line1=['roma','ferrovia','rialto','sanmarco'].map(k=>[vapStops[k].lat,vapStops[k].lng]);
  const line12=['ftnove','murano','torcello','burano'].map(k=>[vapStops[k].lat,vapStops[k].lng]);
  L.polyline(line1,{color:'#7d1027',weight:5,opacity:.8}).addTo(vapMap).bindTooltip('Linea 1 · schema');
  L.polyline(line12,{color:'#0d533b',weight:5,opacity:.8}).addTo(vapMap).bindTooltip('Linea 12 · schema');
  vapMap.fitBounds([...line1,...line12],{padding:[22,22]});
}
function updateVapAdvice(){
  const from=$('#vapFrom')?.value,to=$('#vapTo')?.value; const el=$('#vapAdvice');if(!el)return; let txt='';
  if((to==='murano'||to==='burano'||to==='torcello')){
    if(from==='ftnove') txt=to==='murano'?'Da Fondamente Nove: controlla Linea 12 verso Murano.':`Da Fondamente Nove: la Linea 12 è il riferimento principale verso ${vapStops[to].name}.`;
    else if(from==='ferrovia'&&to==='murano') txt='Da Ferrovia: controlla Linea 3 per Murano; in alternativa raggiungi Fondamente Nove e verifica la 12.';
    else txt=`Per ${vapStops[to].name}: in genere conviene orientarsi su Fondamente Nove e controllare la Linea 12. Google Maps ti calcola il percorso aggiornato dal punto reale.`;
  } else if((from==='ferrovia'&&to==='rialto')||(from==='rialto'&&to==='ferrovia')) txt='Canal Grande: Linea 1; controlla anche Linea 2 / 2/ per un collegamento più rapido in base all’orario.';
  else txt='Usa “Percorso mezzi” per il tragitto dal punto reale e “Orari ACTV” per verificare partenze e variazioni.';
  el.textContent=txt;
}
function openTransitPlanner(){
  const from=$('#vapFrom').value,to=$('#vapTo').value; let destination='';
  if(to==='hotel') destination=state.config.hotelAddress||state.config.hotelName;
  else destination=vapStops[to]?.name?`${vapStops[to].name}, Venezia`:to;
  let origin=''; if(from==='hotel') origin=state.config.hotelAddress||state.config.hotelName; else if(from!=='current') origin=vapStops[from]?.name?`${vapStops[from].name}, Venezia`:from;
  const url=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=transit${origin?`&origin=${encodeURIComponent(origin)}`:''}`; window.open(url,'_blank');
}

function openSettings(){
  const m=$('#modal'); activeModalStopId=null;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Impostazioni Tour</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="sync-box ${backendMode}"><strong>${backendMode==='remote'?'✅ Condivisione LIVE attiva':'⚠️ Modalità demo locale'}</strong><div class="tiny muted" style="margin-top:3px">${backendMode==='remote'?'Ogni modifica viene sincronizzata in tempo reale su tutti i telefoni.':'Per condividere i dati inseriremo Firebase dopo i test.'}</div><div class="version-row"><span>Versione</span><strong>${APP_VERSION}</strong></div></div><h3 class="section-title">Partecipanti</h3><div class="settings-list" id="peopleList">${state.participants.map(p=>`<div class="person-row"><input value="${attr(p.name)}" data-person-name="${p.id}"><button class="small-btn" data-remove-person="${p.id}">✕</button></div>`).join('')}</div><button class="small-btn" id="addPerson" style="margin-top:8px">＋ Aggiungi partecipante</button><h3 class="section-title">Organizzazione</h3><div class="form-row"><label>Data<input type="date" id="tourDate" value="${attr(state.config.date)}"></label><label>Hotel<input id="hotelName" value="${attr(state.config.hotelName||'')}"></label><label>Indirizzo hotel<input id="hotelAddress" value="${attr(state.config.hotelAddress||'')}"></label></div><button class="primary-btn wine" id="saveSettings">Salva impostazioni</button><hr><div class="actions-row"><button class="small-btn" id="updateApp">🔄 Aggiorna app</button><button class="small-btn" id="resetLocal">Ripristina demo locale</button></div></div>`;
  bindModalClose(m); $('#addPerson').addEventListener('click',async()=>{await mutate(st=>st.participants.push({id:uid(),name:`Partecipante ${st.participants.length+1}`}));m.close();openSettings();});
  $$('[data-remove-person]').forEach(b=>b.addEventListener('click',async()=>{await mutate(st=>{st.participants=st.participants.filter(p=>p.id!==b.dataset.removePerson);st.drinks=(st.drinks||[]).filter(d=>d.participantId!==b.dataset.removePerson);});m.close();openSettings();}));
  $('#saveSettings').addEventListener('click',async()=>{const names={};$$('[data-person-name]').forEach(i=>names[i.dataset.personName]=i.value.trim());await mutate(st=>{st.participants.forEach(p=>p.name=names[p.id]||p.name);st.config.date=$('#tourDate').value;st.config.hotelName=$('#hotelName').value.trim();st.config.hotelAddress=$('#hotelAddress').value.trim();const h=findStop(st,'hotel');if(h){h.name=st.config.hotelName||'Hotel / Check-in';h.note=st.config.hotelAddress||'Zona Rialto · da impostare';h.mapQuery=st.config.hotelAddress||h.name+', Venezia';}});m.close();showToast('Impostazioni salvate');});
  $('#updateApp').addEventListener('click',async()=>{showToast('Controllo aggiornamenti…');try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();setTimeout(()=>location.reload(),600);}catch{location.reload();}});
  $('#resetLocal').disabled=backendMode==='remote'; $('#resetLocal').addEventListener('click',()=>{if(backendMode==='remote')return;if(confirm('Ripristinare la demo? Verranno cancellate le prove locali.')){state=clone(starterState);localStorage.setItem(storageKey,JSON.stringify(state));m.close();render();}}); if(!m.open)m.showModal();
}

function bindModalClose(m){ $$('[data-close]',m).forEach(b=>b.addEventListener('click',()=>{activeModalStopId=null;m.close();})); }
function escapeHtml(v=''){ return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function attr(v=''){ return escapeHtml(v).replace(/`/g,'&#096;'); }

$$('.nav-btn').forEach(b=>b.addEventListener('click',()=>{activeModalStopId=null;currentView=b.dataset.view;render();}));
$('#settingsBtn').addEventListener('click',openSettings);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){activeModalStopId=null;$('#modal').close();}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__installPrompt=e;});

await initBackend(); updateSyncLabel(); render();
