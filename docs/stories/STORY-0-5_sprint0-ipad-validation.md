---
story: "0.5"
epic: "Epic 0: Setup e Infraestrutura"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["0.3"]
unlocks: ["2.1"]
priority: P0
model: sonnet
---

# Story 0.5: Sprint 0 — Validacao iPad Safari

## Contexto do Epic
Epic 0 cria toda a infraestrutura base. Esta story e um gate critico: valida que todas as Web APIs necessarias funcionam no Safari iPadOS 17+ antes de investir em desenvolvimento.

## Requisito
Como PO, quero validar que getUserMedia (camera+mic), WebSocket (wss://), Wake Lock, Web Push Notifications e ServiceWorker funcionam no Safari iPadOS 17+ para que eu tenha confianca de que a PWA e viavel no iPad.

## Criterios de Aceite
```gherkin
DADO que o app de teste esta deployado no Firebase Hosting
QUANDO abro no Safari iPadOS 17+ no iPad real
ENTAO consigo instalar como PWA via "Add to Home Screen"

DADO que o app de teste solicita camera e microfone
QUANDO aceito as permissoes
ENTAO getUserMedia retorna stream de video + audio funcional

DADO que o app de teste abre WebSocket (wss://)
QUANDO envia e recebe mensagens
ENTAO a conexao bidirecional funciona sem timeout por pelo menos 30 minutos

DADO que Wake Lock API esta disponivel
QUANDO ativo o Wake Lock durante uma sessao
ENTAO a tela nao apaga durante a sessao de chat
SE Wake Lock nao funcionar ENTAO documentar workaround com AudioContext

DADO que Web Push Notifications estao configuradas
QUANDO envio uma notificacao push
ENTAO o iPad exibe a notificacao mesmo com o app em background

DADO que Web Speech API e testada
QUANDO tento transcricao de voz
ENTAO documentar se funciona ou se precisamos de fallback (Gemini server-side transcription)
```

## Contexto Tecnico
- Matriz de compatibilidade Safari: 06-stack.md secao 2.3
- APIs criticas: getUserMedia, WebSocket, Wake Lock, Web Push, ServiceWorker, MediaRecorder, AudioContext
- APIs parciais a testar: Wake Lock (limitacoes Safari 16.4+), Web Speech API (suporte limitado)
- Fallbacks documentados: AudioContext hack para Wake Lock, Gemini transcription para Web Speech
- BLOQUEADOR: se getUserMedia ou WebSocket falharem, o projeto precisa ser repensado (Capacitor?)
- Resultado: documento de compatibilidade com status de cada API (OK / Parcial / Falhou + workaround)

## GAPs Cobertos
- G-PRD-04: Validacao de plataforma PWA no iPad
- G-ARCH-04: PWA no Safari/iPadOS
- G-STACK-05: Sprint 0 validation

## Contexto de Dependencias
> Story 0.3: Projeto React scaffolded e deployavel no Firebase Hosting para teste
> Story 0.3 (React 19 + Vite 6 + Tailwind 4 + TypeScript scaffold): implementada

## Agent Workspace
> Notas do agente durante implementacao
