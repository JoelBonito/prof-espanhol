---
story: "0.6"
epic: "Epic 0: Setup e Infraestrutura"
status: done
agent: devops-engineer
tool: claude_code
depends_on: ["0.3"]
unlocks: []
priority: P1
model: sonnet
---

# Story 0.6: CI/CD Pipeline (GitHub Actions)

## Contexto do Epic
Epic 0 cria toda a infraestrutura base. Esta story configura o pipeline de CI/CD para garantir qualidade automatizada em cada push.

## Requisito
Como desenvolvedor, quero um pipeline CI/CD no GitHub Actions que rode lint, typecheck, testes e deploy automatico para que cada mudanca seja validada antes de ir para producao.

## Criterios de Aceite
```gherkin
DADO que um PR e aberto
QUANDO o pipeline CI roda
ENTAO executa em sequencia: ESLint, TypeScript check, Vitest (unit), build Vite
E reporta status no PR

DADO que o PR e merged na branch main
QUANDO o pipeline CD roda
ENTAO faz deploy automatico no Firebase Hosting (producao)

DADO que um PR e aberto (nao merged)
QUANDO o pipeline detecta que e PR
ENTAO faz deploy em preview channel do Firebase Hosting com URL temporaria

DADO que npm audit esta configurado
QUANDO uma dependencia vulneravel e detectada
ENTAO o pipeline falha com warning (nao blocking no MVP)

DADO que os testes de Firestore Security Rules existem
QUANDO o pipeline roda testes
ENTAO os testes de rules rodam no Firebase Emulator dentro do CI
```

## Contexto Tecnico
- 2 workflow files: ci.yml (PR) + cd.yml (merge to main)
- Jobs: lint (ESLint 9) → typecheck (tsc --noEmit) → test (Vitest + Firebase Emulator) → build (Vite) → deploy
- Firebase deploy tokens como GitHub Secrets
- Preview channels para PRs
- npm audit step (warning only, nao blocking)
- Referencia: 04-architecture.md secao 7, 06-stack.md secao 6

## GAPs Cobertos
- G-ARCH-06: CI/CD Pipeline
- G-STACK-04: CI/CD Pipeline
- G-STACK-06: Testing infrastructure (Vitest + emulador no CI)
- G-SEC-08: Dependency audit no CI

## Contexto de Dependencias
> Story 0.3: Projeto scaffolded com ESLint, TypeScript, Vitest configurados
> Story 0.3 (React 19 + Vite 6 + Tailwind 4 + TypeScript scaffold): implementada

## Agent Workspace
> Notas do agente durante implementacao
