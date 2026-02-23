---
story: "6.4"
epic: "Epic 6: Dashboard e Analytics"
status: pending
agent: frontend-specialist
tool: claude_code
depends_on: ["0.4", "0.2"]
unlocks: []
priority: P2
model: sonnet
---

# Story 6.4: Botao de feedback (reportar erro da IA)

## Contexto do Epic
Epic 6 implementa dashboard e analytics. Esta story adiciona o botao de feedback para reportar erros de conteudo gerado pela IA. RF09.

## Requisito
Como usuario, quero reportar quando a IA gera conteudo incorreto (erro gramatical, traducao errada, correcao fonetica indevida) para que o conteudo seja revisado pelo PO.

## Criterios de Aceite
```gherkin
DADO que o usuario esta em qualquer tela com conteudo gerado pela IA
QUANDO toca no icone de "Reportar Erro" (flag)
ENTAO abre modal com opcoes: "Erro gramatical", "Traducao incorreta", "Correcao fonetica indevida", "Outro"

DADO que o usuario seleciona um tipo de erro
QUANDO opcionalmente adiciona texto livre
ENTAO pode enviar o report

DADO que o report e enviado
QUANDO salvo no Firestore
ENTAO reports/{uid}/{reportId} contem: tipo, descricao, tela, conteudo reportado, sessaoId, timestamp
E feedback visual "Obrigado pelo report! Vamos revisar."

DADO que o PO acessa os reports
QUANDO consulta a collection reports/
ENTAO ve todos os reports pendentes para revisao manual
```

## Contexto Tecnico
- RF09 criterios: 02-prd.md
- RN31: Reports salvos para revisao manual pelo PO
- RN32: Sem resposta automatica
- Schema: reports/{uid}/{reportId} com campos: type, description, screen, content, sessionId, timestamp
- UI: icone flag pequeno no canto de areas com conteudo IA + Modal com radio buttons + textarea
- Componente global: pode ser adicionado como overlay em qualquer tela
- Prototipos Stitch: modal de feedback

## Contexto de Dependencias
> Story 0.4: Design System components (Modal, Button, Input/Textarea, Radio)
> Story 0.2: Firestore schema com collection reports/{uid}
> Story 0.4 (Design System core components): implementada

## Agent Workspace
> Notas do agente durante implementacao
