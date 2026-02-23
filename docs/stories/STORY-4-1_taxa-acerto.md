---
story: "4.1"
epic: "Epic 4: Motor de Adaptacao"
status: pending
agent: backend-specialist
tool: claude_code
depends_on: ["0.2", "1.5"]
unlocks: ["4.2"]
priority: P0
model: sonnet
---

# Story 4.1: Calculo de taxa de acerto

## Contexto do Epic
Epic 4 implementa o Schedule Adapter: sistema que analisa desempenho recente e ajusta dificuldade automaticamente. RF05.

## Requisito
Como sistema, quero calcular a taxa de acerto das ultimas 5-7 sessoes do usuario para que o Adapter possa classificar o estado em "Muito Facil", "Zona Ideal" ou "Muito Dificil".

## Criterios de Aceite
```gherkin
DADO que o usuario completou pelo menos 3 sessoes (chat ou licoes)
QUANDO o Schedule Adapter e triggerado (Firestore onCreate em sessions/{uid})
ENTAO calcula a taxa de acerto das ultimas 5 sessoes

DADO que a taxa de acerto e calculada
QUANDO o resultado e classificado
ENTAO retorna uma das 3 zonas: "Muito Facil" (>80%), "Zona Ideal" (60-80%), "Muito Dificil" (<60%)

DADO que o usuario tem menos de 3 sessoes
QUANDO o Adapter e triggerado
ENTAO NAO roda; usa o nivel do diagnostico como base

DADO que o usuario tem desempenho erratico (alterna zonas frequentemente)
QUANDO o Adapter detecta variacao > 20% entre sessoes consecutivas
ENTAO usa media movel de 7 sessoes em vez de 5

DADO que o Adapter considera tipos de atividade separadamente
QUANDO calcula taxa de acerto
ENTAO calcula separadamente para: fonetica, gramatica, vocabulario (podem estar em niveis diferentes)
```

## Contexto Tecnico
- RF05 criterios: 02-prd.md
- RN17: Adapter roda apos CADA sessao completada
- RN20: Tipos de atividade separados (fonetica, gramatica, vocabulario)
- Cloud Function: `runScheduleAdapter(uid)` triggerado por Firestore onCreate em sessions/{uid}
- Input: ultimas 5-7 sessoes de sessions/{uid} ordenadas por createdAt desc
- Output: zona por tipo de atividade, salvo em users/{uid}/profile/adapterState
- G-PRD-03, G-ARCH-03: Sistema de adaptacao

## GAPs Cobertos
- G-PRD-03: Sistema de adaptacao (parcial — calculo)
- G-ARCH-03: Schedule Adapter (parcial — calculo)

## Contexto de Dependencias
> Story 0.2: Firestore schema com sessions/{uid} e profile disponivel
> Story 1.5: Nivel do usuario calculado (fallback quando < 3 sessoes)

## Agent Workspace
> Notas do agente durante implementacao
