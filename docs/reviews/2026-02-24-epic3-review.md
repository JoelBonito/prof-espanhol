# Code Review Report — Epic 3: Lições e Conteúdo

**Data:** 2026-02-24
**Revisor:** Claude Code (claude-sonnet-4-6)
**Escopo:** Stories 3.1–3.4 — todos os arquivos modificados/criados no Epic 3

---

## Checklist Core (Framework)

| Check | Status |
|-------|--------|
| Framework Validation | ✅ PASSED |
| Traceability Check | ✅ PASSED |
| TypeScript (`tsc --noEmit`) | ✅ PASSED (zero erros) |
| Testes (`vitest run`) | ✅ PASSED (6/6 testes) |

---

## Resumo

| Severidade | Quantidade | Resolvidos |
|------------|-----------|------------|
| 🔴 BLOCKING | 0 | — |
| 🟡 MAJOR | 4 | 0 |
| 🟢 MINOR | 9 | 0 |

**Veredicto: NEEDS FIXES**

---

## Issues por Arquivo

---

### `src/features/lessons/components/QuizMultipleChoice.tsx`

| # | Severidade | Linha | Issue | Sugestão |
|---|-----------|-------|-------|----------|
| 1 | 🟡 MAJOR | 17 | `selected` não reseta quando a prop `exercise` muda. Se o pai trocar de exercício mantendo o componente montado, a opção antiga fica selecionada e pode ser submetida incorretamente. | Adicionar `useEffect(() => setSelected(''), [exercise.id])` |
| 2 | 🟡 MAJOR | 19–25 | Fallback `[exercise.answer]` quando `options` está vazio expõe a resposta correta como única opção, tornando o quiz trivial. | Garantir no gerador que `multiple_choice` sempre tenha ≥ 2 opções; ou exibir erro/estado de aviso em vez de fallback silencioso |
| 3 | 🟢 MINOR | 29 | Badge mostra `multiple_choice` (valor interno). Usuário vê type técnico. | Usar label amigável: `"Múltipla Escolha"` |
| 4 | 🟢 MINOR | 32–36 | `role="radiogroup"` + `role="radio"` em `<button>` sem navegação por setas (↑↓). Comportamento de teclado não cumpre ARIA spec de radiogroup. | Usar `<input type="radio">` nativo para conformidade ARIA, ou implementar `onKeyDown` com navegação por setas |

---

### `src/features/lessons/components/QuizFillBlank.tsx`

| # | Severidade | Linha | Issue | Sugestão |
|---|-----------|-------|-------|----------|
| 5 | 🟡 MAJOR | 14 | `answer` não reseta quando a prop `exercise` muda. Mesma causa raiz do item #1. | Adicionar `useEffect(() => setAnswer(''), [exercise.id])` |
| 6 | 🟢 MINOR | 24 | Badge mostra `fill_blank` (valor interno). | Usar label amigável: `"Preencha o Espaço"` |

---

### `src/pages/LessonsPage.tsx`

| # | Severidade | Linha | Issue | Sugestão |
|---|-----------|-------|-------|----------|
| 7 | 🟡 MAJOR | 147–617 | Componente com 470 linhas dentro da função. Acumula lógica de: catálogo de módulos, geração de lição, timeline de leitura, avaliação de exercícios, persistência, e narração. Dificulta testes e manutenção. | Extrair hooks: `useModuleCatalog`, `useLessonSession`, `useLessonVoiceNarration`. A lógica de `persistModuleResult` já pode ser um hook `useLessonPersistence` |
| 8 | 🟢 MINOR | 93–97 | `scoreByAttempts` duplicada aqui e no Cloud Function. Divergência futura de regras pode causar inconsistência entre score exibido e score salvo. | Documentar intenção: "client usa para UI imediata; servidor é fonte de verdade para score final" |
| 9 | 🟢 MINOR | 138–145 | `getExerciseHint` usa voseo rioplatense (`Escutá`, `repetí`) em meio a UI em pt-BR. Inconsistência de idioma. | Uniformizar para pt-BR: `"Ouça a pergunta e repita em voz alta…"` |
| 10 | 🟢 MINOR | 592–594 | `onShowTextHint` define `feedback.status = 'correct'` para mostrar uma dica, causando estilo verde/sucesso sem resposta correta do usuário. Semanticamente confuso. | Adicionar `status: 'hint'` ao tipo de feedback, ou usar componente separado para dicas |

---

### `functions/src/completeLessonModule.ts`

| # | Severidade | Linha | Issue | Sugestão |
|---|-----------|-------|-------|----------|
| 11 | 🟢 MINOR | 131–136 | Se nenhum exercício objetivo existe (apenas `flashcard`), `canonicalScores` fica vazio → `finalScore = 0` → módulo nunca pode ser desbloqueado. Comportamento silencioso. | Adicionar lógica: se `canonicalScores.length === 0` (módulo só tem flashcards), retornar `finalScore = 100` (presença = conclusão) ou documentar como restrição de design |
| 12 | 🟢 MINOR | 98–242 | Handler com ~145 linhas. Lógica de scoring, unlock e schedule misturadas. | Extrair `computeFinalScore`, `shouldUnlock`, `buildNextUnlock` como funções puras |
| 13 | 🟢 MINOR | 59–63 | `scoreByAttempts` duplicada do lado cliente (ver item #8). | Já abordado; apenas documentar no comentário que o server é authoritative |

---

### `src/features/lessons/persistence.ts`

| # | Severidade | Linha | Issue | Sugestão |
|---|-----------|-------|-------|----------|
| — | — | — | Nenhuma issue identificada. Lógica de unlock correta, leitura segura via optional chain, fallback de unauthenticated bem tratado. | — |

---

### `src/features/lessons/__tests__/persistence.test.ts`

| # | Severidade | Linha | Issue | Sugestão |
|---|-----------|-------|-------|----------|
| — | — | — | Cobertura boa: estado sem auth, carregamento de nível, cadeia de unlock, delegação ao callable. 6/6 passando. | Considerar adicionar casos: `getDocs` falha com erro de rede; módulo com `prerequisiteId` inválido (não encontrado no array) |

---

### `src/features/lessons/components/ModuleListCard.tsx`

| # | Severidade | Linha | Issue | Sugestão |
|---|-----------|-------|-------|----------|
| — | — | — | Componente limpo e focado. Acessibilidade básica presente (text visível, ícone lock). | Considerar `aria-disabled` nos botões bloqueados para leitores de tela |

---

## Ações Requeridas (MAJOR)

1. [x] **#1 — QuizMultipleChoice:** Reset do `selected` quando `exercise.id` muda ✅ corrigido
2. [x] **#2 — QuizMultipleChoice:** Remover fallback `[exercise.answer]` ✅ corrigido — agora renderiza estado "Exercício indisponível"
3. [x] **#5 — QuizFillBlank:** Reset do `answer` quando `exercise.id` muda ✅ corrigido
4. [ ] **#7 — LessonsPage:** Extrair hooks — dívida técnica planejada (não bug funcional)

## Fixes Aplicados em 2026-02-24

| # | Arquivo | Mudança |
|---|---------|---------|
| #1 | `QuizMultipleChoice.tsx:19` | `useEffect(() => setSelected(''), [exercise.id])` |
| #2 | `QuizMultipleChoice.tsx:23` | Removido fallback `[exercise.answer]`; guard renderiza "Exercício indisponível" |
| #5 | `QuizFillBlank.tsx:16` | `useEffect(() => setAnswer(''), [exercise.id])` |
| #9 | `LessonsPage.tsx:139` | Voseo → pt-BR: "Ouça a pergunta e repita em voz alta…" |
| #10 | `LessonsPage.tsx:593` | `status: 'correct'` → `status: 'incorrect'` para dica textual (estilo âmbar, sem verde falso-positivo) |

**TypeScript:** ✅ zero erros pós-fix
**Testes:** ✅ 6/6 passando

---

## Notas do Revisor

**Pontos fortes encontrados:**
- Cloud Function `completeLessonModule.ts` tem excelente postura de segurança: Zod validation, App Check duplo (flag + middleware), auth check explícito, batch write atômico, e `canUnlockNext` que valida integridade da cadeia de módulos server-side.
- `sanitizeHtml` via DOMPurify está corretamente aplicado antes de qualquer innerHTML (G-SEC-03 atendido).
- `persistence.ts` tem lógica de desbloqueio elegante que combina estado do servidor (`unlocked: true`) com estado calculado (prerequisite completed), garantindo resiliência a caches desatualizados.
- Testes de `persistence.test.ts` cobrem o boundary value crítico (score exato = 60 = completed).
- TypeScript strict sem erros, zero `any` types visíveis.

**Risco principal:** Os bugs #1 e #5 (estado do quiz não reseta) podem causar submissão de respostas erradas de exercícios anteriores — afeta diretamente a experiência de aprendizado e a precisão do score final. São correções pequenas mas de alto impacto.
