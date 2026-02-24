---
story: "1.2"
epic: "Epic 1: Teste Diagnostico"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["0.2", "1.1"]
unlocks: ["1.3"]
priority: P0
model: sonnet
---

# Story 1.2: Teste de gramatica

## Contexto do Epic
Epic 1 implementa o teste diagnostico obrigatorio. Esta story cobre a Secao 1: 10 questoes de multipla escolha + 5 de preenchimento, com scoring.

## Requisito
Como novo usuario, quero completar a secao de gramatica do diagnostico com 10 questoes de multipla escolha e 5 de preenchimento para que o sistema avalie meu nivel gramatical.

## Criterios de Aceite
```gherkin
DADO que o usuario iniciou o Teste Diagnostico
QUANDO chega na Secao 1 (Gramatica)
ENTAO ve 10 questoes de multipla escolha seguidas de 5 de preenchimento
E cada questao tem timer visual (nao eliminatorio, apenas para medir tempo medio)

DADO que o usuario responde todas as 15 questoes
QUANDO completa a secao
ENTAO o sistema calcula score de gramatica (0-100) e tempo medio por questao
E salva os resultados em diagnostics/{uid}/grammar no Firestore

DADO que o usuario fecha o app no meio da secao
QUANDO volta ao app
ENTAO retoma de onde parou (progresso salvo localmente via Zustand persist)

DADO que a secao de gramatica esta completa
QUANDO o score e registrado
ENTAO o usuario e direcionado automaticamente para a Secao 2 (Compreensao)
```

## Contexto Tecnico
- RF02 criterios de aceite: 02-prd.md
- Wireframe: 03-ux-concept.md secao 4.3 (Teste Diagnostico)
- Schema Firestore: diagnostics/{uid} com subcampos grammar, listening, speaking
- Questoes geradas via Gemini REST (Cloud Function) ou seed estatico no MVP
- RN04: Diagnostico obrigatorio — nenhuma feature acessivel sem completa-lo
- Timer visual por questao (nao eliminatorio)

## Contexto de Dependencias
> Story 0.2: Firestore schema com collection diagnostics/{uid} disponivel
> Story 1.1: Onboarding concluido, routing para /diagnostic ativo

## Agent Workspace
> Notas do agente durante implementacao
