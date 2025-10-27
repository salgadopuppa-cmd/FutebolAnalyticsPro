Futebol Analytics Pro - Local Development Guide

O workspace contém um frontend estático e um mock backend para desenvolvimento.

Estrutura relevante:
- index.html
- app.js
- style.css
- server/
  - server.js (mock API)
  - package.json
- games/
  - precisao.js
  - goleiro.js
  - ranking.js

Como executar localmente:
1. Abra um terminal e navegue até `FutebolAnalyticsPro/server`.
2. Instale dependências:

   npm install

3. Inicie o mock server (executa server/server.js):

   npm start

4. Abra http://localhost:3000 no navegador para carregar o frontend (o servidor serve o frontend da pasta pai).

Funcionalidades implementadas para desenvolvimento:
- Endpoints mock: /api/health, /api/sports/:league-tabela, /api/sports/:league-artilheiros, /api/sports/:league-proximos
- Suporte para múltiplas ligas: premier, laliga, seriea-ita, libertadores, sudamericana, ucl, uel, ueconf, brasileirao, brasileirao-b, copadobrasil
- Jogos interativos em games/: precisao.js, goleiro.js, ranking.js (carregáveis via dynamic import)
- Persistência básica de moedas no localStorage e sincronização com o mock backend quando consentido
- Banner simples de consentimento (CMP) para Ads / Analytics / Backend

Próximos passos recomendados:
- Substituir mock auth por OAuth real ou Firebase Auth.
- Trocar armazenamento em memória do server por DB (Postgres, MongoDB) para produção.
- Configurar Google Ad Manager / SSP e implementar Prebid configurado.
- Implementar server-side tagging para GA4 se necessário.

Instruções rápidas (scripts PowerShell)
------------------------------------
No Windows PowerShell você pode iniciar o servidor sem Firebase:

   cd 'c:\Users\unik2\Downloads\FutebolAnalyticsPro\server'
   .\start.ps1

Ou iniciar com Firebase (passando o path para o JSON do service account):

   cd 'c:\Users\unik2\Downloads\FutebolAnalyticsPro\server'
   .\start-with-firebase.ps1 'C:\caminho\para\serviceAccountKey.json'

Configuração do Firebase Web SDK (frontend)
-------------------------------------------
No frontend você pode colar o objeto `firebaseConfig` diretamente no modal (clique em "Configurar Firebase" no rodapé). Isso inicializa o SDK localmente para testes e ativa o fluxo de login via popup Google.

Lembre-se: para verificar tokens no backend você também precisa configurar o `FIREBASE_SERVICE_ACCOUNT_PATH` e iniciar o servidor com o script `start-with-firebase.ps1`.
