// ===============================================
// Variáveis do DOM e Estado Global
// ===============================================
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

// Estado da Aplicação
let currentUser = null;
let userCoins = 0;
let interactionsCount = 0;
let gamesPlayedCount = 0;
let startTime = Date.now();
let status = 'loading'; // loading, online, error
let engagementScore = 0.0;

// Persistência local de moedas (localStorage)
const COINS_STORAGE_KEY = 'fap_user_coins_v1';

function loadCoinsFromStorage() {
    try {
        const raw = localStorage.getItem(COINS_STORAGE_KEY);
        if (raw !== null) {
            const parsed = parseInt(raw, 10);
            if (!isNaN(parsed)) {
                userCoins = parsed;
            }
        }
    } catch (e) {
        console.warn('Não foi possível ler moedas do localStorage', e);
    }
}

function saveCoinsToStorage() {
    try {
        localStorage.setItem(COINS_STORAGE_KEY, String(userCoins));
    } catch (e) {
        console.warn('Não foi possível salvar moedas no localStorage', e);
    }
}

// Toasts não intrusivos substituem alert()
function showToast(message, options = {}) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);

    // small delay to allow transition
    setTimeout(() => toast.classList.add('show'), 10);

    const ttl = options.ttl || 3500;
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, ttl);
}

// -------------------
// Consentimento (CMP) simplificado
// -------------------
const CONSENT_KEY = 'fap_user_consent_v1';

function getConsent(key) {
    try {
        const raw = localStorage.getItem(CONSENT_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return !!parsed[key];
    } catch (e) {
        return false;
    }
}

function setConsent(consentObj) {
    try {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consentObj || {}));
    } catch (e) {
        console.warn('Could not save consent', e);
    }
}

// Controlador simples para exibir o banner de consentimento
function showConsentBannerIfNeeded() {
    const banner = document.getElementById('consentBanner');
    if (!banner) return;
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
        banner.style.display = 'flex';
    }
}

window.acceptAllConsent = function() {
    setConsent({ analytics: true, ads: true, backend: true });
    document.getElementById('consentBanner').style.display = 'none';
    showToast('Consentimento salvo: Analytics + Ads + Backend', { ttl: 2200 });
}

window.rejectAllConsent = function() {
    setConsent({ analytics: false, ads: false, backend: false });
    document.getElementById('consentBanner').style.display = 'none';
    showToast('Você rejeitou cookies e tracking. Algumas funcionalidades ficarão limitadas.', { ttl: 2500 });
}

// Consent modal controls
function openConsentModal() {
    const modal = document.getElementById('consentModal');
    if (!modal) return;
    // populate checkboxes
    const raw = localStorage.getItem(CONSENT_KEY);
    let parsed = { analytics: false, ads: false, backend: false };
    try { if (raw) parsed = JSON.parse(raw); } catch(e){}
    document.getElementById('cons_analytics').checked = !!parsed.analytics;
    document.getElementById('cons_ads').checked = !!parsed.ads;
    document.getElementById('cons_backend').checked = !!parsed.backend;
    modal.style.display = 'flex';
}

function closeConsentModal() {
    const modal = document.getElementById('consentModal');
    if (!modal) return;
    modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('consentSettingsBtn');
    if (btn) btn.addEventListener('click', openConsentModal);

    const saveBtn = document.getElementById('saveConsentBtn');
    if (saveBtn) saveBtn.addEventListener('click', () => {
        const newConsent = {
            analytics: !!document.getElementById('cons_analytics').checked,
            ads: !!document.getElementById('cons_ads').checked,
            backend: !!document.getElementById('cons_backend').checked
        };
        setConsent(newConsent);
        closeConsentModal();
        showToast('Preferências salvas.', { ttl: 1800 });
    });

    const cancelBtn = document.getElementById('cancelConsentBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        closeConsentModal();
    });

    // Show banner if needed on load
    showConsentBannerIfNeeded();
    // Firebase setup button
    const fbBtn = document.getElementById('firebaseSetupBtn');
    if (fbBtn) fbBtn.addEventListener('click', () => {
        const modal = document.getElementById('firebaseModal');
        if (!modal) return;
        const raw = localStorage.getItem('fap_firebase_cfg');
        if (raw) document.getElementById('firebaseConfigInput').value = raw;
        modal.style.display = 'flex';
    });

    const saveFb = document.getElementById('saveFirebaseBtn');
    if (saveFb) saveFb.addEventListener('click', () => {
        const txt = document.getElementById('firebaseConfigInput').value.trim();
        try {
            const cfg = JSON.parse(txt);
            localStorage.setItem('fap_firebase_cfg', JSON.stringify(cfg));
            initFirebaseFromConfig(cfg);
            showToast('Firebase inicializado localmente.', { ttl: 1800 });
            document.getElementById('firebaseModal').style.display = 'none';
        } catch (e) {
            showToast('JSON inválido. Verifique e tente novamente.', { ttl: 2200 });
        }
    });

    const cancelFb = document.getElementById('cancelFirebaseBtn');
    if (cancelFb) cancelFb.addEventListener('click', () => document.getElementById('firebaseModal').style.display = 'none');
    // If firebase config exists in localStorage, try to init
    try { const autoCfg = JSON.parse(localStorage.getItem('fap_firebase_cfg') || 'null'); if (autoCfg) initFirebaseFromConfig(autoCfg); } catch(e){}
});

// Debugging: mostrar currentUser em painel e console
function debugShowCurrentUser() {
    const panel = document.getElementById('debugUserDisplay');
    const pre = document.getElementById('debugUserPre');
    if (!panel || !pre) return;
    const payload = currentUser ? JSON.stringify(currentUser, null, 2) + '\ncoins: ' + userCoins : 'Nenhum usuário autenticado';
    pre.textContent = payload;
    panel.style.display = 'block';
    console.log('DEBUG currentUser:', currentUser, 'userCoins=', userCoins);
    showToast('Debug: currentUser mostrado na tela e no console', { ttl: 2200 });
}

// Wire debug button
document.addEventListener('DOMContentLoaded', () => {
    const dbgBtn = document.getElementById('debugUserBtn');
    if (dbgBtn) dbgBtn.addEventListener('click', debugShowCurrentUser);
});

// also expose for console
window.debugShowCurrentUser = debugShowCurrentUser;

// Dynamically load Firebase SDK and init
function loadFirebaseSdk(callback) {
    if (window.firebase && firebase.auth) return callback && callback();
    const scriptApp = document.createElement('script');
    scriptApp.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
    scriptApp.onload = () => {
        const scriptAuth = document.createElement('script');
        scriptAuth.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
        scriptAuth.onload = () => callback && callback();
        document.body.appendChild(scriptAuth);
    };
    document.body.appendChild(scriptApp);
}

function initFirebaseFromConfig(cfg) {
    try {
        loadFirebaseSdk(() => {
            try {
                if (!window.firebase) return;
                // If already initialized, skip
                try { firebase.app(); } catch(e) { firebase.initializeApp(cfg); }
            } catch (e) { console.warn('Firebase init error', e); }
        });
    } catch (e) { console.warn('initFirebase error', e); }
}

/*
 Prebid.js / Google Ad Manager - Exemplo (comentado)

 Para testar header bidding localmente:
 1. Cadastre unidades no Google Ad Manager (GAM) ou use um ad unit de teste.
 2. Inclua Prebid.js (build apropriado para produção). Exemplo de script (não ativado aqui):

 <script src="https://acdn.adnxs.com/prebid/not-for-prod/prebid.js"></script>

 3. Configurar ad units e adapters no Prebid, então chamar pbjs.requestBids e, após timeout, fazer a chamada ao GPT (gpt.js) do GAM.

 Exemplo mínimo (pseudo):

 // var adUnits = [{ code: 'adSlotTop', mediaTypes: { banner: { sizes: [[728,90]] } }, bids: [{ bidder: 'appnexus', params: { placementId: '123' } }] }];
 // pbjs.addAdUnits(adUnits);
 // pbjs.requestBids({ bidsBackHandler: function() { googletag.cmd.push(function(){ pbjs.setTargetingForGPTAsync(); googletag.pubads().refresh(); }); } });

 Atenção: é necessário configurar adaptadores e negociações reais antes de usar em produção. Consulte a documentação do Prebid e do Google Ad Manager.

*/


// ===============================================
// Funções de Utilitário e Simulação de Dados
// ===============================================

/** Simulação de Dados de Classificação */
const CLASSIFICATION_DATA = {
    'serieA': [
        { pos: 1, team: 'Fluminense', pts: 65, status: 'Líder' },
        { pos: 2, team: 'Flamengo', pts: 62, status: 'Libertadores' },
        { pos: 3, team: 'Botafogo', pts: 58, status: 'Libertadores' },
        { pos: 4, team: 'Palmeiras', pts: 55, status: 'Libertadores' },
        { pos: 5, team: 'São Paulo', pts: 50, status: 'Sul-Americana' },
        { pos: 17, team: 'Cruzeiro', pts: 35, status: 'Z4' },
    ],
    'serieB': [
        { pos: 1, team: 'Vasco', pts: 72, status: 'Acesso' },
        { pos: 2, team: 'Bahia', pts: 70, status: 'Acesso' },
        { pos: 3, team: 'Grêmio', pts: 68, status: 'Acesso' },
        { pos: 4, team: 'Criciúma', pts: 64, status: 'Acesso' },
    ]
};

/** Função para gerar a tabela HTML (restringida por login) */
function generateTableHTML(data) {
    let html = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95em;">
            <thead>
                <tr style="background-color: #34495e;">
                    <th style="padding: 12px;">Pos.</th>
                    <th style="padding: 12px;">Time</th>
                    <th style="padding: 12px;">Pts</th>
                    <th style="padding: 12px;">Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach(row => {
        let statusColor = '#bdc3c7'; // cor cinza padrão
        if (row.status === 'Líder' || row.status === 'Acesso') statusColor = '#2ecc71';
        if (row.status === 'Z4') statusColor = '#e74c3c';
        if (row.status === 'Libertadores') statusColor = '#f1c40f';

        html += `
            <tr style="border-bottom: 1px solid #4a4a4a;">
                <td style="padding: 10px;">${row.pos}</td>
                <td style="padding: 10px; font-weight: bold;">${row.team}</td>
                <td style="padding: 10px;">${row.pts}</td>
                <td style="padding: 10px; color: ${statusColor}; font-weight: 500;">${row.status}</td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    return html;
}

/** Adiciona um efeito de animação de moedas no canto da tela */
function animateCoinGain(amount) {
    const coinEl = document.createElement('div');
    coinEl.textContent = `+${amount} 💰`;
    coinEl.style.cssText = `
        position: fixed;
        top: 80px;
        right: 15%;
        background-color: #f1c40f;
        color: #1f1f1f;
        padding: 5px 10px;
        border-radius: 20px;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease-out;
    `;
    document.body.appendChild(coinEl);

    // Animação de subida e desaparecimento
    setTimeout(() => {
        coinEl.style.opacity = '1';
        coinEl.style.transform = 'translateY(0px)';
    }, 50);

    setTimeout(() => {
        coinEl.style.opacity = '0';
        coinEl.style.transform = 'translateY(-20px)';
    }, 1500);

    setTimeout(() => {
        coinEl.remove();
    }, 2000);
}


// ===============================================
// Lógica de Autenticação e Conteúdo Restrito
// ===============================================

function signIn() {
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
        fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Analista Pro' }) })
            .then(r => r.json())
            .then(user => {
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
function openGame(gameName) {
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