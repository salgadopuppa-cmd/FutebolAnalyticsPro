# Relatório automático: E2E run — 2025-10-09

Resumo
------
- Autor: execução automática local via ambiente de desenvolvimento
- Data: 2025-10-09
- Objetivo: validar o fluxo crítico da aplicação (consentimento, login fallback, minijogo/quickQuery que gera moedas, sincronização backend de coins) através de testes E2E automatizados e chamadas API.

Ambiente
--------
- Sistema: Windows (PowerShell) — execução local
- Node.js: v22.x (ambiente local)
- Servidor: Mock Express + SQLite (arquivo: `server/data/fap.db`)
- Test runner: Playwright (headless Chromium) via `e2e/test-e2e.js`

Comandos executados (principais)
--------------------------------
- Iniciar servidor (PowerShell):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& 'C:\Users\unik2\Downloads\FutebolAnalyticsPro\start.ps1'"
```

- Verificações API (PowerShell / Invoke-RestMethod):
```powershell
# status
Invoke-RestMethod -Uri 'http://localhost:3000/api/debug/status'
# featured matches
Invoke-RestMethod -Uri 'http://localhost:3000/api/featured-matches'
# coins (user inexistente)
Invoke-RestMethod -Uri 'http://localhost:3000/api/coins?userId=nonexistent'
```

- Criar usuário de teste e simular ganho de moedas:
```powershell
$resp = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{ email = 'tester@example.com'; name = 'Tester' })
Invoke-RestMethod -Uri "http://localhost:3000/api/coins?userId=$($resp.userId)"
Invoke-RestMethod -Uri 'http://localhost:3000/api/coins' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{ userId = $resp.userId; coins = 650 })
node server/query_user.js <userId>
```

- Executar testes E2E (Playwright):
```powershell
cd e2e
npm install
npx playwright install
npm test
```

Trechos de logs e saídas (capturadas)
-----------------------------------

1) Saída do start / servidor iniciado
```
> futebol-analytics-pro-server@1.0.0 start
> node index.js

Mock API server with SQLite running on http://localhost:3000
```

2) /api/debug/status (verificação)
```
{ "status": "ok", "firebaseAdmin": false, "dbPath": "C:\\Users\\unik2\\Downloads\\FutebolAnalyticsPro\\server\\data\\fap.db" }
```

3) /api/featured-matches (retorno seed)
```
{ "matches": [
  { "date": "2025-10-05 20:00", "match": "Flamengo vs Palmeiras (Série A)", "probabilities": { "flamengo": 55, "draw": 25, "palmeiras": 20 } },
  { "date": "2025-10-12 19:00", "match": "Vasco vs São Paulo (Série A)", "probabilities": { "vasco": 30, "draw": 20, "saopaulo": 50 } }
]}
```

4) GET /api/coins?userId=nonexistent
```
{ "userId": "nonexistent", "coins": 0 }
```

5) Criação de usuário teste (POST /api/auth)
```
{ "userId": "user-afzqt1m", "name": "Tester", "email": "tester@example.com", "photoURL": "https://i.imgur.com/2p1x9QZ.png", "coins": 500 }
```

6) Atualização de coins (POST /api/coins) e leitura direta do DB
```
POST returned: { "userId": "user-afzqt1m", "coins": 650 }

query_user.js output:
{
  "found": true,
  "user": {
    "id": "user-afzqt1m",
    "name": "Tester",
    "email": "tester@example.com",
    "photoURL": "https://i.imgur.com/2p1x9QZ.png",
    "coins": 650
  }
}
```

7) E2E run — saídas relevantes (execução final bem-sucedida)
```
Opening frontend...
Accepting consent...
Clicking sign-in button...
Logged in as Analista Pro
Opening debug panel...
Debug content snippet: { "userId": "user-6drkbrv", "name": "Analista Pro", "email": "local+1760057132042@example.com", ... }
Triggering quickQuery...
Coins shown in UI: 505
Backend coins for user-6drkbrv 505
Coins match between UI and backend.
E2E test completed successfully.
```

Observações e interpretações
---------------------------
- O servidor mock iniciou com sucesso e respondeu aos endpoints básicos.
- O fluxo de criação de usuários via fallback funciona e inicializa `coins` com 500.
- Atualizações de saldo via POST /api/coins persistem no SQLite (verificado com `query_user.js`).
- O teste E2E automatizado reproduziu a interação de UI (aceitar consentimento, login fallback, quickQuery) e confirmou que o saldo exibido na UI é sincronizado com o backend.

Problemas encontrados e correções aplicadas
-----------------------------------------
- Erro inicial: execução do teste E2E falhou por falta do pacote `node-fetch` — adicionado às dependências `e2e/package.json`.
- Erro: Playwright não tinha os navegadores baixados — executei `npx playwright install` antes de rodar os testes.
- Erro: fallback signin inicialmente não fornecia email (causava 400 no backend) — atualizei `app.js` para gerar um email fake quando necessário.

Artefatos e onde encontrar
--------------------------
- Server log (local): `server/server_run.log`
- Script auxiliar para inspeção do DB: `server/query_user.js`
- Testes E2E: `e2e/test-e2e.js`, `e2e/package.json`
- GitHub Actions workflow: `.github/workflows/e2e.yml`
- Relatório gerado automaticamente: este arquivo `reports/e2e-run-report-2025-10-09.md`

Recomendações / próximos passos
------------------------------
1. Adicionar seed/cleanup automatizado para testes (script SQL ou endpoint test-only) para garantir runs idempotentes.
2. Configurar secrets e ajustar workflow caso queira testar fluxo de Firebase (rodar com credenciais seguras em CI).
3. Expandir o workflow para executar em múltiplos navegadores (Chromium/Firefox/WebKit) e publicar resultados/take screenshots on failure.
4. Opcional: adicionar um job de integração que roda o linter e testes unitários antes do E2E para acelerar iteração.

Conclusão
---------
O teste E2E validou o fluxo crítico e confirmou persistência de moedas no backend. O ambiente local foi preparado e os problemas encontrados foram corrigidos para permitir execução confiável dos testes. O próximo passo natural é integrar estes testes ao CI (já adicionado como workflow) e automatizar a seed/cleanup para garantir repetibilidade.
