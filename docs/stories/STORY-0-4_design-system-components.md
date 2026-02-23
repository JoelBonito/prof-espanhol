---
story: "0.4"
epic: "Epic 0: Setup e Infraestrutura"
status: done
agent: frontend-specialist
tool: claude_code
depends_on: ["0.3"]
unlocks: ["1.1", "2.2", "5.1", "6.1", "6.4"]
priority: P0
model: opus-4-6
---

# Story 0.4: Design System core components

## Contexto do Epic
Epic 0 cria toda a infraestrutura base. Esta story implementa os componentes React reutilizaveis do Design System, baseados nos 35 prototipos Stitch e nos tokens do doc 07-design-system.md.

## Requisito
Como desenvolvedor, quero uma biblioteca de componentes UI reutilizaveis (Button, Card, Input, Sidebar, ProgressBar, Badge, etc.) para que todas as telas do app compartilhem a mesma linguagem visual sem duplicacao.

## Criterios de Aceite
```gherkin
DADO que os tokens do Design System estao no @theme block
QUANDO implemento componentes React
ENTAO todos usam CSS custom properties (var(--color-primary-500), etc.) em vez de valores hardcoded

DADO que os componentes base existem
QUANDO importo Button, Card, Input, Badge, ProgressBar, Sidebar, Modal
ENTAO cada um aceita props TypeScript tipadas e segue os padroes visuais dos prototipos Stitch

DADO que o Sidebar e responsive
QUANDO o iPad esta em landscape
ENTAO o sidebar e visivel com 5 itens (Dashboard, Chat, Licoes, Agenda, Progresso)
QUANDO o iPad esta em portrait
ENTAO o sidebar colapsa para bottom navigation
QUANDO o usuario entra no Chat
ENTAO o sidebar desaparece (modo imersivo full-screen)

DADO que dark mode contextual esta implementado
QUANDO o usuario entra na tela de Chat
ENTAO o tema muda automaticamente para dark mode (chat-bg, chat-surface, etc.)
QUANDO o usuario sai do Chat
ENTAO o tema volta para light mode

DADO que acessibilidade esta implementada
QUANDO navego por teclado
ENTAO focus ring (outline) e visivel em todos os elementos focaveis
QUANDO uso VoiceOver
ENTAO todos os componentes customizados tem aria-label, role e aria-live apropriados
```

## Contexto Tecnico
- Tokens e componentes: 07-design-system.md secoes 2-9
- Prototipos Stitch: docs/stitch-screens/ (35 telas HTML como referencia visual)
- Mapeamento Stitch-to-React: G-DS-08
- Sidebar responsive: G-DS-03 (landscape sidebar, portrait bottom nav, chat full-screen)
- Dark mode contextual: G-DS-04 (apenas chat usa dark mode, nao toggle manual)
- Focus visible: G-UX-06 (outline em elementos focaveis)
- ARIA: G-UX-07 (roles em componentes customizados como flashcard, audio player)
- Componentes minimos: Button (4 variants), Card, Input, Select, Badge, ProgressBar, Sidebar, Modal, Breadcrumb, Avatar, Skeleton
- Touch targets: minimo 44x44pt (Apple HIG)

## GAPs Cobertos
- G-DS-01: Component library React
- G-DS-03: Responsive sidebar
- G-DS-04: Dark mode contextual
- G-DS-08: Stitch-to-React mapping
- G-UX-06: Focus visible
- G-UX-07: ARIA em componentes customizados

## Contexto de Dependencias
> Story 0.3: Projeto React scaffolded com Tailwind v4 e tokens configurados no @theme block
> Story 0.3 (React 19 + Vite 6 + Tailwind 4 + TypeScript scaffold): implementada

## Agent Workspace
> Notas do agente durante implementacao
