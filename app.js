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
function openGame(name){ if(!currentUser){ showToast('Login needed'); return; } gamesPlayedCount++; const G=15; userCoins+=G; if(userCoinsDisplay) userCoinsDisplay.textContent=userCoins; animateCoinGain(G); saveCoinsToStorage(); showToast(`+${G} coins for ${name}`); if(gameContentArea) gameContentArea.innerHTML=`<p>Game ${name} started (sim)</p>`; }
window.endGame = ()=>{ saveCoinsToStorage(); showToast('Game ended'); if(gameContentArea) gameContentArea.innerHTML=''; };

function updateMetrics(){ const s=Math.floor((Date.now()-startTime)/1000); engagementScore = Math.min((interactionsCount*1.5)+(gamesPlayedCount*3)+(s/120),10); const se=document.getElementById('sessionTime'); if(se) se.textContent=`${s}s`; const ie=document.getElementById('interactions'); if(ie) ie.textContent=interactionsCount; const ge=document.getElementById('gamesPlayed'); if(ge) ge.textContent=gamesPlayedCount; const eng=document.getElementById('engagementScore'); if(eng) eng.textContent=engagementScore.toFixed(2); }

function loadFeaturedMatches(){ if(featuredMatchesDiv) featuredMatchesDiv.innerHTML = '<h3>Próximos Jogos</h3>' + generateTableHTML(CLASSIFICATION_DATA.serieA); }
function checkBackendStatus(){ if(backendStatusText) backendStatusText.textContent='Servidor Online'; if(backendStatusIndicator) { backendStatusIndicator.classList.remove('status-loading'); backendStatusIndicator.classList.add('status-online'); } }

function navigateTo(pageId){ pages.forEach(p=>p.classList.remove('active')); const t=document.getElementById(pageId); if(t) t.classList.add('active'); navButtons.forEach(b=> b.getAttribute('data-page')===pageId? b.classList.add('active'): b.classList.remove('active')); history.pushState(null,null,`#${pageId}`); }

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
});

window.onload = ()=>{ const h=window.location.hash.substring(1); if(h && document.getElementById(h)) navigateTo(h); else navigateTo('home'); checkBackendStatus(); loadFeaturedMatches(); setInterval(updateMetrics,1000); loadCoinsFromStorage(); updateAuthState(false); if(userCoinsDisplay) userCoinsDisplay.textContent=userCoins; };

// Expose for HTML
window.quickQuery = quickQuery; window.openGame = openGame; window.debugShowCurrentUser = ()=> console.log('DEBUG user', currentUser, 'coins', userCoins);