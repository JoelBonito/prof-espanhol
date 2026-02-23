---
story: "5.4"
epic: "Epic 5: Agenda e Disciplina"
status: pending
agent: backend-specialist
tool: claude_code
depends_on: ["5.3"]
unlocks: []
priority: P0
model: sonnet
---

# Story 5.4: Curva de esquecimento (SM-2)

## Contexto do Epic
Epic 5 implementa agenda rigida. Esta story implementa o algoritmo de repeticao espacada (SM-2 simplificado) que agenda revisoes em intervalos crescentes.

## Requisito
Como sistema, quero agendar revisoes de conteudo em intervalos crescentes (1h, 1d, 3d, 7d, 30d) baseado no algoritmo SM-2 para que o usuario retenha o conhecimento a longo prazo.

## Criterios de Aceite
```gherkin
DADO que o usuario completou um dever ou exercicio
QUANDO o score e >= 70
ENTAO o conteudo entra na fila de repeticao espacada
E o proximo review e agendado: 1h apos conclusao

DADO que o usuario completa o review de 1h com score >= 70
QUANDO o intervalo e recalculado
ENTAO proximo review: 1 dia

DADO que os intervalos progridem normalmente
QUANDO cada review e completado com score >= 70
ENTAO a sequencia segue: 1h → 1 dia → 3 dias → 7 dias → 30 dias
E apos 30 dias com sucesso, o conteudo e considerado "dominado"

DADO que o usuario falha em um review (score < 70)
QUANDO o intervalo e recalculado
ENTAO o conteudo volta ao inicio da curva (proximo review em 1h)

DADO que reviews pendentes existem
QUANDO o usuario abre o app
ENTAO reviews devidos aparecem na secao "Deveres" com prioridade sobre deveres novos
```

## Contexto Tecnico
- RN22: Curva de esquecimento 1h → 1d → 3d → 7d → 30d
- RN15: SM-2 simplificado para flashcards
- Cloud Function: `processSpacedRepetition(uid, contentId, score)`
- Schema: homework/{uid}/{homeworkId} com campos: interval (1h|1d|3d|7d|30d), nextReviewAt, repetitionCount
- Trigger: Firestore onUpdate em homework quando status muda para completed
- G-ARCH-09: Spaced Repetition Engine
- Logica: if score >= 70 → advance interval; else → reset to 1h
- Reviews devidos: query homework WHERE nextReviewAt <= now() AND status != "mastered"

## GAPs Cobertos
- G-ARCH-09: Spaced Repetition Engine

## Contexto de Dependencias
> Story 5.3: Deveres com prazo implementados; homework/{uid} collection funcional

## Agent Workspace
> Notas do agente durante implementacao
