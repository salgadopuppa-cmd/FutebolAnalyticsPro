// Minimal clean app.js
// Purpose: Consent (CMP), local coin persistence, simple gamification, SPA navigation, optional Firebase hooks

// DOM refs
const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const userProfile = document.getElementById('userProfile');
const userCoinsDisplay = document.getElementById('userCoins');
const backendStatusText = document.getElementById('statusText');
const backendStatusIndicator = document.querySelector('.status-indicator');
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const iaResponseDiv = document.getElementById('iaResponse');
const featuredMatchesDiv = document.getElementById('featuredMatches');
const serieATableDiv = document.getElementById('serieATable');
const serieBTableDiv = document.getElementById('serieBTable');
const gameContentArea = document.getElementById('gameContentArea');

// App state
let currentUser = null;
let userCoins = 0;
let interactionsCount = 0;
let gamesPlayedCount = 0;
let startTime = Date.now();
let engagementScore = 0;

// Keys
const COINS_STORAGE_KEY = 'fap_user_coins_v1';
const CONSENT_KEY = 'fap_user_consent_v1';

// Demo data
const CLASSIFICATION_DATA = {
  serieA: [ { pos:1, team:'Fluminense', pts:65 }, { pos:2, team:'Flamengo', pts:62 } ],
  serieB: [ { pos:1, team:'Vasco', pts:72 } ]
};

// Helpers
function loadCoinsFromStorage(){ try{ const raw=localStorage.getItem(COINS_STORAGE_KEY); if(raw!==null){ const v=parseInt(raw,10); if(!isNaN(v)) userCoins=v; } }catch(e){ console.warn(e); } }
function saveCoinsToStorage(){ try{ localStorage.setItem(COINS_STORAGE_KEY, String(userCoins)); }catch(e){console.warn(e);} }
function showToast(msg, opts={}){ const c=document.getElementById('toastContainer'); if(!c) return; const t=document.createElement('div'); t.className='toast'; t.textContent=msg; c.appendChild(t); setTimeout(()=>t.classList.add('show'),10); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, opts.ttl||3500); }

function getConsent(k){ try{ const raw=localStorage.getItem(CONSENT_KEY); if(!raw) return false; return !!JSON.parse(raw)[k]; }catch(e){return false;} }
function setConsent(o){ try{ localStorage.setItem(CONSENT_KEY, JSON.stringify(o||{})); }catch(e){console.warn(e);} }
function lazyLoadAdSense() {
  if (document.querySelector('script[data-consent-loaded="ads"]')) return;
  const ph = document.querySelector('script[data-consent="ads"]');
  if (ph) {
    const s = document.createElement('script');
    s.src = ph.getAttribute('data-src');
    s.async = true;
    s.setAttribute('data-consent-loaded', 'ads');
    document.head.appendChild(s);
  }
}
function lazyLoadGtag() {
  if (document.querySelector('script[data-consent-loaded="analytics"]')) return;
  const ph = document.querySelector('script[data-consent="analytics"]');
  if (ph) {
    const s = document.createElement('script');
    s.src = ph.getAttribute('data-src');
    s.async = true;
    s.setAttribute('data-consent-loaded', 'analytics');
    document.head.appendChild(s);
    // Inline gtag init
    const init = document.getElementById('gtag-init');
    if (init) {
      const inline = document.createElement('script');
      inline.text = init.textContent;
      inline.setAttribute('data-consent-loaded', 'analytics');
      document.head.appendChild(inline);
    }
  }
}
function applyConsentScripts(consent) {
  if (consent?.ads) lazyLoadAdSense();
  if (consent?.analytics) lazyLoadGtag();
}
// Ensure showConsentBannerIfNeeded exists and is safe to call from DOMContentLoaded
function showConsentBannerIfNeeded() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    const consent = raw ? JSON.parse(raw) : null;
    const b = document.getElementById('consentBanner');
    // If no consent recorded, show the banner
    if (!consent) {
      if (b) b.style.display = 'block';
      return;
    }
    // If consent exists, ensure scripts load for granted categories
    if (consent) applyConsentScripts(consent);
    if (b) b.style.display = 'none';
  } catch (e) {
    // fail silently
    console.warn('showConsentBannerIfNeeded error', e);
  }
}
window.acceptAllConsent = ()=>{
  const consent = {analytics:true,ads:true,backend:true};
  setConsent(consent);
  applyConsentScripts(consent);
  const b=document.getElementById('consentBanner'); if(b) b.style.display='none'; showToast('Consent saved');
};
window.rejectAllConsent = ()=>{ setConsent({analytics:false,ads:false,backend:false}); const b=document.getElementById('consentBanner'); if(b) b.style.display='none'; showToast('Consent rejected'); };

function generateTableHTML(data){ if(!Array.isArray(data)) return '<p>No data</p>'; let html='<table class="mini-table"><thead><tr><th>Pos</th><th>Team</th><th>Pts</th></tr></thead><tbody>'; data.forEach(r=> html+=`<tr><td>${r.pos}</td><td>${r.team}</td><td>${r.pts}</td></tr>`); html+='</tbody></table>'; return html; }
function animateCoinGain(n){ const el=document.createElement('div'); el.textContent=`+${n} 💰`; el.className='coin-fly'; el.style.cssText='position:fixed;top:80px;right:15%;background:#f1c40f;padding:6px 12px;border-radius:20px;z-index:9999;opacity:0;transform:translateY(12px);transition:all .45s'; document.body.appendChild(el); setTimeout(()=>{el.style.opacity='1';el.style.transform='translateY(0)';},20); setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(-20px)';},1400); setTimeout(()=>el.remove(),1800); }

// Auth & gamification (minimal)
function signIn(){ currentUser={ name:'LocalUser', userId:`local-${Date.now()}` }; loadCoinsFromStorage(); if(!userCoins) userCoins=500; updateAuthState(true); showToast('Signed in (local)'); }
function signOut(){ currentUser=null; saveCoinsToStorage(); userCoins=0; updateAuthState(false); showToast('Signed out'); }

function updateAuthState(logged){ const secs=document.querySelectorAll('.auth-required'); const prompts=document.querySelectorAll('.sign-in-prompt'); if(logged && currentUser){ if(signInButton) signInButton.style.display='none'; if(signOutButton) signOutButton.style.display='block'; if(userProfile) userProfile.style.display='flex'; const uname=document.getElementById('userName'); if(uname && currentUser.name) uname.textContent=currentUser.name; if(userCoinsDisplay) userCoinsDisplay.textContent=userCoins; secs.forEach(s=>s.classList.add('logged-in')); prompts.forEach(p=>p.classList.add('logged-in')); } else { if(signInButton) signInButton.style.display='block'; if(signOutButton) signOutButton.style.display='none'; if(userProfile) userProfile.style.display='none'; secs.forEach(s=>s.classList.remove('logged-in')); prompts.forEach(p=>p.classList.remove('logged-in')); } }

function quickQuery(q){ if(!currentUser){ if(iaResponseDiv) iaResponseDiv.innerHTML='<p style="color:#e74c3c">🔒 Login required</p>'; return; } interactionsCount++; const G=5; userCoins+=G; if(userCoinsDisplay) userCoinsDisplay.textContent=userCoins; animateCoinGain(G); saveCoinsToStorage(); showToast(`+${G} coins`); if(iaResponseDiv) iaResponseDiv.innerHTML=`<p>Response for ${q}</p>`; updateMetrics(); }
async function openGame(name){
  if(!currentUser){ showToast('Login needed'); return; }
  const container = document.getElementById('gameContentArea');
  if(!container) return;
  container.innerHTML = '<p>Carregando minigame...</p>';
  try{
    let mod = null;
    switch((name||'').toLowerCase()){
      case 'precisao':
      case 'tactical':
        mod = await import('./games/precisao.js'); break;
      case 'goleiro':
      case 'goalkeeper':
        mod = await import('./games/goleiro.js'); break;
      case 'fisico':
      case 'conditioning':
        mod = await import('./games/fisico.js'); break;
      case 'ranking':
        mod = await import('./games/ranking.js'); break;
      default:
        container.innerHTML = `<p>Minigame não encontrado: ${name}</p>`; return;
    }
    // Provide onFinish that awards coins and optionally posts to /api/ranking
    const onFinish = async (score)=>{
      // award coins based on score (simple rule)
      const coins = Math.max(0, Math.round((score||0)/5));
      if(coins>0){ userCoins += coins; if(userCoinsDisplay) userCoinsDisplay.textContent = userCoins; animateCoinGain(coins); saveCoinsToStorage(); showToast(`+${coins} coins (game)`); }
      // try to post to backend ranking endpoint if available
      try{
        await fetch('/api/ranking', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ game: name, nome: currentUser?.name || currentUser?.email || 'Anonymous', pontos: score }) });
      }catch(e){ /* ignore backend errors */ }
      // If the module exposes ranking renderer, show global ranking
      try{ if(mod && mod.renderGlobalRanking){ mod.renderGlobalRanking(container, name); } else { // load ranking module
          const rmod = await import('./games/ranking.js'); rmod.renderGlobalRanking(container, name); }
      }catch(e){ console.warn('Could not render ranking', e); }
    };
    // Clear container and render
    container.innerHTML = '';
    if(typeof mod.renderPrecisaoGame === 'function'){ mod.renderPrecisaoGame(container, onFinish); }
    else if(typeof mod.renderGoleiroGame === 'function'){ mod.renderGoleiroGame(container, onFinish); }
    else if(typeof mod.renderFisicoGame === 'function'){ mod.renderFisicoGame(container, onFinish); }
    else if(typeof mod.renderGlobalRanking === 'function'){ mod.renderGlobalRanking(container, name); }
    else { container.innerHTML = '<p>Minigame carregado, mas não possui função de render.</p>'; }
  }catch(e){ console.warn('openGame error', e); container.innerHTML = '<p>Falha ao carregar o minigame.</p>'; }
}
window.endGame = ()=>{ saveCoinsToStorage(); showToast('Game ended'); if(gameContentArea) gameContentArea.innerHTML=''; };

function updateMetrics(){ const s=Math.floor((Date.now()-startTime)/1000); engagementScore = Math.min((interactionsCount*1.5)+(gamesPlayedCount*3)+(s/120),10); const se=document.getElementById('sessionTime'); if(se) se.textContent=`${s}s`; const ie=document.getElementById('interactions'); if(ie) ie.textContent=interactionsCount; const ge=document.getElementById('gamesPlayed'); if(ge) ge.textContent=gamesPlayedCount; const eng=document.getElementById('engagementScore'); if(eng) eng.textContent=engagementScore.toFixed(2); }

function loadFeaturedMatches(){ if(featuredMatchesDiv) featuredMatchesDiv.innerHTML = '<h3>Próximos Jogos</h3>' + generateTableHTML(CLASSIFICATION_DATA.serieA); }
// --- Real data loaders (call backend proxy endpoints) ---
async function loadSerieAReal(){
  try{
    const res = await fetch('/api/sports/brasileirao-tabela');
    const data = await res.json();
    const standings = data.response?.[0]?.league?.standings?.[0];
    if(!standings) { document.getElementById('serieATable').innerHTML = '<p>Nenhum dado disponível.</p>'; return; }
    let html = `<table class="mini-table"><thead><tr><th>Pos</th><th>Time</th><th>Pts</th></tr></thead><tbody>`;
    standings.forEach(team=>{
      html += `<tr><td>${team.rank}</td><td><img src="${team.team.logo}" style="height:18px;vertical-align:middle;margin-right:6px"> ${team.team.name}</td><td>${team.points}</td></tr>`;
    });
    html += `</tbody></table>`;
    const el = document.getElementById('serieATable'); if(el) el.innerHTML = html;
  }catch(e){ console.warn(e); const el=document.getElementById('serieATable'); if(el) el.innerHTML = '<p>Erro ao carregar classificações.</p>'; }
}

async function loadArtilheiros(){
  try{
    const res = await fetch('/api/sports/brasileirao-artilheiros');
    const data = await res.json();
    const list = data.response || [];
    let html = `<table class="mini-table"><thead><tr><th>Jogador</th><th>Time</th><th>Gols</th></tr></thead><tbody>`;
    list.forEach(p=>{
      const player = p.player || {};
      const stats = p.statistics?.[0] || {};
      const team = stats.team || {};
      const goals = stats.goals?.total ?? '-';
      html += `<tr><td><img src="${player.photo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${player.name}</td><td><img src="${team.logo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${team.name||''}</td><td>${goals}</td></tr>`;
    });
    html += `</tbody></table>`;
    const el = document.getElementById('artilheirosTable'); if(el) el.innerHTML = html;
    // render chart if Chart.js available
    try{ if(window.Chart) renderGraficoArtilheiros(data.response || []); }catch(e){}
  }catch(e){ console.warn(e); const el=document.getElementById('artilheirosTable'); if(el) el.innerHTML = '<p>Erro ao carregar artilheiros.</p>'; }
}

// Chart renderers (Chart.js)
function renderGraficoArtilheiros(players){
  try{
    const top = (players || []).slice(0,10);
    const nomes = top.map(p=>p.player?.name || '');
    const gols = top.map(p=>p.statistics?.[0]?.goals?.total ?? 0);
    const el = document.getElementById('chartArtilheiros'); if(!el) return;
    const ctx = el.getContext('2d');
    if(window._chartArtilheiros) window._chartArtilheiros.destroy();
    window._chartArtilheiros = new Chart(ctx, {
      type: 'bar',
      data: { labels: nomes, datasets: [{ label: 'Goals', data: gols, backgroundColor: 'rgba(46,204,113,0.7)' }] },
      options: { responsive: true, plugins:{ legend:{ display:false }, title:{ display:true, text:'Top Scorers - Série A' } }, scales:{ x:{ title:{ display:true, text:'Player' } }, y:{ title:{ display:true, text:'Goals' }, beginAtZero:true } } }
    });
  }catch(e){ console.warn('chart artilheiros failed', e); }
}

// Serie B loader (uses server proxy endpoint)
async function loadSerieB(){
  try{
    const res = await fetch('/api/sports/brasileirao-b-tabela');
    const data = await res.json();
    const standings = data.response?.[0]?.league?.standings?.[0];
    if(!standings) { const el=document.getElementById('serieBTable'); if(el) el.innerHTML = '<p>Nenhum dado disponível.</p>'; return; }
    let html = `<table class="mini-table"><thead><tr><th>Pos</th><th>Time</th><th>Pts</th></tr></thead><tbody>`;
    standings.forEach(team=>{
      html += `<tr><td>${team.rank}</td><td><img src="${team.team.logo}" style="height:18px;vertical-align:middle;margin-right:6px"> ${team.team.name}</td><td>${team.points}</td></tr>`;
    });
    html += `</tbody></table>`;
    const el = document.getElementById('serieBTable'); if(el) el.innerHTML = html;
  }catch(e){ console.warn(e); const el=document.getElementById('serieBTable'); if(el) el.innerHTML = '<p>Erro ao carregar Serie B.</p>'; }
}

// Copa do Brasil loaders require caller to pass league id via query param or configure appropriately.
async function loadCopaTabela(leagueId){
  try{
    if(!leagueId){ const el=document.getElementById('copaTable'); if(el) el.innerHTML = '<p>League id required for Copa do Brasil data.</p>'; return; }
    const res = await fetch(`/api/sports/copadobrasil-tabela?league=${leagueId}`);
    const data = await res.json();
    const standings = data.response?.[0]?.league?.standings?.[0];
    if(!standings) { document.getElementById('copaTable').innerHTML = '<p>Nenhum dado disponível.</p>'; return; }
    let html = `<table class="mini-table"><thead><tr><th>Pos</th><th>Time</th><th>Pts</th></tr></thead><tbody>`;
    standings.forEach(team=>{
      html += `<tr><td>${team.rank}</td><td><img src="${team.team.logo}" style="height:18px;vertical-align:middle;margin-right:6px"> ${team.team.name}</td><td>${team.points}</td></tr>`;
    });
    html += `</tbody></table>`;
    const el = document.getElementById('copaTable'); if(el) el.innerHTML = html;
  }catch(e){ console.warn(e); const el=document.getElementById('copaTable'); if(el) el.innerHTML = '<p>Erro ao carregar Copa do Brasil.</p>'; }
}

async function loadArtilheirosSerieB(){
  try{
    const res = await fetch('/api/sports/brasileirao-b-artilheiros');
    const data = await res.json();
    const list = data.response || [];
    let html = `<table class="mini-table"><thead><tr><th>Jogador</th><th>Time</th><th>Gols</th></tr></thead><tbody>`;
    list.forEach(p=>{
      const player = p.player || {};
      const stats = p.statistics?.[0] || {};
      const team = stats.team || {};
      const goals = stats.goals?.total ?? '-';
      html += `<tr><td><img src="${player.photo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${player.name}</td><td><img src="${team.logo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${team.name||''}</td><td>${goals}</td></tr>`;
    });
    html += `</tbody></table>`;
    const el = document.getElementById('artilheirosSerieB'); if(el) el.innerHTML = html;
  }catch(e){ console.warn(e); const el=document.getElementById('artilheirosSerieB'); if(el) el.innerHTML = '<p>Erro ao carregar artilheiros Serie B.</p>'; }
}

async function loadArtilheirosCopa(leagueId){
  try{
    if(!leagueId){ const el=document.getElementById('artilheirosCopa'); if(el) el.innerHTML = '<p>League id required for Copa artilheiros.</p>'; return; }
    const res = await fetch(`/api/sports/copadobrasil-artilheiros?league=${leagueId}`);
    const data = await res.json();
    const list = data.response || [];
    let html = `<table class="mini-table"><thead><tr><th>Jogador</th><th>Time</th><th>Gols</th></tr></thead><tbody>`;
    list.forEach(p=>{
      const player = p.player || {};
      const stats = p.statistics?.[0] || {};
      const team = stats.team || {};
      const goals = stats.goals?.total ?? '-';
      html += `<tr><td><img src="${player.photo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${player.name}</td><td><img src="${team.logo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${team.name||''}</td><td>${goals}</td></tr>`;
    });
    html += `</tbody></table>`;
    const el = document.getElementById('artilheirosCopa'); if(el) el.innerHTML = html;
  }catch(e){ console.warn(e); const el=document.getElementById('artilheirosCopa'); if(el) el.innerHTML = '<p>Erro ao carregar artilheiros Copa do Brasil.</p>'; }
}

// Generic renderer helpers
function renderPlayersTable(containerId, list, valuePathFn){
  const targets = [];
  const primary = document.getElementById(containerId);
  if(primary) targets.push(primary);
  // legacy/id variants: append 'Table' or 'Table' in different positions
  const legacy1 = document.getElementById(`${containerId}Table`);
  if(legacy1) targets.push(legacy1);
  const legacy2 = document.getElementById(containerId.replace('Serie','Serie') + 'Table');
  if(legacy2 && !targets.includes(legacy2)) targets.push(legacy2);
  if(targets.length === 0) return;
  if(!Array.isArray(list) || list.length===0){ targets.forEach(t => t.innerHTML = '<p>Nenhum dado disponível.</p>'); return; }
  let html = `<table class="mini-table"><thead><tr><th>Jogador</th><th>Time</th><th>Stat</th></tr></thead><tbody>`;
  list.forEach(p=>{
    const player = p.player || {};
    const stats = p.statistics?.[0] || {};
    const team = stats.team || {};
    const val = valuePathFn(p, stats) ?? '-';
    html += `<tr><td><img src="${player.photo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${player.name}</td><td><img src="${team.logo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${team.name||''}</td><td>${val}</td></tr>`;
  });
  html += `</tbody></table>`;
  targets.forEach(t => t.innerHTML = html);
}

// Assistências renderers
async function loadAssistenciasSerieA(){
  try{
    const res = await fetch('/api/sports/brasileirao-assistencias');
    const data = await res.json();
    renderPlayersTable('assistenciasSerieA', data.response || [], (p, stats) => stats.goals?.assists ?? '-');
    try{ if(window.Chart) renderGraficoAssistencias(data.response || []); }catch(e){}
  }catch(e){ console.warn(e); const el=document.getElementById('assistenciasSerieA'); if(el) el.innerHTML = '<p>Erro ao carregar assistências.</p>'; }
}

function renderGraficoAssistencias(players){
  try{
    const top = (players || []).slice(0,10);
    const nomes = top.map(p=>p.player?.name || '');
    const assists = top.map(p=>p.statistics?.[0]?.goals?.assists ?? 0);
    const el = document.getElementById('chartAssistencias'); if(!el) return;
    const ctx = el.getContext('2d');
    if(window._chartAssistencias) window._chartAssistencias.destroy();
    window._chartAssistencias = new Chart(ctx, { type:'bar', data:{ labels:nomes, datasets:[{ label:'Assists', data:assists, backgroundColor:'rgba(52,152,219,0.7)' }] }, options:{ responsive:true } });
  }catch(e){ console.warn('chart assists failed', e); }
}
async function loadAssistenciasSerieB(){
  try{ const res = await fetch('/api/sports/brasileirao-b-assistencias'); const data = await res.json(); renderPlayersTable('assistenciasSerieB', data.response || [], (p, stats) => stats.goals?.assists ?? '-'); }catch(e){ console.warn(e); const el=document.getElementById('assistenciasSerieB'); if(el) el.innerHTML = '<p>Erro ao carregar assistências.</p>'; }
}
async function loadAssistenciasCopa(leagueId){ if(!leagueId){ const el=document.getElementById('assistenciasCopa'); if(el) el.innerHTML = '<p>League id required.</p>'; return; } try{ const res = await fetch(`/api/sports/copadobrasil-assistencias?league=${leagueId}`); const data = await res.json(); renderPlayersTable('assistenciasCopa', data.response || [], (p, stats) => stats.goals?.assists ?? '-'); }catch(e){ console.warn(e); const el=document.getElementById('assistenciasCopa'); if(el) el.innerHTML = '<p>Erro ao carregar assistências Copa.</p>'; } }

// Cards renderer (yellow/red)
async function loadCartoesSerieA(){ try{ const res = await fetch('/api/sports/brasileirao-cartoes'); const data = await res.json(); renderPlayersTable('cartoesSerieA', data.response || [], (p, stats) => `${stats.cards?.yellow||0} Y / ${stats.cards?.red||0} R`); }catch(e){ console.warn(e); const el=document.getElementById('cartoesSerieA'); if(el) el.innerHTML = '<p>Erro ao carregar cartões.</p>'; } }
async function loadCartoesSerieB(){ try{ const res = await fetch('/api/sports/brasileirao-b-cartoes'); const data = await res.json(); renderPlayersTable('cartoesSerieB', data.response || [], (p, stats) => `${stats.cards?.yellow||0} Y / ${stats.cards?.red||0} R`); }catch(e){ console.warn(e); const el=document.getElementById('cartoesSerieB'); if(el) el.innerHTML = '<p>Erro ao carregar cartões.</p>'; } }
async function loadCartoesCopa(leagueId){ if(!leagueId){ const el=document.getElementById('cartoesCopa'); if(el) el.innerHTML = '<p>League id required.</p>'; return; } try{ const res = await fetch(`/api/sports/copadobrasil-cartoes?league=${leagueId}`); const data = await res.json(); renderPlayersTable('cartoesCopa', data.response || [], (p, stats) => `${stats.cards?.yellow||0} Y / ${stats.cards?.red||0} R`); }catch(e){ console.warn(e); const el=document.getElementById('cartoesCopa'); if(el) el.innerHTML = '<p>Erro ao carregar cartões Copa.</p>'; } }

// Goalkeepers renderer (clean sheets)
async function loadGoleirosSerieA(){
  try{
    const res = await fetch('/api/sports/brasileirao-goleiros');
    const data = await res.json();
    renderPlayersTable('goleirosSerieA', data.response || [], (p, stats) => stats.games?.cleansheets ?? (stats.games?.appearences? 0 : '-'));
    try{ if(window.Chart) renderGraficoGoleiros(data.response || []); }catch(e){}
  }catch(e){ console.warn(e); const el=document.getElementById('goleirosSerieA'); if(el) el.innerHTML = '<p>Erro ao carregar goleiros.</p>'; }
}

function renderGraficoGoleiros(players){
  try{
    const top = (players || []).slice(0,10);
    const nomes = top.map(p=>p.player?.name || '');
    const cleans = top.map(p=>p.statistics?.[0]?.games?.cleansheets ?? 0);
    const el = document.getElementById('chartGoleiros'); if(!el) return;
    const ctx = el.getContext('2d');
    if(window._chartGoleiros) window._chartGoleiros.destroy();
    window._chartGoleiros = new Chart(ctx, { type:'bar', data:{ labels:nomes, datasets:[{ label:'Clean Sheets', data:cleans, backgroundColor:'rgba(241,196,15,0.8)' }] }, options:{ responsive:true } });
  }catch(e){ console.warn('chart goleiros failed', e); }
}
async function loadGoleirosSerieB(){ try{ const res = await fetch('/api/sports/brasileirao-b-goleiros'); const data = await res.json(); renderPlayersTable('goleirosSerieB', data.response || [], (p, stats) => stats.games?.cleansheets ?? '-'); }catch(e){ console.warn(e); const el=document.getElementById('goleirosSerieB'); if(el) el.innerHTML = '<p>Erro ao carregar goleiros.</p>'; } }
async function loadGoleirosCopa(leagueId){ if(!leagueId){ const el=document.getElementById('goleirosCopa'); if(el) el.innerHTML = '<p>League id required.</p>'; return; } try{ const res = await fetch(`/api/sports/copadobrasil-goleiros?league=${leagueId}`); const data = await res.json(); renderPlayersTable('goleirosCopa', data.response || [], (p, stats) => stats.games?.cleansheets ?? '-'); }catch(e){ console.warn(e); const el=document.getElementById('goleirosCopa'); if(el) el.innerHTML = '<p>Erro ao carregar goleiros Copa.</p>'; } }

// Upcoming matches renderer
async function loadProximosMatches(){ try{ const res = await fetch('/api/sports/brasileirao-proximos'); const data = await res.json(); const list = data.response || []; const el = document.getElementById('proximosMatches'); if(!el) return; if(!Array.isArray(list) || list.length===0){ el.innerHTML = '<p>Nenhum próximo jogo encontrado.</p>'; return; } let html = `<table class="mini-table"><thead><tr><th>Data</th><th>Casa</th><th>Visitante</th><th>Competição</th></tr></thead><tbody>`; list.forEach(match=>{ const fixture = match.fixture || {}; const teams = match.teams || {}; html += `<tr><td>${fixture.date? new Date(fixture.date).toLocaleString(): '-'}</td><td><img src="${teams.home?.logo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${teams.home?.name||''}</td><td><img src="${teams.away?.logo||''}" style="height:18px;vertical-align:middle;margin-right:6px"> ${teams.away?.name||''}</td><td>${match.league?.name||''}</td></tr>`; }); html += `</tbody></table>`; el.innerHTML = html; }catch(e){ console.warn(e); const el=document.getElementById('proximosMatches'); if(el) el.innerHTML = '<p>Erro ao carregar próximos jogos.</p>'; } }
function checkBackendStatus(){ if(backendStatusText) backendStatusText.textContent='Servidor Online'; if(backendStatusIndicator) { backendStatusIndicator.classList.remove('status-loading'); backendStatusIndicator.classList.add('status-online'); } }

function navigateTo(pageId){ pages.forEach(p=>p.classList.remove('active')); const t=document.getElementById(pageId); if(t) t.classList.add('active'); navButtons.forEach(b=> b.getAttribute('data-page')===pageId? b.classList.add('active'): b.classList.remove('active')); history.pushState(null,null,`#${pageId}`); }

// Keep simple load flags to avoid refetching repeatedly
const _loaded = { serieA: false, artilheiros: false, serieB: false, artilheirosB: false, assistA:false, assistB:false, cardsA:false, cardsB:false, gkA:false, gkB:false, next:false, copa:false, artilheirosCopa:false, assistCopa:false, cardsCopa:false, gkCopa:false };


// Wiring
document.addEventListener('DOMContentLoaded', ()=>{
  const cs=document.getElementById('consentSettingsBtn'); if(cs) cs.addEventListener('click', ()=>{ const m=document.getElementById('consentModal'); if(m) m.style.display='flex'; });
  const sv=document.getElementById('saveConsentBtn'); if(sv) sv.addEventListener('click', ()=>{
    const newC={ analytics: !!document.getElementById('cons_analytics')?.checked, ads: !!document.getElementById('cons_ads')?.checked, backend: !!document.getElementById('cons_backend')?.checked };
    // Persist locally
    setConsent(newC);
    // Try to persist server-side (sets cookie for server-side injection)
    fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newC)
    }).then(r=>{
      if(!r.ok) throw new Error('server rejected consent');
      return r.json();
    }).then(()=>{
      applyConsentScripts(newC);
      const m=document.getElementById('consentModal'); if(m) m.style.display='none'; showToast('Consent saved');
    }).catch(err=>{
      console.warn('Failed to persist consent to server', err);
      // Fallback: still apply and inform the user
      applyConsentScripts(newC);
      const m=document.getElementById('consentModal'); if(m) m.style.display='none'; showToast('Consent saved locally (server unavailable)');
    });
  });
  const cancel=document.getElementById('cancelConsentBtn'); if(cancel) cancel.addEventListener('click', ()=>{ const m=document.getElementById('consentModal'); if(m) m.style.display='none'; });
  navButtons.forEach(b=> b.addEventListener('click', e=>{ e.preventDefault(); const id=b.getAttribute('data-page'); navigateTo(id); }));
  if(signInButton) signInButton.addEventListener('click', signIn); if(signOutButton) signOutButton.addEventListener('click', signOut);
  try{ const cfg=JSON.parse(localStorage.getItem('fap_firebase_cfg')||'null'); if(cfg) initFirebaseFromConfig(cfg); }catch(e){}
  showConsentBannerIfNeeded();
  // On load, if consent exists, apply scripts
  try{ const c=JSON.parse(localStorage.getItem(CONSENT_KEY)||'null'); if(c) applyConsentScripts(c); }catch(e){}
  // Populate radar selects when DOM is ready
  try{ populateTimesRadar(); populateJogadoresRadar(); }catch(e){}
  // Contact form submission (AJAX)
  try{
    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactSuccess');
    const contactError = document.getElementById('contactError');
    if(contactForm){
      contactForm.addEventListener('submit', async (ev)=>{
        ev.preventDefault();
        if(contactSuccess) contactSuccess.style.display='none';
        if(contactError) contactError.style.display='none';
        const name = (document.getElementById('contactName')?.value||'').trim();
        const email = (document.getElementById('contactEmail')?.value||'').trim();
        const message = (document.getElementById('contactMessage')?.value||'').trim();
        if(!name||!email||!message){ if(contactError){ contactError.textContent='Preencha todos os campos.'; contactError.style.display='block'; } return; }
        // Optional reCAPTCHA
        let recaptchaToken = null;
        if(window.grecaptcha && typeof grecaptcha.getResponse === 'function'){
          try{ recaptchaToken = grecaptcha.getResponse(); }catch(e){}
        }
        try{
          const resp = await fetch('/api/contact', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ name, email, message, recaptcha: recaptchaToken }) });
          const body = await resp.json().catch(()=>({}));
          if(resp.ok && body && body.message){ if(contactSuccess){ contactSuccess.style.display='block'; contactForm.reset(); } }
          else { if(contactError){ contactError.textContent = body.error || 'Falha ao enviar. Tente novamente.'; contactError.style.display='block'; } }
        }catch(e){ if(contactError){ contactError.textContent = 'Erro inesperado: '+(e && e.message ? e.message : 'network error'); contactError.style.display='block'; } }
      });
    }
  }catch(e){ console.warn('contact form init failed', e); }
});

window.onload = ()=>{ const h=window.location.hash.substring(1); if(h && document.getElementById(h)) navigateTo(h); else navigateTo('home'); checkBackendStatus(); loadFeaturedMatches(); setInterval(updateMetrics,1000); loadCoinsFromStorage(); updateAuthState(false); if(userCoinsDisplay) userCoinsDisplay.textContent=userCoins; };

// --- Firebase client initializer (paste config JSON into modal and initialize) ---
window.initFirebaseFromConfig = function(cfg){
  try{
    // Save config locally
    localStorage.setItem('fap_firebase_cfg', JSON.stringify(cfg));
  }catch(e){ console.warn('Could not persist firebase cfg', e); }
  // Dynamically load Firebase scripts if not present
  if(!window.firebase){
    const s1 = document.createElement('script'); s1.src = 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js'; s1.onload = ()=>{ const s2=document.createElement('script'); s2.src='https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js'; s2.onload = ()=>{ try{ firebase.initializeApp(cfg); window._firebaseApp = firebase; window._firebaseAuth = firebase.auth(); console.log('Firebase initialized (compat)'); attachFirebaseAuthHandlers(); }catch(e){ console.warn('firebase init failed', e); } }; document.head.appendChild(s2); }; document.head.appendChild(s1);
  } else {
    try{ firebase.initializeApp(cfg); window._firebaseApp = firebase; window._firebaseAuth = firebase.auth(); attachFirebaseAuthHandlers(); }catch(e){ console.warn('firebase init failed', e); }
  }
};

function attachFirebaseAuthHandlers(){
  // Wire sign-in button to Google popup
  const signInBtn = document.getElementById('signInButton');
  if(signInBtn){ signInBtn.removeEventListener('click', firebaseSignIn); signInBtn.addEventListener('click', firebaseSignIn); }
  const signOutBtn = document.getElementById('signOutButton');
  if(signOutBtn){ signOutBtn.removeEventListener('click', firebaseSignOut); signOutBtn.addEventListener('click', firebaseSignOut); }
  // Monitor auth state
  try{ window._firebaseAuth.onAuthStateChanged(user=>{ if(user){ currentUser = { name: user.displayName, email: user.email, uid: user.uid }; // present minimal profile
      // Optionally fetch token and display
      user.getIdToken().then(tok=>{ console.log('Firebase ID token (short):', tok?.slice(0,40)+'...'); });
      loadCoinsFromStorage(); if(!userCoins) userCoins = 500; updateAuthState(true); showToast('Signed in: '+(user.displayName||user.email));
    } else { currentUser = null; updateAuthState(false); showToast('Signed out'); } }); }catch(e){ console.warn('auth state handler failed', e); }
}

async function firebaseSignIn(ev){ ev && ev.preventDefault && ev.preventDefault(); if(!window._firebaseAuth){ showToast('Firebase not configured. Use the Configure Firebase modal.'); return; } try{ const provider = new firebase.auth.GoogleAuthProvider(); const result = await window._firebaseAuth.signInWithPopup(provider); const user = result.user; if(user){ currentUser = { name: user.displayName, email: user.email, uid: user.uid }; loadCoinsFromStorage(); if(!userCoins) userCoins = 500; updateAuthState(true); showToast('Signed in: ' + (user.displayName||user.email)); } }catch(e){ console.warn('firebase signIn failed', e); showToast('Login failed'); } }

async function firebaseSignOut(ev){ ev && ev.preventDefault && ev.preventDefault(); if(!window._firebaseAuth) return; try{ await window._firebaseAuth.signOut(); currentUser=null; updateAuthState(false); showToast('Signed out'); }catch(e){ console.warn('firebase signOut failed', e); showToast('Sign out failed'); } }

// Wire firebase modal save button (already present in HTML)
document.addEventListener('DOMContentLoaded', ()=>{
  const saveBtn = document.getElementById('saveFirebaseBtn');
  if(saveBtn){ saveBtn.addEventListener('click', ()=>{
    const raw = document.getElementById('firebaseConfigInput')?.value || '';
    try{
      const cfg = JSON.parse(raw);
      initFirebaseFromConfig(cfg);
      const m = document.getElementById('firebaseModal'); if(m) m.style.display='none';
      showToast('Firebase configurado localmente');
    }catch(e){ showToast('JSON inválido. Cole o objeto firebaseConfig.'); }
  });
  }
  const cancel = document.getElementById('cancelFirebaseBtn'); if(cancel) cancel.addEventListener('click', ()=>{ const m=document.getElementById('firebaseModal'); if(m) m.style.display='none'; });
});

// After navigation, attempt to load sports data lazily
document.addEventListener('click', (e)=>{
  const a = e.target.closest && e.target.closest('.nav-btn');
  if(!a) return;
  const page = a.getAttribute('data-page');
  if(page === 'brasileirao'){
    // Serie A standings
    if(!_loaded.serieA){ loadSerieAReal().then(()=>{ _loaded.serieA = true; }).catch(()=>{}); }
    // Artilheiros
    if(!_loaded.artilheiros){ loadArtilheiros().then(()=>{ _loaded.artilheiros = true; }).catch(()=>{}); }
    // Serie B
    if(!_loaded.serieB){ loadSerieB().then(()=>{ _loaded.serieB = true; }).catch(()=>{}); }
    if(!_loaded.artilheirosB){ loadArtilheirosSerieB().then(()=>{ _loaded.artilheirosB = true; }).catch(()=>{}); }
    // Assist, cards, goalkeepers, upcoming
  if(!_loaded.assistA){ loadAssistenciasSerieA().then(()=>{ _loaded.assistA = true; }).catch(()=>{}); }
  if(!_loaded.cardsA){ loadCartoesSerieA().then(()=>{ _loaded.cardsA = true; }).catch(()=>{}); }
  if(!_loaded.gkA){ loadGoleirosSerieA().then(()=>{ _loaded.gkA = true; }).catch(()=>{}); }
    if(!_loaded.next){ loadProximosMatches().then(()=>{ _loaded.next = true; }).catch(()=>{}); }
    if(!_loaded.assistB){ loadAssistenciasSerieB().then(()=>{ _loaded.assistB = true; }).catch(()=>{}); }
    if(!_loaded.cardsB){ loadCartoesSerieB().then(()=>{ _loaded.cardsB = true; }).catch(()=>{}); }
    if(!_loaded.gkB){ loadGoleirosSerieB().then(()=>{ _loaded.gkB = true; }).catch(()=>{}); }
    // Copa do Brasil (optional: set window.COPA_LEAGUE_ID to the API-Football league id)
    try{
      const copaId = window.COPA_LEAGUE_ID || null;
      if(copaId && !_loaded.copa){ loadCopaTabela(copaId).then(()=>{ _loaded.copa = true; }).catch(()=>{}); }
      if(copaId && !_loaded.artilheirosCopa){ loadArtilheirosCopa(copaId).then(()=>{ _loaded.artilheirosCopa = true; }).catch(()=>{}); }
      if(copaId && !_loaded.assistCopa){ loadAssistenciasCopa(copaId).then(()=>{ _loaded.assistCopa = true; }).catch(()=>{}); }
      if(copaId && !_loaded.cardsCopa){ loadCartoesCopa(copaId).then(()=>{ _loaded.cardsCopa = true; }).catch(()=>{}); }
      if(copaId && !_loaded.gkCopa){ loadGoleirosCopa(copaId).then(()=>{ _loaded.gkCopa = true; }).catch(()=>{}); }
    }catch(e){}
  }
});

// --- ApexCharts Radar charts for Team and Player comparisons ---
// Load options: the project does not currently include ApexCharts - load CDN dynamically when needed
function ensureApexLoaded(){
  if(window.ApexCharts) return Promise.resolve();
  return new Promise((resolve, reject)=>{
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
    s.onload = ()=>resolve();
    s.onerror = (e)=>reject(e);
    document.head.appendChild(s);
  });
}

async function populateTimesRadar(){
  try{
    const res = await fetch('/api/sports/brasileirao-tabela');
    const data = await res.json();
    const times = data.response?.[0]?.league?.standings?.[0] || [];
    const select = document.getElementById('selectTimesRadar');
    if(!select) return;
    select.innerHTML = '';
    times.forEach(team => {
      const opt = document.createElement('option');
      opt.value = String(team.team?.id || team.team?.name || '');
      opt.textContent = team.team?.name || '—';
      select.appendChild(opt);
    });
    // setup awesomplete lists for inputs
    try{
      const names = times.map(t => t.team?.name).filter(Boolean);
      ['inputRadarTime1','inputRadarTime2','inputRadarTime3'].forEach(id=>{
        const input = document.getElementById(id);
        if(input && window.Awesomplete){ new Awesomplete(input, { list: names, minChars: 1 }); }
      });
    }catch(e){/* ignore awesomplete setup errors */}
  }catch(e){ console.warn('populateTimesRadar failed', e); }
}

async function populateJogadoresRadar(){
  try{
    const res = await fetch('/api/sports/brasileirao-artilheiros');
    const data = await res.json();
    const jogadores = data.response || [];
    const select = document.getElementById('selectJogadoresRadar');
    if(!select) return;
    select.innerHTML = '';
    jogadores.forEach(j => {
      const opt = document.createElement('option');
      opt.value = String(j.player?.id || j.player?.name || '');
      opt.textContent = j.player?.name || '—';
      select.appendChild(opt);
    });
    // setup awesomplete lists for player inputs
    try{
      const names = jogadores.map(j => j.player?.name).filter(Boolean);
      ['inputRadarJogador1','inputRadarJogador2','inputRadarJogador3'].forEach(id=>{
        const input = document.getElementById(id);
        if(input && window.Awesomplete){ new Awesomplete(input, { list: names, minChars: 1 }); }
      });
    }catch(e){/* ignore awesomplete setup errors */}
  }catch(e){ console.warn('populateJogadoresRadar failed', e); }
}

async function renderRadarTimesSelected(){
  try{
    await ensureApexLoaded();
    const select = document.getElementById('selectTimesRadar');
    if(!select) return;
    const selectedIds = Array.from(select.selectedOptions).map(o => String(o.value));
    const res = await fetch('/api/sports/brasileirao-tabela');
    const data = await res.json();
    const times = data.response?.[0]?.league?.standings?.[0] || [];
    const timesComparar = (selectedIds.length>0 ? times.filter(t => selectedIds.includes(String(t.team?.id))) : times.slice(0,3)).slice(0,3);
    const categorias = ['Goals Scored','Goals Conceded','Wins','Draws','Losses'];
    const series = timesComparar.map(time => ({ name: time.team?.name || '—', data: [ time.all?.goals?.for ?? 0, time.all?.goals?.against ?? 0, time.all?.win ?? 0, time.all?.draw ?? 0, time.all?.lose ?? 0 ] }));
    const options = { chart:{ type:'radar', height:350 }, title:{ text:'Team Comparison - Série A', style:{ color:'#3498db' } }, xaxis:{ categories:categorias }, colors:['#2ecc71','#e74c3c','#f1c40f'], stroke:{ width:2 }, fill:{ opacity:0.25 }, markers:{ size:4 } };
    if(window._apexRadarTimes){ try{ window._apexRadarTimes.destroy(); }catch(e){} }
    window._apexRadarTimes = new ApexCharts(document.querySelector('#chartRadarTimes'), { ...options, series });
    window._apexRadarTimes.render();
  }catch(e){ console.warn('renderRadarTimesSelected failed', e); }
}

async function renderRadarJogadoresSelected(){
  try{
    await ensureApexLoaded();
    const select = document.getElementById('selectJogadoresRadar');
    if(!select) return;
    const selectedIds = Array.from(select.selectedOptions).map(o => String(o.value));
    const res = await fetch('/api/sports/brasileirao-artilheiros');
    const data = await res.json();
    const jogadores = data.response || [];
    const jogadoresComparar = (selectedIds.length>0 ? jogadores.filter(j => selectedIds.includes(String(j.player?.id))) : jogadores.slice(0,3)).slice(0,3);
    const categorias = ['Goals','Assists','Yellow Cards','Clean Sheets'];
    const series = jogadoresComparar.map(j => { const stats = j.statistics?.[0] || {}; return { name: j.player?.name || '—', data: [ stats?.goals?.total ?? 0, stats?.goals?.assists ?? 0, stats?.cards?.yellow ?? 0, stats?.games?.cleansheets ?? 0 ] }; });
    const options = { chart:{ type:'radar', height:350 }, title:{ text:'Player Comparison - Série A', style:{ color:'#3498db' } }, xaxis:{ categories:categorias }, colors:['#2ecc71','#e74c3c','#f1c40f'], stroke:{ width:2 }, fill:{ opacity:0.25 }, markers:{ size:4 } };
    if(window._apexRadarJogadores){ try{ window._apexRadarJogadores.destroy(); }catch(e){} }
    window._apexRadarJogadores = new ApexCharts(document.querySelector('#chartRadarJogadores'), { ...options, series });
    window._apexRadarJogadores.render();
  }catch(e){ console.warn('renderRadarJogadoresSelected failed', e); }
}

// Wire buttons
document.addEventListener('DOMContentLoaded', ()=>{
  const btnT = document.getElementById('btnRadarTimes'); if(btnT) btnT.addEventListener('click', (ev)=>{ ev.preventDefault(); renderRadarTimesSelected(); });
  const btnP = document.getElementById('btnRadarJogadores'); if(btnP) btnP.addEventListener('click', (ev)=>{ ev.preventDefault(); renderRadarJogadoresSelected(); });
});

// Autocomplete-based radar rendering (reads inputs first, falls back to selects)
async function renderRadarTimesAutocomplete(){
  try{
    const inputs = ['inputRadarTime1','inputRadarTime2','inputRadarTime3'].map(id=>document.getElementById(id)).filter(Boolean);
    const names = inputs.map(i=>i.value?.trim()).filter(Boolean);
    if(names.length>0){
      // fetch standings and match by name
      const res = await fetch('/api/sports/brasileirao-tabela');
      const data = await res.json();
      const times = data.response?.[0]?.league?.standings?.[0] || [];
      const selected = times.filter(t => names.includes(t.team?.name)).slice(0,3);
      if(selected.length>0){
        const categorias = ['Goals Scored','Goals Conceded','Wins','Draws','Losses'];
        const series = selected.map(time => ({ name: time.team?.name || '—', data:[ time.all?.goals?.for ?? 0, time.all?.goals?.against ?? 0, time.all?.win ?? 0, time.all?.draw ?? 0, time.all?.lose ?? 0 ] }));
        await ensureApexLoaded();
        const options = { chart:{ type:'radar', height:350 }, title:{ text:'Team Comparison - Série A', style:{ color:'#3498db' } }, xaxis:{ categories }, colors:['#2ecc71','#e74c3c','#f1c40f'], stroke:{ width:2 }, fill:{ opacity:0.25 }, markers:{ size:4 } };
        if(window._apexRadarTimes){ try{ window._apexRadarTimes.destroy(); }catch(e){} }
        window._apexRadarTimes = new ApexCharts(document.querySelector('#chartRadarTimes'), { ...options, series });
        window._apexRadarTimes.render();
        return;
      }
    }
    // fallback to select-based rendering
    renderRadarTimesSelected();
  }catch(e){ console.warn('renderRadarTimesAutocomplete', e); }
}

async function renderRadarJogadoresAutocomplete(){
  try{
    const inputs = ['inputRadarJogador1','inputRadarJogador2','inputRadarJogador3'].map(id=>document.getElementById(id)).filter(Boolean);
    const names = inputs.map(i=>i.value?.trim()).filter(Boolean);
    if(names.length>0){
      const res = await fetch('/api/sports/brasileirao-artilheiros');
      const data = await res.json();
      const jogadores = data.response || [];
      const selected = jogadores.filter(j => names.includes(j.player?.name)).slice(0,3);
      if(selected.length>0){
        const categorias = ['Goals','Assists','Yellow Cards','Clean Sheets'];
        const series = selected.map(j => { const stats = j.statistics?.[0] || {}; return { name: j.player?.name || '—', data: [ stats?.goals?.total ?? 0, stats?.goals?.assists ?? 0, stats?.cards?.yellow ?? 0, stats?.games?.cleansheets ?? 0 ] }; });
        await ensureApexLoaded();
        const options = { chart:{ type:'radar', height:350 }, title:{ text:'Player Comparison - Série A', style:{ color:'#3498db' } }, xaxis:{ categories }, colors:['#2ecc71','#e74c3c','#f1c40f'], stroke:{ width:2 }, fill:{ opacity:0.25 }, markers:{ size:4 } };
        if(window._apexRadarJogadores){ try{ window._apexRadarJogadores.destroy(); }catch(e){} }
        window._apexRadarJogadores = new ApexCharts(document.querySelector('#chartRadarJogadores'), { ...options, series });
        window._apexRadarJogadores.render();
        return;
      }
    }
    // fallback to select-based rendering
    renderRadarJogadoresSelected();
  }catch(e){ console.warn('renderRadarJogadoresAutocomplete', e); }
}

// Wire autocomplete buttons
document.addEventListener('DOMContentLoaded', ()=>{
  const bAutoT = document.getElementById('btnRadarTimes'); if(bAutoT) bAutoT.addEventListener('click', (ev)=>{ ev.preventDefault(); renderRadarTimesAutocomplete(); });
  const bAutoP = document.getElementById('btnRadarJogadores'); if(bAutoP) bAutoP.addEventListener('click', (ev)=>{ ev.preventDefault(); renderRadarJogadoresAutocomplete(); });
});

// Trigger radars when navigating to Brasileirão page
const _navigateOrig = navigateTo;
window.navigateTo = function(pageId){ try{ _navigateOrig(pageId); }catch(e){ console.warn('navigateTo wrapper', e); }
  if(pageId === 'brasileirao'){
    // populate selects if empty
    try{ populateTimesRadar(); populateJogadoresRadar(); }catch(e){}
    // render default radars
    renderRadarTimesSelected(); renderRadarJogadoresSelected();
  }
};

// Also attempt to load when page is opened directly via hash
if(window.location.hash && window.location.hash.includes('brasileirao')){
  if(!_loaded.serieA) { loadSerieAReal().then(()=>{ _loaded.serieA = true; }).catch(()=>{}); }
  if(!_loaded.artilheiros) { loadArtilheiros().then(()=>{ _loaded.artilheiros = true; }).catch(()=>{}); }
}

// Expose for HTML
window.quickQuery = quickQuery; window.openGame = openGame; window.debugShowCurrentUser = ()=> console.log('DEBUG user', currentUser, 'coins', userCoins);