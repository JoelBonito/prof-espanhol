---
story: "1.1"
epic: "Epic 1: Teste Diagnostico"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["0.4"]
unlocks: ["1.2"]
priority: P1
model: sonnet
---

# Story 1.1: Onboarding slides

## Contexto do Epic
Epic 1 implementa o fluxo de primeiro acesso: onboarding, teste diagnostico nas 3 secoes (gramatica, compreensao, pronuncia) e calculo de nivel. RF02 + RF08.

## Requisito
Como novo usuario, quero ver 3 slides de boas-vindas ao criar minha conta para que eu entenda o que e o app e como funciona antes de comecar o diagnostico.

## Criterios de Aceite
```gherkin
DADO que o usuario acabou de criar conta
QUANDO e redirecionado ao app pela primeira vez
ENTAO ve 3 slides: (1) "O que e o Espanhol" (2) "Como funciona" (3) "Vamos comecar"

DADO que o usuario esta nos slides
QUANDO toca "Pular"
ENTAO vai direto para o Teste Diagnostico (diagnostico continua obrigatorio)

DADO que o usuario completa os 3 slides
QUANDO toca "Vamos comecar" no ultimo slide
ENTAO e direcionado ao Teste Diagnostico

DADO que o usuario ja completou o onboarding anteriormente
QUANDO faz login novamente
ENTAO vai direto para o Dashboard (ou diagnostico, se nao completou)
```

## Contexto Tecnico
- Wireframe: 03-ux-concept.md secao 4.2 (Splash + Onboarding)
- Prototipos Stitch: docs/stitch-screens/ (telas de onboarding)
- RF08: Onboarding guiado (PRD)
- RN29: Fluxo completo em no maximo 20 minutos
- RN30: Permissoes de camera/mic solicitadas antes da secao de pronuncia, NAO durante onboarding
- Routing: /onboarding → /diagnostic (condicional no Zustand flag `hasCompletedOnboarding`)

## Contexto de Dependencias
> Story 0.4: Design System components (Button, Card) disponiveis para montar os slides
> Story 0.3 (React 19 + Vite 6 + Tailwind 4 + TypeScript scaffold): implementada
> Story 0.4 (Design System core components): implementada

## Agent Workspace
> Notas do agente durante implementacao
