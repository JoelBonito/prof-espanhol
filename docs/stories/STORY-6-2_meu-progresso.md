---
story: "6.2"
epic: "Epic 6: Dashboard e Analytics"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["6.1"]
unlocks: ["4.3", "6.3"]
priority: P1
model: sonnet
---

# Story 6.2: Meu Progresso

## Contexto do Epic
Epic 6 implementa dashboard e analytics. Esta story cria a tela detalhada de progresso com graficos e historico.

## Requisito
Como usuario, quero ver meu historico detalhado com grafico de evolucao semanal, scores por tipo e fonemas melhorados para que eu tenha visibilidade completa do meu progresso.

## Criterios de Aceite
```gherkin
DADO que o usuario acessa "Meu Progresso"
QUANDO a tela carrega
ENTAO ve: grafico de evolucao semanal (sessoes completadas vs agendadas), historico de scores por tipo (fonetica/gramatica/vocabulario), lista de fonemas melhorados e pendentes

DADO que o grafico semanal e exibido
QUANDO o usuario navega entre semanas
ENTAO ve barras comparativas: agendado (cinza) vs completado (verde/terracota)

DADO que scores por tipo sao exibidos
QUANDO o usuario ve os 3 tipos
ENTAO cada tipo mostra: score atual, tendencia (subindo/descendo/estavel), nivel atual do Adapter

DADO que fonemas sao listados
QUANDO o usuario ve a secao de fonetica
ENTAO ve: fonemas melhorados (verde com check), fonemas pendentes (vermelho), fonemas nunca testados (cinza)

DADO que o relatorio semanal automatico existe
QUANDO e segunda-feira
ENTAO o usuario ve resumo da semana anterior gerado automaticamente
```

## Contexto Tecnico
- RF07 criterios (Meu Progresso): 02-prd.md
- RN28: Relatorio semanal automatico toda segunda-feira
- Dados: sessions/{uid}, homework/{uid}, diagnostics/{uid}, adapterHistory
- Graficos: lib leve (nenhuma lib pesada — usar CSS/SVG inline ou chart lib < 10KB)
- Wireframe: 03-ux-concept.md secao 4.10 (Meu Progresso)
- Prototipos Stitch: tela de progresso
- Fonemas: agregar de sessions[].phonemesCorrect e phonemesPending

## Contexto de Dependencias
> Story 6.1: Dashboard funcional com navegacao para "Meu Progresso"

## Agent Workspace
> Notas do agente durante implementacao
