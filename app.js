import { firebaseConfig, sharedPath } from './firebase-config.js';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const clone = (x) => JSON.parse(JSON.stringify(x));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const nowISO = () => new Date().toISOString();
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});

const starterState = {
  version: 1,
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
      name:'Giorno 1 · Bacaro Tour',
      subtitle:'Prologo + Tour Cannaregio',
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
  drinks: [],
  ratings: {},
  notes: {},
  topEvents: [],
  activity: []
};

let state = clone(starterState);
let currentView = 'home';
let map = null;
let mapLayer = null;
let backendMode = 'local';
let firebaseApi = null;
let toastTimer = null;

const storageKey = 'bacaro-tour-2026-local';

function showToast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

function iconForType(type){ return ({bacaro:'🍷',hotel:'🏨',poi:'📍',transit:'🚆'}[type]||'📍'); }
function phaseLabel(stop){ return stop.phase==='prologue'?'Prologo':'Tour ufficiale'; }
function participantName(id){ return state.participants.find(p=>p.id===id)?.name || 'Partecipante'; }
function stopById(id){ return [...state.tours.day1.stops,...state.tours.day2.stops].find(s=>s.id===id); }
function dayOfStop(id){ return state.tours.day1.stops.some(s=>s.id===id)?'day1':'day2'; }

async function initBackend(){
  const saved = localStorage.getItem(storageKey);
  if(saved){ try{ state={...clone(starterState),...JSON.parse(saved)}; }catch{} }
  const hasConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.databaseURL;
  if(!hasConfig){ backendMode='local'; updateSyncLabel(); return; }
  try{
    const [{initializeApp},{getDatabase,ref,onValue,runTransaction},{getAuth,signInAnonymously}] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')
    ]);
    const app=initializeApp(firebaseConfig);
    const auth=getAuth(app); await signInAnonymously(auth);
    const db=getDatabase(app); const rootRef=ref(db,sharedPath);
    firebaseApi={rootRef,runTransaction,onValue}; backendMode='remote';
    onValue(rootRef, snap=>{
      if(snap.exists()) state=snap.val();
      else runTransaction(rootRef,()=>clone(starterState));
      updateSyncLabel(); render();
    });
  }catch(err){ console.error(err); backendMode='local'; updateSyncLabel('Firebase non disponibile · demo locale'); }
}

function updateSyncLabel(force){
  const el=$('#syncLabel'); if(!el) return;
  el.textContent=force || (backendMode==='remote'?'● Sincronizzazione LIVE':'● Demo locale · sync da attivare');
  el.style.color=backendMode==='remote'?'#0d533b':'#8a6421';
}

async function mutate(mutator, activity=null){
  if(backendMode==='remote' && firebaseApi){
    await firebaseApi.runTransaction(firebaseApi.rootRef, current=>{
      const next=current?clone(current):clone(starterState); mutator(next);
      if(activity) next.activity=[...(next.activity||[]),{id:uid(),at:nowISO(),...activity}].slice(-300);
      return next;
    });
  }else{
    mutator(state);
    if(activity) state.activity=[...(state.activity||[]),{id:uid(),at:nowISO(),...activity}].slice(-300);
    localStorage.setItem(storageKey,JSON.stringify(state)); render();
  }
}

function render(){
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
  if(currentView==='home') renderHome();
  if(currentView==='map') renderMapView();
  if(currentView==='tour') renderTour();
  if(currentView==='diary') renderDiary();
}

function renderHome(){
  const participants = state.participants?.length || 0;
  const completed=[...state.tours.day1.stops,...state.tours.day2.stops].filter(s=>s.status==='done'&&s.type==='bacaro').length;
  $('#mainView').innerHTML=`
    <div class="home-layout">
      <section class="hero"><div class="hero-inner">
        <img class="hero-logo" src="assets/logo.jpg" alt="Logo Bacaro Tour" />
        <h1>Bacaro Tour<br>Venezia 2026</h1>
        <p>29 ottobre · goliardia organizzata, mappa e diario condiviso.</p>
        <button class="primary-btn" data-go="tour">🍷 Entra nel Tour</button>
      </div></section>
      <div>
        <div class="grid-3">
          <button class="quick-card" data-go="tour"><span>🍷</span><b>Tour 2026</b></button>
          <button class="quick-card" data-go="map"><span>🗺</span><b>Mappa</b></button>
          <button class="quick-card" data-go="diary"><span>📖</span><b>Diario Live</b></button>
        </div>
        <h2 class="section-title">Servizi rapidi</h2>
        <div class="services">
          <a class="service" href="https://actv.avmspa.it/" target="_blank" rel="noopener"><span>🚤</span>Vaporetti</a>
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
}

function bindGoButtons(){
  $$('[data-go]').forEach(el=>el.addEventListener('click',()=>{
    if(el.dataset.day) state.config.currentDay=el.dataset.day;
    currentView=el.dataset.go; render();
  }));
}

function renderMapView(){
  const day=state.config.currentDay||'day1';
  $('#mainView').innerHTML=`
    <div class="segmented"><button class="seg-btn ${day==='day1'?'active':''}" data-day="day1">Giorno 1</button><button class="seg-btn ${day==='day2'?'active':''}" data-day="day2">Giorno 2</button></div>
    <div class="map-toolbar">
      <button class="small-btn" id="locateBtn">📍 La mia posizione</button>
      <button class="small-btn" id="addStopBtn">➕ Aggiungi tappa</button>
      <button class="small-btn" id="listStopsBtn">☰ Modifica tour</button>
    </div>
    <div id="mapCanvas" aria-label="Mappa interattiva di Venezia"></div>
    <div class="map-legend"><span class="legend-chip">⭐ Fissa</span><span class="legend-chip">🍷 Bacaro</span><span class="legend-chip">🏨 Hotel</span><span class="legend-chip">📍 POI</span><span class="legend-chip">✓ Fatto</span></div>
    <div class="map-footer-actions"><button class="primary-btn wine" id="nextStopBtn">Prossima tappa</button><button class="primary-btn ghost" id="openExternalMapBtn">🚶 Apri mappa pedonale</button></div>`;
  $$('.seg-btn').forEach(b=>b.addEventListener('click',()=>{state.config.currentDay=b.dataset.day; renderMapView();}));
  $('#locateBtn').addEventListener('click',locateMe);
  $('#addStopBtn').addEventListener('click',()=>openAddStopModal(day));
  $('#listStopsBtn').addEventListener('click',()=>openManageStops(day));
  $('#nextStopBtn').addEventListener('click',()=>focusNextStop(day));
  $('#openExternalMapBtn').addEventListener('click',()=>window.open('https://www.google.com/maps/search/?api=1&query=Venezia','_blank'));
  setTimeout(()=>initMap(day),0);
}

function initMap(day){
  const el=$('#mapCanvas'); if(!el || typeof L==='undefined'){ if(el) el.innerHTML='<div class="empty">Mappa non caricata. Controlla la connessione.</div>'; return; }
  if(map){ map.remove(); map=null; }
  map=L.map('mapCanvas',{zoomControl:true}).setView([45.4416,12.3295],14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  mapLayer=L.layerGroup().addTo(map);
  drawTour(day);
  map.on('dblclick',e=>openAddStopModal(day,e.latlng));
}

function drawTour(day){
  if(!mapLayer) return; mapLayer.clearLayers();
  const stops=state.tours[day].stops||[]; const coords=[];
  stops.forEach((s,i)=>{
    if(s.lat==null||s.lng==null) return;
    const done=s.status==='done'; const skipped=s.status==='skipped';
    const icon=L.divIcon({className:'',html:`<div style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:${done?'#0d533b':skipped?'#81776f':'#7d1027'};color:white;border:3px solid #fff;box-shadow:0 2px 8px #0003;font-size:16px">${s.fixed?'⭐':iconForType(s.type)}</div>`,iconSize:[34,34],iconAnchor:[17,17]});
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
  return `<article class="card stop-card" data-id="${s.id}"><div class="stop-icon">${s.fixed?'⭐':iconForType(s.type)}</div><div><h3>${i+1}. ${escapeHtml(s.name)}</h3><div class="tiny muted">${s.lat==null?'📌 Da posizionare sulla mappa':s.type==='bacaro'?`${drinks} bevute registrate`:phaseLabel(s)}</div><div class="badges">${badges}</div></div><div class="stop-actions"><button class="mini-icon" data-open-stop="${s.id}" aria-label="Apri">›</button><button class="mini-icon" data-nav-stop="${s.id}" aria-label="Naviga">🚶</button></div></article>`;
}

function navigateToStop(id){
  const s=stopById(id); if(!s) return; let q='';
  if(s.lat!=null) q=`${s.lat},${s.lng}`; else q=s.name+', Venezia';
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}&travelmode=walking`,'_blank');
}

function renderDiary(){
  const events=[];
  (state.activity||[]).forEach(a=>events.push(a));
  const sorted=events.sort((a,b)=>new Date(a.at)-new Date(b.at));
  const bacariDone=[...state.tours.day1.stops,...state.tours.day2.stops].filter(s=>s.type==='bacaro'&&s.status==='done').length;
  $('#mainView').innerHTML=`
    <h2 class="section-title" style="margin-top:4px">Diario Live</h2>
    <div class="stats-row">
      <div class="card stat"><b>${state.drinks?.length||0}</b><span>bevute registrate</span></div>
      <div class="card stat"><b>${bacariDone}</b><span>bacari fatti</span></div>
      <div class="card stat"><b>${state.topEvents?.length||0}</b><span>Top Event</span></div>
    </div>
    <h3 class="section-title">Bevute per partecipante</h3>
    <div class="card" style="padding:12px">${state.participants.length?state.participants.map(p=>participantSummary(p)).join(''):'<div class="empty">Aggiungi i partecipanti.</div>'}</div>
    <h3 class="section-title">Cronologia</h3>
    <div class="timeline">${sorted.length?sorted.map(activityEvent).join(''):'<div class="empty">Il diario si riempirà automaticamente durante il tour.</div>'}</div>`;
}

function participantSummary(p){
  const ds=(state.drinks||[]).filter(d=>d.participantId===p.id); const counts={}; ds.forEach(d=>counts[d.type]=(counts[d.type]||0)+1);
  const detail=Object.entries(counts).map(([k,v])=>`${v} ${k}`).join(' · ') || 'Nessuna bevuta';
  return `<div style="padding:9px 2px;border-bottom:1px solid var(--line)"><strong>${escapeHtml(p.name)}</strong> <span style="color:var(--wine);font-weight:900">${ds.length}</span><div class="tiny muted">${escapeHtml(detail)}</div></div>`;
}
function activityEvent(a){ return `<div class="event"><time>${fmtTime(a.at)}</time><h4>${escapeHtml(a.title||'Evento')}</h4><p>${escapeHtml(a.text||'')}</p></div>`; }

function openStopModal(id){
  const s=stopById(id); if(!s) return; const day=dayOfStop(id); const participants=state.participants||[];
  const m=$('#modal'); const ratings=state.ratings?.[id]||{}; const notes=state.notes?.[id]||{};
  $('#modalBody').innerHTML=`
    <div class="modal-head"><div><div class="tiny muted">${day==='day1'?'Giorno 1':'Giorno 2'} · ${escapeHtml(phaseLabel(s))}</div><h2>${escapeHtml(s.name)}</h2></div><button class="close-btn" data-close>✕</button></div>
    <div class="modal-content">
      <div class="actions-row"><button class="primary-btn ${s.status==='done'?'green':'wine'}" id="visitBtn">${s.status==='done'?'✓ Fatto':'🍷 Siamo qui'}</button><button class="primary-btn ghost" id="skipBtn">${s.status==='skipped'?'↩ Ripristina':'Salta tappa'}</button><button class="primary-btn ghost" id="navBtn">🚶 Portami qui</button></div>
      ${s.type==='bacaro'?`<h3 class="section-title">Registra bevuta</h3>
      <div class="participant-tabs">${participants.length?participants.map((p,i)=>`<button class="pill ${i===0?'active':''}" data-person="${p.id}">${escapeHtml(p.name)}</button>`).join(''):'<button class="pill" id="addPeopleNow">+ Partecipanti</button>'}</div>
      <div class="drink-grid" id="drinkGrid" style="margin-top:10px">${drinkButtons()}</div>
      <h3 class="section-title">Valutazione personale</h3>
      <div class="rating" id="ratingStars">${[1,2,3,4,5].map(n=>`<button class="star" data-star="${n}">★</button>`).join('')}</div>
      <div class="form-row"><label>Nota personale<textarea id="personalNote" placeholder="Una frase, un ricordo, una nota sul bacaro…"></textarea></label><button class="primary-btn ghost" id="saveNoteBtn">Salva nota</button></div>
      <div class="top-event-box"><strong>⭐ Top Event</strong><p class="tiny muted">Annota la scena che deve restare negli annali.</p><input id="topTitle" placeholder="Titolo del Top Event" /><textarea id="topText" placeholder="Che cosa è successo?"></textarea><button class="primary-btn gold" id="topEventBtn">Aggiungi Top Event</button></div>`:''}
      <h3 class="section-title">Modifica tappa</h3>
      <div class="actions-row"><button class="primary-btn ghost" id="editStopBtn">✏️ Modifica</button><button class="primary-btn ghost" id="placeStopBtn">📌 Posiziona su mappa</button></div>
    </div>`;
  bindModalClose(m); $('#navBtn').addEventListener('click',()=>navigateToStop(id));
  $('#visitBtn').addEventListener('click',async()=>{await mutate(st=>{const x=findStop(st,id); if(x)x.status=x.status==='done'?'todo':'done';},{title:s.status==='done'?`Tappa riaperta: ${s.name}`:`${s.name}`,text:s.type==='bacaro'?'Bacaro segnato come visitato':'Tappa completata'}); m.close(); showToast('Aggiornato');});
  $('#skipBtn').addEventListener('click',async()=>{await mutate(st=>{const x=findStop(st,id); if(x)x.status=x.status==='skipped'?'todo':'skipped';},{title:`Tour aggiornato`,text:`${s.name}: ${s.status==='skipped'?'ripristinata':'saltata'}`}); m.close();});
  $('#editStopBtn').addEventListener('click',()=>{m.close();openEditStopModal(id)}); $('#placeStopBtn').addEventListener('click',()=>{m.close();currentView='map';state.config.currentDay=day;render();showToast('Doppio tap sulla mappa per aggiungere una nuova tappa; per questa usa Modifica e inserisci coordinate.')});
  if(s.type==='bacaro') setupBacaroControls(id,participants,ratings,notes);
  m.showModal();
}

function drinkButtons(){ return ['Ombra bianca','Ombra rossa','Spritz','Birra','Prosecco','Altro'].map(x=>`<button class="drink-btn" data-drink="${x}"><strong>${x}</strong><span>＋</span></button>`).join(''); }
function setupBacaroControls(stopId,participants,ratings,notes){
  let active=participants[0]?.id||null;
  const refreshPerson=()=>{ $$('.pill[data-person]').forEach(x=>x.classList.toggle('active',x.dataset.person===active)); const r=ratings?.[active]||0; $$('.star').forEach(x=>x.classList.toggle('on',Number(x.dataset.star)<=r)); $('#personalNote').value=notes?.[active]||''; };
  $$('.pill[data-person]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.person;refreshPerson()}));
  $$('.drink-btn').forEach(b=>b.addEventListener('click',async()=>{if(!active){showToast('Aggiungi prima i partecipanti');return;}const type=b.dataset.drink; const s=stopById(stopId); await mutate(st=>{st.drinks=st.drinks||[];st.drinks.push({id:uid(),stopId,participantId:active,type,at:nowISO()});},{title:`${participantName(active)} · ${type}`,text:s?.name||''}); showToast(`${type} registrata`);}));
  $$('.star').forEach(b=>b.addEventListener('click',async()=>{if(!active)return;const val=Number(b.dataset.star);await mutate(st=>{st.ratings=st.ratings||{};st.ratings[stopId]=st.ratings[stopId]||{};st.ratings[stopId][active]=val;});ratings=state.ratings?.[stopId]||ratings;refreshPerson();}));
  $('#saveNoteBtn').addEventListener('click',async()=>{if(!active)return;const txt=$('#personalNote').value.trim();await mutate(st=>{st.notes=st.notes||{};st.notes[stopId]=st.notes[stopId]||{};st.notes[stopId][active]=txt;});showToast('Nota salvata');});
  $('#topEventBtn').addEventListener('click',async()=>{const title=$('#topTitle').value.trim()||'Top Event';const text=$('#topText').value.trim();if(!text){showToast('Scrivi cosa è successo');return;}const s=stopById(stopId);await mutate(st=>{st.topEvents=st.topEvents||[];st.topEvents.push({id:uid(),stopId,title,text,at:nowISO()});},{title:`⭐ ${title}`,text:`${s?.name||''} · ${text}`});showToast('Top Event aggiunto');$('#topTitle').value='';$('#topText').value='';});
  if($('#addPeopleNow')) $('#addPeopleNow').addEventListener('click',()=>{$('#modal').close();openSettings()});
  refreshPerson();
}

function findStop(st,id){ return [...st.tours.day1.stops,...st.tours.day2.stops].find(s=>s.id===id); }

function openAddStopModal(day,latlng=null){
  const m=$('#modal'); $('#modalBody').innerHTML=`<div class="modal-head"><h2>Aggiungi tappa</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="form-row"><label>Nome<input id="newStopName" placeholder="Nome del bacaro o punto d'interesse"></label><label>Tipo<select id="newStopType"><option value="bacaro">🍷 Bacaro</option><option value="poi">📍 Punto d'interesse</option><option value="hotel">🏨 Hotel</option><option value="transit">🚤/🚆 Trasporto</option></select></label><label>Fase<select id="newStopPhase"><option value="official">Tour</option><option value="prologue">Prologo</option></select></label><label>Latitudine<input id="newLat" inputmode="decimal" value="${latlng?latlng.lat.toFixed(6):''}"></label><label>Longitudine<input id="newLng" inputmode="decimal" value="${latlng?latlng.lng.toFixed(6):''}"></label><label>Nota<textarea id="newStopNote" placeholder="Facoltativo"></textarea></label></div><button class="primary-btn wine" id="saveNewStop">Salva tappa</button></div>`;
  bindModalClose(m); $('#saveNewStop').addEventListener('click',async()=>{const name=$('#newStopName').value.trim();if(!name){showToast('Inserisci il nome');return;}const lat=parseNum($('#newLat').value),lng=parseNum($('#newLng').value);const obj={id:uid(),name,type:$('#newStopType').value,phase:$('#newStopPhase').value,lat,lng,status:'todo',note:$('#newStopNote').value.trim()};await mutate(st=>st.tours[day].stops.push(obj),{title:`Nuova tappa: ${name}`,text:day==='day1'?'Giorno 1':'Giorno 2'});m.close();showToast('Tappa aggiunta');});m.showModal();
}

function openEditStopModal(id){
  const s=stopById(id), day=dayOfStop(id), m=$('#modal'); if(!s)return;
  $('#modalBody').innerHTML=`<div class="modal-head"><h2>Modifica tappa</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="form-row"><label>Nome<input id="editName" value="${attr(s.name)}"></label><label>Tipo<select id="editType">${['bacaro','poi','hotel','transit'].map(x=>`<option value="${x}" ${s.type===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Latitudine<input id="editLat" inputmode="decimal" value="${s.lat??''}"></label><label>Longitudine<input id="editLng" inputmode="decimal" value="${s.lng??''}"></label><label>Nota<textarea id="editNote">${escapeHtml(s.note||'')}</textarea></label><label><input type="checkbox" id="editFixed" ${s.fixed?'checked':''}> Tappa fissa</label><label><input type="checkbox" id="editOptional" ${s.optional?'checked':''}> Opzionale</label></div><div class="actions-row"><button class="primary-btn wine" id="saveEdit">Salva</button><button class="primary-btn ghost" id="deleteStop">Elimina</button></div></div>`;
  bindModalClose(m); $('#saveEdit').addEventListener('click',async()=>{await mutate(st=>{const x=findStop(st,id);x.name=$('#editName').value.trim()||x.name;x.type=$('#editType').value;x.lat=parseNum($('#editLat').value);x.lng=parseNum($('#editLng').value);x.note=$('#editNote').value.trim();x.fixed=$('#editFixed').checked;x.optional=$('#editOptional').checked;},{title:'Tappa modificata',text:$('#editName').value.trim()});m.close();}); $('#deleteStop').addEventListener('click',async()=>{if(!confirm('Eliminare questa tappa?'))return;await mutate(st=>{st.tours[day].stops=st.tours[day].stops.filter(x=>x.id!==id);},{title:'Tappa eliminata',text:s.name});m.close();});m.showModal();
}

function openManageStops(day){
  const t=state.tours[day],m=$('#modal'); $('#modalBody').innerHTML=`<div class="modal-head"><h2>Modifica ordine</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><p class="muted tiny">Sposta le tappe su/giù. Le modifiche sono condivise.</p><div class="stop-list">${t.stops.map((s,i)=>`<div class="card stop-card"><div class="stop-icon">${i+1}</div><div><h3>${escapeHtml(s.name)}</h3><div class="tiny muted">${s.lat==null?'Da posizionare':'Posizionata'}</div></div><div class="stop-actions"><button class="mini-icon" data-move="up" data-id="${s.id}">↑</button><button class="mini-icon" data-move="down" data-id="${s.id}">↓</button></div></div>`).join('')}</div></div>`;
  bindModalClose(m); $$('[data-move]').forEach(b=>b.addEventListener('click',async()=>{await mutate(st=>{const arr=st.tours[day].stops,idx=arr.findIndex(x=>x.id===b.dataset.id),to=b.dataset.move==='up'?idx-1:idx+1;if(idx<0||to<0||to>=arr.length)return;[arr[idx],arr[to]]=[arr[to],arr[idx]];});m.close();openManageStops(day);}));m.showModal();
}

function openSettings(){
  const m=$('#modal'); $('#modalBody').innerHTML=`<div class="modal-head"><h2>Impostazioni Tour</h2><button class="close-btn" data-close>✕</button></div><div class="modal-content"><div class="sync-box ${backendMode}"><strong>${backendMode==='remote'?'✅ Condivisione LIVE attiva':'⚠️ Modalità demo locale'}</strong><div class="tiny muted" style="margin-top:3px">${backendMode==='remote'?'Ogni modifica viene sincronizzata in tempo reale su tutti i telefoni.':'Per condividere i dati devi inserire la configurazione Firebase in firebase-config.js.'}</div></div><h3 class="section-title">Partecipanti</h3><div class="settings-list" id="peopleList">${state.participants.map(p=>`<div class="person-row"><input value="${attr(p.name)}" data-person-name="${p.id}"><button class="small-btn" data-remove-person="${p.id}">✕</button></div>`).join('')}</div><button class="small-btn" id="addPerson" style="margin-top:8px">＋ Aggiungi partecipante</button><h3 class="section-title">Organizzazione</h3><div class="form-row"><label>Data<input type="date" id="tourDate" value="${attr(state.config.date)}"></label><label>Hotel<input id="hotelName" value="${attr(state.config.hotelName||'')}"></label><label>Indirizzo hotel<input id="hotelAddress" value="${attr(state.config.hotelAddress||'')}"></label></div><button class="primary-btn wine" id="saveSettings">Salva impostazioni</button><hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><button class="small-btn" id="resetLocal">Ripristina dati iniziali (solo demo locale)</button></div>`;
  bindModalClose(m); $('#addPerson').addEventListener('click',async()=>{await mutate(st=>st.participants.push({id:uid(),name:`Partecipante ${st.participants.length+1}`}));m.close();openSettings();}); $$('[data-remove-person]').forEach(b=>b.addEventListener('click',async()=>{await mutate(st=>{st.participants=st.participants.filter(p=>p.id!==b.dataset.removePerson)});m.close();openSettings();})); $('#saveSettings').addEventListener('click',async()=>{const names={};$$('[data-person-name]').forEach(i=>names[i.dataset.personName]=i.value.trim());await mutate(st=>{st.participants.forEach(p=>p.name=names[p.id]||p.name);st.config.date=$('#tourDate').value;st.config.hotelName=$('#hotelName').value.trim();st.config.hotelAddress=$('#hotelAddress').value.trim();const h=findStop(st,'hotel');if(h){h.name=st.config.hotelName||'Hotel / Check-in';h.note=st.config.hotelAddress||'Zona Rialto · da impostare';}});m.close();showToast('Impostazioni salvate');}); $('#resetLocal').disabled=backendMode==='remote';$('#resetLocal').addEventListener('click',()=>{if(backendMode==='remote')return;if(confirm('Ripristinare la demo?')){state=clone(starterState);localStorage.setItem(storageKey,JSON.stringify(state));m.close();render();}}); m.showModal();
}

function bindModalClose(m){ $$('[data-close]',m).forEach(b=>b.addEventListener('click',()=>m.close())); }
function parseNum(v){ const n=Number(String(v).replace(',','.')); return Number.isFinite(n)?n:null; }
function escapeHtml(v=''){ return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function attr(v=''){ return escapeHtml(v).replace(/`/g,'&#096;'); }

$$('.nav-btn').forEach(b=>b.addEventListener('click',()=>{currentView=b.dataset.view;render();}));
$('#settingsBtn').addEventListener('click',openSettings);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')) $('#modal').close();});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__installPrompt=e;});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.warn);

await initBackend();
render();
