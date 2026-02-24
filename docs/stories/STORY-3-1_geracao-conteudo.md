---
story: "3.1"
epic: "Epic 3: Licoes e Conteudo"
status: done
agent: backend-specialist
tool: claude_code
depends_on: ["0.2", "1.5"]
unlocks: ["3.2"]
priority: P0
model: opus-4-6
---

# Story 3.1: Geracao de conteudo via Gemini REST + cache

## Contexto do Epic
Epic 3 implementa licoes teoricas com quizzes interativos. Esta story cria o backend de geracao de conteudo adaptativo via Gemini REST API com cache no Firestore.

## Requisito
Como backend, quero gerar conteudo de licoes (explicacoes + exercicios) via Gemini REST API e cachear no Firestore para que licoes personalizadas por nivel estejam disponíveis sem chamadas duplicadas a API.

## Criterios de Aceite
```gherkin
DADO que o usuario acessa a secao "Licoes"
QUANDO solicita um modulo para seu nivel
ENTAO a Cloud Function `generateLesson` verifica se existe cache no Firestore
SE existe cache valido ENTAO retorna conteudo cacheado em < 500ms
SE nao existe ENTAO chama Gemini REST, gera conteudo, salva cache e retorna em < 5s

DADO que o conteudo e gerado pelo Gemini
QUANDO o prompt e construido
ENTAO inclui: nivel do usuario, topico do modulo, contexto paraguaio, formato (blocos de 3-5min + 2-3 exercicios)

DADO que o conteudo retornado e HTML/markdown
QUANDO renderizado no client
ENTAO e sanitizado via DOMPurify antes de inserir no DOM

DADO que o cache existe
QUANDO o nivel do usuario muda (re-teste ou Adapter)
ENTAO o cache antigo e invalidado e novo conteudo e gerado
```

## Contexto Tecnico
- RF04 criterios: 02-prd.md
- RN13: Conteudo gerado por Gemini, contextualizado para espanhol paraguaio
- RN14: Modulos de 15-25 minutos
- Cloud Function: `generateLesson(uid, moduleId)` → check cache → call Gemini REST → save cache → return
- Cache: lessons/{uid}/cache/{moduleId} com TTL e nivel
- G-ARCH-08: Cache de licoes no Firestore
- G-PRD-05: Conteudo educacional
- Prompt engineering: G-ARCH-05, G-STACK-08
- System prompt: nivel, persona, topico, formato estruturado (JSON schema para blocos + exercicios)
- DOMPurify no client para sanitizar output

## GAPs Cobertos
- G-PRD-05: Conteudo educacional contextualizado
- G-ARCH-05: Prompt Engineering (parcial — prompts para licoes)
- G-ARCH-08: Cache de licoes
- G-STACK-08: Prompt engineering base (parcial — prompts para geracao)

## Contexto de Dependencias
> Story 0.2: Firestore schema com collections lessons/{uid} disponivel
> Story 1.5: Nivel do usuario calculado (necessario para personalizar conteudo)
> Story 1.5 (Calculo de nivel + perfil de fluencia): implementada

## Agent Workspace
> Notas do agente durante implementacao
