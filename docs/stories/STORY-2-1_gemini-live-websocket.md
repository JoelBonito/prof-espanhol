---
story: "2.1"
epic: "Epic 2: Chat Supervisionado"
status: done
agent: backend-specialist
tool: claude_code
depends_on: ["0.2", "0.5"]
unlocks: ["2.2"]
priority: P0
model: opus-4-6
---

# Story 2.1: Gemini Live API — WebSocket + token efemero

## Contexto do Epic
Epic 2 implementa o chat supervisionado com voz + visao: conversacao em tempo real com o tutor AI via Gemini Live API. RF03.

## Requisito
Como desenvolvedor, quero a conexao WebSocket bidirecional com o Gemini Live API funcionando via token efemero gerado por Cloud Function para que o chat por voz em tempo real seja possivel sem expor API keys.

## Criterios de Aceite
```gherkin
DADO que o usuario inicia uma sessao de chat
QUANDO o client solicita um token
ENTAO a Cloud Function `createChatSession` gera um token efemero com TTL de 35 minutos
E retorna o token + WebSocket URL ao client

DADO que o client tem o token efemero
QUANDO abre a conexao WebSocket com o Gemini Live API
ENTAO a conexao bidirecional e estabelecida com sucesso
E o client pode enviar audio frames + video frames
E o client pode receber audio + texto + correcoes do Gemini

DADO que o token expira durante uma sessao
QUANDO o TTL de 35 minutos e atingido
ENTAO o client detecta a desconexao e exibe "Sessao expirou. Deseja continuar?"
E ao confirmar, solicita novo token e reconecta automaticamente

DADO que a API key do Gemini esta configurada
QUANDO verifico o client-side code
ENTAO a API key NAO aparece em nenhum lugar do bundle (apenas server-side)

DADO que o WebSocket falha (conexao ruim)
QUANDO a latencia excede 3 segundos
ENTAO o app ativa fallback para modo texto com mensagem "Conexao lenta. Mudando para modo texto."
```

## Contexto Tecnico
- Fluxo completo: 04-architecture.md secao 3.1 (Data Flow: Chat Supervisionado)
- Cloud Function `createChatSession`: valida Auth token, gera ephemeral token via @google/genai, retorna token + wss URL
- @google/genai SDK: Live API client no browser (WebSocket nativo Safari)
- System prompt: include nivel do usuario, persona (Matheus/Renata/Joel), contexto paraguaio
- RN08: Sessoes 3-30 minutos
- RN11: Max 3 sessoes/dia/usuario
- RN12: Contexto paraguaio obrigatorio
- Fallback texto: degradacao graceful se WebSocket falhar
- Validacao Sprint 0 (Story 0.5) confirma que WebSocket funciona no Safari iPadOS

## GAPs Cobertos
- G-PRD-01: Infraestrutura de audio WebSocket
- G-ARCH-01: WebSocket + Gemini Live
- G-STACK-03: Gemini SDK integration
- G-SEC-04: Token efemero para Gemini

## Contexto de Dependencias
> Story 0.2: Firestore schema disponivel para salvar sessoes
> Story 0.5: Sprint 0 validou que WebSocket funciona no Safari iPadOS
> Story 0.5 (Sprint 0 — Validacao iPad Safari): implementada

## Agent Workspace
> Notas do agente durante implementacao
