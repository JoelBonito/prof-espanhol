---
story: "6.1"
epic: "Epic 6: Dashboard e Analytics"
status: pending
agent: frontend-specialist
tool: claude_code
depends_on: ["0.4", "0.2", "1.5"]
unlocks: ["6.2"]
priority: P1
model: sonnet
---

# Story 6.1: Dashboard principal

## Contexto do Epic
Epic 6 implementa o dashboard e analytics: tela principal, historico de progresso, re-teste e feedback. RF07 + RF09.

## Requisito
Como usuario, quero ver meu progresso, proximos blocos de estudo e deveres pendentes em uma unica tela para que eu saiba exatamente o que fazer ao abrir o app.

## Criterios de Aceite
```gherkin
DADO que o usuario fez login e completou o diagnostico
QUANDO acessa o Dashboard
ENTAO ve: nivel atual (A1-C1) com badge colorido, streak atual (dias consecutivos), proximo bloco agendado (com countdown), deveres pendentes (com prazo), botoes de acesso rapido ("Iniciar Conversa", "Estudar Licao")

DADO que o usuario nao completou nenhuma sessao alem do diagnostico
QUANDO acessa o Dashboard
ENTAO ve mensagem "Comece sua primeira licao!" com CTA destacado em primary-500

DADO que existem deveres vencidos
QUANDO o Dashboard carrega
ENTAO exibe alerta amarelo "Voce tem X deveres atrasados. Vamos colocar em dia?"

DADO que o re-teste diagnostico esta disponivel (30 dias)
QUANDO o Dashboard carrega
ENTAO exibe banner azul "Hora de medir seu progresso! Faca o diagnostico novamente."

DADO que os dados mudam em tempo real
QUANDO outro processo atualiza Firestore (ex: Adapter recalcula)
ENTAO o Dashboard reflete a mudanca via real-time listener sem refresh manual
```

## Contexto Tecnico
- RF07 criterios: 02-prd.md
- RN26: Dashboard e a tela inicial apos login
- RN27: Dados atualizados em tempo real via Firestore onSnapshot
- Wireframe: 03-ux-concept.md secao 4.4 (Dashboard)
- Prototipos Stitch: tela de dashboard
- Layout: grid com cards (nivel, streak, proximo bloco, deveres) + 2 CTAs primarios
- Dados agregados de: profile, schedule, homework, sessions
- RN24: Streak = dias consecutivos com >= 1 sessao de 10+ min

## Contexto de Dependencias
> Story 0.4: Design System components (Card, Badge, ProgressBar, Button)
> Story 0.2: Firestore schema com todas as collections necessarias
> Story 1.5: Nivel calculado e perfil disponivel
> Story 0.4 (Design System core components): implementada

## Agent Workspace
> Notas do agente durante implementacao
