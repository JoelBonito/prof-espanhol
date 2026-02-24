---
story: "1.3"
epic: "Epic 1: Teste Diagnostico"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["1.2"]
unlocks: ["1.4"]
priority: P0
model: sonnet
---

# Story 1.3: Teste de compreensao auditiva

## Contexto do Epic
Epic 1 implementa o teste diagnostico obrigatorio. Esta story cobre a Secao 2: 5 audios em espanhol paraguaio com questoes sobre o conteudo.

## Requisito
Como novo usuario, quero ouvir 5 audios em espanhol paraguaio e responder questoes para que o sistema avalie minha compreensao auditiva.

## Criterios de Aceite
```gherkin
DADO que o usuario completou a secao de gramatica
QUANDO chega na Secao 2 (Compreensao Auditiva)
ENTAO ve 5 audios com player integrado + questoes de multipla escolha sobre cada audio

DADO que o usuario ouve um audio e responde
QUANDO seleciona uma resposta
ENTAO o sistema registra a resposta e classifica o tipo de erro (vocabulario vs. velocidade vs. contexto)

DADO que o usuario completou os 5 audios
QUANDO a secao finaliza
ENTAO o sistema calcula score de compreensao (0-100) com breakdown por tipo de erro
E salva em diagnostics/{uid}/listening no Firestore

DADO que o audio nao carrega (conexao lenta)
QUANDO o timeout de 10s e atingido
ENTAO exibe mensagem "Audio nao carregou. Verifique sua conexao." com botao "Tentar novamente"
```

## Contexto Tecnico
- RF02 criterios de aceite (secao compreensao): 02-prd.md
- Audios: pre-gravados ou gerados via Gemini TTS (espanhol paraguaio)
- Tipos de erro a classificar: vocabulario, velocidade, contexto
- Schema: diagnostics/{uid}/listening
- AudioContext para reproduzir audios no Safari iPadOS
- Prototipos Stitch: tela de diagnostico com audio player

## Contexto de Dependencias
> Story 1.2: Secao de gramatica completa e score salvo; routing para secao 2

## Agent Workspace
> Notas do agente durante implementacao
