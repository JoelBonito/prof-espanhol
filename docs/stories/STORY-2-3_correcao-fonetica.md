---
story: "2.3"
epic: "Epic 2: Chat Supervisionado"
status: done
agent: backend-specialist
tool: claude_code
depends_on: ["2.2"]
unlocks: ["2.4"]
priority: P0
model: opus-4-6
---

# Story 2.3: Correcao fonetica em tempo real

## Contexto do Epic
Epic 2 implementa o chat supervisionado. Esta story e o diferencial do produto: correcao fonetica em tempo real durante a conversa com o tutor AI.

## Requisito
Como usuario, quero que o tutor AI corrija minha pronuncia em tempo real durante a conversa para que eu aprenda os fonemas corretos do espanhol paraguaio.

## Criterios de Aceite
```gherkin
DADO que o usuario esta conversando com o tutor
QUANDO comete um erro de pronuncia (ex: "rr" brasileiro vs. "rr" espanhol)
ENTAO o tutor interrompe o fluxo com correcao especifica
E exibe visualmente: fonema correto vs. fonema pronunciado
E pede ao usuario para repetir a palavra/frase

DADO que o usuario repete a palavra corrigida
QUANDO o score do fonema e >= 60
ENTAO a correcao e aceita e a conversa prossegue

DADO que o usuario nao consegue pronunciar corretamente
QUANDO atinge 3 tentativas no mesmo fonema
ENTAO o tutor registra o fonema como "pendente" e prossegue a conversa
E o fonema aparece no resumo da sessao como "a trabalhar"

DADO que a intensidade de correcao depende do nivel
QUANDO o usuario e Matheus (iniciante)
ENTAO correcao intensiva — tutor interrompe a cada erro
QUANDO o usuario e Renata (intermediaria)
ENTAO correcao moderada — consolida correcoes ao final de frases
QUANDO o usuario e Joel (profissional)
ENTAO correcao minima — so erros graves; demais no resumo

DADO que o contexto e paraguaio
QUANDO o tutor gera correcoes
ENTAO usa vocabulario, expressoes e fonetica do espanhol paraguaio (nao Espanha)
```

## Contexto Tecnico
- RF03 criterios (correcao fonetica): 02-prd.md
- RN10: 3 niveis de intensidade por persona
- RN12: Contexto paraguaio obrigatorio
- G-UX-10: Maximo 3 tentativas por fonema (evita loop frustrante)
- System prompts calibrados: diretorio functions/src/shared/prompts/
- Prompt engineering: G-ARCH-05, G-STACK-08
- Fonemas criticos para brasileiros: rr (vibrante), ll (lateral/yeismo), j (fricativa velar), z (interdental → seseo), d intervocalica
- O Gemini Live API retorna correcoes inline no stream de resposta; client deve parsear e exibir UI de correcao

## GAPs Cobertos
- G-PRD-02: Motor de IA pedagogica (correcao fonetica real-time)
- G-ARCH-05: Prompt Engineering
- G-STACK-08: Prompt engineering base
- G-UX-10: Limite de correcoes por fonema

## Contexto de Dependencias
> Story 2.2: Chat UI com dark mode, video, legendas e waveform funcionando

## Agent Workspace
> Notas do agente durante implementacao
