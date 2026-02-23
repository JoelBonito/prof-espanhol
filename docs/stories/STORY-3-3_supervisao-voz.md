---
story: "3.3"
epic: "Epic 3: Licoes e Conteudo"
status: pending
agent: backend-specialist
tool: claude_code
depends_on: ["3.2"]
unlocks: ["3.4"]
priority: P0
model: opus-4-6
---

# Story 3.3: Supervisao por voz da IA nas licoes

## Contexto do Epic
Epic 3 implementa licoes teoricas. Esta story adiciona a camada de voz: a IA le enunciados, da dicas orais e explica erros falando.

## Requisito
Como usuario, quero que a IA leia enunciados em voz alta, de dicas orais e explique meus erros falando para que a experiencia de estudo seja mais imersiva e proxima de um tutor real.

## Criterios de Aceite
```gherkin
DADO que um bloco de conteudo e exibido
QUANDO a licao comeca
ENTAO a IA le o conteudo em voz alta via Gemini TTS (espanhol paraguaio)
E o texto acompanha visualmente (highlight) a leitura

DADO que o usuario erra um exercicio
QUANDO recebe feedback
ENTAO a IA explica verbalmente o erro alem do texto escrito

DADO que o usuario esta em um exercicio de audio
QUANDO a IA da uma dica
ENTAO a dica e falada (nao apenas escrita) para reforcar aprendizado auditivo

DADO que o audio nao esta disponivel (microfone bloqueado)
QUANDO o exercicio exige audio
ENTAO oferece alternativa em texto para o mesmo exercicio
```

## Contexto Tecnico
- RF04 criterios (supervisao por voz): 02-prd.md
- RN16: IA supervisiona verbalmente — ler enunciados, dar dicas orais, explicar erros
- Gemini TTS via Cloud Function ou Web Speech API (synthesis) para leitura
- AudioContext para reproduzir audio gerado
- Fallback texto: se audio indisponivel, texto e suficiente
- Prototipos Stitch: telas de licao com indicador de audio

## Contexto de Dependencias
> Story 3.2: Flashcards e quizzes implementados; exercicios funcionais

## Agent Workspace
> Notas do agente durante implementacao
