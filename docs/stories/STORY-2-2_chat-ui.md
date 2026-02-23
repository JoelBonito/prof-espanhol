---
story: "2.2"
epic: "Epic 2: Chat Supervisionado"
status: pending
agent: frontend-specialist
tool: claude_code
depends_on: ["0.4", "2.1"]
unlocks: ["2.3"]
priority: P0
model: opus-4-6
---

# Story 2.2: Chat UI — dark mode full-screen + video + legendas

## Contexto do Epic
Epic 2 implementa o chat supervisionado. Esta story cria a interface imersiva de chat: dark mode forcado, video do usuario, avatar do tutor, area de legendas e controles minimos.

## Requisito
Como usuario, quero uma tela de chat imersiva em dark mode com meu video, o avatar do tutor e legendas para que eu me concentre na conversa sem distracoes.

## Criterios de Aceite
```gherkin
DADO que o usuario inicia uma sessao de chat
QUANDO a tela de chat abre
ENTAO o sidebar desaparece (full-screen imersivo)
E o tema muda automaticamente para dark mode (--color-chat-bg)
E o layout mostra: video do usuario (canto), avatar do tutor (centro), area de legendas (embaixo)

DADO que o chat esta ativo
QUANDO o usuario fala
ENTAO a legenda do que o usuario disse aparece em tempo real na area de legendas
E a resposta da IA aparece como legenda simultaneamente

DADO que Wake Lock esta ativo
QUANDO a sessao de chat esta em andamento
ENTAO a tela do iPad nao apaga durante toda a sessao
SE Wake Lock API nao disponivel ENTAO usar AudioContext hack como fallback

DADO que o usuario quer encerrar
QUANDO toca "Encerrar" ou diz "Encerrar sessao"
ENTAO o chat fecha, dark mode desativa, sidebar reaparece

DADO que o visualizador de audio funciona
QUANDO o tutor ou usuario fala
ENTAO o waveform Canvas mostra atividade de audio em tempo real
```

## Contexto Tecnico
- Wireframe: 03-ux-concept.md secao 4.6 (Chat Supervisionado)
- Prototipos Stitch: telas de chat com dark mode
- Dark mode contextual: G-DS-04 (forcado no chat, nao toggle manual)
- Tokens de cor: --color-chat-bg, --color-chat-surface, --color-chat-bubble-tutor, --color-chat-bubble-user
- Wake Lock: G-UX-11 (manter tela ativa durante sessao)
- Transcricao visual: G-UX-12 (Web Speech API ou Gemini server-side)
- Audio waveform Canvas: G-DS-07 (conectado ao AudioContext)
- getUserMedia para video + audio do usuario
- Controles minimos: botao mute, botao encerrar, indicador de gravacao

## GAPs Cobertos
- G-DS-07: Audio waveform (Canvas)
- G-UX-11: Chat Wake Lock / AudioContext Safari
- G-UX-12: Chat transcricao visual do aluno

## Contexto de Dependencias
> Story 0.4: Design System components disponiveis (Modal, Button, Avatar)
> Story 2.1: Conexao WebSocket com Gemini Live API funcionando
> Story 0.4 (Design System core components): implementada

## Agent Workspace
> Notas do agente durante implementacao
