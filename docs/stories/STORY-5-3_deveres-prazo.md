---
story: "5.3"
epic: "Epic 5: Agenda e Disciplina"
status: done
agent: backend-specialist
tool: claude_code
depends_on: ["5.1", "4.2"]
unlocks: ["5.4"]
priority: P0
model: sonnet
---

# Story 5.3: Deveres com prazo + geracao automatica

## Contexto do Epic
Epic 5 implementa agenda rigida. Esta story cria o sistema de deveres: exercicios de reforco gerados automaticamente quando o usuario tem score < 70, com prazo de 48h.

## Requisito
Como sistema, quero gerar deveres automaticamente quando o usuario tem score < 70 em conteudo, com prazo de 48h e countdown visivel, para reforcar pontos fracos.

## Criterios de Aceite
```gherkin
DADO que o usuario completou uma sessao com score < 70 em algum conteudo
QUANDO o Schedule Adapter detecta
ENTAO gera automaticamente um "Dever" com: exercicio de reforco, prazo de 48h, status "pendente"
E o dever aparece na aba "Deveres" com countdown visivel

DADO que o prazo de 48h expira sem conclusao
QUANDO o deadline passa
ENTAO o dever e marcado como "Vencido" (vermelho)
E o conteudo e re-inserido na proxima sessao agendada com prioridade alta
E a metrica de aderencia e penalizada

DADO que o usuario completa o dever com score >= 70
QUANDO o exercicio e finalizado
ENTAO o dever e marcado como "Completo" (verde)
E o conteudo entra na curva de esquecimento (proximo review agendado)

DADO que o usuario completa o dever atrasado
QUANDO o dever esta "Vencido" mas e completado
ENTAO recebe 50% de credito na aderencia (G-UX-05)
E o conteudo entra na curva de esquecimento normalmente

DADO que todos os deveres estao em dia
QUANDO o usuario ve a aba "Deveres"
ENTAO mensagem positiva "Tudo em dia! Continue assim." + sugestao de sessao extra
```

## Contexto Tecnico
- RF06 criterios (deveres): 02-prd.md
- RN22: Deveres usam curva de esquecimento (intervalos SM-2)
- Schema: homework/{uid} com campos: contentRef, deadline, status (pending/completed/overdue), score, createdAt
- Cloud Function trigger: apos sessao/licao, verifica scores < 70 e gera deveres
- G-UX-05: Deveres atrasados com 50% credito (nao penalizacao total)
- Countdown visual: date-fns para calculo de tempo restante
- Prototipos Stitch: tela de deveres com countdown

## GAPs Cobertos
- G-UX-05: Deveres atrasados com credito parcial

## Contexto de Dependencias
> Story 5.1: Calendario semanal funcional (deveres aparecem na agenda)
> Story 4.2: Schedule Adapter com regras de ajuste (fornece input de quais conteudos gerar deveres)

## Agent Workspace
> Notas do agente durante implementacao
