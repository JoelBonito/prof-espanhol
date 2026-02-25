---
story: "4.3"
epic: "Epic 4: Motor de Adaptacao"
status: pending
agent: frontend-specialist
tool: claude_code
depends_on: ["4.2", "6.2"]
unlocks: []
priority: P0
model: sonnet
---

# Story 4.3: Historico de ajustes

## Contexto do Epic
Epic 4 implementa o Schedule Adapter. Esta story exibe o historico de ajustes de dificuldade na tela "Meu Progresso".

## Requisito
Como usuario, quero ver o historico de ajustes de dificuldade no meu perfil para que eu entenda como o sistema esta se adaptando ao meu desempenho.

## Criterios de Aceite
```gherkin
DADO que o usuario acessa "Meu Progresso"
QUANDO navega para a secao "Adaptacao"
ENTAO ve timeline de ajustes: data, zona anterior, zona nova, motivo do ajuste

DADO que existem ajustes por tipo de atividade
QUANDO exibe o historico
ENTAO mostra separadamente: fonetica, gramatica, vocabulario (cada um pode estar em nivel diferente)

DADO que nenhum ajuste foi feito ainda (< 3 sessoes)
QUANDO o usuario ve a secao
ENTAO exibe mensagem "Complete mais sessoes para o sistema comecar a se adaptar ao seu ritmo"
```

## Contexto Tecnico
- RN19: Historico visivel no "Meu Progresso"
- Dados: users/{uid}/adapterHistory[] (gerados pela Story 4.2)
- UI: Timeline vertical com cards por ajuste (data, badge de zona, descricao)
- Cores: success (Zona Ideal), warning (Muito Facil → subindo), error (Muito Dificil → descendo)
- Prototipos Stitch: secao de progresso

## Contexto de Dependencias
> Story 4.2: Regras de ajuste geram historico em adapterHistory[]
> Story 6.2: Tela "Meu Progresso" implementada (esta story adiciona a secao de Adaptacao)
> Story 6.2 (Meu Progresso): implementada

## Agent Workspace
> Notas do agente durante implementacao
