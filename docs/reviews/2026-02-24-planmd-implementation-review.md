# Code Review Report

**Data:** 2026-02-24
**Revisor:** Codex
**Escopo:** Implementação do `docs/PLAN.md` (Gemini Live subtitles/transcription, board JSON, chat board UI, prompt/session updates)

---

## Resumo

| Severidade | Quantidade | Resolvidos |
|------------|-----------:|-----------:|
| 🔴 BLOCKING | 3 | 0 |
| 🟡 MAJOR | 4 | 0 |
| 🟢 MINOR | 2 | 0 |

**Veredicto:** BLOCKED

---

## Issues por Arquivo

### functions/src/createChatSession.ts

| # | Severidade | Linha | Issue | Sugestao |
|---|-----------|------:|-------|----------|
| 1 | 🔴 BLOCKING | 21 | `enforceAppCheck` foi alterado para `false`, removendo enforcement de App Check na callable de criação de sessão. | Restaurar `enforceAppCheck: true` e manter validação consistente no middleware. |
| 2 | 🔴 BLOCKING | 13 | Limite diário RN11 regrediu de 3 para default 50 (`DAILY_SESSION_LIMIT ?? "50"`). | Voltar default para 3 e tratar override por env apenas em ambiente controlado. |
| 3 | 🔴 BLOCKING | 52 | Bypass hardcoded para UID admin permite contornar limite diário em produção. | Remover bypass hardcoded; se necessário, usar feature flag segura por ambiente. |
| 4 | 🟡 MAJOR | 13 | `parseInt(...)` sem validação pode gerar `NaN`, desativando limite sem erro explícito. | Validar com `Number.isFinite` e fallback seguro (3). |
| 5 | 🟡 MAJOR | 243 | Texto do prompt contém erro gramatical em espanhol: "si el estudiante pedir...". | Corrigir para "si el estudiante pide..." para evitar ruído de instrução. |

### functions/src/middleware/appcheck.ts

| # | Severidade | Linha | Issue | Sugestao |
|---|-----------|------:|-------|----------|
| 1 | 🔴 BLOCKING | 10-19 | Middleware de App Check foi neutralizado (`return;` imediato), tornando o guard inoperante. | Reativar validação de `request.app` com `HttpsError('permission-denied', ...)`. |

### src/features/chat/hooks/useGeminiLive.ts

| # | Severidade | Linha | Issue | Sugestao |
|---|-----------|------:|-------|----------|
| 1 | 🟡 MAJOR | 86-104 | Cada evento de transcription vira nova mensagem no feed; em stream incremental isso tende a duplicar/floodar mensagens e inflar `messageCount` na avaliação adaptativa. | Implementar agregação/deduplicação por turno (update da última mensagem de transcrição em vez de append). |
| 2 | 🟡 MAJOR | 127-129 | `cleanText` de `onStructuredText` é descartado em produção (só loga em DEV), perdendo conteúdo útil caso modelo envie texto legítimo junto aos marcadores. | Definir regra explícita: renderizar texto residual em tutor message ou descartar com justificativa/documentação. |

### src/features/chat/components/MessageFeed.tsx

| # | Severidade | Linha | Issue | Sugestao |
|---|-----------|------:|-------|----------|
| 1 | 🟢 MINOR | 31-38 | Requisito do plano para badge de idioma `(ES)/(PT)` não foi implementado. | Adicionar badge por heurística simples (ou campo de idioma no payload da mensagem). |

### src/features/chat/lib/geminiLive.ts

| # | Severidade | Linha | Issue | Sugestao |
|---|-----------|------:|-------|----------|
| 1 | 🟢 MINOR | 43 | `systemPrompt` recebido em `connect()` não é usado localmente (agora só no token). | Remover parâmetro ou documentar explicitamente que a configuração vem do token ephemero. |

---

## Ações Requeridas

1. [ ] Restaurar proteção de App Check (`createChatSession` + middleware) antes de merge.
2. [ ] Corrigir regra RN11 (limite diário seguro por padrão e sem bypass hardcoded em produção).
3. [ ] Corrigir estratégia de transcriptions no feed para evitar duplicação/flood e impacto na avaliação adaptativa.
4. [ ] Fechar gap funcional do badge de idioma no feed.

---

## Evidências executadas

- Revisão de diff dos arquivos do escopo do `PLAN.md`.
- Execução de testes novos:
  - `src/features/chat/lib/__tests__/boardParser.test.ts` ✅
  - `src/stores/__tests__/chatStore.board.test.ts` ✅

Comando usado:

```bash
npm run test:run -- src/features/chat/lib/__tests__/boardParser.test.ts src/stores/__tests__/chatStore.board.test.ts
```

---

## Notas do Revisor

- A separação de canais do Gemini Live (transcription vs structured text) foi uma boa direção técnica.
- O parser de `BOARD_JSON` e os testes de estado de board estão bem estruturados para MVP.
- O merge não deve avançar com as regressões de segurança/limite acima.
