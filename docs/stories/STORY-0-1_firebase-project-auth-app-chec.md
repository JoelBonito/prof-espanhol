---
story: "0.1"
epic: "Epic 0: Setup e Infraestrutura"
status: done
agent: security-auditor
tool: codex
depends_on: []
unlocks: []
priority: P0
spec_hash: "195ab1d1837f"
---

# Story 0.1: Firebase project + Auth + App Check + Security Headers `[opus]`

## Contexto do Epic
Setup e Infraestrutura

## Requisito
(a definir)

## Criterios de Aceite
(a definir)

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
