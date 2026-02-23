---
story: "6.3"
epic: "Epic 6: Dashboard e Analytics"
status: pending
agent: frontend-specialist
tool: claude_code
depends_on: ["6.2", "1.5"]
unlocks: []
priority: P1
model: sonnet
---

# Story 6.3: Re-teste diagnostico

## Contexto do Epic
Epic 6 implementa dashboard e analytics. Esta story permite o re-teste diagnostico a cada 30 dias com comparacao lado-a-lado do resultado anterior.

## Requisito
Como usuario, quero refazer o teste diagnostico a cada 30 dias e ver a comparacao com o resultado anterior para que eu meça minha evolucao concreta.

## Criterios de Aceite
```gherkin
DADO que 30 dias se passaram desde o ultimo diagnostico
QUANDO o usuario acessa o Dashboard
ENTAO ve banner "Hora de medir seu progresso! Faca o diagnostico novamente."

DADO que o usuario inicia o re-teste
QUANDO completa as 3 secoes (gramatica + compreensao + pronuncia)
ENTAO o sistema calcula novo nivel com a mesma formula (30%+30%+40%)

DADO que o novo resultado esta pronto
QUANDO e exibido ao usuario
ENTAO ve comparacao lado-a-lado: nivel anterior vs atual, scores por area anterior vs atual, fonemas antes vs agora

DADO que o nivel subiu
QUANDO a comparacao e exibida
ENTAO mensagem de parabens + novo conteudo desbloqueado

DADO que o nivel nao subiu
QUANDO a comparacao e exibida
ENTAO mensagem de encorajamento + recomendacoes especificas baseadas nos scores

DADO que o novo nivel e diferente do Adapter
QUANDO o diagnostico e salvo
ENTAO o Schedule Adapter reseta para o novo nivel (diagnostico prevalece)

DADO que o usuario quer antecipar o re-teste
QUANDO acessa "Meu Progresso" antes dos 30 dias
ENTAO ve botao "Refazer diagnostico" disponivel (RN05: pode antecipar manualmente)
```

## Contexto Tecnico
- RF07 criterios (re-teste): 02-prd.md
- RN05: Re-aplicacao a cada 30 dias; usuario pode antecipar
- Logica: reutiliza todo o fluxo do diagnostico (Stories 1.2-1.5) mas salva como nova entry
- Comparacao: ler diagnostics/{uid} ordenado por date desc, pegar [0] e [1]
- UI de comparacao: 2 colunas lado-a-lado com diff visual (setas up/down, cores)
- Adapter reset: Cloud Function trigger onCreate em diagnostics/{uid} reseta adapterState
- Wireframe: 03-ux-concept.md secao 4.12 (Re-teste)

## Contexto de Dependencias
> Story 6.2: Tela "Meu Progresso" implementada (re-teste e acessivel daqui)
> Story 1.5: Fluxo de diagnostico + calculo de nivel reutilizavel

## Agent Workspace
> Notas do agente durante implementacao
