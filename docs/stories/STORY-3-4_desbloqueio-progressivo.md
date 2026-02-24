---
story: "3.4"
epic: "Epic 3: Licoes e Conteudo"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["3.3"]
unlocks: []
priority: P0
model: sonnet
---

# Story 3.4: Desbloqueio progressivo de modulos

## Contexto do Epic
Epic 3 implementa licoes teoricas. Esta story controla a progressao: modulos sao desbloqueados sequencialmente conforme o usuario atinge score minimo.

## Requisito
Como usuario, quero ver apenas modulos desbloqueados para meu nivel e desbloquear os proximos ao completar com score >= 60 para que eu progrida de forma estruturada.

## Criterios de Aceite
```gherkin
DADO que o usuario acessa a lista de modulos
QUANDO visualiza os modulos disponiveis
ENTAO ve modulos desbloqueados (acessiveis) e modulos bloqueados (com indicacao de pre-requisito)

DADO que o usuario completa um modulo com score >= 60
QUANDO o modulo e finalizado
ENTAO o proximo modulo e desbloqueado automaticamente
E o usuario ve animacao de desbloqueio + mensagem motivacional

DADO que o usuario completa um modulo com score < 60
QUANDO o modulo e finalizado
ENTAO o modulo pode ser refeito
E o proximo modulo permanece bloqueado
E mensagem "Complete com score >= 60 para desbloquear o proximo"

DADO que o usuario tenta acessar modulo bloqueado
QUANDO toca no modulo
ENTAO ve mensagem "Complete [modulo X] primeiro para desbloquear"
```

## Contexto Tecnico
- RF04 criterios (desbloqueio): 02-prd.md
- Logica de desbloqueio: lessons/{uid}/progress/{moduleId} com campo unlocked, score
- Modulos por nivel: A1 (modulos 1-5), A2 (6-10), B1 (11-15), etc.
- Diagnostico determina quais modulos ja estao desbloqueados inicialmente
- UI: lista vertical com icones locked/unlocked, progress bar por modulo
- Prototipos Stitch: tela de lista de licoes

## Contexto de Dependencias
> Story 3.3: Supervisao por voz implementada; modulos completos e funcionais end-to-end

## Agent Workspace
> Notas do agente durante implementacao
