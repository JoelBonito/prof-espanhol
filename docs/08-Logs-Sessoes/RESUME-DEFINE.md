# Prompt de Retomada — Workflow /define

> Cole este conteudo na nova sessao do Claude Code para retomar o workflow.

---

## Contexto

O workflow `/define` esta em andamento para o projeto **Espanhol — Tutor AI de Espanhol para iPad (PWA)**.

### Documentos ja gerados e APROVADOS:

| Fase | Arquivo | Status |
|------|---------|--------|
| 0 | Discovery | Concluido |
| 1 | `docs/01-Planejamento/01-product-brief.md` | Aprovado |
| 2 | `docs/01-Planejamento/02-prd.md` | Aprovado (atualizado com RN10 correcao por persona + RN26-RF06 janela 75min) |
| 3 | `docs/01-Planejamento/03-ux-concept.md` | Aprovado (atualizado com sidebar iPadOS, dark mode chat, Wake Lock, serif pedagógico, Web Speech API, GAPs G-UX-11/12) |

### O que falta:

| Fase | Documento | Status |
|------|-----------|--------|
| **3.5** | **Visual Mockups via Stitch MCP** | **PROXIMO — RETOMAR AQUI** |
| 4 | Architecture | Pendente |
| 5 | Security | Pendente |
| 6 | Stack | Pendente |
| 7 | Design System | Pendente |
| 8 | Backlog + Stories | Pendente |

### Documentacao antiga (referencia tecnica):
Em `docs/old/doc antigo/` existem 7 documentos gerados pelo AG (Antigravity/Gemini) com insights tecnicos valiosos. Ja foram comparados e os insights relevantes foram incorporados nos docs novos. Para as fases 4-7, usar como referencia tecnica (nao copiar — gerar do zero).

**Insights do AG para incorporar nas fases futuras:**
- **Architecture:** Schema Firestore (users, schedules, homeworks, curriculum/recommendation, curriculumHistory, metrics/current); ADR streaming via proxy Cloud Function; Wake Lock Safari
- **Security:** Zero Retention de midia (stream direto, nunca salvar audio/video); track.stop() cleanup; procedimento de vazamento de API key
- **Stack:** React 19 + Vite 6 + Tailwind 4 + shadcn/ui + Zustand + Firebase + Gemini SDK; GAP API Gemini Live experimental; Web Speech API paralela
- **Design System:** Non-judgmental Interface; dark mode leve na sala de chat; serif (Lora/Merriweather) para conteudo pedagogico; canvas visualizador de frequencia FFT

---

## Instrucao para a nova sessao

```
Retomar workflow /define para o projeto Espanhol.

Le o arquivo docs/08-Logs-Sessoes/RESUME-DEFINE.md para contexto completo.

O proximo passo e a Fase 3.5: Visual Mockups via Stitch MCP.

HAS_UI=true. O UX Concept (docs/01-Planejamento/03-ux-concept.md) tem 24 telas wireframadas na Secao 4.

Processo obrigatorio:
1. Verificar Stitch MCP (mcp__stitch__list_projects)
2. Criar projeto Stitch
3. Extrair TODAS as 24 telas do UX Concept Secao 4
4. Converter wireframes em prompts (usar skill stitch-ui-design)
5. Gerar TODAS as telas (telas-chave: PRO + MOBILE + DESKTOP; secundarias: FLASH + MOBILE)
6. Validar cobertura 100%
7. Documentar em docs/01-Planejamento/03.5-visual-mockups.md
8. Checkpoint com usuario

Apos aprovar mockups, continuar sequencialmente: Fase 4 (Architecture) → 5 (Security) → 6 (Stack) → 7 (Design System) → 8 (Backlog + Stories).

Para fases 4-7, ler docs antigos em docs/old/doc antigo/ como referencia tecnica.
```
