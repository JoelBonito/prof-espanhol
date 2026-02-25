# Backlog: Espanhol — Tutor AI de Espanhol para iPad

## Epic 0: Setup e Infraestrutura [P0] [OWNER: claude_code]
- [x] Story 0.1: Firebase project + Auth + App Check + Security Headers `[opus]`
- [x] Story 0.2: Firestore schema (8 subcollections) + Security Rules `[opus]`
- [x] Story 0.3: React 19 + Vite 6 + Tailwind 4 + TypeScript scaffold `[sonnet]`
- [x] Story 0.4: Design System core components `[opus]`
- [x] Story 0.5: Sprint 0 — Validacao iPad Safari `[sonnet]`
- [x] Story 0.6: CI/CD Pipeline (GitHub Actions) `[sonnet]`

## Epic 1: Teste Diagnostico [P0] [OWNER: claude_code]
- [x] Story 1.1: Onboarding slides `[sonnet]`
- [x] Story 1.2: Teste de gramatica `[sonnet]`
- [x] Story 1.3: Teste de compreensao auditiva `[sonnet]`
- [x] Story 1.4: Teste de pronuncia (Gemini audio analysis) `[opus]`
- [x] Story 1.5: Calculo de nivel + perfil de fluencia `[sonnet]`

## Epic 2: Chat Supervisionado [P0] [OWNER: claude_code]
- [x] Story 2.1: Gemini Live API — WebSocket + token efemero `[opus]`
- [x] Story 2.2: Chat UI — dark mode full-screen + video + legendas `[opus]`
- [x] Story 2.3: Correcao fonetica em tempo real `[opus]`
- [x] Story 2.4: Resumo de sessao `[sonnet]`

## Epic 3: Licoes e Conteudo [P0] [OWNER: claude_code]
- [x] Story 3.1: Geracao de conteudo via Gemini REST + cache `[opus]`
- [x] Story 3.2: Flashcards + quizzes interativos `[sonnet]`
- [x] Story 3.3: Supervisao por voz da IA nas licoes `[opus]`
- [x] Story 3.4: Desbloqueio progressivo de modulos `[sonnet]`

## Epic 4: Motor de Adaptacao [P0] [OWNER: claude_code]
- [x] Story 4.1: Calculo de taxa de acerto `[sonnet]`
- [x] Story 4.2: Regras de ajuste de dificuldade `[sonnet]`
- [x] Story 4.3: Historico de ajustes `[sonnet]`

## Epic 5: Agenda e Disciplina [P0] [OWNER: claude_code]
- [x] Story 5.1: Calendario semanal + tolerancia 75min `[sonnet]`
- [x] Story 5.2: Notificacoes Web Push `[sonnet]`
- [x] Story 5.3: Deveres com prazo + geracao automatica `[sonnet]`
- [x] Story 5.4: Curva de esquecimento (SM-2) `[sonnet]`

## Epic 6: Dashboard e Analytics [P1] [OWNER: claude_code]
- [x] Story 6.1: Dashboard principal `[sonnet]`
- [x] Story 6.2: Meu Progresso `[sonnet]`
- [x] Story 6.3: Re-teste diagnostico `[sonnet]`
- [x] Story 6.4: Botao de feedback `[sonnet]`

## Epic 7: Aula Adaptativa Multimodal [P0] [OWNER: antigravity]
- [x] Story 7.1: Formalizar contrato de idioma e regras pedagógicas es-PY vs pt-BR `[antigravity]`
- [x] Story 7.2: Implementar callable assíncrono de avaliação pedagógica (Gemini 3 Flash) `[antigravity]`
- [x] Story 7.3: Integrar resultados da avaliação na UI do Resumo de Sessão `[antigravity]`
- [ ] Story 7.4: Validar fluxo adaptativo completo e testes de regressão `[antigravity]`

---

## GAP-to-Story Mapping

| GAP ID | Origem | Story | Prioridade |
|--------|--------|-------|------------|
| G-PRD-01 | PRD | Story 2.1 | P0 |
| G-PRD-02 | PRD | Story 1.4, 2.3 | P0 |
| G-PRD-03 | PRD | Story 4.1, 4.2 | P0 |
| G-PRD-04 | PRD | Story 0.5 | P0 |
| G-PRD-05 | PRD | Story 3.1 | P0 |
| G-PRD-06 | PRD | Backlog futuro | P2 |
| G-PRD-07 | PRD | Backlog futuro | P2 |
| G-UX-01 | UX Concept | Backlog futuro | P1 |
| G-UX-02 | UX Concept | Backlog futuro | P2 |
| G-UX-03 | UX Concept | Backlog futuro | P2 |
| G-UX-04 | UX Concept | Backlog futuro | P1 |
| G-UX-05 | UX Concept | Story 5.3 | P1 |
| G-UX-06 | UX Concept | Story 0.4 | P0 |
| G-UX-07 | UX Concept | Story 0.4 | P0 |
| G-UX-08 | UX Concept | Backlog futuro | P1 |
| G-UX-09 | UX Concept | Backlog futuro | P2 |
| G-UX-10 | UX Concept | Story 2.3 | P0 |
| G-UX-11 | UX Concept | Story 2.2 | P0 |
| G-UX-12 | UX Concept | Story 2.2 | P0 |
| G-ARCH-01 | Architecture | Story 2.1 | P0 |
| G-ARCH-02 | Architecture | Story 0.2 | P0 |
| G-ARCH-03 | Architecture | Story 4.1, 4.2 | P0 |
| G-ARCH-04 | Architecture | Story 0.5 | P0 |
| G-ARCH-05 | Architecture | Story 2.3, 3.1 | P0 |
| G-ARCH-06 | Architecture | Story 0.6 | P1 |
| G-ARCH-07 | Architecture | Backlog futuro | P1 |
| G-ARCH-08 | Architecture | Story 3.1 | P1 |
| G-ARCH-09 | Architecture | Story 5.4 | P0 |
| G-ARCH-10 | Architecture | Story 5.1 | P0 |
| G-SEC-01 | Security | Story 0.2 | P0 |
| G-SEC-02 | Security | Story 0.1 | P0 |
| G-SEC-03 | Security | Story 0.3 | P0 |
| G-SEC-04 | Security | Story 2.1 | P0 |
| G-SEC-05 | Security | Story 0.1 | P0 |
| G-SEC-06 | Security | Story 0.1 | P0 |
| G-SEC-07 | Security | Story 0.1 | P0 |
| G-SEC-08 | Security | Story 0.6 | P1 |
| G-SEC-09 | Security | Backlog futuro | P1 |
| G-SEC-10 | Security | Backlog futuro | P2 |
| G-SEC-11 | Security | Story 0.2 | P0 |
| G-STACK-01 | Stack | Story 0.3 | P0 |
| G-STACK-02 | Stack | Story 0.1 | P0 |
| G-STACK-03 | Stack | Story 2.1 | P0 |
| G-STACK-04 | Stack | Story 0.6 | P1 |
| G-STACK-05 | Stack | Story 0.5 | P0 |
| G-STACK-06 | Stack | Story 0.6 | P1 |
| G-STACK-07 | Stack | Backlog futuro | P1 |
| G-STACK-08 | Stack | Story 2.3, 3.1 | P0 |
| G-DS-01 | Design System | Story 0.4 | P0 |
| G-DS-02 | Design System | Backlog futuro | P1 |
| G-DS-03 | Design System | Story 0.4 | P0 |
| G-DS-04 | Design System | Story 0.4 | P0 |
| G-DS-05 | Design System | Story 0.3 | P0 |
| G-DS-06 | Design System | Story 3.2 | P1 |
| G-DS-07 | Design System | Story 2.2 | P0 |
| G-DS-08 | Design System | Story 0.4 | P1 |
