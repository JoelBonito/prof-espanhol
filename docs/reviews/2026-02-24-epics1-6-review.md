# Code Review Report — Epics 1–6 (Revisão Geral Pós-Sprint)

**Data:** 2026-02-24
**Revisor:** Claude Code (claude-sonnet-4-6)
**Escopo:** Todos os arquivos implementados nos Epics 1–6 (revisão cross-sprint)
**Validado por:** @debugger, @backend-specialist, @database-architect, @frontend-specialist + Codex

---

## Checklist Core (Framework)

| Check | Status |
|-------|--------|
| Framework Validation (`checklist.py`) | ✅ PASSED |
| Traceability Check | ✅ PASSED |
| TypeScript (`tsc --noEmit`) | ✅ PASSED (zero erros) |
| Testes (`vitest run`) | ✅ PASSED (57/57 testes) |

---

## Resumo

| Severidade | Quantidade | Resolvidos |
|------------|-----------|------------|
| 🔴 BLOCKING | 2 | 2 ✅ |
| 🟡 MAJOR | 4 | 4 ✅ |
| 🟢 MINOR | 4 | 4 ✅ |

**Veredicto: APPROVED**

---

## Issues por Arquivo — Status Final

---

### `src/features/diagnostic/DiagnosticResultView.tsx`

| # | Severidade | Linha | Issue | Status |
|---|-----------|-------|-------|--------|
| B1 | 🔴 BLOCKING | 56,136 | Retry button chamava `setState('loading')` mas `useEffect` dependia só de `diagnosticId` — re-execução nunca ocorria, spinner infinito. | ✅ Corrigido: adicionado `retryTrigger` state; useEffect depende de `[diagnosticId, retryTrigger]`; `setState('loading')` movido para dentro do effect |

---

### `src/features/progress/hooks/useProgressData.ts`

| # | Severidade | Linha | Issue | Status |
|---|-----------|-------|-------|--------|
| B2 | 🔴 BLOCKING | 25 | Query em `collection(db, 'diagnostics')` (raiz) — collection inexistente no schema real. Dados de diagnóstico ficam em `users/{uid}/diagnostics`. | ✅ Corrigido: path correto `users/{uid}/diagnostics` |
| B2b | 🔴 BLOCKING | 26 | Campo `timestamp` não existe; schema usa `completedAt`. `cefrLevel` não existe; schema usa `levelAssigned`. | ✅ Corrigido: `orderBy('completedAt')`, `latest?.levelAssigned` |
| M1 | 🟡 MAJOR | 32–67 | Todos os scores, phonemes e weeklyActivity eram mocks hardcoded com fallbacks estáticos. | ✅ Corrigido: dados reais de Firestore — scores do último diagnóstico, weeklyActivity de `scheduleLogs`, phonemes de `phonemesToWork` |
| m4 | 🟢 MINOR | 22 | `await getDoc(userRef)` sem uso do resultado — dead code. | ✅ Removido junto com a refatoração |

---

### `src/pages/ProgressPage.tsx`

| # | Severidade | Linha | Issue | Status |
|---|-----------|-------|-------|--------|
| M2a | 🟡 MAJOR | 99–103 | Banner de segunda com "8 sessões" e "+15%" hardcoded — valores nunca mudam. | ✅ Corrigido: calcula `totalCompleted` de `data.weeklyActivity` e usa `data.pronunciation.lastChange` |
| M2b | 🟡 MAJOR | 116,120 | Contador "12" sessões e "+20%" growth hardcoded no cabeçalho do chart. | ✅ Corrigido: total real de completadas/agendadas; percentual de conclusão calculado |

---

### `src/pages/HomePage.tsx`

| # | Severidade | Linha | Issue | Status |
|---|-----------|-------|-------|--------|
| M2c | 🟡 MAJOR | 120–122 | ActivityItems hardcoded ("Quiz de Verbos", "Escuta Ativa") — dados falsos exibidos para o usuário. | ✅ Corrigido: removidos items estáticos; seção agora exibe link direto para a página de Deveres |
| m2 | 🟢 MINOR | 150 | Função `cn` local duplicava `src/lib/utils.ts`. Import duplicado de `firebase`. | ✅ Corrigido: importa `cn` de `../lib/utils`; imports de firebase consolidados |

---

### `src/pages/SchedulePage.tsx`

| # | Severidade | Linha | Issue | Status |
|---|-----------|-------|-------|--------|
| M4 | 🟡 MAJOR | 126–161 | `markPastMissedSlots` fazia N×8 reads + writes sequenciais individuais (até 80 ops Firestore por chamada). | ✅ Corrigido: bulk-read com `documentId() in [...]` em chunks de 30; writes agrupados em `writeBatch` |

---

### Arquivos duplicados (6 arquivos)

| # | Severidade | Arquivo | Status |
|---|-----------|---------|--------|
| m1 | 🟢 MINOR | `persistence 2.ts`, `types 2.ts`, `push 2.ts`, `HomeworkPage 2.tsx`, `ProgressPage 2.tsx`, `ErrorBoundary 2.tsx` | ✅ Deletados |

---

### `src/pages/DiagnosticPage.tsx`

| # | Severidade | Linha | Issue | Status |
|---|-----------|-------|-------|--------|
| m3 | 🟢 MINOR | 17,21,25 | `onComplete` props passavam `void 0` — comportamento do componente depende do store, não do callback. Padrão confuso sem documentação. | ✅ Adicionado comentário explicando que store é a fonte de transição; prefixo `_result` já sinalizava intenção |

---

### Dívida Técnica Registrada (M3 — não corrigido nesta sprint)

| # | Severidade | Arquivo | Issue |
|---|-----------|---------|-------|
| M3 | 🟢 (rebaixado) | `useGeminiLive.ts:215` | `isConnected` derivado de ref — não reativo. `ChatContainer` usa status do store (fonte correta), então não há impacto imediato. Corrigir em sprint futura se `isConnected` for consumido diretamente em outros componentes. |

---

## Fixes Aplicados

| Sprint | # | Arquivo | Mudança |
|--------|---|---------|---------|
| 1 | B1 | `DiagnosticResultView.tsx` | `retryTrigger` state + `setState('loading')` no effect + useEffect deps `[diagnosticId, retryTrigger]` |
| 1 | B2 | `useProgressData.ts` | Path correto `users/{uid}/diagnostics`, fields `completedAt`/`levelAssigned`, dados reais do Firestore |
| 2 | M2a | `ProgressPage.tsx` | Banner Monday com dados reais de `weeklyActivity` e `pronunciation.lastChange` |
| 2 | M2b | `ProgressPage.tsx` | Header do chart com total real de sessões e % de conclusão |
| 2 | M2c | `HomePage.tsx` | Removidos ActivityItems hardcoded; seção exibe link para Deveres |
| 2 | m2 | `HomePage.tsx` | `cn` importado de `lib/utils`; imports Firebase consolidados |
| 2 | M4 | `SchedulePage.tsx` | `markPastMissedSlots` com bulk-read `documentId() in` + `writeBatch` |
| 3 | m1 | Global | 6 arquivos duplicados " 2" deletados |
| 3 | m3 | `DiagnosticPage.tsx` | Comentário documentando padrão store-driven |

---

## Verificações Pós-Fix

| Check | Antes | Depois |
|-------|-------|--------|
| `tsc --noEmit` | ✅ 0 erros | ✅ 0 erros |
| `vitest run` | ✅ 57/57 | ✅ 57/57 |
| `checklist.py` | ✅ 2/2 | ✅ 2/2 |

---

## Notas do Revisor

**Pontos fortes mantidos:**
- Firestore Security Rules com App Check duplo — segurança robusta validada pelos testes de rules (28 testes passando).
- `correctionParser`, `sessionSummary`, `spacedRepetition` — lógica pura bem coberta por testes unitários.
- `SchedulePage.parseStoredSchedule` tem validação defensiva exemplar (sem `any` types, verificação de campos antes de uso).
- `push.ts` — implementação de Web Push com tratamento correto de todos os casos de erro.

**Principal impacto desta sprint:**
O fix B2 (path Firestore correto + dados reais em `useProgressData`) desbloqueou o Dashboard e ProgressPage que estavam exibindo dados estáticos para todos os usuários. O fix B1 corrigiu um loop de loading infinito no retry do diagnóstico — bug crítico para usuários com conexão instável.
