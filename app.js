// APP-CLEAN-V1

'use strict';

// Minimal definitive app.js to resolve merge conflicts
(function(){
    const COINS_KEY = 'fap_user_coins_v1';
    const CONSENT_KEY = 'fap_user_consent_v1';
    let currentUser = null;
    let userCoins = 0;
    const $id = id => document.getElementById(id);

    function loadCoins(){ try{ const v = localStorage.getItem(COINS_KEY); userCoins = v===null?0:parseInt(v,10)||0; }catch(e){ userCoins = 0; } }
    function saveCoins(){ try{ localStorage.setItem(COINS_KEY, String(userCoins)); }catch(e){} }
    function readConsent(){ try{ const raw = localStorage.getItem(CONSENT_KEY); return raw?JSON.parse(raw):{analytics:false,ads:false,backend:false}; }catch(e){ return {analytics:false,ads:false,backend:false}; } }
    function saveConsent(obj){ try{ localStorage.setItem(CONSENT_KEY, JSON.stringify(obj||{})); }catch(e){} }
    function showToast(msg){ const t=document.createElement('div'); t.textContent=msg; t.style='position:fixed;right:12px;bottom:24px;background:#222;color:#fff;padding:8px;border-radius:6px;z-index:9999;'; document.body.appendChild(t); setTimeout(()=>t.remove(),2200); }

    async function signIn(){ currentUser = { name:'LocalUser', userId:`local-${Date.now()}` }; if(userCoins<=0) userCoins=500; saveCoins(); updateAuthUi(); showToast(`Bem-vindo, ${currentUser.name}!`); }
    async function signOut(){ currentUser=null; userCoins=0; saveCoins(); updateAuthUi(); showToast('Você saiu.'); }
    function updateAuthUi(){ const s=$id('signInButton'), so=$id('signOutButton'), up=$id('userProfile'), uc=$id('userCoins'); if(currentUser){ if(s) s.style.display='none'; if(so) so.style.display='inline-block'; if(up) up.style.display='flex'; if(uc) uc.textContent=userCoins; } else { if(s) s.style.display='inline-block'; if(so) so.style.display='none'; if(up) up.style.display='none'; if(uc) uc.textContent=userCoins; } }

    async function postScoreIfAllowed(game, score){ try{ const consent = readConsent(); if(!consent.backend) return; if(!currentUser) return; await fetch('/api/ranking',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ game, nome: currentUser.name||'Anon', pontos: Number(score)||0 }) }); }catch(e){ console.warn('postScore failed', e); } }

    async function openGame(name){ const area=$id('gameContentArea'); if(!area){ showToast('Área do jogo não encontrada'); return; } if(!currentUser){ showToast('Faça login para jogar'); return; } area.innerHTML='<p>Carregando...</p>'; try{ let mod; switch((name||'').toLowerCase()){ case 'precisao': mod = await import('./games/precisao.js'); break; case 'goleiro': mod = await import('./games/goleiro.js'); break; case 'fisico': mod = await import('./games/fisico.js'); break; case 'ranking': mod = await import('./games/ranking.js'); break; default: area.innerHTML=`<p>Minigame ${name} não encontrado</p>`; return; }
        const onFinish = async score=>{ const coins=Math.max(0,Math.round((score||0)/5)); if(coins>0){ userCoins+=coins; saveCoins(); const uc=$id('userCoins'); if(uc) uc.textContent=userCoins; showToast(`+${coins} moedas`); } await postScoreIfAllowed(name, score); };
        area.innerHTML=''; if(mod && typeof mod.render==='function') mod.render(area,onFinish); else if(mod && typeof mod.renderPrecisaoGame==='function') mod.renderPrecisaoGame(area,onFinish); else if(mod && typeof mod.renderGoleiroGame==='function') mod.renderGoleiroGame(area,onFinish); else if(mod && typeof mod.renderFisicoGame==='function') mod.renderFisicoGame(area,onFinish); else if(mod && typeof mod.renderGlobalRanking==='function') mod.renderGlobalRanking(area,name); else area.innerHTML='<p>Minigame carregado (sem renderer).</p>';
    }catch(err){ console.warn(err); area.innerHTML='<p>Erro ao carregar o minigame.</p>'; } }

    function quickQuery(q){ if(!currentUser){ showToast('Faça login para usar a IA'); return; } userCoins+=5; saveCoins(); const uc=$id('userCoins'); if(uc) uc.textContent=userCoins; showToast('+5 moedas'); if($id('iaResponse')) $id('iaResponse').innerHTML=`<p>Resposta simulada para: ${q}</p>`; }

    function wireUi(){ const s=$id('signInButton'), so=$id('signOutButton'); if(s) s.addEventListener('click', signIn); if(so) so.addEventListener('click', signOut); const sc=$id('saveConsentBtn'); if(sc) sc.addEventListener('click', ()=>{ const newC={ analytics:!!($id('cons_analytics')&&$id('cons_analytics').checked), ads:!!($id('cons_ads')&&$id('cons_ads').checked), backend:!!($id('cons_backend')&&$id('cons_backend').checked) }; saveConsent(newC); const m=$id('consentModal'); if(m) m.style.display='none'; showToast('Preferências salvas'); }); }

    window.openGame=openGame; window.quickQuery=quickQuery; window.endGame=function(){ saveCoins(); showToast('Jogo finalizado.'); }; window.acceptAllConsent=function(){ saveConsent({analytics:true,ads:true,backend:true}); const b=$id('consentBanner'); if(b) b.style.display='none'; showToast('Consentimento aceito'); }; window.rejectAllConsent=function(){ saveConsent({analytics:false,ads:false,backend:false}); const b=$id('consentBanner'); if(b) b.style.display='none'; showToast('Consentimento rejeitado'); };

    window.addEventListener('load', ()=>{ loadCoins(); updateAuthUi(); wireUi(); const uc=$id('userCoins'); if(uc) uc.textContent=userCoins; const h=location.hash.replace('#',''); if(h && $id(h)){ document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('active')); $id(h).classList.add('active'); } else { if($id('home')){ document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('active')); $id('home').classList.add('active'); } } });

})();

/*
  Clean, conflict-free frontend for FutebolAnalyticsPro
  - Consent persistence (analytics, ads, backend)
  - Coin persistence (localStorage)
  - Simple local sign-in fallback
  - Dynamic minigame loading and posting scores to /api/ranking when backend consent is true
  - Minimal UI wiring for buttons exposed in index.html
*/

/*
    Replaced with a single, minimal clean implementation.
    This file intentionally small and focused to resolve merge-conflict artifacts.
*/

(function(){
    'use strict';

    const COINS_KEY = 'fap_user_coins_v1';
    const CONSENT_KEY = 'fap_user_consent_v1';

    let currentUser = null;
    let userCoins = 0;

    const $id = id => document.getElementById(id);

    function loadCoins(){ try{ const v = localStorage.getItem(COINS_KEY); userCoins = v===null?0:parseInt(v,10)||0; }catch(e){ userCoins = 0; } }
    function saveCoins(){ try{ localStorage.setItem(COINS_KEY, String(userCoins)); }catch(e){} }

    function readConsent(){ try{ const raw = localStorage.getItem(CONSENT_KEY); return raw?JSON.parse(raw):{analytics:false,ads:false,backend:false}; }catch(e){ return {analytics:false,ads:false,backend:false}; } }
    function saveConsent(obj){ try{ localStorage.setItem(CONSENT_KEY, JSON.stringify(obj||{})); }catch(e){} }

    function showToast(msg, ttl=2000){ const t = document.createElement('div'); t.className = 'fap-toast'; t.textContent = msg; t.style = 'position:fixed;right:12px;bottom:24px;background:#222;color:#fff;padding:8px 12px;border-radius:6px;z-index:99999;'; document.body.appendChild(t); setTimeout(()=>t.remove(), ttl); }

    function animateCoinGain(n){ const el = document.createElement('div'); el.textContent = `+${n} 💰`; el.style = 'position:fixed;right:18px;bottom:90px;background:#f1c40f;color:#000;padding:6px 10px;border-radius:16px;z-index:99999;'; document.body.appendChild(el); setTimeout(()=>el.remove(),1200); }

    async function signIn(){ currentUser = { name: 'LocalUser', userId: `local-${Date.now()}` }; if(userCoins<=0) userCoins = 500; saveCoins(); updateAuthUi(); showToast(`Bem-vindo, ${currentUser.name}!`); }
    async function signOut(){ currentUser = null; userCoins = 0; saveCoins(); updateAuthUi(); showToast('Você saiu.'); }

    function updateAuthUi(){ const s = $id('signInButton'); const so = $id('signOutButton'); const up = $id('userProfile'); const uc = $id('userCoins'); if(currentUser){ if(s) s.style.display='none'; if(so) so.style.display='inline-block'; if(up) up.style.display='flex'; if(uc) uc.textContent = userCoins; } else { if(s) s.style.display='inline-block'; if(so) so.style.display='none'; if(up) up.style.display='none'; if(uc) uc.textContent = userCoins; } }

    async function postScoreIfAllowed(game, score){ try{ const consent = readConsent(); if(!consent.backend) return; if(!currentUser) return; await fetch('/api/ranking', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ game, nome: currentUser.name||'Anon', pontos: Number(score)||0 }) }); }catch(e){ console.warn('postScore failed', e); } }

    async function openGame(name){ const area = $id('gameContentArea'); if(!area){ showToast('Área do jogo não encontrada'); return; } if(!currentUser){ showToast('Faça login para jogar e ganhar moedas'); return; } area.innerHTML = '<p>Carregando minijogo...</p>'; try{ let mod; switch((name||'').toLowerCase()){ case 'precisao': mod = await import('./games/precisao.js'); break; case 'goleiro': mod = await import('./games/goleiro.js'); break; case 'fisico': mod = await import('./games/fisico.js'); break; case 'ranking': mod = await import('./games/ranking.js'); break; default: area.innerHTML = `<p>Minigame ${name} não encontrado</p>`; return; }
        const onFinish = async (score) => { const coins = Math.max(0, Math.round((score||0)/5)); if(coins>0){ userCoins += coins; saveCoins(); const uc = $id('userCoins'); if(uc) uc.textContent = userCoins; animateCoinGain(coins); showToast(`+${coins} moedas`); } await postScoreIfAllowed(name, score); };
        area.innerHTML = '';
        if(mod && typeof mod.render === 'function') mod.render(area, onFinish);
        else if(mod && typeof mod.renderPrecisaoGame === 'function') mod.renderPrecisaoGame(area, onFinish);
        else if(mod && typeof mod.renderGoleiroGame === 'function') mod.renderGoleiroGame(area, onFinish);
        else if(mod && typeof mod.renderFisicoGame === 'function') mod.renderFisicoGame(area, onFinish);
        else if(mod && typeof mod.renderGlobalRanking === 'function') mod.renderGlobalRanking(area, name);
        else area.innerHTML = '<p>Minigame carregado (sem renderer).</p>';
    } catch(err){ console.warn(err); area.innerHTML = '<p>Erro ao carregar o minigame.</p>'; } }

    function quickQuery(q){ if(!currentUser){ showToast('Faça login para usar a IA'); return; } interactionsCount++; const G = 5; userCoins += G; saveCoins(); const uc = $id('userCoins'); if(uc) uc.textContent = userCoins; animateCoinGain(G); showToast(`+${G} moedas`); if($id('iaResponse')) $id('iaResponse').innerHTML = `<p>Resposta simulada para: ${q}</p>`; }

    function wireUi(){ const s = $id('signInButton'); const so = $id('signOutButton'); if(s) s.addEventListener('click', signIn); if(so) so.addEventListener('click', signOut); const saveC = $id('saveConsentBtn'); if(saveC) saveC.addEventListener('click', ()=>{ const newC = { analytics: !!($id('cons_analytics')&&$id('cons_analytics').checked), ads: !!($id('cons_ads')&&$id('cons_ads').checked), backend: !!($id('cons_backend')&&$id('cons_backend').checked) }; saveConsent(newC); applyConsentWorkflows(); const m = $id('consentModal'); if(m) m.style.display='none'; showToast('Preferências salvas'); }); }

    window.openGame = openGame;
    window.quickQuery = quickQuery;
    window.endGame = function(){ saveCoins(); showToast('Jogo finalizado. Moedas salvas.'); };
    window.acceptAllConsent = function(){ saveConsent({analytics:true,ads:true,backend:true}); applyConsentWorkflows(); const b = $id('consentBanner'); if(b) b.style.display='none'; showToast('Consentimento aceito'); };
    window.rejectAllConsent = function(){ saveConsent({analytics:false,ads:false,backend:false}); const b = $id('consentBanner'); if(b) b.style.display='none'; showToast('Consentimento rejeitado'); };

    window.addEventListener('load', ()=>{ loadCoins(); updateAuthUi(); applyConsentWorkflows(); wireUi(); const uc = $id('userCoins'); if(uc) uc.textContent = userCoins; const h = location.hash.replace('#',''); if(h && $id(h)){ document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('active')); $id(h).classList.add('active'); } else { if($id('home')){ document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('active')); $id('home').classList.add('active'); } } });

    function updateAuthUi(){ const s = $id('signInButton'); const so = $id('signOutButton'); const up = $id('userProfile'); const uc = $id('userCoins'); if(currentUser){ if(s) s.style.display='none'; if(so) so.style.display='inline-block'; if(up) up.style.display='flex'; if(uc) uc.textContent = userCoins; } else { if(s) s.style.display='inline-block'; if(so) so.style.display='none'; if(up) up.style.display='none'; if(uc) uc.textContent = userCoins; } }

})();
/*
    Clean unified frontend script for FutebolAnalyticsPro
    - Consent (CMP) with persistence
    - Analytics/Ads lazy-loading (consent-gated)
    - Local sign-in fallback and simple profile UI
    - Coin persistence in localStorage and coin animations
    - Dynamic minigame loading via import()
    - Posting scores to /api/ranking when backend consent is granted
    - Simple metrics dashboard (session time, interactions, games played)
    - SPA hash navigation
*/

(function (){
    'use strict';

    // Keys
    const COINS_KEY = 'fap_user_coins_v1';
    const CONSENT_KEY = 'fap_user_consent_v1';

    // State
    let currentUser = null;
    let userCoins = 0;
    let startTime = Date.now();
    let interactionsCount = 0;
    let gamesPlayedCount = 0;
    let engagementScore = 0;

    // Helpers
    const $id = id => document.getElementById(id);
    const qAll = sel => Array.from(document.querySelectorAll(sel || '*'));

    // DOM refs (safe guards)
    const signInButton = $id('signInButton');
    const signOutButton = $id('signOutButton');
    const userProfile = $id('userProfile');
    const userCoinsDisplay = $id('userCoins');
    const toastContainer = $id('toastContainer');
    const navButtons = qAll('.nav-btn');
    const pages = qAll('.page');
    const iaResponseDiv = $id('iaResponse');
    const serieATableDiv = $id('serieATable');
    const serieBTableDiv = $id('serieBTable');
    const featuredMatchesDiv = $id('featuredMatches');
    const backendStatusIndicator = document.querySelector('.status-indicator');
    const backendStatusText = $id('statusText');
    const statusDetails = $id('statusDetails');

    // --- storage helpers ---
    function loadCoins(){ try{ const v=localStorage.getItem(COINS_KEY); userCoins = v===null?0:parseInt(v,10)||0; }catch(e){ userCoins=0; } }
    function saveCoins(){ try{ localStorage.setItem(COINS_KEY, String(userCoins)); }catch(e){} }

    function readConsent(){ try{ const raw=localStorage.getItem(CONSENT_KEY); return raw?JSON.parse(raw):{analytics:false,ads:false,backend:false}; }catch(e){ return {analytics:false,ads:false,backend:false}; } }
    function saveConsent(obj){ try{ localStorage.setItem(CONSENT_KEY, JSON.stringify(obj||{})); }catch(e){} }
    function getConsent(kind){ return !!(readConsent() && readConsent()[kind]); }

    // Lazy load scripts that were marked with data-consent
    function lazyLoadScriptsFor(selector){ const scripts=document.querySelectorAll(selector); scripts.forEach(s=>{ if(s.dataset.src){ const ns=document.createElement('script'); ns.async=true; ns.src=s.dataset.src; if(s.dataset.crossorigin) ns.crossOrigin=s.dataset.crossorigin; document.head.appendChild(ns); } else if(s.textContent){ const ns=document.createElement('script'); ns.textContent = s.textContent; document.head.appendChild(ns); } }); }
    function applyConsentWorkflows(){ const c=readConsent(); if(c.analytics) lazyLoadScriptsFor('script[data-consent="analytics"]'); if(c.ads) lazyLoadScriptsFor('script[data-consent="ads"]'); }

    // Simple toast
    function showToast(msg, opts={ttl:3000}){ if(!toastContainer) return; const t=document.createElement('div'); t.className='toast'; t.textContent = msg; toastContainer.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, opts.ttl); }

    // Coin animation (small reusable)
    function animateCoinGain(n){ const el=document.createElement('div'); el.className='coin-fly'; el.textContent=`+${n} 💰`; el.style.cssText='position:fixed;top:80px;right:12%;background:#f1c40f;padding:6px 12px;border-radius:20px;z-index:9999;opacity:0;transform:translateY(12px);transition:all .45s'; document.body.appendChild(el); requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='translateY(0)'; }); setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(-20px)'; },1400); setTimeout(()=>el.remove(),1800); }

    // Auth UI updates
    function updateAuthUi(){ if(currentUser){ if(signInButton) signInButton.style.display='none'; if(signOutButton) signOutButton.style.display='inline-block'; if(userProfile) userProfile.style.display='flex'; if(userCoinsDisplay) userCoinsDisplay.textContent=userCoins; } else { if(signInButton) signInButton.style.display='inline-block'; if(signOutButton) signOutButton.style.display='none'; if(userProfile) userProfile.style.display='none'; } }

    // Minimal sign-in fallback (local-only, or use Firebase if present)
    async function signIn(){
        // If firebase is configured, prefer it (best-effort)
        if(window.firebase && firebase.auth){
            try{
                const provider = new firebase.auth.GoogleAuthProvider();
                const res = await firebase.auth().signInWithPopup(provider);
                const user = res.user;
                currentUser = { name: user.displayName || user.email, userId: user.uid, photoURL: user.photoURL };
                // keep coins in local fallback
                if(userCoins<=0) userCoins = 500;
                saveCoins();
                updateAuthUi();
                showToast(`Bem-vindo, ${currentUser.name}!`);
                loadRestrictedContent();
                return;
            }catch(e){ console.warn('firebase signin failed', e); }
        }

        // If backend consent and /api/auth exists, try server flow
        if(getConsent('backend')){
            try{
                const fakeEmail = `local+${Date.now()}@example.com`;
                const r = await fetch('/api/auth',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: 'Analista Pro', email: fakeEmail }) });
                if(r.ok){ const user = await r.json(); currentUser = user; }
            }catch(e){ /* fallback below */ }
        }

        // Final fallback: local user
        if(!currentUser) currentUser = { name: 'LocalUser', userId: `local-${Date.now()}` };
        if(userCoins<=0) userCoins = 500;
        saveCoins(); updateAuthUi(); showToast('Assinado (modo local)'); loadRestrictedContent();
    }

    async function signOut(){ if(window.firebase && firebase.auth){ try{ await firebase.auth().signOut(); }catch(e){} } currentUser = null; saveCoins(); userCoins = 0; updateAuthUi(); showToast('Você saiu.'); }

    // Game opening: dynamic import and render. Requires a logged user to gain coins.
    async function openGame(name){ const area = $id('gameContentArea'); if(!area) return; if(!currentUser){ showToast('Faça login para jogar e ganhar moedas'); return; } area.innerHTML = '<p>Carregando...</p>'; try{ let mod; switch((name||'').toLowerCase()){ case 'precisao': mod = await import('./games/precisao.js'); break; case 'goleiro': mod = await import('./games/goleiro.js'); break; case 'fisico': mod = await import('./games/fisico.js'); break; case 'ranking': mod = await import('./games/ranking.js'); break; default: area.innerHTML = `<p>Minigame não encontrado: ${name}</p>`; return; }
            // onFinish contract: (score:Number) => Promise
            const onFinish = async score => {
                const coins = Math.max(0, Math.round((score||0)/5));
                if(coins>0){ userCoins += coins; saveCoins(); if(userCoinsDisplay) userCoinsDisplay.textContent = userCoins; animateCoinGain(coins); showToast(`+${coins} moedas`); }
                const consent = readConsent(); if(consent.backend){ try{ await fetch('/api/ranking',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ game: name, nome: currentUser.name||'Anonymous', pontos: score }) }); }catch(e){ console.warn('ranking post failed', e); } }
            };

            area.innerHTML = '';
            // Prefer common renderer names used in games: renderPrecisaoGame/renderGoleiroGame/renderFisicoGame or renderGlobalRanking
            if(mod.renderPrecisaoGame) mod.renderPrecisaoGame(area, onFinish);
            else if(mod.renderGoleiroGame) mod.renderGoleiroGame(area, onFinish);
            else if(mod.renderFisicoGame) mod.renderFisicoGame(area, onFinish);
            else if(mod.renderGlobalRanking) mod.renderGlobalRanking(area, name);
            else area.innerHTML = '<p>Minigame carregado, porém não possui renderer.</p>';
        }catch(err){ console.warn(err); area.innerHTML = '<p>Erro ao carregar o minigame.</p>'; }
    }

    function endGame(){ const area = $id('gameContentArea'); if(area) area.innerHTML = '<p>Fim de jogo. Volte sempre!</p>'; saveCoins(); showToast('Jogo finalizado. Moedas salvas.'); }

    // Quick query -> small coin reward
    function quickQuery(q){ if(!currentUser){ if(iaResponseDiv) iaResponseDiv.innerHTML = '<p>🔒 Faça login para usar a IA</p>'; return; } interactionsCount++; const COIN_GAIN = 5; userCoins += COIN_GAIN; saveCoins(); if(userCoinsDisplay) userCoinsDisplay.textContent = userCoins; animateCoinGain(COIN_GAIN); showToast(`+${COIN_GAIN} moedas`); if(iaResponseDiv) iaResponseDiv.innerHTML = `<p>Processando consulta: ${q}...</p>`; setTimeout(()=>{ iaResponseDiv && (iaResponseDiv.innerHTML = `<p>Resposta simulada para ${q}.</p>`); updateMetrics(); },1200); }

    // Metrics / dashboard
    function updateMetrics(){ const now = Date.now(); const sessionSeconds = Math.floor((now - startTime)/1000); engagementScore = Math.min(((interactionsCount*1.5)+(gamesPlayedCount*3)+(sessionSeconds/120)), 10.0); const el = $id('sessionTime'); if(el) el.textContent = `${sessionSeconds}s`; const e1 = $id('interactions'); if(e1) e1.textContent = interactionsCount; const e2 = $id('gamesPlayed'); if(e2) e2.textContent = gamesPlayedCount; const e3 = $id('engagementScore'); if(e3) e3.textContent = engagementScore.toFixed(2); }

    // Small utilities: render classification table for logged users
    const CLASSIFICATION_DATA = { 'serieA': [ { pos:1, team:'Fluminense', pts:65, status:'Líder' }, { pos:2, team:'Flamengo', pts:62, status:'Libertadores' }, { pos:3, team:'Botafogo', pts:58, status:'Libertadores' }, { pos:4, team:'Palmeiras', pts:55, status:'Libertadores' }, { pos:5, team:'São Paulo', pts:50, status:'Sul-Americana' }, { pos:17, team:'Cruzeiro', pts:35, status:'Z4' } ], 'serieB':[ { pos:1, team:'Vasco', pts:72, status:'Acesso' }, { pos:2, team:'Bahia', pts:70, status:'Acesso' }, { pos:3, team:'Grêmio', pts:68, status:'Acesso' }, { pos:4, team:'Criciúma', pts:64, status:'Acesso' } ] };

    function generateTableHTML(data){ let html = `<table style="width:100%;border-collapse:collapse;text-align:left;font-size:0.95em;"><thead><tr style="background:#34495e;color:#fff"><th style="padding:10px">Pos.</th><th style="padding:10px">Time</th><th style="padding:10px">Pts</th><th style="padding:10px">Status</th></tr></thead><tbody>`; data.forEach(row=>{ let statusColor='#bdc3c7'; if(row.status==='Líder' || row.status==='Acesso') statusColor='#2ecc71'; if(row.status==='Z4') statusColor='#e74c3c'; if(row.status==='Libertadores') statusColor='#f1c40f'; html += `<tr style="border-bottom:1px solid #4a4a4a;"><td style="padding:8px">${row.pos}</td><td style="padding:8px;font-weight:600">${row.team}</td><td style="padding:8px">${row.pts}</td><td style="padding:8px;color:${statusColor}">${row.status}</td></tr>`; }); html += `</tbody></table>`; return html; }

    function loadRestrictedContent(){ if(serieATableDiv) serieATableDiv.innerHTML = generateTableHTML(CLASSIFICATION_DATA.serieA); if(serieBTableDiv) serieBTableDiv.innerHTML = generateTableHTML(CLASSIFICATION_DATA.serieB); }

    // Featured matches (consent-gated backend fetch)
    function loadFeaturedMatches(){ if(!featuredMatchesDiv) return; if(getConsent('backend')){ fetch('/api/featured-matches').then(r=>r.json()).then(data=>{ const matches = data.matches||[]; if(matches.length===0){ featuredMatchesDiv.innerHTML = '<p>Sem jogos recentes.</p>'; return; } let html = '<h3>Próximos Jogos</h3><ul>'; matches.forEach(m=> html += `<li>${m.date} - ${m.match}</li>`); html += '</ul>'; featuredMatchesDiv.innerHTML = html; }).catch(()=>{ featuredMatchesDiv.innerHTML = '<p>Erro ao buscar (offline). Versão local: Flamengo vs Fluminense - Hoje 20:00</p>'; }); } else { featuredMatchesDiv.innerHTML = '<p>Flamengo vs Fluminense - Hoje 20:00 (local)</p>'; } }

    // Backend status mock
    function checkBackendStatus(){ setTimeout(()=>{ if(backendStatusText) backendStatusText.textContent = 'Servidor Online (dev)'; if(backendStatusIndicator) { backendStatusIndicator.classList.remove('status-loading'); backendStatusIndicator.classList.add('status-online'); } if(statusDetails) statusDetails.innerHTML = 'Conectado ao servidor local.'; }, 800); }

    // SPA navigation
    function navigateTo(pageId){ pages.forEach(p=>p.classList.remove('active')); const t = $id(pageId); if(t) t.classList.add('active'); navButtons.forEach(b=> b.classList.toggle('active', b.dataset.page===pageId)); try{ history.pushState(null,null, `#${pageId}`); }catch(e){} }
    navButtons.forEach(b=> b.addEventListener('click', e=>{ e.preventDefault(); navigateTo(b.dataset.page); }));

    // Attach UI controls for consent modal buttons (if present)
    function wireConsentControls(){ const cs = $id('consentSettingsBtn'); if(cs) cs.addEventListener('click', ()=>{ const m = $id('consentModal'); if(m) m.style.display='flex'; const c = readConsent(); const ca = $id('cons_analytics'); const cad = $id('cons_ads'); const cb = $id('cons_backend'); if(ca) ca.checked = !!c.analytics; if(cad) cad.checked = !!c.ads; if(cb) cb.checked = !!c.backend; }); const saveC = $id('saveConsentBtn'); if(saveC) saveC.addEventListener('click', ()=>{ const newC = { analytics: !!($id('cons_analytics')&&$id('cons_analytics').checked), ads: !!($id('cons_ads')&&$id('cons_ads').checked), backend: !!($id('cons_backend')&&$id('cons_backend').checked) }; saveConsent(newC); applyConsentWorkflows(); const m = $id('consentModal'); if(m) m.style.display='none'; showToast('Preferências salvas'); }); const cancelC = $id('cancelConsentBtn'); if(cancelC) cancelC.addEventListener('click', ()=>{ const m = $id('consentModal'); if(m) m.style.display='none'; }); }

    /*
        Final clean app.js (single-file)
        This file implements consent, coin persistence, simple auth fallback, dynamic game loading
        and posting scores to /api/ranking only when backend consent is given.
    */

    (function(){
        'use strict';

        const COINS_KEY = 'fap_user_coins_v1';
        const CONSENT_KEY = 'fap_user_consent_v1';

        let currentUser = null;
        let userCoins = 0;
        let startTime = Date.now();
        let interactionsCount = 0;
        let gamesPlayedCount = 0;

        const $id = id => document.getElementById(id);
        const qAll = sel => Array.from(document.querySelectorAll(sel || '*'));

        const signInButton = $id('signInButton');
        const signOutButton = $id('signOutButton');
        const userProfile = $id('userProfile');
        const userCoinsDisplay = $id('userCoins');
        const toastContainer = $id('toastContainer');
        const navButtons = qAll('.nav-btn');
        const pages = qAll('.page');

        function loadCoins(){ try{ const v=localStorage.getItem(COINS_KEY); userCoins = v===null?0:parseInt(v,10)||0; }catch(e){ userCoins=0; } }
        function saveCoins(){ try{ localStorage.setItem(COINS_KEY, String(userCoins)); }catch(e){} }

        function readConsent(){ try{ const raw=localStorage.getItem(CONSENT_KEY); return raw?JSON.parse(raw):{analytics:false,ads:false,backend:false}; }catch(e){ return {analytics:false,ads:false,backend:false}; } }
        function saveConsent(obj){ try{ localStorage.setItem(CONSENT_KEY, JSON.stringify(obj||{})); }catch(e){} }

        function lazyLoadScriptsFor(selector){ const scripts=document.querySelectorAll(selector); scripts.forEach(s=>{ if(s.dataset.src){ const ns=document.createElement('script'); ns.async=true; ns.src=s.dataset.src; if(s.dataset.crossorigin) ns.crossOrigin=s.dataset.crossorigin; document.head.appendChild(ns); } else if(s.textContent){ const ns=document.createElement('script'); ns.textContent = s.textContent; document.head.appendChild(ns); } }); }
        function applyConsentWorkflows(){ const c=readConsent(); if(c.analytics) lazyLoadScriptsFor('script[data-consent="analytics"]'); if(c.ads) lazyLoadScriptsFor('script[data-consent="ads"]'); }

        function showToast(msg, opts={ttl:3000}){ if(!toastContainer) return; const t=document.createElement('div'); t.className='toast'; t.textContent = msg; toastContainer.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, opts.ttl); }

        function animateCoinGain(n){ const el=document.createElement('div'); el.className='coin-fly'; el.textContent=`+${n} 💰`; el.style.cssText='position:fixed;top:80px;right:12%;background:#f1c40f;padding:6px 12px;border-radius:20px;z-index:9999;opacity:0;transform:translateY(12px);transition:all .45s'; document.body.appendChild(el); requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='translateY(0)'; }); setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(-20px)'; },1400); setTimeout(()=>el.remove(),1800); }

        function updateAuthUi(){ if(currentUser){ if(signInButton) signInButton.style.display='none'; if(signOutButton) signOutButton.style.display='inline-block'; if(userProfile) userProfile.style.display='flex'; if(userCoinsDisplay) userCoinsDisplay.textContent = userCoins; } else { if(signInButton) signInButton.style.display='inline-block'; if(signOutButton) signOutButton.style.display='none'; if(userProfile) userProfile.style.display='none'; } }

        async function signIn(){ if(window.firebase && firebase.auth){ try{ const provider = new firebase.auth.GoogleAuthProvider(); const res = await firebase.auth().signInWithPopup(provider); const user = res.user; currentUser = { name: user.displayName||user.email, userId: user.uid, photoURL: user.photoURL }; if(userCoins<=0) userCoins=500; saveCoins(); updateAuthUi(); showToast(`Bem-vindo, ${currentUser.name}!`); return; }catch(e){ console.warn('firebase signin failed', e); } }
            if(readConsent().backend){ try{ const fakeEmail = `local+${Date.now()}@example.com`; const r = await fetch('/api/auth',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: 'Analista Pro', email: fakeEmail }) }); if(r.ok){ currentUser = await r.json(); } }catch(e){} }
            if(!currentUser) currentUser = { name: 'LocalUser', userId: `local-${Date.now()}` }; if(userCoins<=0) userCoins = 500; saveCoins(); updateAuthUi(); showToast('Logado (local)'); }

        async function signOut(){ if(window.firebase && firebase.auth){ try{ await firebase.auth().signOut(); }catch(e){} } currentUser=null; saveCoins(); userCoins=0; updateAuthUi(); showToast('Você saiu.'); }

        async function openGame(name){ const area = $id('gameContentArea'); if(!area) return; if(!currentUser){ showToast('Faça login para jogar'); return; } area.innerHTML = '<p>Carregando...</p>'; try{ let mod; switch((name||'').toLowerCase()){ case 'precisao': mod = await import('./games/precisao.js'); break; case 'goleiro': mod = await import('./games/goleiro.js'); break; case 'fisico': mod = await import('./games/fisico.js'); break; case 'ranking': mod = await import('./games/ranking.js'); break; default: area.innerHTML = `<p>Minigame não encontrado: ${name}</p>`; return; }
            const onFinish = async score => { const coins = Math.max(0, Math.round((score||0)/5)); if(coins>0){ userCoins+=coins; saveCoins(); if(userCoinsDisplay) userCoinsDisplay.textContent = userCoins; animateCoinGain(coins); showToast(`+${coins} moedas`); } if(readConsent().backend){ try{ await fetch('/api/ranking',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ game: name, nome: currentUser.name||'Anonymous', pontos: score }) }); }catch(e){ console.warn('ranking post failed', e); } } };
            area.innerHTML = '';
            if(mod.renderPrecisaoGame) mod.renderPrecisaoGame(area,onFinish); else if(mod.renderGoleiroGame) mod.renderGoleiroGame(area,onFinish); else if(mod.renderFisicoGame) mod.renderFisicoGame(area,onFinish); else if(mod.renderGlobalRanking) mod.renderGlobalRanking(area,name); else area.innerHTML = '<p>Minigame carregado sem renderer.</p>';
        } catch(err){ console.warn(err); area.innerHTML = '<p>Erro ao carregar o minigame.</p>'; } }

        function endGame(){ const area = $id('gameContentArea'); if(area) area.innerHTML = '<p>Fim de jogo. Volte sempre!</p>'; saveCoins(); showToast('Jogo finalizado.'); }

        function quickQuery(q){ if(!currentUser){ if($id('iaResponse')) $id('iaResponse').innerHTML = '<p>🔒 Faça login para usar a IA</p>'; return; } interactionsCount++; const COIN_GAIN = 5; userCoins+=COIN_GAIN; saveCoins(); if(userCoinsDisplay) userCoinsDisplay.textContent = userCoins; animateCoinGain(COIN_GAIN); showToast(`+${COIN_GAIN} moedas`); if($id('iaResponse')) $id('iaResponse').innerHTML = `<p>Processando: ${q}</p>`; setTimeout(()=>{ if($id('iaResponse')) $id('iaResponse').innerHTML = `<p>Resposta simulada para ${q}.</p>`; }, 1200); }

        function updateMetrics(){ const now=Date.now(); const s = Math.floor((now-startTime)/1000); const score = (interactionsCount*1.5)+(gamesPlayedCount*3)+(s/120); engagementScore = Math.min(score,10); if($id('sessionTime')) $id('sessionTime').textContent = `${s}s`; if($id('interactions')) $id('interactions').textContent = interactionsCount; if($id('gamesPlayed')) $id('gamesPlayed').textContent = gamesPlayedCount; if($id('engagementScore')) $id('engagementScore').textContent = engagementScore.toFixed(2); }

        function generateTableHTML(data){ let html = `<table style="width:100%;border-collapse:collapse;text-align:left;"><thead><tr style="background:#34495e;color:#fff"><th style="padding:10px">Pos.</th><th style="padding:10px">Time</th><th style="padding:10px">Pts</th><th style="padding:10px">Status</th></tr></thead><tbody>`; data.forEach(r=>{ let sc='#bdc3c7'; if(r.status==='Líder' || r.status==='Acesso') sc='#2ecc71'; if(r.status==='Z4') sc='#e74c3c'; if(r.status==='Libertadores') sc='#f1c40f'; html += `<tr style="border-bottom:1px solid #4a4a4a;"><td style="padding:8px">${r.pos}</td><td style="padding:8px;font-weight:600">${r.team}</td><td style="padding:8px">${r.pts}</td><td style="padding:8px;color:${sc}">${r.status}</td></tr>` }); html += `</tbody></table>`; return html; }

        const CLASSIFICATION_DATA = { 'serieA':[ {pos:1,team:'Fluminense',pts:65,status:'Líder'}, {pos:2,team:'Flamengo',pts:62,status:'Libertadores'}, {pos:3,team:'Botafogo',pts:58,status:'Libertadores'}, {pos:4,team:'Palmeiras',pts:55,status:'Libertadores'}, {pos:5,team:'São Paulo',pts:50,status:'Sul-Americana'}, {pos:17,team:'Cruzeiro',pts:35,status:'Z4'} ], 'serieB':[ {pos:1,team:'Vasco',pts:72,status:'Acesso'}, {pos:2,team:'Bahia',pts:70,status:'Acesso'}, {pos:3,team:'Grêmio',pts:68,status:'Acesso'}, {pos:4,team:'Criciúma',pts:64,status:'Acesso'} ] };

        function loadRestrictedContent(){ if($id('serieATable')) $id('serieATable').innerHTML = generateTableHTML(CLASSIFICATION_DATA.serieA); if($id('serieBTable')) $id('serieBTable').innerHTML = generateTableHTML(CLASSIFICATION_DATA.serieB); }

        function loadFeaturedMatches(){ const el = $id('featuredMatches'); if(!el) return; if(readConsent().backend){ fetch('/api/featured-matches').then(r=>r.json()).then(d=>{ const m = d.matches||[]; if(m.length===0){ el.innerHTML = '<p>Sem jogos recentes.</p>'; return; } el.innerHTML = '<h3>Próximos Jogos</h3><ul>'+m.map(x=>`<li>${x.date} - ${x.match}</li>`).join('')+'</ul>'; }).catch(()=>{ el.innerHTML = '<p>Versão local: Flamengo vs Fluminense - Hoje 20:00</p>'; }); } else { el.innerHTML = '<p>Flamengo vs Fluminense - Hoje 20:00 (local)</p>'; } }

        function checkBackendStatus(){ setTimeout(()=>{ const st = $id('statusText'); if(st) st.textContent = 'Servidor local (dev)'; const ind = document.querySelector('.status-indicator'); if(ind){ ind.classList.remove('status-loading'); ind.classList.add('status-online'); } if($id('statusDetails')) $id('statusDetails').textContent = 'Conectado (dev)'; }, 800); }

        function navigateTo(pageId){ pages.forEach(p=>p.classList.remove('active')); const t = $id(pageId); if(t) t.classList.add('active'); navButtons.forEach(b=> b.classList.toggle('active', b.dataset.page===pageId)); try{ history.replaceState(null,null,`#${pageId}`); }catch(e){} }

        function wireUiControls(){ const cs = $id('consentSettingsBtn'); if(cs) cs.addEventListener('click', ()=>{ const m = $id('consentModal'); if(m) m.style.display='flex'; const c = readConsent(); if($id('cons_analytics')) $id('cons_analytics').checked = !!c.analytics; if($id('cons_ads')) $id('cons_ads').checked = !!c.ads; if($id('cons_backend')) $id('cons_backend').checked = !!c.backend; }); const saveC = $id('saveConsentBtn'); if(saveC) saveC.addEventListener('click', ()=>{ const newC = { analytics: !!($id('cons_analytics')&&$id('cons_analytics').checked), ads: !!($id('cons_ads')&&$id('cons_ads').checked), backend: !!($id('cons_backend')&&$id('cons_backend').checked) }; saveConsent(newC); applyConsentWorkflows(); const m = $id('consentModal'); if(m) m.style.display='none'; showToast('Preferências salvas'); }); const cancelC = $id('cancelConsentBtn'); if(cancelC) cancelC.addEventListener('click', ()=>{ const m = $id('consentModal'); if(m) m.style.display='none'; }); const fbBtn = $id('firebaseSetupBtn'); if(fbBtn) fbBtn.addEventListener('click', ()=>{ const m = $id('firebaseModal'); if(m) m.style.display='flex'; }); const saveFb = $id('saveFirebaseBtn'); if(saveFb) saveFb.addEventListener('click', ()=>{ const txt = $id('firebaseConfigInput'); if(!txt) return; try{ const obj = JSON.parse(txt.value); localStorage.setItem('fap_firebase_cfg', JSON.stringify(obj)); showToast('Firebase salvo localmente'); const m = $id('firebaseModal'); if(m) m.style.display='none'; }catch(e){ showToast('JSON inválido'); } }); const cancelFb = $id('cancelFirebaseBtn'); if(cancelFb) cancelFb.addEventListener('click', ()=>{ const m = $id('firebaseModal'); if(m) m.style.display='none'; }); }
        // Expose functions for inline handlers
        window.openGame = openGame;
        window.quickQuery = quickQuery;
        window.endGame = endGame;
        window.acceptAllConsent = function(){ saveConsent({analytics:true,ads:true,backend:true}); applyConsentWorkflows(); const b=$id('consentBanner'); if(b) b.style.display='none'; showToast('Consentimento aceito'); };
        window.rejectAllConsent = function(){ saveConsent({analytics:false,ads:false,backend:false}); const b=$id('consentBanner'); if(b) b.style.display='none'; showToast('Consentimento rejeitado'); };

        // Init
        window.addEventListener('load', ()=>{ loadCoins(); updateAuthUi(); applyConsentWorkflows(); wireUiControls(); checkBackendStatus(); loadFeaturedMatches(); const h = location.hash.replace('#',''); if(h && $id(h)) navigateTo(h); else navigateTo('home'); if(signInButton) signInButton.addEventListener('click', signIn); if(signOutButton) signOutButton.addEventListener('click', signOut); setInterval(updateMetrics,1000); if(userCoinsDisplay) userCoinsDisplay.textContent = userCoins; });

    })();
    // If Firebase SDK is present, use Google popup auth
    if (window.firebase && firebase.auth) {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(result => {
            return result.user.getIdToken().then(idToken => ({ user: result.user, idToken }));
        }).then(({ user, idToken }) => {
            // Send idToken to backend to create/find user
            fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) })
                .then(r => r.json())
                .then(data => {
                    currentUser = { userId: data.userId, name: data.name, email: data.email, photoURL: data.photoURL };
                    // load coins from backend
                    fetch(`/api/coins?userId=${encodeURIComponent(currentUser.userId)}`).then(r => r.json()).then(d => {
                        userCoins = Number(d.coins) || 0;
                        updateAuthState(true);
                        showToast(`Bem-vindo, ${currentUser.name}!`, { ttl: 2000 });
                        loadRestrictedContent();
                    }).catch(() => {
                        loadCoinsFromStorage();
                        updateAuthState(true);
                        loadRestrictedContent();
                    });
                }).catch(() => {
                    showToast('Erro ao autenticar com o backend.', { ttl: 2200 });
                });
        }).catch(err => {
            console.warn('Firebase sign-in failed', err);
            showToast('Falha no login do Google.', { ttl: 2000 });
        });
        return;
    }

    // Fallback: previous local/backend flow
    if (getConsent('backend')) {
        // Ensure we send an email (backend expects email). Generate a local fake email to avoid 400 errors
        const fakeEmail = `local+${Date.now()}@example.com`;
        fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Analista Pro', email: fakeEmail }) })
            .then(r => r.json())
            .then(user => {
                // If API returned an error object, fallback to local mode
                if (user && user.error) throw new Error(user.error);
                currentUser = user;
                // Pega saldo do backend
                fetch(`/api/coins?userId=${encodeURIComponent(user.userId)}`)
                    .then(r => r.json())
                    .then(data => {
                        userCoins = Number(data.coins) || 0;
                        updateAuthState(true);
                        showToast(`Bem-vindo, ${currentUser.name}! Dados carregados.`, { ttl: 2500 });
                        loadRestrictedContent();
                    }).catch(() => {
                        // fallback local
                        loadCoinsFromStorage();
                        if (!userCoins || userCoins <= 0) userCoins = 500;
                        updateAuthState(true);
                        showToast(`Bem-vindo, ${currentUser.name}! (offline)` , { ttl: 2500 });
                        loadRestrictedContent();
                    });
            }).catch(() => {
                // fallback local
                currentUser = { name: 'Analista Pro' };
                loadCoinsFromStorage();
                if (!userCoins || userCoins <= 0) userCoins = 500;
                updateAuthState(true);
                showToast('Bem-vindo! (modo offline)', { ttl: 2000 });
                loadRestrictedContent();
            });
    } else {
        // Sem consentimento para backend, faz login local simulado
        currentUser = { name: 'Analista Pro' };
        loadCoinsFromStorage();
        if (!userCoins || userCoins <= 0) userCoins = 500;
        updateAuthState(true);
        showToast('Bem-vindo! (local)', { ttl: 2000 });
        loadRestrictedContent();
    }
}

function signOut() {
    // If firebase is active, sign out there too
    if (window.firebase && firebase.auth) {
        firebase.auth().signOut().catch(()=>{});
    }
    currentUser = null;
    // Persiste o saldo atual e limpa a sessão
    saveCoinsToStorage();
    userCoins = 0;
    updateAuthState(false);
    showToast('Você saiu. Sessão finalizada.', {ttl: 2000});
}

/** Atualiza a interface (botões, perfil e conteúdo restrito) */
function updateAuthState(loggedIn) {
    const sections = document.querySelectorAll('.auth-required');
    const prompts = document.querySelectorAll('.sign-in-prompt');
    
    if (loggedIn && currentUser) {
        signInButton.style.display = 'none';
        signOutButton.style.display = 'block';
        userProfile.style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userPhoto').src = currentUser.photoURL;
        userCoinsDisplay.textContent = userCoins;

        sections.forEach(section => section.classList.add('logged-in'));
        prompts.forEach(prompt => prompt.classList.add('logged-in'));
        
    } else {
        signInButton.style.display = 'block';
        signOutButton.style.display = 'none';
        userProfile.style.display = 'none';

        sections.forEach(section => section.classList.remove('logged-in'));
        prompts.forEach(prompt => prompt.classList.remove('logged-in'));
    }
}

/** Carrega as tabelas de classificação que só podem ser vistas por usuários logados */
function loadRestrictedContent() {
    // 1. Classificação Série A
    serieATableDiv.innerHTML = generateTableHTML(CLASSIFICATION_DATA.serieA);
    // 2. Classificação Série B
    serieBTableDiv.innerHTML = generateTableHTML(CLASSIFICATION_DATA.serieB);
}


// ===============================================
// Lógica do Dashboard e Interatividade
// ===============================================

/** Simula a resposta da IA para consultas rápidas */
function quickQuery(queryType) {
    if (!currentUser) {
        iaResponseDiv.innerHTML = '<p style="color: #e74c3c; font-weight: bold;">🔒 Faça login para usar o IA Analytics!</p>';
        return;
    }
    
    interactionsCount++;
    const COIN_GAIN = 5;
    userCoins += COIN_GAIN;
    userCoinsDisplay.textContent = userCoins;
    animateCoinGain(COIN_GAIN); // Animação de ganho de moedas
    // Persiste local e tenta sincronizar com backend se houver consentimento
    saveCoinsToStorage();
    if (currentUser && currentUser.userId && getConsent('backend')) {
        fetch('/api/coins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.userId, coins: userCoins }) }).catch(()=>{});
    }
    showToast(`+${COIN_GAIN} moedas! (Consulta IA)` , {ttl: 2200});
    
    const responses = {
        'serie-a-classification': 'Análise da IA: Fluminense mantém a liderança, mas o Flamengo tem 78% de chance de vencer o próximo clássico, diminuindo a diferença. Probabilidade de 5% de Z4.',
        'serie-b-classification': 'Análise da IA: O Vasco tem 92% de chance de acesso, mas precisa garantir mais 4 vitórias nos próximos 6 jogos. Cruzeiro e Bahia em disputa acirrada.',
        'copa-brasil-results': 'Análise da IA: São Paulo 2x1 Corinthians (IA acertou 85%), Palmeiras 3x0 Atlético-MG (IA errou o placar). Próxima fase em análise.',
        'top-scorers': 'Análise da IA: Tiquinho Soares (Botafogo) lidera com 18 gols. Pedro (Flamengo) com 15. A IA prevê Endrick como o artilheiro do segundo turno.'
    };

    iaResponseDiv.innerHTML = `<p style="font-weight: bold; color: #f1c40f;">[Processando... Consultando Modelos Prediivos V4.1]</p>`;

    setTimeout(() => {
        iaResponseDiv.innerHTML = `<p style="color: #2ecc71; font-weight: bold;">Resposta da IA:</p><p>${responses[queryType] || 'Consulta não reconhecida pela IA.'}</p>`;
        updateMetrics();
    }, 1500);
}

/** Simula a abertura de um minijogo */
async function openGame(gameName) {
    if (!currentUser) {
        showToast('Você precisa estar logado para iniciar um jogo e ganhar moedas!', {ttl: 3000});
        return;
    }
    
    gamesPlayedCount++;
    const COIN_GAIN = 15;
    userCoins += COIN_GAIN;
    
    updateMetrics(); 
    userCoinsDisplay.textContent = userCoins;
    animateCoinGain(COIN_GAIN); // Animação de ganho de moedas
    saveCoinsToStorage();
    if (currentUser && currentUser.userId && getConsent('backend')) {
        fetch('/api/coins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.userId, coins: userCoins }) }).catch(()=>{});
    }
    showToast(`+${COIN_GAIN} moedas por iniciar ${gameName}!`, {ttl: 2500});
    
    // Dynamically load and render the game
    const gameContentArea = document.getElementById('gameContentArea');
    if (!gameContentArea) return;
    
    try {
        if (gameName === 'precisao') {
            const { renderPrecisaoGame } = await import('./games/precisao.js');
            renderPrecisaoGame('gameContentArea');
        } else if (gameName === 'goleiro') {
            const { renderGoleiroGame } = await import('./games/goleiro.js');
            renderGoleiroGame('gameContentArea');
        } else if (gameName === 'ranking') {
            const { renderGlobalRanking } = await import('./games/ranking.js');
            renderGlobalRanking('gameContentArea');
        } else {
            gameContentArea.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #f1c40f;">
                    <h3>🎮 ${gameName.toUpperCase()}</h3>
                    <p>Este jogo está em desenvolvimento e será lançado em breve!</p>
                    <p style="margin-top: 20px;">Continue jogando outros minijogos para acumular moedas! 💰</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading game:', error);
        gameContentArea.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <p>Erro ao carregar o jogo. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// Função para simular o fim do jogo e persistir moedas
window.endGame = function() {
    if (typeof gameContentArea !== 'undefined' && gameContentArea) {
        gameContentArea.innerHTML = `
            <p style="color: #f1c40f; font-weight: bold;">Fim de Jogo! Volte sempre para ganhar mais moedas!</p>
        `;
        setTimeout(() => {
            gameContentArea.innerHTML = '<p class="sign-in-prompt logged-in">Escolha um novo jogo abaixo:</p>';
        }, 2000);
    }
    saveCoinsToStorage();
    showToast('Jogo finalizado. Moedas salvas.', {ttl: 1800});
}

/** Atualiza o dashboard de métricas em tempo real */
function updateMetrics() {
    const currentTime = Date.now();
    const sessionSeconds = Math.floor((currentTime - startTime) / 1000);
    
    // Fórmulas de Engajamento mais dinâmicas (simulação)
    let rawScore = (interactionsCount * 1.5) + (gamesPlayedCount * 3) + (sessionSeconds / 120);
    engagementScore = Math.min(rawScore, 10.0);

    document.getElementById('sessionTime').textContent = `${sessionSeconds}s`;
    document.getElementById('interactions').textContent = interactionsCount;
    document.getElementById('gamesPlayed').textContent = gamesPlayedCount;
    document.getElementById('engagementScore').textContent = engagementScore.toFixed(2);
}

/** Simula o carregamento dos jogos em destaque */
function loadFeaturedMatches() {
    // Tenta buscar do backend quando permitido
    if (getConsent('backend')) {
        fetch('/api/featured-matches').then(r => r.json()).then(data => {
            const matches = data.matches || [];
            let html = `<h3>Próximos Jogos (Palpites da IA)</h3><table style="width: 100%; border-collapse: collapse; text-align: left;">`;
            html += `<thead><tr style="background-color: #34495e;"><th style="padding: 10px;">Data</th><th style="padding: 10px;">Partida</th><th style="padding: 10px;">Probabilidade de Vitória (IA)</th></tr></thead><tbody>`;
            matches.forEach(m => {
                const probs = m.probabilities;
                const probText = Object.keys(probs).map(k => `${k} ${probs[k]}%`).join(' | ');
                html += `<tr><td style="padding: 10px; border-bottom: 1px solid #4a4a4a;">${m.date}</td><td style="padding: 10px; border-bottom: 1px solid #4a4a4a;">${m.match}</td><td style="padding: 10px; border-bottom: 1px solid #4a4a4a; color: #2ecc71;">${probText}</td></tr>`;
            });
            html += `</tbody></table>`;
            featuredMatchesDiv.innerHTML = html;
        }).catch(()=>{
            // fallback local
            featuredMatchesDiv.innerHTML = `<p>Sem conexão. Mostrando dados locais.</p>`;
            // reuse the original local content
            featuredMatchesDiv.innerHTML += `
                <h3>Próximos Jogos (Local)</h3>
                <p>Flamengo vs Fluminense - Hoje 20h00</p>
            `;
        });
    } else {
        // fallback quando sem consentimento
        featuredMatchesDiv.innerHTML = `
            <h3>Próximos Jogos (Local)</h3>
            <p>Flamengo vs Fluminense - Hoje 20h00</p>
        `;
    }
}

/** Simula a conexão com o Backend */
function checkBackendStatus() {
    setTimeout(() => {
        status = 'online';
        backendStatusText.textContent = 'Servidor Online (v2.1.0)';
        backendStatusIndicator.classList.remove('status-loading');
        backendStatusIndicator.classList.add('status-online');
        document.getElementById('statusDetails').innerHTML = 'Dados atualizados em tempo real.';
    }, 1000);
}


// ===============================================
// Lógica de Navegação (SPA) - Mantida
// ===============================================

function navigateTo(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    navButtons.forEach(btn => {
        if (btn.getAttribute('data-page') === pageId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    history.pushState(null, null, `#${pageId}`);
    
    // Lazy-load international league data when navigating to internacional page
    if (pageId === 'internacional' && getConsent('backend')) {
        loadPremierLeague();
        loadLaLiga();
        loadSerieAIta();
        loadLibertadores();
        loadSudamericana();
        loadUCL();
        loadUEL();
        loadUEConf();
    }
}

navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = button.getAttribute('data-page');
        navigateTo(pageId);
    });
});

function handleInitialLoad() {
    const defaultPage = 'home';
    const hash = window.location.hash.substring(1);
    
    if (hash && document.getElementById(hash)) {
        navigateTo(hash);
    } else {
        navigateTo(defaultPage);
    }
}


// ===============================================
// Event Listeners e Inicialização
// ===============================================

// Listeners de Login/Logout
signInButton.addEventListener('click', signIn);
signOutButton.addEventListener('click', signOut);

window.onload = () => {
    handleInitialLoad();
    checkBackendStatus();
    loadFeaturedMatches();
    
    setInterval(updateMetrics, 1000); 
    // Atualiza o estado inicial (caso o usuário já estivesse logado em um ambiente real)
    updateAuthState(false); 
    // Ao carregar a página, restaura moedas caso usuário já as tenha
    loadCoinsFromStorage();
    userCoinsDisplay.textContent = userCoins;
};

// Expondo as funções para uso no HTML (onclick)
window.quickQuery = quickQuery;
window.openGame = openGame;
