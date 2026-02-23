---
story: "0.3"
epic: "Epic 0: Setup e Infraestrutura"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["0.1"]
unlocks: ["0.4", "0.5", "0.6", "1.1"]
priority: P0
model: sonnet
---

# Story 0.3: React 19 + Vite 6 + Tailwind 4 + TypeScript scaffold

## Contexto do Epic
Epic 0 cria toda a infraestrutura base. Esta story cria o projeto frontend com todas as ferramentas de build e styling configuradas.

## Requisito
Como desenvolvedor, quero o scaffold completo do projeto React com Vite, Tailwind v4, TypeScript strict e PWA manifest para que eu possa comecar a desenvolver componentes imediatamente.

## Criterios de Aceite
```gherkin
DADO que o projeto nao existe
QUANDO executo o scaffold
ENTAO o projeto React 19.2 e criado com Vite 6, TypeScript 5.7 strict, e todas as dependencias core instaladas

DADO que Tailwind v4 esta configurado
QUANDO uso classes utilitarias no JSX
ENTAO os estilos sao aplicados corretamente com CSS-first config (@theme block com tokens do Design System)

DADO que vite-plugin-pwa esta configurado
QUANDO faco build do projeto
ENTAO o manifest.json e service worker sao gerados corretamente para PWA

DADO que DOMPurify esta integrado
QUANDO conteudo HTML do Gemini e renderizado
ENTAO o HTML e sanitizado antes de ser inserido no DOM

DADO que a estrutura de pastas segue o padrao definido
QUANDO navego o projeto
ENTAO vejo: src/pages/, src/components/ui/, src/components/features/, src/hooks/, src/stores/, src/lib/, src/types/

DADO que ESLint 9 (flat config) + Prettier estao configurados
QUANDO salvo um arquivo
ENTAO o codigo e formatado e linted automaticamente
```

## Contexto Tecnico
- Stack exata: 06-stack.md secao 1 (Stack por Camada)
- Dependencias core: 06-stack.md secao 3.1
- DevDependencies: 06-stack.md secao 3.2
- Tailwind v4 @theme config: 07-design-system.md secao 10 (config completo com tokens)
- DOMPurify para sanitizacao de output Gemini (G-SEC-03)
- Routing: React Router 7.x com lazy loading
- State: Zustand 5.x
- Validacao: Zod 3.x (shared client + server)

## GAPs Cobertos
- G-STACK-01: Projeto React + Vite scaffold
- G-DS-05: Tailwind v4 CSS-first config
- G-SEC-03: XSS protection via DOMPurify

## Contexto de Dependencias
> Story 0.1: Firebase project criado (necessario para config do Firebase SDK no client)

## Agent Workspace
> Notas do agente durante implementacao
