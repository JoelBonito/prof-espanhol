---
epic: 7
story: 7.2
title: Callable evaluateAdaptiveSession (Gemini 3 Flash)
agent: backend-specialist
tool: antigravity
status: EM_ANDAMENTO
depends_on: [7.1]
---

# Story 7.2: Callable evaluateAdaptiveSession (Gemini 3 Flash)

## Requisito
Implementar uma Cloud Function que recebe o histórico da conversa e correções fonéticas da sessão Live para gerar uma avaliação pedagógica detalhada.

## Criterios de Aceite
- [ ] Função `evaluateAdaptiveSession` funcional e registrada.
- [ ] Uso do modelo `gemini-3-flash-preview` (ou equivalente estável).
- [ ] Output estruturado JSON com dimensões (pronúncia, fluência, etc).
- [ ] Persistência do resultado no documento da sessão no Firestore.

## Agent Workspace
A função já existe em `functions/src/evaluateAdaptiveSession.ts`, mas precisa ser verificada se está exportada no `index.ts` e se o prompt está alinhado com o contrato de idioma de 7.1.
