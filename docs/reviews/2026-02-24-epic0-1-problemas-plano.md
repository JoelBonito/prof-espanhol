# Revisão Técnica — Epic 0 e Epic 1 (Problemas + Plano de Correção)

**Data:** 2026-02-24  
**Escopo:** `docs/BACKLOG.md` + código implementado dos Epics 0 e 1  
**Referência de orquestração:** `.codex/agents/orchestrator.md`

## 1) Problemas identificados

### P0 (Crítico)

1. Fluxo do diagnóstico incompatível com Firestore Rules  
- O frontend cria documento em `users/{uid}/diagnostics` sem `type`, mas a regra exige `type` + `status` + `startedAt` na criação.
- A falha de criação é tratada silenciosamente e o fluxo segue sem `diagnosticId`, quebrando o fechamento do diagnóstico na Cloud Function.
- Impacto: risco de diagnóstico não persistir e cálculo final falhar.

### P1 (Alto)

2. `type-check` quebrando no app por tipagem restrita do componente `Icon`  
- `Icon` aceita apenas `20 | 24 | 48`, enquanto há usos com `12`, `16`, `18`, `36`.
- Impacto: `npm run type-check` falha; build/pipeline podem ficar instáveis.

3. Navegação aponta para rotas não existentes  
- Links e CTA enviam para `/chat`, `/lessons`, `/schedule`, `/progress`, porém rotas não estão declaradas no router atual.
- Impacto: regressão funcional de navegação.

### P2 (Médio)

4. Retry da tela de resultado não refaz chamada  
- Botão “Tentar novamente” altera apenas estado local, sem reinvocar a requisição de cálculo.
- Impacto: usuário fica preso em erro mesmo com backend recuperado.

5. Story 1.5 parcialmente implementada no write de perfil  
- Critério pede persistir campos adicionais (`grammarScore`, `listeningScore`, `speakingScore`, `weakPhonemes`, `diagnosticDate`) e hoje a CF salva subconjunto.
- Impacto: desalinhamento entre aceite e dados disponíveis para features futuras.

6. Cobertura de testes de frontend insuficiente para Epic 1  
- Não há testes unitários efetivos do fluxo diagnóstico; `test:run` passa sem testes por `--passWithNoTests`.
- Impacto: risco de regressão alto.

### P3 (Baixo / Processo)

7. Inconsistência documental de status das stories  
- Backlog indica Epic 1 completo, mas story files `1.1`, `1.2`, `1.3` ainda constam como `pending`.
- Impacto: rastreabilidade e governança de backlog comprometidas.

## 2) Plano de correção (priorizado)

### Fase 1 — Estabilização imediata (P0/P1)

1. Corrigir criação de diagnóstico conforme rules  
- Incluir `type: "initial"` no `addDoc` da seção de gramática.
- Remover fallback silencioso: falha de criação deve bloquear avanço e oferecer retry explícito.
- Guardar fluxo de resultado: sem `diagnosticId` válido, não chamar `calculateDiagnosticResult`.

2. Corrigir tipagem do `Icon`  
- Atualizar `size` para aceitar `number` (recomendado) ou expandir union com tamanhos realmente usados.
- Validar com `npm run type-check` e `npm run build`.

3. Corrigir rotas inexistentes  
- Criar placeholders de rota para paths já navegáveis (`/chat`, `/lessons`, `/schedule`, `/progress`) ou desabilitar links até implementação.
- Ajustar CTA final para rota realmente disponível no momento.

### Fase 2 — Robustez funcional (P2)

4. Corrigir retry na tela de resultado  
- Extrair função `loadResult()` e chamar no `useEffect` e no botão de retry.

5. Alinhar persistência da CF com Story 1.5  
- Completar escrita de campos exigidos no perfil (ou atualizar aceite oficial, se houver decisão técnica diferente).

6. Cobertura mínima de testes do diagnóstico  
- Adicionar testes para criação de sessão, cálculo de resultado, retry, e proteção contra `diagnosticId` ausente.

### Fase 3 — Higiene de processo (P3)

7. Sincronizar status de stories e backlog via scripts oficiais  
- Executar `finish_task.py` e `progress_tracker.py` para normalizar consistência de artefatos.

## 3) Agentes e skills usados para detectar os problemas

## Agentes usados na detecção

1. `orchestrator` (guia em `.codex/agents/orchestrator.md`)  
- Usado como framework de coordenação de revisão multi-domínio (frontend, backend, segurança/rules, CI).

2. `Codex` em modo de code review  
- Execução prática da auditoria com foco em bug/regressão/risco e validação por comandos (`lint`, `type-check`, `test`).

## Skills usadas na detecção (aplicadas na revisão)

1. `code-review-checklist`  
- Priorização por severidade e foco em riscos reais.

2. `lint-and-validate`  
- Validação objetiva por comandos de qualidade.

3. `systematic-debugging`  
- Cadeia causa-raiz -> evidência -> impacto.

4. `plan-writing`  
- Estruturação do plano em fases e prioridades.

5. `parallel-agents`  
- Estratégia de coleta paralela de contexto e evidências.

## 4) Agentes e skills propostos para corrigir os problemas

## Agentes propostos (por problema)

1. `frontend-specialist`  
- Correções em fluxo diagnóstico, navegação/rotas, retry, tipagem e UX de erro.

2. `backend-specialist`  
- Ajustes na Cloud Function `calculateDiagnosticResult` para conformidade com Story 1.5.

3. `database-architect`  
- Verificação de alinhamento entre payloads de escrita, schema e regras Firestore.

4. `test-engineer`  
- Implementação de testes unitários/integrados do fluxo do diagnóstico.

5. `devops-engineer`  
- Ajustes de pipeline para reduzir falso-positivo de qualidade (`passWithNoTests`) e reforçar gates.

6. `orchestrator`  
- Coordenação da execução por fases e resolução de conflitos entre domínios.

## Skills propostas (por problema)

1. `systematic-debugging`  
- Para fechar inconsistências de fluxo diagnóstico (create doc -> id -> CF).

2. `testing-patterns` e `tdd-workflow`  
- Para construir cobertura confiável de regressão no Epic 1.

3. `lint-and-validate`  
- Para garantir quality gates locais e em CI.

4. `architecture`  
- Para decidir se ajuste é no código, no aceite, ou em ambos (Story 1.5).

5. `plan-writing`  
- Para execução incremental com critério de saída por fase.

## 5) Critérios de pronto para fechar a correção

1. Fluxo diagnóstico completo funcionando com rules ativas e `diagnosticId` válido fim-a-fim.  
2. `npm run lint`, `npm run type-check`, `npm run build` verdes.  
3. Navegação sem links quebrados para rotas inexistentes.  
4. Retry de resultado funcional.  
5. Campos de perfil em conformidade com Story 1.5 (ou aceite atualizado formalmente).  
6. Testes de diagnóstico adicionados e executando em CI.
