---
story: "5.2"
epic: "Epic 5: Agenda e Disciplina"
status: pending
agent: backend-specialist
tool: claude_code
depends_on: ["5.1"]
unlocks: []
priority: P0
model: sonnet
---

# Story 5.2: Notificacoes Web Push

## Contexto do Epic
Epic 5 implementa agenda rigida. Esta story adiciona notificacoes push para lembrar o usuario dos blocos agendados.

## Requisito
Como usuario, quero receber notificacoes push no iPad 5 minutos antes e no momento do bloco agendado para que eu nao esqueca de estudar.

## Criterios de Aceite
```gherkin
DADO que o usuario tem blocos agendados
QUANDO faltam 5 minutos para um bloco
ENTAO o iPad exibe notificacao push "Daqui a 5 minutos: seu bloco de [tipo] comeca"

DADO que o horario do bloco chegou
QUANDO o bloco inicia
ENTAO o iPad exibe notificacao "Hora de estudar! Seu bloco de [tipo] comeca agora."
E ao tocar na notificacao, o app abre na tela correspondente (licao ou chat)

DADO que o usuario bloqueou notificacoes
QUANDO o sistema tenta enviar
ENTAO a notificacao nao e entregue
E o usuario ve o lembrete apenas ao abrir o app (fallback visual no Dashboard)

DADO que e o Safari iPadOS
QUANDO Web Push e utilizado
ENTAO funciona com Service Worker + Web Push API (Safari 16.4+)
```

## Contexto Tecnico
- RF06 criterios (notificacoes): 02-prd.md
- RN23: Notificacoes 5min antes + no momento do bloco
- Web Push API: Safari 16.4+ suporta (validado no Sprint 0, Story 0.5)
- Service Worker: recebe push events e exibe notificacao
- Cloud Function scheduled (Cloud Scheduler) ou Firebase Cloud Messaging
- Fallback: se push nao disponivel, lembrete visual no Dashboard ao abrir
- Payload: titulo, corpo, URL de deep link (/lessons ou /chat)

## Contexto de Dependencias
> Story 5.1: Calendario semanal com blocos definidos e persistidos no Firestore

## Agent Workspace
> Notas do agente durante implementacao
