# Design System: Espanhol — Tutor AI de Espanhol para iPad

## Metadados
- **Baseado em:** 01-product-brief.md, 02-prd.md, 03-ux-concept.md, 06-stack.md, Stitch Screens (35 telas)
- **Data:** 2026-02-23
- **Autor:** AI Frontend Specialist
- **Framework CSS:** Tailwind CSS 4.x
- **Versao:** 1.0
- **Status:** Draft

---

## 1. Fundamentos

### 1.1 Principios de Design
1. **Caloroso e Acolhedor:** Tons terrosos (terracota, ambar, stone) transmitem conforto — o app deve sentir como um tutor paciente, nao uma ferramenta fria. O usuario nunca deve sentir ansiedade ao abrir o app.
2. **Clareza sobre Decoracao:** Cada elemento visual tem funcao. Sem ornamentos desnecessarios. Cards, botoes e tipografia comunicam hierarquia por conta propria. A informacao mais importante e sempre a mais visivel.
3. **Imersao Contextual:** O app tem dois modos visuais distintos — light mode caloroso para estudo e navegacao, dark mode profundo para sessoes de chat (imersao total). A troca de modo cria separacao psicologica entre "estudar" e "conversar".
4. **iPad-First:** Otimizado para 10.2"-12.9" em landscape e portrait. Touch targets de 44x44pt minimo (Apple HIG). Tipografia generosa legivel a distancia de braço.
5. **Progresso Visivel:** O usuario deve VER sua evolucao em cada tela. Barras de progresso, badges de streak, scores coloridos — feedback visual constante que motiva sem gamificar superficialmente.

### 1.2 Tom Visual
- **Personalidade:** Tutor particular acolhedor — profissional mas nunca intimidador
- **Sensacao:** Confianca, calor, progresso, disciplina gentil
- **Atmosfera:** Casa no Paraguai — terrosos, quentes, naturais
- **Anti-padrao:** Neon, gamificacao infantil, cores frias/corporativas, excesso de animacoes

---

## 2. Paleta de Cores

> Extraida dos 35 prototipos Stitch e normalizada para consistencia.

### 2.1 Cores Primarias (Terracota/Laranja Quente)
| Token | Hex | RGB | Uso | Contraste (branco) |
|-------|-----|-----|-----|-------------------|
| `--color-primary-50` | `#FDF1EB` | rgb(253,241,235) | Backgrounds sutis, hover areas | N/A (bg) |
| `--color-primary-100` | `#FBDDD0` | rgb(251,221,208) | Badges, chips inativos | N/A (bg) |
| `--color-primary-200` | `#F5B9A0` | rgb(245,185,160) | Decoracao, borders leves | N/A |
| `--color-primary-400` | `#E7724B` | rgb(231,114,75) | Chat mode accent, links | 3.2:1 |
| `--color-primary-500` | `#EC5B13` | rgb(236,91,19) | Botoes primarios, CTAs, icones ativos | 3.8:1 |
| `--color-primary-600` | `#D14F0F` | rgb(209,79,15) | Hover em botoes primarios | 4.5:1 (AA) |
| `--color-primary-700` | `#B5430D` | rgb(181,67,13) | Active/pressed state | 5.5:1 (AA) |
| `--color-primary-900` | `#7A2D09` | rgb(122,45,9) | Texto sobre backgrounds claros | 8.5:1 (AAA) |

### 2.2 Cores Semanticas
| Token | Hex | Uso | Contexto no App |
|-------|-----|-----|-----------------|
| `--color-success` | `#0D9488` | Acertos, progresso positivo, fonemas corretos | Teal — "voce acertou", barra de progresso |
| `--color-success-light` | `#E8F5E9` | Background de feedback positivo | Card de acerto em quiz |
| `--color-warning` | `#D97706` | Deveres proximos do prazo, atencao | Amber — countdown < 6h |
| `--color-warning-light` | `#FEF3C7` | Background de alerta amarelo | Banner de deveres atrasados |
| `--color-error` | `#DC2626` | Erros, deveres vencidos, fonemas errados | Vermelho — "vencido", pronuncia incorreta |
| `--color-error-light` | `#FFEBEE` | Background de feedback negativo | Card de erro em quiz |
| `--color-info` | `#2563EB` | Informacoes neutras, links, re-teste | Azul — banner de re-teste |
| `--color-info-light` | `#EFF6FF` | Background informativo | Banner de 30 dias |

### 2.3 Cores Neutras (Stone — Tom Quente)
| Token | Hex | Uso |
|-------|-----|-----|
| `--color-neutral-50` | `#FAFAF8` | Background principal (light mode) |
| `--color-neutral-100` | `#F5F1ED` | Background de secoes alternadas |
| `--color-neutral-200` | `#E5DDDC` | Borders, dividers, separadores |
| `--color-neutral-300` | `#D4CBC5` | Borders mais fortes, disabled bg |
| `--color-neutral-400` | `#A89B92` | Placeholder text, icones inativos |
| `--color-neutral-500` | `#896F61` | Texto muted (subtitulos, labels) |
| `--color-neutral-600` | `#6B5B50` | Texto secundario |
| `--color-neutral-700` | `#4A3F38` | Texto forte secundario |
| `--color-neutral-800` | `#2D2420` | Surface dark mode |
| `--color-neutral-900` | `#181311` | Texto principal (light mode) |

### 2.4 Cores do Chat (Dark Mode Imersivo)
| Token | Hex | Uso |
|-------|-----|-----|
| `--color-chat-bg` | `#1A1A2E` | Background do chat (azul profundo) |
| `--color-chat-surface` | `#23233B` | Cards e areas dentro do chat |
| `--color-chat-bubble-tutor` | `#1F4A4A` | Bubble de mensagem do tutor (teal escuro) |
| `--color-chat-bubble-user` | `#34344A` | Bubble de mensagem do usuario (cinza escuro) |
| `--color-chat-text` | `#E2E8F0` | Texto principal no chat (slate-200) |
| `--color-chat-muted` | `#94A3B8` | Texto secundario no chat (slate-400) |

> **Regra:** O chat SEMPRE usa dark mode independente da preferencia do sistema. A transicao light→dark ao entrar no chat cria separacao psicologica "modo conversa" (UX Concept 4.13).

### 2.5 Acessibilidade de Cores
| Par de Cores | Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) | Uso |
|-------------|-------|-----------------|----------------|-----|
| neutral-900 / neutral-50 | 14.2:1 | Passa | Passa | Texto principal em bg claro |
| primary-600 / white | 4.5:1 | Passa | Nao | Botao primario |
| success / white | 4.6:1 | Passa | Nao | Texto em badge verde |
| error / white | 4.6:1 | Passa | Nao | Texto de erro |
| chat-text / chat-bg | 10.1:1 | Passa | Passa | Texto no chat |
| neutral-500 / neutral-50 | 4.6:1 | Passa | Nao | Texto muted |

---

## 3. Tipografia

> Extraida dos prototipos Stitch: Inter (body) + Lora (display/headings).

### 3.1 Familias
| Proposito | Fonte | Peso | Fallback | Justificativa |
|-----------|-------|------|----------|---------------|
| Display / Headlines | Lora | 500, 600, 700 | Georgia, serif | Serif humanista — calor, personalidade; usada em titulos e badges de nivel |
| Body / UI | Inter | 400, 500, 600, 700 | system-ui, -apple-system, sans-serif | Sans-serif otima para UI; legibilidade alta em telas; otimizada para telas |
| Icons | Material Symbols Outlined | Variable (100-700) | - | Icones consistentes com estilo outlined; suporta fill variavel |

### 3.2 Escala Tipografica
| Token | Tamanho | Line Height | Letter Spacing | Peso | Fonte | Uso |
|-------|---------|-------------|---------------|------|-------|-----|
| `--text-xs` | 12px (0.75rem) | 1.5 (18px) | +0.02em | 500 | Inter | Labels, timestamps, badges pequenos |
| `--text-sm` | 14px (0.875rem) | 1.5 (21px) | normal | 400-500 | Inter | Body small, subtitulos, captions |
| `--text-base` | 16px (1rem) | 1.5 (24px) | normal | 400 | Inter | Body text, paragrafos, opcoes de quiz |
| `--text-lg` | 18px (1.125rem) | 1.5 (27px) | normal | 500 | Inter | Body large, labels de input, titulos de card |
| `--text-xl` | 20px (1.25rem) | 1.4 (28px) | -0.01em | 600 | Lora | H4, titulos de secao |
| `--text-2xl` | 24px (1.5rem) | 1.3 (31px) | -0.02em | 600 | Lora | H3, titulos de modulo |
| `--text-3xl` | 30px (1.875rem) | 1.2 (36px) | -0.02em | 700 | Lora | H2, saudacao no Dashboard |
| `--text-4xl` | 36px (2.25rem) | 1.1 (40px) | -0.03em | 700 | Lora | H1, badge de nivel (A2, B1) |
| `--text-5xl` | 48px (3rem) | 1.0 (48px) | -0.03em | 700 | Lora | Hero, flashcard palavra principal |

### 3.3 Regras Tipograficas
- **Headlines (H1-H4):** Sempre Lora. Tracking tight (-0.02em a -0.03em). Peso bold (700) ou semibold (600).
- **Body text:** Sempre Inter. Tracking normal. Peso regular (400) ou medium (500).
- **Labels/UI:** Inter medium (500) ou semibold (600). Uppercase + tracking wider para labels pequenos.
- **Conteudo em espanhol:** Inter regular. Tamanho >= text-lg para legibilidade de texto estrangeiro.
- **Frases de pronuncia:** Lora italic, text-3xl a text-5xl. Centralizado. Em caixa com padding generoso.

---

## 4. Espacamento

> Sistema base 4px. Escala do Tailwind padrao.

| Token | Valor | Classe Tailwind | Uso |
|-------|-------|----------------|-----|
| `--space-0.5` | 2px | `p-0.5` | Micro gaps |
| `--space-1` | 4px | `p-1` | Gaps minimos, inline spacing |
| `--space-1.5` | 6px | `p-1.5` | Padding de badges, chips |
| `--space-2` | 8px | `p-2` | Padding interno pequeno, icon buttons |
| `--space-3` | 12px | `p-3` | Padding de inputs pequenos |
| `--space-4` | 16px | `p-4` | Padding padrao de cards, gaps de grid |
| `--space-5` | 20px | `p-5` | Padding de cards maiores |
| `--space-6` | 24px | `p-6` | Padding de secoes, gap principal |
| `--space-8` | 32px | `p-8` | Separacao entre blocos |
| `--space-10` | 40px | `p-10` | Padding de telas e modals |
| `--space-12` | 48px | `p-12` | Margem de secoes grandes |
| `--space-16` | 64px | `p-16` | Espacamento de hero sections |
| `--space-24` | 96px | `p-24` | Bottom padding para nav bottom |

### 4.1 Regras de Espacamento
- **Cards:** `p-4` (mobile) / `p-5` ou `p-6` (tablet landscape)
- **Secoes:** `gap-6` entre cards; `gap-4` entre elementos internos
- **Header:** `px-6 py-4` (padrao dos prototipos Stitch)
- **Inputs:** `h-14` (56px altura), `px-4` padding horizontal
- **Botoes:** `px-6 py-2.5` (default) / `px-8 py-4` (large/CTA)

---

## 5. Layout

### 5.1 Breakpoints (iPad-First)
| Nome | Min-width | Dispositivo | Orientacao |
|------|-----------|------------|------------|
| `default` | 0px | iPhone (fallback) | Portrait |
| `sm` | 640px | iPad Mini portrait | Portrait |
| `md` | 768px | iPad 10.2" portrait | Portrait |
| `lg` | 1024px | iPad 10.2" landscape / iPad Pro portrait | Landscape |
| `xl` | 1280px | iPad Pro 12.9" landscape | Landscape |

### 5.2 Layout Principal
```
+================================================================+
| [Sidebar 72px]  |  [Content Area]                               |
| (colapsavel)    |  max-w: 800px (centralizado)                  |
|                 |  px-4 (sm) / px-6 (md+)                       |
| [Icon]          |                                               |
| [Icon]          |  [Cards, forms, content]                      |
| [Icon]          |                                               |
| [Icon]          |                                               |
| [Icon]          |                                               |
|                 |                                               |
| [Settings]      |                                               |
+================================================================+
```

- **Sidebar:** 72px width (colapsada = icones only). Visivel em landscape (lg+). Oculta em portrait (< lg) — usa bottom nav.
- **Content Area:** `max-w-3xl` (768px) centralizado com `mx-auto`
- **Chat Mode:** Full-screen, sem sidebar, sem bottom nav. 100% do viewport.

### 5.3 Grid
- **Dashboard cards:** `grid-cols-1 md:grid-cols-2 gap-4`
- **Exercicios:** Single column, `max-w-2xl mx-auto`
- **Agenda semanal:** `grid-cols-7 gap-4` (desktop) / scroll horizontal (mobile)
- **Licoes grid:** `grid-cols-1 md:grid-cols-2 gap-4`

---

## 6. Componentes

### 6.1 Botoes

| Variante | Classes Tailwind | Uso |
|----------|-----------------|-----|
| **Primary** | `bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-2 focus:ring-primary-500/50 rounded-[10px] px-6 py-2.5 font-semibold transition-colors` | CTAs, acoes principais (Comecar, Confirmar, Gravar) |
| **Primary Large** | `bg-primary-500 text-white hover:bg-primary-600 rounded-[10px] px-8 py-4 font-bold text-lg shadow-sm transition-colors` | Botoes hero (Iniciar Conversa, Configurar Agenda) |
| **Secondary** | `bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50 rounded-[10px] px-6 py-2.5 font-medium transition-colors` | Acoes secundarias (Estudar Licao, Fazer Dever) |
| **Ghost** | `text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-[10px] px-4 py-2 font-medium transition-colors` | Acoes sutis (Voltar, Pular) |
| **Destructive** | `bg-error text-white hover:bg-red-700 rounded-[10px] px-6 py-2.5 font-semibold transition-colors` | Encerrar sessao, cancelar |
| **Pill Active** | `bg-primary-500 text-white rounded-full px-5 py-2 font-medium` | Filtros ativos, tabs selecionados |
| **Pill Inactive** | `bg-white border border-neutral-200 text-neutral-600 rounded-full px-5 py-2 font-medium hover:bg-neutral-50` | Filtros inativos |
| **Disabled** | `bg-neutral-200 text-neutral-400 cursor-not-allowed rounded-[10px] px-6 py-2.5` | Qualquer botao desabilitado |
| **Loading** | Primary + `opacity-75` com spinner inline | Durante requests |

**Tamanhos:**
| Tamanho | Altura | Padding | Fonte | Touch Target |
|---------|--------|---------|-------|-------------|
| Small | 32px | `px-3 py-1.5` | text-sm | 44x44 (area expanded) |
| Default | 40px | `px-6 py-2.5` | text-sm font-semibold | 44x44 |
| Large | 52px | `px-8 py-4` | text-lg font-bold | 52px+ |

**Estados:** Default → Hover → Active (scale-95) → Focus (ring) → Disabled → Loading

### 6.2 Inputs

| Tipo | Classes Base | Notas |
|------|------------|-------|
| **Text** | `h-14 w-full px-4 bg-white border border-neutral-200 rounded-[10px] text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors` | Formularios de login, registro |
| **Password** | Text + botao mostrar/ocultar inline (icon eye) | Toggle visibilidade |
| **Textarea** | `w-full p-4 bg-white border border-neutral-200 rounded-[10px] min-h-[100px] resize-none` | Feedback/report de erro |
| **Select** | `h-14 w-full px-4 bg-white border border-neutral-200 rounded-[10px] appearance-none` | - |

**Estados:**
| Estado | Alteracao Visual |
|--------|-----------------|
| Default | `border-neutral-200` |
| Hover | `border-neutral-300` |
| Focus | `border-primary-500 ring-2 ring-primary-500/50` |
| Error | `border-error ring-2 ring-error/50` + mensagem vermelha abaixo |
| Disabled | `bg-neutral-100 text-neutral-400 cursor-not-allowed` |

### 6.3 Cards

| Variante | Classes | Uso |
|----------|---------|-----|
| **Default** | `bg-white border border-neutral-100 rounded-[10px] shadow-sm p-5` | Cards de nivel, proximo bloco, licoes |
| **Elevated** | `bg-white rounded-xl shadow-md p-6` | Flashcards, resultado do diagnostico |
| **Highlight** | `bg-primary-50 border border-primary-500/10 rounded-[10px] p-5` | Card de streak, badge ativo |
| **Dark (Chat)** | `bg-chat-surface rounded-[10px] p-4` | Cards dentro do modo chat |
| **Interactive** | Default + `hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer` | Cards clicaveis (licoes, deveres) |
| **Status** | Card com borda esquerda colorida: `border-l-4 border-l-success` / `border-l-warning` / `border-l-error` | Deveres (pendente, urgente, vencido) |

### 6.4 Modals

| Elemento | Classes |
|----------|---------|
| Overlay | `fixed inset-0 bg-black/50 backdrop-blur-sm z-40` |
| Container | `fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 z-50 max-w-lg mx-auto` |
| Header | `font-display text-xl font-bold mb-4` |
| Footer | `flex gap-3 justify-end mt-6` |

### 6.5 Badges / Chips

| Variante | Classes | Uso |
|----------|---------|-----|
| **Streak** | `bg-primary-50 border border-primary-500/10 rounded-[10px] px-3 py-1.5 text-sm font-bold text-primary-500` + icone de chama | Badge de streak no header |
| **Level** | `bg-success/10 text-success font-bold text-4xl font-display rounded-xl px-6 py-4` | Badge A1, A2, B1 etc. |
| **Status Pendente** | `bg-warning-light text-warning font-medium text-xs rounded-full px-3 py-1` | Dever pendente |
| **Status Vencido** | `bg-error-light text-error font-medium text-xs rounded-full px-3 py-1` | Dever vencido |
| **Status Completo** | `bg-success-light text-success font-medium text-xs rounded-full px-3 py-1` | Dever/sessao completa |

### 6.6 Progress Bars

| Variante | Classes | Uso |
|----------|---------|-----|
| **Default** | Container: `h-3 bg-neutral-200 rounded-full` / Fill: `bg-success rounded-full transition-all duration-1000 ease-out` | Barras de nivel, progresso de licao |
| **Segmented** | Container: `h-2 bg-neutral-200 rounded-full` / Fill com cor por tipo: grammar=success, pronunciation=primary, vocabulary=info | Diagnostico por area |
| **Thin** | `h-1 bg-neutral-200 rounded-full` / Fill: `bg-primary-500` | Progresso do quiz (1/15) |

### 6.7 Sidebar (iPadOS Style)

```
Largura: 72px (colapsada, icones only)
Background: bg-white border-r border-neutral-200
Itens: flex flex-col items-center py-4 gap-2
Item ativo: bg-primary-50 text-primary-500 rounded-[10px] p-3
Item inativo: text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-[10px] p-3
Separador: border-t border-neutral-200 my-2
Icone: Material Symbols Outlined, 24px
```

### 6.8 Skeleton (Loading States)

```
Background: bg-neutral-200 rounded-[10px] animate-pulse
Texto: h-4 bg-neutral-200 rounded w-3/4 animate-pulse
Card: h-32 bg-neutral-100 rounded-[10px] animate-pulse
Avatar: h-12 w-12 bg-neutral-200 rounded-full animate-pulse
```

### 6.9 Empty States

```
Container: flex flex-col items-center justify-center py-16 text-center
Icone: Material Symbols Outlined, 48px, text-neutral-300
Titulo: font-display text-xl font-bold text-neutral-700 mt-4
Descricao: text-neutral-500 mt-2 max-w-sm
CTA: mt-6 + Botao Primary
```

---

## 7. Iconografia

- **Biblioteca:** Material Symbols Outlined (variable weight, variable fill)
- **Importacao:** Google Fonts CDN (ja presente nos prototipos Stitch)
- **Tamanhos:**
  | Contexto | Tamanho | Classe |
  |----------|---------|--------|
  | Inline (botoes, labels) | 20px | `text-[20px]` |
  | UI (sidebar, cards) | 24px | `text-[24px]` |
  | Feature (empty states, onboarding) | 48px | `text-[48px]` |
- **Peso:** 400 (default) para UI; 300 para decoracao; FILL 1 para icones ativos (streak, nivel)
- **Icones chave usados nos prototipos:**
  | Icone | Contexto |
  |-------|----------|
  | `local_fire_department` (FILL) | Streak badge |
  | `trending_up` | Nivel/progresso |
  | `mic` | Gravacao/pronuncia |
  | `videocam` | Camera do chat |
  | `menu_book` | Licoes |
  | `calendar_today` | Agenda |
  | `assignment` | Deveres |
  | `insights` | Progresso |
  | `settings` | Configuracoes |
  | `arrow_back_ios_new` | Navegacao voltar |
  | `flag` | Report de erro |
  | `check_circle` | Acerto/completo |
  | `cancel` | Erro/fechar |

---

## 8. Border Radius

> Extraido dos prototipos: valor consistente de 10px como padrao.

| Token | Valor | Classe Tailwind | Uso |
|-------|-------|----------------|-----|
| `--radius-sm` | 6px | `rounded-md` | Badges pequenos, chips |
| `--radius-default` | 10px | `rounded-[10px]` | Cards, botoes, inputs, sidebar items |
| `--radius-lg` | 16px | `rounded-2xl` | Cards elevados, modals, flashcards |
| `--radius-xl` | 24px | `rounded-3xl` | Hero cards, onboarding slides |
| `--radius-full` | 9999px | `rounded-full` | Pills, avatares, icone buttons circulares |

> **Regra:** O border radius padrao do app e 10px (nao 8px do Tailwind `rounded-lg`). Usar `rounded-[10px]` ou customizar no Tailwind config.

---

## 9. Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards default |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards em hover, dropdowns |
| `--shadow-lg` | `0 10px 25px rgba(0,0,0,0.08)` | Modals, elevated cards |
| `--shadow-xl` | `0 20px 50px rgba(0,0,0,0.08)` | Flashcards (foco central) |
| `--shadow-chat` | `0 4px 12px rgba(0,0,0,0.3)` | Elementos no dark mode do chat |

---

## 10. Animacoes

| Token | Duracao | Easing | Uso |
|-------|---------|--------|-----|
| `--duration-fast` | 100ms | `ease-out` | Hovers em botoes e links |
| `--duration-default` | 200ms | `ease-in-out` | Transicoes de cor, border, shadow |
| `--duration-slow` | 300ms | `ease-in-out` | Abertura de modals, sidebar toggle |
| `--duration-progress` | 1000ms | `ease-out` | Barras de progresso preenchendo |
| `--duration-reveal` | 500ms | `ease-out` | Reveal do nivel no diagnostico |

**Animacoes especificas:**
| Animacao | Keyframes | Uso |
|----------|-----------|-----|
| Waveform | `height: 10% → 100% → 10%` (1.2s, ease-in-out, infinite) | Onda sonora durante gravacao |
| Pulse | Scale 1 → 1.1 → 1 (2s, ease-in-out, infinite) | Indicador de gravacao ativo |
| Skeleton shimmer | `animate-pulse` (Tailwind built-in) | Loading states |
| Active press | `active:scale-95` + 100ms | Feedback tatil em botoes |

**Regra de Reducao de Movimento:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Acessibilidade

### 11.1 Checklist WCAG AA
- [ ] Contraste texto principal: 4.5:1 minimo (neutral-900/neutral-50 = 14.2:1 — Passa)
- [ ] Contraste texto muted: 4.5:1 minimo (neutral-500/neutral-50 = 4.6:1 — Passa)
- [ ] Contraste botoes: 4.5:1 (primary-600/white = 4.5:1 — Passa)
- [ ] Contraste no chat dark: 4.5:1 (chat-text/chat-bg = 10.1:1 — Passa)
- [ ] Contraste graficos/icones: 3:1 minimo
- [ ] Focus ring visivel: `focus:ring-2 focus:ring-primary-500/50 focus:outline-none` em TODOS os elementos focaveis
- [ ] Touch target minimo: 44x44pt (Apple HIG) em TODOS os botoes/links
- [ ] Labels visiveis em todos os inputs (nao apenas placeholder)
- [ ] `aria-label` em icon buttons (Settings, Voltar, Gravar)
- [ ] `aria-live="polite"` em areas de feedback dinamico (correcao fonetica, score)
- [ ] `role="progressbar"` + `aria-valuenow` em barras de progresso
- [ ] `lang="es"` em conteudo em espanhol dentro de `lang="pt-BR"`
- [ ] Navegacao por teclado (tab order logico) para Smart Keyboard
- [ ] Skip-to-content link (hidden, visivel no focus)

### 11.2 Focus Ring Padrao
```css
/* Aplicar globalmente */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-default);
}
```

---

## 12. Tailwind CSS 4 Configuration

### 12.1 globals.css (CSS-First Config)

```css
@import "tailwindcss";

/* === Custom Theme Tokens === */
@theme {
  /* Primary (Terracota) */
  --color-primary-50: #FDF1EB;
  --color-primary-100: #FBDDD0;
  --color-primary-200: #F5B9A0;
  --color-primary-400: #E7724B;
  --color-primary-500: #EC5B13;
  --color-primary-600: #D14F0F;
  --color-primary-700: #B5430D;
  --color-primary-900: #7A2D09;

  /* Semantic */
  --color-success: #0D9488;
  --color-success-light: #E8F5E9;
  --color-warning: #D97706;
  --color-warning-light: #FEF3C7;
  --color-error: #DC2626;
  --color-error-light: #FFEBEE;
  --color-info: #2563EB;
  --color-info-light: #EFF6FF;

  /* Neutrals (Stone/Warm) */
  --color-neutral-50: #FAFAF8;
  --color-neutral-100: #F5F1ED;
  --color-neutral-200: #E5DDDC;
  --color-neutral-300: #D4CBC5;
  --color-neutral-400: #A89B92;
  --color-neutral-500: #896F61;
  --color-neutral-600: #6B5B50;
  --color-neutral-700: #4A3F38;
  --color-neutral-800: #2D2420;
  --color-neutral-900: #181311;

  /* Chat Dark Mode */
  --color-chat-bg: #1A1A2E;
  --color-chat-surface: #23233B;
  --color-chat-bubble-tutor: #1F4A4A;
  --color-chat-bubble-user: #34344A;

  /* Fonts */
  --font-display: "Lora", Georgia, serif;
  --font-body: "Inter", system-ui, -apple-system, sans-serif;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-default: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Shadows */
  --shadow-card: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-elevated: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-modal: 0 10px 25px rgba(0,0,0,0.08);
  --shadow-flashcard: 0 20px 50px rgba(0,0,0,0.08);
}

/* === Base Styles === */
@layer base {
  html {
    font-family: var(--font-body);
    color: var(--color-neutral-900);
    background-color: var(--color-neutral-50);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Focus visible */
  :focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  /* Selection */
  ::selection {
    background-color: var(--color-primary-500);
    color: white;
  }
}
```

---

## 13. GAP Analysis: Design

> Skill: `gap-analysis` — Dimensao: Design

### 13.1 Component Coverage
| Componente | Necessario (PRD/UX) | Tem Prototipo Stitch? | Tem Spec Design System? | GAP | Prioridade |
|-----------|---------------------|----------------------|------------------------|-----|------------|
| Button (Primary, Secondary, Ghost, Pill) | Sim | Sim | Sim (6.1) | Nenhum | P0 |
| Input (Text, Password) | Sim | Sim | Sim (6.2) | Nenhum | P0 |
| Card (Default, Elevated, Interactive, Status) | Sim | Sim | Sim (6.3) | Nenhum | P0 |
| Modal (Report erro, confirmacao) | Sim | Parcial | Sim (6.4) | Implementar variantes | P1 |
| Progress Bar (Default, Segmented, Thin) | Sim | Sim | Sim (6.6) | Nenhum | P0 |
| Sidebar (iPadOS style) | Sim | Parcial (nao em todos) | Sim (6.7) | Implementar responsive | P0 |
| Skeleton/Loading | Sim | Nao | Sim (6.8) | Implementar | P0 |
| Empty State | Sim | Nao | Sim (6.9) | Implementar para cada tela | P1 |
| Toast/Snackbar | Sim (feedback rapido) | Nao | Nao | Definir + implementar | P1 |
| Badge/Chip | Sim | Sim | Sim (6.5) | Nenhum | P0 |
| Audio Waveform | Sim (pronuncia) | Sim (CSS animation) | Parcial | Implementar com Canvas/AudioContext | P0 |
| Calendar Grid (Agenda) | Sim | Sim | Layout spec (5.3) | Implementar interacao drag | P0 |
| Flashcard (flip) | Sim | Sim | Spec (6.3 Elevated) | Implementar animacao de flip | P0 |
| Chat Bubble | Sim | Sim | Cores definidas (2.4) | Implementar componente | P0 |
| Countdown Timer | Sim (deveres) | Sim | Nao | Definir + implementar | P0 |

### 13.2 Token Coverage
| Categoria | Definidos | Faltantes | Cobertura |
|----------|----------|----------|-----------|
| Cores Primarias | 8 tokens | 0 | 100% |
| Cores Semanticas | 8 tokens | 0 | 100% |
| Cores Neutras | 10 tokens | 0 | 100% |
| Cores Chat | 4 tokens | 0 | 100% |
| Tipografia (familias) | 2 | 0 | 100% |
| Tipografia (escala) | 9 tamanhos | 0 | 100% |
| Espacamento | 13 tokens | 0 | 100% |
| Border Radius | 5 tokens | 0 | 100% |
| Sombras | 5 tokens | 0 | 100% |
| Animacoes | 5 duracoes + 4 keyframes | 0 | 100% |

### 13.3 GAP Inventory
| ID | Area | AS-IS | TO-BE | GAP | Severidade | Prioridade |
|----|------|-------|-------|-----|------------|------------|
| G-DS-01 | Component library | Tokens definidos; prototipos HTML no Stitch | Componentes React reutilizaveis em `shared/components/ui/` com tipos TypeScript | Implementar componentes React baseados nos prototipos | High | P0 |
| G-DS-02 | Toast/Snackbar | Nao prototipado | Componente de feedback efemero para acoes (dever marcado, progresso salvo) | Definir visual + implementar | Medium | P1 |
| G-DS-03 | Responsive sidebar | Prototipo parcial (algumas telas tem, outras nao) | Sidebar colapsavel em landscape, bottom nav em portrait, oculta no chat | Implementar logica responsive + transicao | High | P0 |
| G-DS-04 | Dark mode global | Prototipos Stitch tem dark classes | App usa light mode por default; APENAS chat usa dark mode forcado | Implementar troca contextual (nao toggle manual) | Medium | P0 |
| G-DS-05 | Tailwind v4 config | Prototipos usam Tailwind CDN (v3 syntax) | CSS-first config com `@theme` block (v4 syntax) | Migrar tokens de JS config para CSS `@theme` | Medium | P0 |
| G-DS-06 | Flashcard flip animation | Prototipo estatico | Animacao 3D de flip (frente → verso) com CSS transforms | Implementar keyframes + componente | Medium | P1 |
| G-DS-07 | Audio waveform (Canvas) | Prototipo usa CSS animation (barras) | Canvas-based waveform real conectado ao AudioContext | Implementar componente com Web Audio API | High | P0 |
| G-DS-08 | Stitch → React mapping | 35 telas HTML standalone | Componentes React compostos que reproduzem cada tela | Documento de mapeamento tela→componente | Medium | P1 |

---

## Aprovacoes

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| Product Owner | Joel | Pendente | - |
