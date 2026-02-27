# PLAN — Migração de Design: Light → Premium Dark (Stitch)

> **Status:** APROVADO
> **Data:** 2026-02-26
> **Stitch Project:** `5663344124088709367` (Premium Dark Dashboard)
> **Agentes:** `frontend-specialist` + `ux-researcher`
> **Risco:** MÉDIO (mudança visual completa, lógica intacta)

---

## 1. Resumo Executivo

Migrar o design do Elite Espanhol de um tema **light minimalista** para um tema **dark premium glassmorphism**, seguindo fielmente os 14 protótipos do Stitch (7 páginas × mobile + desktop). A lógica de negócio, estado (Zustand/Firestore) e integrações (Gemini Live, Firebase Auth) **não são afetadas**.

---

## 2. Mapeamento Stitch → Rotas

| # | Tela Stitch (Mobile) | Tela Stitch (Desktop) | Rota | Página Atual |
|---|---|---|---|---|
| 1 | `47984d84...` Auth | `e057c891...` Auth Desktop | `/auth/login` | `LoginPage.tsx` |
| 2 | `670541b5...` Dashboard | `92d54b78...` Dashboard Desktop | `/` | `HomePage.tsx` |
| 3 | `15875ebe...` Virtual Class | `7c242bcd...` Virtual Class Desktop | `/chat` | `ChatPage.tsx` |
| 4 | `a9f6855e...` Lessons | `bca3d7e2...` Lessons Desktop | `/lessons` | `LessonsPage.tsx` |
| 5 | `fe1baf92...` Schedule | `407e7eac...` Schedule Desktop | `/schedule` | `SchedulePage.tsx` |
| 6 | `66c305f8...` Progress | `0d516e97...` Progress Desktop | `/progress` | `ProgressPage.tsx` |
| 7 | `7cb86683...` Profile | `ed69caaa...` Profile Desktop | `/profile` | `ProfilePage.tsx` |

**Referência para navegação:** Tela **Progresso** (mobile = bottom nav, desktop = sidebar com logo + labels + user card).

---

## 3. GAP Analysis — Design System

### 3.1 Cores

| Token | ATUAL | NOVO (Stitch) | Mudança |
|-------|-------|---------------|---------|
| Background | `#FAFAF8` (neutral-50, light) | `#0B101B` (navy deep, dark) | **TOTAL** |
| Surface/Card | `#FFFFFF` | `rgba(18, 24, 38, 0.6)` glass | **TOTAL** |
| Primary | `#EC5B13` (terracota) | `#FF8C42` (warm orange) | Shift +15% warm |
| Primary glow | N/A | `rgba(255, 140, 66, 0.3)` | **NOVO** |
| Text primary | `#181311` (neutral-900) | `#FFFFFF` | **INVERTIDO** |
| Text secondary | `#896F61` (neutral-500) | `#94A3B8` (slate-400) | Neutral shift |
| Border | `#E5DDDC` (neutral-200) | `rgba(255, 255, 255, 0.05)` | Glass border |
| Card border | N/A | `rgba(255, 140, 66, 0.25)` | **NOVO** (glow) |
| Chat (já dark) | `#1A1A2E` | `#0B101B` (unificar) | Harmonizar |

### 3.2 Tipografia

| Elemento | ATUAL | NOVO (Stitch) | Ação |
|----------|-------|---------------|------|
| Display/Headings | `Lora` (serif) | `Playfair Display` (serif) | **TROCAR** |
| Body | `Inter` (sans) | `Inter` (sans) | Manter |
| Sidebar logo | N/A | `Playfair Display italic bold` | **NOVO** |
| Font weights | 400, 700 | 300, 400, 500, 600, 700 | Expandir |

### 3.3 Componentes de Layout

| Componente | ATUAL | NOVO (Stitch) | Impacto |
|------------|-------|---------------|---------|
| **Sidebar** | 72px, icon-only, white, `hidden lg:flex` | **Collapsible**: 72px em `lg`, 320px em `xl`, glass dark, logo + labels + user card | **REWRITE** |
| **Bottom Nav** | 64px, white bg, icons + labels | Glass dark bg, icons + labels, active glow | **RESTYLE** |
| **AppLayout** | `max-w-3xl` centered, `lg:pl-[72px]` | Full-width com grid, `lg:pl-[72px]` / `xl:pl-[320px]` | **REFACTOR** |
| **ChatLayout** | Full-screen dark, sem nav | Desktop: com sidebar; Mobile: full-screen sem nav | **REFACTOR** |
| **Cards** | Flat white, `shadow-card` | Glass morphism, orange border glow, `rounded-3xl` | **RESTYLE** |

### 3.4 Efeitos Visuais Novos

| Efeito | Existe? | Descrição |
|--------|---------|-----------|
| Glass morphism | **NÃO** | `backdrop-filter: blur(20px)` + semi-transparent bg |
| Glow borders | **NÃO** | `box-shadow: 0 0 15px rgba(255,140,66,0.3)` |
| Radial gradient bg | **NÃO** | `radial-gradient(circle at top left, #1a2332, #0b101b 60%)` |
| Active glow nav | **NÃO** | `filter: drop-shadow(0 0 8px rgba(234,140,85,0.6))` |
| Ambient light blob | **NÃO** | Div blur 180px com cor primária (decorativo) |

### 3.5 Brand / Logo

| Elemento | ATUAL | NOVO | Ação |
|----------|-------|------|------|
| Login heading | "Prof Espanhol" (texto) | Logo SVG `elite-espanhol-logo-full.svg` | **SUBSTITUIR** |
| Sidebar brand | Nenhum | Logo mark + "Elite Español" italic | **ADICIONAR** |
| Favicon | `favicon.svg` genérico | Logo mark `elite-espanhol-logo-mark.svg` | **SUBSTITUIR** |
| PWA icons | Genéricos | Derivar do logo mark | **GERAR** |

---

## 4. Plano de Implementação — 6 Fases

### Fase 0: Design System Foundation (tokens + globals)
**Agente:** `frontend-specialist`
**Estimativa:** ~1 sessão
**Arquivos:** 3-4

| Step | Arquivo | Ação |
|------|---------|------|
| 0.1 | `src/styles/globals.css` | Reescrever tokens: dark bg, nova primary, glass vars, glow vars |
| 0.2 | `src/styles/globals.css` | Trocar `--font-display` de Lora → Playfair Display |
| 0.3 | `src/styles/globals.css` | Adicionar utility classes: `.glass-panel`, `.premium-card`, `.glow-badge` |
| 0.4 | `index.html` | Atualizar Google Fonts link (Playfair Display em vez de Lora) |
| 0.5 | `public/favicon.svg` | Substituir pelo `elite-espanhol-logo-mark.svg` |

**Tokens CSS do Stitch a implementar:**
```css
--color-app-bg: #0B101B;
--color-surface-dark: #121926;
--color-primary-500: #FF8C42;
--color-primary-glow: rgba(255, 140, 66, 0.3);
--color-card-border: rgba(255, 140, 66, 0.25);
--color-glass-bg: rgba(18, 24, 38, 0.6);
--color-text-primary: #FFFFFF;
--color-text-secondary: #94A3B8;
--color-text-muted: #64748B;
--color-border-subtle: rgba(255, 255, 255, 0.05);
```

**Verificação:** App compila sem erros, todas as páginas renderizam (mesmo que feias temporariamente).

---

### Fase 1: Navigation Shell (Sidebar + Bottom Nav + AppLayout)
**Agente:** `frontend-specialist`
**Estimativa:** ~1 sessão
**Arquivos:** 5-6

| Step | Arquivo | Ação |
|------|---------|------|
| 1.1 | `src/components/layout/nav-items.ts` | Atualizar icons para coincidir com Stitch (`grid_view`, `auto_stories`, `chat_bubble`, `analytics`, `calendar_month`) |
| 1.2 | `src/components/layout/Sidebar.tsx` | **REWRITE**: Collapsible (72px em lg, 320px em xl), glass bg, logo "Elite Español", labels (só xl), nav com active state orange, user card no footer |
| 1.3 | `src/components/layout/BottomNav.tsx` | **RESTYLE**: Dark glass bg, active glow, tipografia atualizada |
| 1.4 | `src/components/layout/AppLayout.tsx` | Ajustar: dark bg, `lg:pl-[72px] xl:pl-[320px]`, remover max-w-3xl (conteúdo varia por página) |
| 1.5 | `src/components/layout/ChatLayout.tsx` | **REFACTOR**: Desktop inclui sidebar; mobile mantém full-screen |
| 1.6 | `src/components/layout/UserCard.tsx` | **NOVO**: Card do usuário no footer da sidebar (avatar + nome + plano) |

**Design da Sidebar — Modo Expandido (xl: 1280px+):**
```
┌──────────────────────┐
│  [logo] Elite Español │ ← Logo mark + texto italic serif, orange
│                       │
│  ▪ Dashboard          │ ← gray-400, hover:bg-white/5
│  ▪ Lições             │
│  ▪ Tutor IA           │ ← (renomeado de "Chat")
│  ▪ Progresso  ◄────  │ ← active: bg-orange/10, text orange, left border
│  ▪ Agenda             │
│                       │
│ ──────────────────── │
│ [Avatar] Joel Santos  │ ← User card, premium badge
│          Plano Premium│
└──────────────────────┘
```

**Design da Sidebar — Modo Colapsado (lg: 1024-1279px):**
```
┌────────┐
│ [logo] │ ← Logo mark only
│        │
│  [🏠]  │ ← Icon only, tooltip on hover
│  [📖]  │
│  [🎙]  │
│  [📊]  │ ← active: orange bg
│  [📅]  │
│        │
│ ────── │
│ [👤]   │ ← Avatar only
└────────┘
```

**Design do Bottom Nav (Stitch reference — tela Dashboard Mobile):**
```
┌─────────────────────────────────────┐
│ HOME   CHAT   LIÇÕES   AGENDA   PROGRESSO │
│  ●                                         │ ← active = orange + glow
└─────────────────────────────────────┘
```

**Verificação:** Navegação funcional mobile + desktop, transições entre rotas OK, sidebar collapse/expand correto no breakpoint lg.

---

### Fase 2: Login Page Redesign
**Agente:** `frontend-specialist`
**Estimativa:** ~0.5 sessão
**Arquivos:** 1-2

| Step | Arquivo | Ação |
|------|---------|------|
| 2.1 | `src/pages/auth/LoginPage.tsx` | **REWRITE visual** (manter lógica auth): dark bg, logo SVG full no topo, form card glass, botão orange |

**Layout Login (Mobile):**
```
┌─────────────────────┐
│    [logo-full.svg]  │ ← Logo i9AI + "Elite Espanhol"
│      ¡Hola!         │
│  Accede a tu        │
│  experiencia premium│
│                     │
│ ┌─────────────────┐ │
│ │ EMAIL           │ │ ← glass card
│ │ CONTRASEÑA      │ │
│ │ [ENTRAR] orange │ │
│ └─────────────────┘ │
└─────────────────────┘
```

**Decisão:** Seção "¿Quién está aprendiendo?" **OMITIDA** (simplificar).

**Verificação:** Login funcional, auth Firebase OK, redirect pós-login OK.

---

### Fase 3: Page-by-Page Content Migration
**Agente:** `frontend-specialist` + `ux-researcher` (validação)
**Estimativa:** ~2-3 sessões
**Arquivos:** 15-20

Cada página recebe o tratamento dark premium. A lógica de dados **NÃO muda** — apenas visual.

#### 3.1 Dashboard (`HomePage.tsx`)
- Dark bg + greeting "¡Hola, {nome}!"
- Badge nível (B1) com glow
- Card CTA "Conversa em Tempo Real" com ícone mic laranja
- Card "Continuar Aprendendo" com próxima lição
- Seção "Deveres" com cards de homework
- Desktop: layout 2-col (CTA esquerda, metas + deveres direita)

#### 3.2 Chat/Aula (`ChatPage.tsx` + components)
- Já é dark — harmonizar cores com novo palette
- Header: nome da aula + timer + badge "sessão ativa"
- Quadro digital (VirtualBoard) com glass card
- Tutor avatar redesenhado
- Barra de legendas + controles
- Desktop: layout split (board esquerda, tutor/chat direita, class notes)

#### 3.3 Lições (`LessonsPage.tsx` + components)
- Mobile: tela full-screen com módulo, reading card dark, botão "Continuar"
- Desktop: sidebar módulos (esquerda) + conteúdo lição (centro) + exercícios (direita)
- Cards de leitura com citações estilizadas (aspas laranja)
- Badge de nível e tempo estimado

#### 3.4 Agenda (`SchedulePage.tsx`)
- Mobile: seletor de dias horizontal + timeline vertical com blocos de estudo
- Desktop: calendar grid semanal completo + ações (agendar lição/chat)
- Blocos de estudo com glow border orange
- Toggle notificações push com glass panel

#### 3.5 Progresso (`ProgressPage.tsx` + components)
- Gráfico SVG de fluência (line chart orange gradient)
- Donut chart de habilidades (Speaking/Listening/Grammar)
- Fonemas dominados com glow badges
- Cards de stats (tempo de estudo, streak, palavras, conquistas)
- Desktop: grid 12-col layout

#### 3.6 Perfil (`ProfilePage.tsx`)
- Mobile: avatar + nome + badge premium + form sections (conta, idioma, notificações, privacidade, sair)
- Desktop: sidebar de sub-nav (Perfil e Conta, Idioma e Região, Notificações, etc.) + form à direita
- Botão "Sair da Conta" estilo destructive

**Verificação por página:** Screenshot + snapshot para confirmar layout correto.

---

### Fase 4: Componentes UI Base (Card, Button, Badge, etc.)
**Agente:** `frontend-specialist`
**Estimativa:** ~1 sessão
**Arquivos:** 8-10

| Componente | Ação |
|------------|------|
| `Card.tsx` | Variantes: `default` → glass dark, `elevated` → glow border, `highlight` → orange accent |
| `Button.tsx` | Primary → orange bg, secondary → glass outline, ghost → white/5 hover |
| `Badge.tsx` | Dark bg variants, glow para active/premium |
| `Input.tsx` | Dark bg, border subtle, focus orange |
| `Select.tsx` | Dark dropdown |
| `Modal.tsx` | Glass overlay + glass card |
| `ProgressBar.tsx` | Orange gradient fill |
| `Icon.tsx` | Sem mudança (Material Symbols funciona igual) |
| `EmptyState.tsx` | Dark variant |
| `Skeleton.tsx` | Dark shimmer |

**Nota:** Esta fase pode rodar em **paralelo** com a Fase 3, ou ser feita **antes** para que as páginas já usem os componentes atualizados.

**Estratégia recomendada:** Fazer Fase 4 ANTES da Fase 3, para que ao migrar cada página os componentes base já estejam no tema dark.

---

### Fase 5: Polish & QA
**Agente:** `frontend-specialist` + `ux-researcher`
**Estimativa:** ~0.5 sessão
**Arquivos:** Variados

| Check | Descrição |
|-------|-----------|
| Responsividade | Testar todas as 7 páginas em mobile (375px) + desktop (1440px) |
| Acessibilidade | Contraste WCAG AA no dark theme, focus rings visíveis |
| Transições | Hover states, active states, page transitions suaves |
| Consistency | Espaçamentos, border-radius, sombras uniformes |
| Chat integration | Gemini Live funciona normalmente após redesign |
| Auth flow | Login → redirect → dashboard OK |
| PWA | Manifest icons atualizados com logo mark |
| Performance | Nenhuma regressão de bundle size |

---

## 5. Ordem de Execução Recomendada

```
Fase 0 (Foundation)     ← PRIMEIRO — tokens e fonts
    ↓
Fase 1 (Navigation)     ← Sidebar + BottomNav + AppLayout
    ↓
Fase 4 (UI Components)  ← Card, Button, Badge, Input (base)
    ↓
Fase 2 (Login)           ← Página isolada, fácil validar
    ↓
Fase 3 (Pages)           ← Page-by-page, maior volume
    ↓
Fase 5 (Polish & QA)     ← Final pass
```

**Justificativa:** Foundation → Shell → Components → Pages garante que cada camada subsequente já herda o tema correto, evitando retrabalho.

---

## 6. Arquivos Impactados (Estimativa)

| Categoria | Quantidade | Exemplos |
|-----------|-----------|----------|
| Design tokens | 1 | `globals.css` |
| Layout/Navigation | 5-6 | `Sidebar.tsx`, `BottomNav.tsx`, `AppLayout.tsx`, `UserCard.tsx`, `nav-items.ts` |
| Páginas | 7 | `LoginPage.tsx`, `HomePage.tsx`, `ChatPage.tsx`, `LessonsPage.tsx`, `SchedulePage.tsx`, `ProgressPage.tsx`, `ProfilePage.tsx` |
| Feature components | ~15 | Cards de chat, lesson, progress, homework, etc. |
| UI base | 8-10 | `Card.tsx`, `Button.tsx`, `Badge.tsx`, `Input.tsx`, etc. |
| Assets | 2-3 | `favicon.svg`, `index.html` (fonts), manifest |
| **TOTAL** | ~40 arquivos | |

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Chat quebra após dark theme unificado | Baixa | Chat já é dark — apenas harmonizar cores, não mudar lógica |
| Contraste insuficiente em dark mode | Média | Usar valores do Stitch que já passam WCAG AA |
| Sidebar 320px ocupa espaço demais em telas médias (1024-1280px) | ~~Média~~ **Mitigado** | Sidebar collapsible: 72px em `lg`, 320px em `xl` |
| Perda de estado/lógica durante rewrite visual | Baixa | Manter lógica intacta — só trocar JSX/classes |
| Google Fonts — Playfair Display peso extra | Baixa | Subset pt-BR + wght variable |

---

## 8. O que NÃO muda

- Firebase Auth (email/password) — lógica intacta
- Gemini Live API — zero mudança
- Zustand stores — zero mudança
- Firestore data model — zero mudança
- Roteamento (React Router) — zero mudança
- Cloud Functions — zero mudança
- Service Worker / Push Notifications — zero mudança

---

## 9. Decisões Aprovadas

| # | Decisão | Resposta |
|---|---------|----------|
| 1 | Seção "¿Quién está aprendiendo?" no login | **OMITIR** |
| 2 | Sidebar collapsible em telas médias | **SIM** — 320px em xl (1280px+), 72px em lg (1024-1279px), bottom nav em mobile |
| 3 | Label na navegação | **"Tutor IA"** (substituir "Chat") |
| 4 | Font de headings | **Playfair Display** (substituir Lora) |
| 5 | Ambient light blob | **SIM** — implementar |
| 6 | Chat page desktop | **ADICIONAR sidebar** no desktop (manter full-screen apenas em mobile)

---

## 10. Referência Visual (Screenshots Stitch)

Todos os screenshots foram salvos localmente:

| Tela | Mobile | Desktop |
|------|--------|---------|
| Login | `screen_47984d84...` | `screen_e057c891...` |
| Dashboard | `screen_670541b5...` | `screen_92d54b78...` |
| Aula/Chat | `screen_15875ebe...` | `screen_7c242bcd...` |
| Lições | `screen_a9f6855e...` | `screen_bca3d7e2...` |
| Agenda | `screen_fe1baf92...` | `screen_407e7eac...` |
| Progresso | `screen_66c305f8...` | `screen_0d516e97...` |
| Perfil | `screen_7cb86683...` | `screen_ed69caaa...` |
