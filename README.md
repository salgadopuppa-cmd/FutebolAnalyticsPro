Futebol Analytics Pro - Local Development Guide

O workspace contém um frontend estático e um mock backend para desenvolvimento.

Estrutura relevante:
- index.html
- app.js
- style.css
- server/
  - index.js (mock API)
  - package.json
  - README.md

Como executar localmente:
1. Abra um terminal e navegue até `FutebolAnalyticsPro/server`.
2. Instale dependências:

   npm install

3. Inicie o mock server:

   npm start

4. Abra http://localhost:3000 no navegador para carregar o frontend (o servidor serve o frontend da pasta pai).

Docker & CI
----------------
Build and run with Docker:

   docker build -t fap:latest .
   docker run -p 3000:3000 -v $(pwd)/server/data:/app/server/data fap:latest

Or use docker-compose for nginx + app:

   docker-compose up --build

Run unit tests (server):

   cd server
   npm ci
   npx jest


Funcionalidades implementadas para desenvolvimento:
- Endpoints mock: /api/auth, /api/coins, /api/featured-matches
- Persistência básica de moedas no localStorage e sincronização com o mock backend quando consentido
- Banner simples de consentimento (CMP) para Ads / Analytics / Backend
- Placeholders comentados para Prebid.js (header bidding) e instruções no server/README.md

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
