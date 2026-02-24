---
story: "4.2"
epic: "Epic 4: Motor de Adaptacao"
status: done
agent: backend-specialist
tool: claude_code
depends_on: ["4.1"]
unlocks: ["4.3", "5.3"]
priority: P0
model: sonnet
---

# Story 4.2: Regras de ajuste de dificuldade

## Contexto do Epic
Epic 4 implementa o Schedule Adapter. Esta story aplica as regras de ajuste: subir, manter ou reduzir dificuldade com base nas zonas calculadas.

## Requisito
Como sistema, quero aplicar regras de ajuste graduais de dificuldade (nunca pular mais de 1 sub-nivel) para que o conteudo se adapte ao ritmo do usuario sem saltos bruscos.

## Criterios de Aceite
```gherkin
DADO que o usuario esta na faixa "Muito Facil" (>80% por 3 sessoes consecutivas)
QUANDO o Adapter recalcula
ENTAO aumenta dificuldade: vocabulario mais avancado, frases mais longas, topicos mais complexos
E registra ajuste no historico com timestamp, motivo e zona anterior/nova

DADO que o usuario esta na faixa "Muito Dificil" (<60% por 3 sessoes consecutivas)
QUANDO o Adapter recalcula
ENTAO reduz dificuldade: revisa conteudo anterior, simplifica exercicios, reforca base
E registra ajuste no historico

DADO que o usuario esta na "Zona Ideal" (60-80%)
QUANDO o Adapter recalcula
ENTAO mantem dificuldade atual e introduz conteudo novo progressivamente

DADO que um re-teste diagnostico mostra nivel diferente do Adapter
QUANDO o diagnostico e completado
ENTAO o diagnostico prevalece; Adapter reseta para o novo nivel

DADO que o ajuste e gradual
QUANDO o Adapter muda a dificuldade
ENTAO nunca pula mais de 1 sub-nivel por vez (ex: A2-low → A2-high, NAO A2 → B1)
```

## Contexto Tecnico
- RF05 criterios: 02-prd.md
- RN18: Ajustes graduais (max 1 sub-nivel por vez)
- Cloud Function: extensao de `runScheduleAdapter(uid)` — apos calcular zona, aplica regra
- Sub-niveis: A1-low, A1-mid, A1-high, A2-low, etc. (3 sub-niveis por CEFR)
- Historico: users/{uid}/adapterHistory[] com entries: {date, zone, adjustment, reason}
- Reset por diagnostico: onCreate trigger em diagnostics/{uid} reseta adapterState
- Output: modifica users/{uid}/profile/currentDifficulty e gera parametros para proxima sessao

## GAPs Cobertos
- G-PRD-03: Sistema de adaptacao (parcial — regras)
- G-ARCH-03: Schedule Adapter (parcial — regras)

## Contexto de Dependencias
> Story 4.1: Calculo de taxa de acerto e classificacao em zonas funcionando

## Agent Workspace
> Notas do agente durante implementacao
