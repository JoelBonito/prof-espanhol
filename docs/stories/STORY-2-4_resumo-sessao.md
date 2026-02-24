---
story: "2.4"
epic: "Epic 2: Chat Supervisionado"
status: done
agent: backend-specialist
tool: claude_code
depends_on: ["2.3"]
unlocks: []
priority: P0
model: sonnet
---

# Story 2.4: Resumo de sessao

## Contexto do Epic
Epic 2 implementa o chat supervisionado. Esta story fecha o ciclo: ao encerrar a conversa, gera resumo com metricas e salva no historico.

## Requisito
Como usuario, quero ver um resumo da minha sessao de chat com duracao, topicos, fonemas corrigidos e score geral para que eu saiba o que pratiquei e onde preciso melhorar.

## Criterios de Aceite
```gherkin
DADO que o usuario encerra a sessao de chat
QUANDO toca "Encerrar" ou diz "Encerrar sessao" ou atinge 30 minutos
ENTAO o sistema gera resumo com: duracao, topicos abordados, fonemas corrigidos, fonemas pendentes, score geral da sessao

DADO que o resumo e gerado
QUANDO exibido ao usuario
ENTAO mostra cards visuais: duracao (timer), topicos (tags), fonemas OK (verde), fonemas pendentes (vermelho), score (0-100)

DADO que o resumo e aceito
QUANDO o usuario toca "OK" ou "Voltar ao Dashboard"
ENTAO os dados sao salvos em sessions/{uid} no Firestore
E o Schedule Adapter e notificado (trigger Firestore) para recalcular dificuldade
```

## Contexto Tecnico
- RF03 criterios finais: 02-prd.md
- Schema: sessions/{uid} com campos: type, duration, topics[], phonemesCorrect[], phonemesPending[], score, createdAt
- RN08: Duracao maxima 30 minutos (auto-encerrar)
- Cloud Function trigger: onCreate em sessions/{uid}/{sessionId} dispara Schedule Adapter
- Wireframe: 03-ux-concept.md secao 4.7 (Resumo de Sessao)
- Prototipos Stitch: tela de resumo pos-chat

## Contexto de Dependencias
> Story 2.3: Chat com correcao fonetica funcionando; dados de fonemas coletados durante a sessao

## Agent Workspace
> Notas do agente durante implementacao
