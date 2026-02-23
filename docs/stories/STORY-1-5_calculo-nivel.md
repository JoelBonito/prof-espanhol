---
story: "1.5"
epic: "Epic 1: Teste Diagnostico"
status: done
agent: backend-specialist
tool: claude_code
depends_on: ["1.4"]
unlocks: ["2.2", "3.1", "4.1", "5.1", "6.1"]
priority: P0
model: sonnet
---

# Story 1.5: Calculo de nivel + perfil de fluencia

## Contexto do Epic
Epic 1 implementa o teste diagnostico obrigatorio. Esta story e o fechamento: calcula o nivel geral (A1-C1), gera o perfil de fluencia e desbloqueia o Dashboard.

## Requisito
Como novo usuario, quero ver meu nivel de espanhol (A1-C1) com perfil detalhado de pontos fortes/fracos para que eu entenda onde estou e o que preciso melhorar.

## Criterios de Aceite
```gherkin
DADO que o usuario completou as 3 secoes do diagnostico
QUANDO o calculo e executado (Cloud Function)
ENTAO o nivel geral e calculado: gramatica (30%) + compreensao (30%) + pronuncia (40%)
E o nivel e mapeado para CEFR: A1 (0-20), A2 (21-40), B1 (41-60), B2 (61-80), C1 (81-100)

DADO que o score esta empatado entre dois niveis (ex: 40 = A2/B1)
QUANDO o nivel e atribuido
ENTAO o sistema atribui o nivel INFERIOR (A2) para nao gerar conteudo dificil demais

DADO que o nivel e calculado
QUANDO o resultado e exibido
ENTAO o usuario ve: nivel (A1-C1), scores por area, pontos fortes, pontos fracos, fonemas a trabalhar
E o usuario e direcionado para configurar a agenda semanal

DADO que o perfil e salvo
QUANDO o Firestore e atualizado
ENTAO users/{uid}/profile contem: level, levelScore, grammarScore, listeningScore, speakingScore, weakPhonemes[], diagnosticDate
E o Dashboard e desbloqueado
```

## Contexto Tecnico
- RF02 criterios finais: 02-prd.md
- Cloud Function: `calculateDiagnosticResult` le diagnostics/{uid}/*, calcula media ponderada, salva em profile
- Campos write-protected (level, levelScore): apenas Cloud Function via Admin SDK (G-SEC-11)
- Logica de empate: nivel inferior prevalece
- RN05: Re-aplicacao a cada 30 dias (flag lastDiagnosticDate no profile)
- Tela de resultado: 03-ux-concept.md secao 4.3 (wireframe)
- Apos resultado: redirecionar para configuracao de agenda → Dashboard

## Contexto de Dependencias
> Story 1.4: Todas as 3 secoes do diagnostico completadas; dados em diagnostics/{uid}
> Story 1.4 (Teste de pronuncia (Gemini audio analysis)): implementada

## Agent Workspace
> Notas do agente durante implementacao
