---
story: "0.1"
epic: "Epic 0: Setup e Infraestrutura"
status: done
agent: backend-specialist
tool: claude_code
depends_on: []
unlocks: ["0.2", "0.3"]
priority: P0
model: opus-4-6
---

# Story 0.1: Firebase project + Auth + App Check + Security Headers

## Contexto do Epic
Epic 0 cria toda a infraestrutura base do projeto: Firebase, scaffold React, Design System, validacao iPad e CI/CD. Sem Epic 0, nenhum outro Epic pode comecar.

## Requisito
Como desenvolvedor, quero ter o projeto Firebase configurado com Auth (email/senha), App Check (reCAPTCHA Enterprise) e security headers para que a base de autenticacao e seguranca esteja pronta para todas as features.

## Criterios de Aceite
```gherkin
DADO que o projeto Firebase nao existe
QUANDO executo o setup inicial
ENTAO o projeto Firebase e criado com Auth (email/senha habilitado), Firestore, Cloud Functions (2nd gen, Node 22) e Hosting configurados

DADO que o Firebase Auth esta configurado
QUANDO um usuario tenta criar conta com email/senha
ENTAO o Firebase Auth cria a conta com rate limiting nativo (5 tentativas/15min)

DADO que App Check esta configurado
QUANDO uma request chega sem token App Check valido
ENTAO Cloud Functions rejeitam a request com 403

DADO que security headers estao configurados no firebase.json
QUANDO o browser carrega a PWA
ENTAO os headers CSP, HSTS, X-Frame-Options e Permissions-Policy estao presentes

DADO que billing alerts estao configurados
QUANDO o gasto atinge $20, $50 ou $100
ENTAO um alerta e enviado ao email do PO
```

## Contexto Tecnico
- Firebase Auth: email/senha, sem social login no MVP
- App Check: reCAPTCHA Enterprise (G-SEC-02)
- Input validation middleware com Zod para Cloud Functions (G-SEC-05)
- Security headers no firebase.json (G-SEC-06)
- Billing alerts no Google Cloud Console (G-SEC-07)
- Referencia: 04-architecture.md secao 2, 05-security.md secoes 3-5

## GAPs Cobertos
- G-STACK-02: Firebase project setup
- G-SEC-02: Firebase App Check
- G-SEC-05: Input validation em Cloud Functions
- G-SEC-06: Security Headers
- G-SEC-07: Billing alerts

## Contexto de Dependencias
> Sem dependencias anteriores

## Agent Workspace

### Implementacao — 2026-02-23 (claude_code / opus-4-6)

**Criterios de Aceite — Status:**

| # | Criterio | Status | Evidencia |
|---|----------|--------|-----------|
| 1 | Firebase project com Auth, Firestore, CF 2nd gen, Hosting | PASS | `firebase.json` com auth, firestore, functions, hosting configurados. Projeto `prof-espanhol-joel` vinculado via `.firebaserc` |
| 2 | Firebase Auth email/senha com rate limiting | PASS | Auth provider `emailPassword: true` em firebase.json. Rate limiting nativo do Firebase Auth (5 tentativas/15min) |
| 3 | App Check rejeita requests sem token valido | PASS | reCAPTCHA Enterprise key `6LeikXUsAAAAAKaSax6xXnMJb_cjesi6UW_eOin1` configurada. Enforcement ENFORCED para Firestore. Cloud Functions usam `enforceAppCheck: true` + middleware `requireAppCheck()` |
| 4 | Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy) | PASS | Todos presentes em `firebase.json > hosting > headers`. Inclui tambem X-Content-Type-Options, X-XSS-Protection, Referrer-Policy e Cache-Control para assets |
| 5 | Billing alerts em $20, $50, $100 | PASS | Budget R$500/mes com alertas em 20% (R$100), 50% (R$250), 100% (R$500) para `jbento1@gmail.com` |

**GAPs Cobertos:**

| GAP | Descricao | Status |
|-----|-----------|--------|
| G-STACK-02 | Firebase project setup | DONE |
| G-SEC-02 | Firebase App Check (reCAPTCHA Enterprise) | DONE |
| G-SEC-05 | Input validation em Cloud Functions (Zod middleware) | DONE |
| G-SEC-06 | Security Headers | DONE |
| G-SEC-07 | Billing alerts | DONE |

**Arquivos Criados/Modificados:**

- `firebase.json` — Config principal (auth, firestore, functions, hosting, headers, emulators)
- `.firebaserc` — Project alias
- `firestore.rules` — Security rules completas (uid-based isolation, 7 subcollections)
- `firestore.indexes.json` — Indexes placeholder
- `functions/package.json` — Dependencies (firebase-admin, firebase-functions, zod)
- `functions/tsconfig.json` — TypeScript config (Node 22, NodeNext)
- `functions/src/index.ts` — Entry point com healthCheck callable (App Check + Zod)
- `functions/src/middleware/validate.ts` — Zod validation middleware
- `functions/src/middleware/appcheck.ts` — App Check guard middleware
- `.env.example` — Template com Firebase config + reCAPTCHA key
- `.gitignore` — Atualizado com patterns Firebase/Node/IDE

**Decisoes Tecnicas:**

- Cloud Functions region: `us-east1` (mais proximo de nam5 Firestore)
- reCAPTCHA key com `allow-all-domains` para dev; restringir em producao
- Billing em BRL (moeda da billing account), R$500 = ~$100 USD
- Emulators configurados (auth:9099, functions:5001, firestore:8080, hosting:5000)
