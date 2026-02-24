---
story: "3.2"
epic: "Epic 3: Licoes e Conteudo"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["3.1", "0.4"]
unlocks: ["3.3"]
priority: P0
model: sonnet
---

# Story 3.2: Flashcards + quizzes interativos

## Contexto do Epic
Epic 3 implementa licoes teoricas. Esta story cria os componentes de exercicios interativos: flashcards com flip animation e quizzes de multipla escolha/preenchimento.

## Requisito
Como usuario, quero praticar com flashcards e quizzes interativos apos cada bloco de conteudo para que eu fixe o que aprendi com feedback imediato.

## Criterios de Aceite
```gherkin
DADO que o usuario completou um bloco de conteudo (3-5 min)
QUANDO os exercicios de verificacao aparecem
ENTAO ve 2-3 exercicios: flashcard, multipla escolha ou preenchimento

DADO que o usuario interage com um flashcard
QUANDO toca/swipe no card
ENTAO o card faz animacao 3D de flip (frente → verso) com CSS transforms
E mostra a resposta no verso

DADO que o usuario erra um exercicio
QUANDO seleciona resposta incorreta
ENTAO recebe feedback imediato: resposta correta, explicacao do porque, exercicio similar para tentar novamente

DADO que o usuario completa o modulo
QUANDO todos os blocos e exercicios sao finalizados
ENTAO ve score final (0-100)
E exercicios com score < 70 sao marcados para revisao no Schedule Adapter

DADO que SM-2 simplificado esta ativo
QUANDO um exercicio e marcado para revisao
ENTAO o algoritmo calcula proximo intervalo: 1h → 1 dia → 3 dias → 7 dias → 30 dias
```

## Contexto Tecnico
- RF04 criterios: 02-prd.md
- RN15: Repeticao espacada (SM-2 simplificado)
- G-DS-06: Flashcard flip animation (CSS 3D transforms)
- Componentes: FlashCard (flip), QuizMultipleChoice, QuizFillBlank
- Score por exercicio → salvar em lessons/{uid}/{lessonId}/exercises
- Feedback imediato: highlight verde/vermelho + explicacao
- Prototipos Stitch: telas de flashcard e quiz

## GAPs Cobertos
- G-DS-06: Flashcard flip animation

## Contexto de Dependencias
> Story 3.1: Conteudo de licoes gerado e disponivel (blocos + exercicios em JSON)
> Story 0.4: Design System components (Card, Button, Badge, ProgressBar)

## Agent Workspace
> Notas do agente durante implementacao
