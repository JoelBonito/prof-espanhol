---
story: "0.2"
epic: "Epic 0: Setup e Infraestrutura"
status: done
agent: security-auditor
tool: codex
depends_on: []
unlocks: []
priority: P0
spec_hash: "6e34670ee25a"
---

# Story 0.2: Firestore schema (8 subcollections) + Security Rules `[opus]`

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
| 1 | 7 subcollections + user doc sob users/{uid} | PASS | `firestore.rules` define: diagnostics, sessions, lessonProgress, homework, adaptations, scheduleLogs, reports. User doc = "profile". Alinhado com 04-architecture.md secao 4 |
| 2 | Cross-user isolation (deny user B read user A) | PASS | 3 testes de cross-user isolation passam (diagnostics, sessions, homework). Rules usam `isOwner(userId)` em todas as collections |
| 3 | Campos criticos write-protected (level, levelScore, overallScore) | PASS | 5 testes confirmam: level, levelScore, diagnosticCompleted, email, adapterState bloqueados. Helper `fieldUnchangedOrAbsent` impede criacao e modificacao pelo client |
| 4 | Indices compostos definidos | PASS | `firestore.indexes.json` com 6 indices: homework(status+deadline, status+nextReviewDate), sessions(type+startedAt, status+startedAt), scheduleLogs(status+scheduledDate), diagnostics(type+startedAt) |
| 5 | Testes de Security Rules (6+ cenarios) | PASS | 28 testes com vitest + @firebase/rules-unit-testing: 28 passed, 0 failed |

**Nota de Alinhamento:** Story menciona 8 subcollections (profile, lessons, schedule), mas architecture doc (fonte canonica) define 7 subcollections (lessonProgress, adaptations) + user doc. Seguido o architecture doc.

**GAPs Cobertos:**

| GAP | Descricao | Status |
|-----|-----------|--------|
| G-ARCH-02 | Firestore schema + Rules | DONE |
| G-SEC-01 | Firestore Security Rules completas | DONE |
| G-SEC-11 | Campos criticos write-protected | DONE |

**Arquivos Criados/Modificados:**

- `firestore.rules` — Rules refinadas com field-level protection (level, levelScore, overallScore, diagnosticCompleted, adapterState, persona, correctionIntensity, dailyChatCount, dailyChatResetDate)
- `firestore.indexes.json` — 6 composite indexes
- `functions/src/types/firestore.ts` — TypeScript types para todas as 8 entidades (UserProfile, Diagnostic, Session, LessonProgress, Homework, Adaptation, ScheduleLog, Report) + shared types
- `tests/package.json` — Test project config (vitest + @firebase/rules-unit-testing)
- `tests/vitest.config.ts` — Vitest config
- `tests/firestore-rules.test.ts` — 28 testes organizados em 7 describe blocks

**Testes (28 total):**
- User Profile: 8 testes (CRUD + deny other + deny unauth)
- Critical Fields: 5 testes (level, levelScore, diagnosticCompleted, email, adapterState)
- Diagnostics: 3 testes (create, deny overallScore on create, deny overallScore on update)
- Homework: 3 testes (deny create, read own, update status)
- Adaptations: 2 testes (read own, deny write)
- Reports: 4 testes (create valid, deny invalid category, deny update, deny delete)
- Cross-user: 3 testes (deny read diagnostics, deny write sessions, deny read homework)
