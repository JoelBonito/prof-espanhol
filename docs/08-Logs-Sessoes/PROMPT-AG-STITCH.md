# Prompt para Antigravity — Fase 3.5: Visual Mockups via Stitch MCP

> Cole este prompt inteiro no Antigravity/Gemini CLI. Ele contém tudo que o AG precisa para gerar as 24 telas do Stitch de forma autônoma.

---

## Missão

Executar a **Fase 3.5 do workflow /define** do projeto **Espanhol — Tutor AI de Espanhol para iPad (PWA)**. Gerar **TODAS as 24 telas** descritas na Seção 4 do UX Concept como mockups visuais via **Stitch MCP**.

Ao final, criar o documento `docs/01-Planejamento/03.5-visual-mockups.md` com o inventário completo.

---

## Contexto do Projeto

- **Produto:** Espanhol — Tutor AI de Espanhol para iPad (PWA)
- **Público:** Família brasileira no Paraguai (3 personas)
  - **Matheus** (iniciante, universitário, precisa de gramática)
  - **Renata** (intermediária, medicina, precisa de pronúncia médica)
  - **Joel** (avançado, profissional remoto, quer vocabulário utilitário)
- **Dispositivo primário:** iPad (landscape, 2160x1620)
- **Tom:** Acolhedor, sem julgamento, disciplinado mas encorajador. Professor particular paciente.
- **Idioma da UI:** Português brasileiro (conteúdo pedagógico em espanhol)

---

## Regras de Design (OBRIGATÓRIO — aplicar em TODOS os prompts)

### Identidade Visual
- **Tipografia:** Serif pedagógico (Lora ou Merriweather) para conteúdo de estudo (frases em espanhol, explicações, flashcards). Sans-serif (Inter) para toda a UI do app (botões, labels, navegação, headers).
- **Geometria:** Border-radius suave mas não exagerado (8-12px para cards, 6-8px para botões). Não usar 0px sharp nem 24px+ pill.
- **Sidebar iPadOS:** Sidebar vertical colapsável no lado esquerdo com 5 itens (Dashboard, Chat, Lições, Agenda, Progresso) + Configurações na parte inferior. Seguir padrão nativo iPadOS (como Notes, Files, Mail).
- **Dark mode APENAS na tela 4.13 (Chat Session)** — todas as outras telas são light mode.

### Paleta de Cores (direção — NÃO usar valores exatos, interpretar criativamente)
- **Background:** Off-white quente (#fafaf8 ou similar), não branco puro
- **Primária:** Tom quente — terracota, âmbar profundo ou cobre (NÃO azul, NÃO roxo, NÃO verde genérico)
- **Secundária:** Sage/oliva ou teal escuro como contraste
- **Texto primário:** Quase preto quente (#1a1a1a ou #2d2d2d)
- **Texto secundário:** Gray quente (#6b6b6b)
- **Sucesso:** Verde esmeralda (não lime)
- **Erro/Urgente:** Vermelho terracota (não vermelho puro)
- **Alerta/Destaque:** Âmbar dourado
- **Dark mode do Chat (4.13 apenas):** Background #1a1a2e ou similar deep charcoal, texto claro

### Anti-Clichês (PROIBIDO em todos os prompts)
- ❌ Roxo/violeta/indigo como cor primária
- ❌ Glassmorphism (blur, frost, transparência)
- ❌ Hero split 50/50 genérico
- ❌ Paleta SaaS genérica (branco + azul + cinza)
- ❌ Gradient backgrounds
- ❌ Rounded blob shapes decorativos
- ❌ "Clean, modern, minimal" como descrição de estilo
- ❌ Ícones genéricos sem personalidade

### Padrões de Layout
- **iPad landscape** como base (telas amplas, sidebar + conteúdo)
- **Touch targets:** Mínimo 44pt conforme Apple HIG
- **Cards:** Sombra sutil (não drop-shadow forte), borda 1px em cinza claro
- **Status bar:** Incluir para realismo

---

## Processo de Geração

### Passo 1: Verificar/Criar Projeto Stitch

```
1. mcp__stitch__list_projects → procurar projeto "Espanhol — Tutor AI"
2. Se não existir: mcp__stitch__create_project com nome "Espanhol — Tutor AI"
3. Guardar o projectId para todas as gerações
```

### Passo 2: Gerar as 24 Telas

Para cada tela, usar `mcp__stitch__generate_screen_from_text` com os parâmetros indicados.

**IMPORTANTE:** Não gerar prompts genéricos. Cada prompt deve ser detalhado, com layout, elementos, cores, tipografia e mood específicos derivados dos wireframes abaixo.

---

## As 24 Telas — Prompts Stitch

### Classificação e Parâmetros

| Grupo | Telas | Model | Device |
|-------|-------|-------|--------|
| **Telas-chave** | 4.1, 4.2, 4.4-4.6, 4.10, 4.12, 4.13, 4.21, 4.22 | GEMINI_3_PRO | MOBILE + DESKTOP |
| **Telas secundárias** | 4.3, 4.7-4.9, 4.11, 4.14-4.20, 4.23, 4.24 | GEMINI_3_FLASH | MOBILE |

> **Total de gerações:** 10 telas-chave × 2 (mobile+desktop) + 14 secundárias × 1 (mobile) = **34 gerações**

---

### TELA 4.1 — Splash Screen
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Splash screen for "Espanhol", a Spanish language tutor AI app for iPad. Warm, inviting
aesthetic with soft 8px border radius on elements. Color: off-white warm background (#fafaf8),
deep terracotta/copper primary color for branding accent. Layout: perfectly centered content
on a clean warm background. Large app logo "Espanhol" in a serif typeface (Lora) with a
subtle warm copper accent, below it the tagline "Tutor AI de Espanhol" in Inter sans-serif
in warm gray. Below the tagline, a minimal loading spinner in the primary terracotta color,
elegant and thin. Generous whitespace, the screen breathes. No illustrations, just pure
typography and the spinner. Mood: premium, trustworthy, warm first impression. iPad landscape
proportions with status bar. No purple, no glassmorphism, no gradients, no decorative blobs.
```

---

### TELA 4.2 — Welcome (Boas-vindas)
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Welcome screen for "Espanhol" Spanish tutor AI app for iPad, targeting a Brazilian family
in Paraguay. Warm editorial style with 8-12px border radius. Color: off-white warm background
(#fafaf8), deep terracotta/amber primary for CTA button, warm charcoal (#2d2d2d) for headings,
warm gray for secondary text. Layout: iPad landscape — asymmetric split with left side (55%)
showing a warm, humanistic illustration of a family (father, mother, young adult son) casually
studying on an iPad at a dining table with Paraguayan context hints (warm light, tropical
plants visible through window). Right side (45%): app logo "Espanhol" in Lora serif font,
tagline "Seu tutor particular de espanhol com IA" in Inter, a large filled CTA button
"Começar" in deep terracotta/amber with white text, and below it a discrete text link
"Já tenho conta? Entrar" in warm gray. Typography: Lora for logo/headline, Inter for body
and buttons. Mood: welcoming, family-oriented, approachable, warm. 44px touch targets.
No purple, no glassmorphism, no 50/50 split, no generic SaaS palette, no gradient backgrounds.
```

---

### TELA 4.3 — Login / Criar Conta
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Login and registration screen for "Espanhol" Spanish tutor app for iPad. Clean organized
style with 8px border radius. Color: off-white warm background (#fafaf8), terracotta primary
for active tab underline and submit button, warm charcoal for headings, warm gray for labels.
Layout: centered card on warm background. Top: small app logo. Below: tab switcher with
two tabs "Login" and "Criar Conta" with active tab showing terracotta underline. Inside the
card: form fields with visible labels above each — "Nome" (only visible on Criar Conta tab),
"Email", "Senha" with show/hide toggle. Fields have 1px warm gray border, 8px radius. Below
fields: large filled CTA button "Entrar" or "Criar Conta" in terracotta, full-width within
card. Top-left: back arrow icon. Typography: Inter for all text, field labels in warm gray,
input text in charcoal. Form card has subtle shadow. Mood: simple, trustworthy, fast.
iPad landscape with generous whitespace around the centered form card. No purple, no
glassmorphism, no split layout.
```

---

### TELA 4.4 — Onboarding Slide 1: "O que é o Espanhol"
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Onboarding screen (step 1 of 3) for "Espanhol" Spanish tutor AI app for iPad. Warm editorial
style with 10px border radius. Color: off-white warm background, terracotta/amber accents,
charcoal headings. Layout: iPad landscape — left side (45%) has a warm illustration of an
iPad showing an AI tutor character speaking, friendly and non-threatening, with warm tones.
Right side (55%): heading "O que é o Espanhol?" in Lora serif, large and bold. Below: body
text in Inter "Seu tutor particular de espanhol com inteligência artificial. Ele vê, ouve
e conversa com você em tempo real — sem julgamento, sem vergonha." in warm gray. At bottom
center: 3 dots progress indicator (first dot active in terracotta, others in light gray).
Below dots: filled CTA button "Próximo" in terracotta. Top-right corner: discrete text
link "Pular >" in warm gray. Mood: exciting, warm, introducing a new friend. 44px touch
targets. No purple, no glassmorphism, no generic stock illustration style.
```

---

### TELA 4.5 — Onboarding Slide 2: "Como funciona"
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Onboarding screen (step 2 of 3) for "Espanhol" Spanish tutor AI app. Warm editorial style
with 10px border radius. Color: off-white warm background, terracotta accents, charcoal text.
Layout: iPad landscape — left side (45%) illustration showing 3 interconnected steps
represented as icons or mini-scenes (a diagnostic test clipboard, adaptive lessons adjusting,
a fixed calendar with checkmarks), warm color palette. Right side (55%): heading "Como
funciona?" in Lora serif bold. Below: numbered list in Inter — "1. Teste diagnóstico avalia
seu nível em gramática, escuta e pronúncia" / "2. Lições e conversas adaptam ao seu ritmo" /
"3. Agenda fixa + deveres com prazo garantem disciplina". Each number has a small terracotta
circle. Bottom center: 3 dots (second active). CTA "Próximo" in terracotta. Top-right:
"Pular >". Mood: structured, methodical, confidence-building. No purple, no glassmorphism.
```

---

### TELA 4.6 — Onboarding Slide 3: "Vamos começar"
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Onboarding screen (step 3 of 3) for "Espanhol" Spanish tutor AI app. Warm motivational style
with 10px border radius. Color: off-white warm background, terracotta/amber primary. Layout:
iPad landscape — left side (45%) warm illustration of a confident person speaking Spanish with
a speech bubble, looking relaxed and happy, warm light setting. Right side (55%): heading
"Vamos começar!" in Lora serif bold, large and energetic. Body: "Primeiro, vamos descobrir
seu nível de espanhol. O teste dura cerca de 15 minutos e avalia: gramática, compreensão e
pronúncia." in Inter. Bottom: 3 dots (third active). Larger CTA button "Começar Teste" in
terracotta, slightly bigger than previous slides to signal finality. No "Pular" link on this
slide. Mood: motivational, empowering, the starting line. No purple, no glassmorphism.
```

---

### TELA 4.7 — Diagnóstico: Gramática
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Diagnostic test grammar section for "Espanhol" tutor app on iPad. Clean academic style with
8px border radius. Color: off-white warm background, terracotta for progress bar fill and
selected option highlight, charcoal for text, warm gray for secondary. Layout: iPad landscape.
Top bar: "Teste Diagnóstico" left-aligned, "Seção 1 de 3: Gramática" right-aligned. Below:
horizontal progress bar (terracotta fill, 7/15 = 47%). Main content card centered: "Questão
7 de 15" label, then the question in Lora serif: 'Complete la frase: "Ayer nosotros _______
al supermercado."' Below: 2x2 grid of answer option buttons (A through D) with 1px borders,
8px radius, each containing the Spanish text. Unselected = white with gray border. One option
could show selected state with terracotta border and light terracotta background. Bottom-right:
"Próximo >>" button, disabled state (subtle). Typography: Lora for Spanish content/questions,
Inter for UI elements. Mood: focused, exam-like but not stressful. No purple, no glassmorphism.
```

---

### TELA 4.8 — Diagnóstico: Compreensão Auditiva
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Diagnostic test listening comprehension section for "Espanhol" tutor app on iPad. Clean
academic style with 8px border radius. Color: off-white warm background, terracotta accents.
Layout: iPad landscape. Top bar: "Teste Diagnóstico" + "Seção 2 de 3: Compreensão Auditiva".
Progress bar at 3/5 (60%). Main card: "Áudio 3 de 5" label. Instruction "Ouça o áudio e
responda:" in Inter. Audio player widget: rounded rectangle with play button triangle, waveform
progress bar in terracotta, timestamp "01:23". Below player: text link "Ouvir novamente" in
terracotta. Question in Lora serif: "O que a pessoa está pedindo?" Answer options in 2x2 grid:
"A) Direções para o hospital", "B) O preço de um produto", "C) Um remédio na farmácia",
"D) Horário do ônibus". Bottom-right: "Próximo >>" button. Mood: focused, listening-oriented,
calm. No purple, no glassmorphism.
```

---

### TELA 4.9 — Diagnóstico: Pronúncia
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Diagnostic test pronunciation section for "Espanhol" tutor app on iPad. Clean immersive style
with 8px border radius. Color: off-white warm background, terracotta for record button and
active indicators. Layout: iPad landscape. Top bar: "Teste Diagnóstico" + "Seção 3 de 3:
Pronúncia". Progress bar 3/5 (60%). Main card centered: "Frase 3 de 5" label. Instruction
"Leia em voz alta:" in Inter. Large highlighted text box with warm cream background containing
the Spanish phrase in Lora serif: "Buenos días, me gustaría pedir una cita con el doctor para
mañana." Below the phrase box: animated sound waveform visualization (represented as stylized
wave bars in terracotta, showing audio capture). Below waveform: large circular record button
with microphone icon in terracotta/white, labeled "Gravar". Mood: encouraging, intimate, like
speaking to a patient tutor. No purple, no glassmorphism, no distracting elements.
```

---

### TELA 4.10 — Resultado do Diagnóstico
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Diagnostic test results screen for "Espanhol" tutor app on iPad. Warm celebratory editorial
style with 10px border radius. Color: off-white warm background, terracotta for primary
elements, sage/teal for score bars, amber for highlights. Layout: iPad landscape — two-column
layout. Left column (45%): large level badge centered — a prominent rounded square showing
"A2" in large Lora serif with "Pré-Intermediário" below. Descriptive text: "Você entende o
básico mas precisa praticar fala e escuta." Right column (55%): "Detalhes por Área" header.
Three horizontal progress bars — Gramática: 72/100 (teal fill), Compreensão: 65/100 (teal),
Pronúncia: 58/100 (amber fill, indicating weakness). Below bars: card "Fonemas a trabalhar:"
listing "rr (vibrante múltipla)", "ll (lateral palatal)", "z (interdental)" with small warning
icons. Bottom center: large CTA "Configurar Minha Agenda" in terracotta. Title at top:
"Resultado do Diagnóstico" in Lora serif. Mood: revelatory, encouraging, peak moment.
No purple, no glassmorphism, no negative/punitive visual language.
```

---

### TELA 4.11 — Schedule Setup (Configurar Agenda)
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Weekly schedule setup screen for "Espanhol" tutor app on iPad. Clean organized style with
8px border radius. Color: off-white warm background, terracotta for selected time blocks and
CTA, warm gray for grid lines, light terracotta fill for active blocks. Layout: iPad landscape.
Top: back arrow + "Configurar Agenda" title. Instruction text: "Defina pelo menos 3 blocos de
15min por semana. Arraste nos horários desejados." Main area: 7-column weekly grid (Seg-Dom)
with hourly rows (06:00-21:00). 4 blocks are filled with terracotta color at various times
(Mon 18:00, Tue 08:00, Wed 20:00, Sat 18:00). Empty cells have very light gray background.
Below grid: legend "[filled] = Bloco de estudo (toque para remover)". Counter: "Blocos
definidos: 4/3 (mínimo atingido)" in green text. CTA button "Confirmar Agenda" in terracotta,
enabled. Mood: organized, empowering (the user takes control of their learning schedule).
No purple, no glassmorphism.
```

---

### TELA 4.12 — Dashboard
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Main dashboard hub for "Espanhol" Spanish tutor AI app on iPad. Warm, structured editorial
style with 10px border radius. Color: off-white warm background (#fafaf8), terracotta for
primary CTAs and accents, sage/teal for progress indicators, amber for urgency badges, warm
charcoal for text. Layout: iPad landscape with iPadOS-style collapsible sidebar on left
(~72px collapsed showing icons: home, chat, book, calendar, chart + gear at bottom; expandable
to ~240px showing labels). Main content area: top header row with "Olá, Matheus" greeting in
Lora serif, flame icon streak badge "7 dias" and gear icon. Below header: two cards side by
side — left card "Nível atual: A2 Pré-intermediário" with a teal horizontal progress bar at
65%, right card "Próximo bloco: Hoje, 18:00 — Gramática, em 2h 15min" with amber clock icon.
Below: "Deveres pendentes (2)" section with two list items showing urgency badges (red "!" for
urgent, neutral for normal) with "Fazer >" links. Below: two action cards side by side — left
"Iniciar Conversa" with microphone icon in terracotta, right "Estudar Lição" with book icon.
Bottom: subtle banner "Re-teste! 30 dias desde último teste" in soft blue. Typography: Lora
for greeting and section titles, Inter for everything else. Mood: organized, warm, clear
next-action. 44px touch targets. No purple, no glassmorphism, no gradient backgrounds.
```

---

### TELA 4.13 — Chat Session (Voz + Câmera) — DARK MODE
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Live chat session screen for "Espanhol" Spanish tutor AI app on iPad. DARK MODE — immersive
design with deep charcoal background (#1a1a2e). This is the core feature: voice + camera
conversation with AI tutor. Warm dark palette with terracotta/amber accents for active states.
Layout: iPad landscape, FULL SCREEN (no sidebar — it auto-collapses for immersion). Top bar:
"< Sair" back button (muted), "Chat com Tutor" centered, session timer "03:45 / 30:00" and
a flag icon for reporting. Main area split: left (60%) shows a large friendly AI tutor avatar
placeholder (warm, non-threatening face or abstract representation) with subtitle "Tutor está
falando..." — right (40%) top corner has a small PiP rectangle showing "Video do usuário
(câmera)" with rounded corners, below it info badges "Tema: Consulta médica" and "Nível: B1".
Middle section: conversation transcript blocks — tutor message in a dark blue/teal bubble:
"Buenos días, doctora. Tengo un dolor fuerte en el pecho desde ayer." Student message in a
dark gray bubble: "Buenos días. Vamos a hacerle unos exámenes." Below: phonetic correction
card with amber/orange background: "[!] Correção: 'exámenes' → pronuncie /ek-SA-me-nes/ —
Você disse: /e-xa-ME-nes/ [Repetir palavra]". Bottom: animated sound waveform in terracotta
"ouvindo...", and two buttons — "Falar" (large terracotta circle with mic icon) and "Encerrar"
(muted secondary button). Spanish text in Lora serif, UI in Inter. Mood: intimate, immersive,
like a private tutoring room at night. No purple, no glassmorphism.
```

---

### TELA 4.14 — Lista de Lições
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Lesson list screen for "Espanhol" tutor app on iPad. Clean organized style with 8px border
radius. Color: off-white warm background, terracotta for recommended module highlight, sage
green for completed badges, warm gray for locked modules. Layout: iPad landscape with sidebar
visible. Header: "< Dashboard" + "Lições" title. Filter chips below header: "Todos" (active
with terracotta underline), "Gramática", "Vocabulário", "Conversação". Main area: 2-column
grid of module cards. Card 1: green checkmark icon, "Módulo 1 — Verbos no presente",
"Score: 82/100", "Concluído" badge. Card 2: green check, "Módulo 2 — Artigos e gênero",
"Score: 75/100", "Concluído". Card 3 (HIGHLIGHTED): arrow icon, "Módulo 3 — Passado simples",
"Recomendado pelo Adapter", terracotta border, "Iniciar" button in terracotta. Card 4: lock
icon, "Módulo 4 — Subjuntivo básico", "Requer: Módulo 3", grayed out. Cards 5-6: also locked.
Bottom: sidebar navigation echoed. Typography: Inter for all. Mood: structured, motivating
progression path. No purple, no glassmorphism.
```

---

### TELA 4.15 — Módulo da Lição
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Lesson module content screen for "Espanhol" tutor app on iPad. Warm academic style with 8px
border radius. Color: off-white warm background, terracotta for progress bar and CTA, charcoal
for headings. Layout: iPad landscape. Header: "< Lições" back, "Módulo 3: Passado Simples"
title, "Bloco 2/4" indicator. Below: progress bar at 60% in terracotta. Main content card:
heading in Lora serif "Pretérito Indefinido: Verbos Regulares". Body text in Inter explaining
the concept in Spanish. Inside the card, a conjugation table with warm cream background: verb
"HABLAR" conjugated (yo hablé, tú hablaste, él habló, nosotros hablamos, vosotros hablasteis,
ellos hablaron) with verb endings highlighted in terracotta. Below table: speaker icon with
"Ouvir explicação da IA" text link in terracotta. Bottom: CTA button "Próximo: Exercício"
in terracotta. The pedagogical content (Spanish text) uses Lora serif, UI uses Inter. Mood:
studious, clear, academic but accessible. No purple, no glassmorphism.
```

---

### TELA 4.16 — Exercício Flashcard
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Flashcard exercise screen for "Espanhol" tutor app on iPad. Warm interactive style with 12px
border radius on the card. Color: off-white warm background, terracotta accents, the flashcard
itself has a warm cream (#fdf8f0) background with subtle shadow. Layout: iPad landscape.
Header: "< Módulo" back, "Flashcards" title, "Card 3/8" counter. Center: large flashcard
taking ~60% of screen height. Front of card showing Spanish phrase in Lora serif large text:
"Ayer hablé con mi vecino." Below the text, subtle instruction "Toque para virar" in warm
gray Inter. Below the card: two action zones — left side "Não sabia (revisar depois)" with
a muted red-ish arrow left indicator, right side "Sabia (próxima)" with a muted green-ish
arrow right indicator. The card has a slight 3D perspective suggesting it can be flipped.
Generous whitespace. Typography: Lora serif for all Spanish flashcard content, Inter for
UI. Mood: focused, calm, one-task-at-a-time. No purple, no glassmorphism, no distractions.
```

---

### TELA 4.17 — Exercício Quiz
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Quiz exercise screen for "Espanhol" tutor app on iPad. Clean academic style with 8px border
radius. Color: off-white warm background, terracotta for selected option border, emerald green
for correct feedback, warm red for incorrect. Layout: iPad landscape. Header: "< Módulo" +
"Quiz" + "Questão 2/5". Main card: question in Lora serif 'Complete la frase: "Ayer María
_______ al mercado y _______ muchas frutas."' Below: 2x2 grid of option buttons — A) "fue /
compró", B) "fue / compra", C) "iba / compraba", D) "va / compré". Option A is shown as
selected with green background and checkmark (correct state). Below the options: feedback card
with green left border: "Correto! 'fue' e 'compró' são pretérito indefinido porque a ação
foi completada ontem." with a "Próximo >" button at bottom-right. Spanish content in Lora
serif, UI in Inter. Mood: educational, encouraging immediate feedback. No purple, no
glassmorphism.
```

---

### TELA 4.18 — Agenda / Calendário
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Weekly calendar/agenda screen for "Espanhol" tutor app on iPad. Clean organized style with
8px border radius. Color: off-white warm background, emerald green for completed blocks, amber
yellow for next/current block (pulsing), warm red for missed blocks, light gray for future.
Layout: iPad landscape with sidebar. Header: "Minha Agenda" + "Semana de 17-23 Fev" with
left/right arrow navigation. Main: 7-column weekly grid (Seg-Dom) with hourly rows. Several
colored blocks scattered: green "OK" blocks (completed), one amber ">>>" block (next/now),
one red "XX" block (missed), gray "--" blocks (future). Below grid: color legend explaining
each status. Metrics: "Aderência esta semana: 3/4 blocos (75%)" with a small teal progress
bar. Button "Editar Agenda" in terracotta. Bottom sidebar navigation. Typography: Inter for
all. Mood: structured accountability, visual progress. No purple, no glassmorphism.
```

---

### TELA 4.19 — Lista de Deveres
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Homework list screen for "Espanhol" tutor app on iPad. Clean organized style with 8px border
radius. Color: off-white warm background, terracotta for CTAs, warm red for urgent badges,
amber for normal deadlines. Layout: iPad landscape with sidebar. Header: "< Dashboard" +
"Deveres" title. Filter chips: "Pendentes (3)" active, "Concluídos", "Vencidos". Main area:
vertical list of homework cards. Card 1 (URGENT): red "!" badge left side, title "Verbos
irregulares no passado", details "Tipo: Quiz (5 questões) | Prazo: 5h 23min restantes |
Origem: Módulo 3 (score 62/100)", CTA button "Fazer agora" in terracotta. Card 2 (normal):
neutral badge, "Vocabulário do supermercado", "Tipo: Flashcards (10 cards) | Prazo: 1d 12h |
Origem: Chat sessão 15/02", "Fazer agora" button. Card 3 (EXPIRED): red "X" badge, "Artigos
definidos (VENCIDO)", "Venceu em: 16/02 às 14:00 | Será incluído na próxima sessão", grayed
out, no button. Typography: Inter for all. Mood: accountable but not punishing. No purple,
no glassmorphism.
```

---

### TELA 4.20 — Exercício do Dever
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Homework exercise screen for "Espanhol" tutor app on iPad. Clean focused style with 8px
border radius. Color: off-white warm background, terracotta for progress and interactive
elements, amber for the deadline timer. Layout: iPad landscape. Header: "< Deveres" back,
"Dever: Verbos Irregulares" title, deadline "Vence em 5h 23min" in amber with clock icon.
Below: progress bar at 3/5 (60%) in terracotta. Main content: same quiz layout as tela 4.17
— question in Lora serif: "El domingo pasado, ellos _______ a la iglesia." Options: A) fueron,
B) van, C) irán, D) iban. Feedback card shown: green border "Correto! 'fueron' é pretérito
indefinido de ir." with "Próximo >" button. The deadline timer at the top distinguishes this
from regular exercises. Typography: Lora for Spanish content, Inter for UI. Mood: focused
urgency without panic. No purple, no glassmorphism.
```

---

### TELA 4.21 — Meu Progresso
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Progress dashboard for "Espanhol" tutor app on iPad. Warm data-visualization style with 10px
border radius. Color: off-white warm background, teal/sage for chart bars and progress fills,
terracotta for highlights and deltas, amber for warnings, emerald for improvements. Layout:
iPad landscape with sidebar. Header: "Meu Progresso" + "Matheus — Nível A2" badge. Top row:
two cards — left "Evolução Semanal" bar chart showing 4 weeks (S1-S4) of session counts
(bars in teal, heights varying 2-4), right "Scores por Área" with three horizontal progress
bars: Gramática 72 (+7 delta in green), Compreensão 68 (+3), Pronúncia 63 (+5), each with
teal fill. Middle row: "Fonemas" card with two columns — "Melhorados:" with green checkmarks
(rr vibrante, z interdental) and "Pendentes:" with amber warning icons (ll lateral palatal,
j fricativa velar). Bottom: "Histórico de Sessões" scrollable list with date, type, duration,
score, topic for last 4 sessions. Banner at bottom: "Re-teste disponível! Último teste:
23/01" in soft blue. Typography: Inter for all, Lora for data labels. Mood: encouraging,
tangible progress visualization. No purple, no glassmorphism.
```

---

### TELA 4.22 — Comparação de Re-teste
**Model:** GEMINI_3_PRO | **Device:** MOBILE + DESKTOP

```
Before-and-after diagnostic comparison screen for "Espanhol" tutor app on iPad. Warm
celebratory editorial style with 12px border radius. Color: off-white warm background,
terracotta for "now" highlights, muted warm gray for "before" column, emerald green for
improvement deltas. Layout: iPad landscape. Header: "Sua Evolução em 30 Dias" in Lora serif,
centered. Two-column layout: left card "ANTES (23/01)" in muted style — large badge "A2",
below three progress bars (Gramática 65, Compreensão 58, Pronúncia 52) in gray fill. Right
card "AGORA (23/02)" in vibrant style — large badge "B1" in terracotta/emerald, three progress
bars (Gramática 78, Compreensão 71, Pronúncia 67) in teal fill with green "+13", "+13", "+15"
delta badges with up arrows. Below the columns: celebration message card with warm background:
"Parabéns! Você subiu de A2 para B1! Seu maior avanço foi em Pronúncia (+15 pontos). Novos
módulos foram desbloqueados para o nível B1." Bottom: CTA "Voltar ao Dashboard" in terracotta.
Mood: celebratory, rewarding, peak moment. No purple, no glassmorphism, no confetti or
childish animation cues.
```

---

### TELA 4.23 — Modal: Reportar Erro
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Error report modal overlay for "Espanhol" tutor app on iPad. Clean utilitarian style with 10px
border radius. Color: dimmed background overlay (dark semi-transparent), modal card in white
with warm shadow. Layout: centered modal card (~500px wide). Header: "Reportar Erro" in
charcoal Inter bold + "X" close button on right. Content: "O que está errado?" label, then
4 radio button options vertically stacked with warm gray text: "Erro gramatical", "Tradução
incorreta", "Correção fonética indevida", "Outro". Below: "Detalhes (opcional):" label with
a textarea field (warm gray border, 8px radius, ~3 lines height). At bottom: full-width CTA
button "Enviar Report" in terracotta. Button is in disabled state if no radio option selected.
Mood: helpful, non-intrusive, quick to complete. No purple, no glassmorphism.
```

---

### TELA 4.24 — Configurações
**Model:** GEMINI_3_FLASH | **Device:** MOBILE

```
Settings screen for "Espanhol" tutor app on iPad. Clean organized sections style with 8px
border radius. Color: off-white warm background (#fafaf8), warm gray for section borders and
labels, terracotta for active toggle knobs and edit buttons, pale warm red for danger zone.
Layout: iPad landscape with sidebar. Header: "< Dashboard" + "Configurações" title. Main
content: vertically scrolling grouped sections. Section 1 "Perfil": fields showing Nome
"Matheus" with "Editar" link in terracotta, Email "matheus@email.com" (read-only), "Nível
atual: A2", "Membro desde: 23/01/2026". Section 2 "Notificações": three rows with toggles —
"Lembrete de bloco de estudo" (ON, terracotta toggle), "Aviso de dever vencendo" (ON),
"Relatório semanal" (ON). Section 3 "Permissões": Camera "Concedida" green badge, Microfone
"Concedida" green, Notificações "Abrir Ajustes >" link. Section 4 "Sobre": "Versão: 1.0.0",
"Termos de Uso >" link, "Política de Privacidade >" link. Section 5 danger zone with pale
red background: "Sair da Conta" text button in red. Each section has bold header and 1px
separator. Typography: Inter for all. Mood: organized, trustworthy, no surprises. No purple,
no glassmorphism.
```

---

## Passo 3: Validar Cobertura

Após gerar todas as telas, verificar com `mcp__stitch__list_screens` que o projeto tem **pelo menos 34 screens** (24 MOBILE + 10 DESKTOP para telas-chave).

---

## Passo 4: Documentar

Criar o arquivo `docs/01-Planejamento/03.5-visual-mockups.md` com esta estrutura:

```markdown
# Visual Mockups: Espanhol — Tutor AI

## Metadados
- **Baseado em:** 03-ux-concept.md (Seção 4)
- **Data:** 2026-02-23
- **Stitch Project ID:** {ID_DO_PROJETO}
- **Modelos:** GEMINI_3_PRO (telas-chave) + GEMINI_3_FLASH (secundárias)

## Telas Geradas

| # | Tela | Device | Screen ID | Model | Status |
|---|------|--------|-----------|-------|--------|
| 4.1 | Splash Screen | MOBILE | {id} | PRO | Generated |
| 4.1 | Splash Screen | DESKTOP | {id} | PRO | Generated |
| 4.2 | Welcome | MOBILE | {id} | PRO | Generated |
| 4.2 | Welcome | DESKTOP | {id} | PRO | Generated |
| 4.3 | Login / Criar Conta | MOBILE | {id} | FLASH | Generated |
| 4.4 | Onboarding Slide 1 | MOBILE | {id} | PRO | Generated |
| 4.4 | Onboarding Slide 1 | DESKTOP | {id} | PRO | Generated |
| 4.5 | Onboarding Slide 2 | MOBILE | {id} | PRO | Generated |
| 4.5 | Onboarding Slide 2 | DESKTOP | {id} | PRO | Generated |
| 4.6 | Onboarding Slide 3 | MOBILE | {id} | PRO | Generated |
| 4.6 | Onboarding Slide 3 | DESKTOP | {id} | PRO | Generated |
| 4.7 | Diagnóstico Gramática | MOBILE | {id} | FLASH | Generated |
| 4.8 | Diagnóstico Compreensão | MOBILE | {id} | FLASH | Generated |
| 4.9 | Diagnóstico Pronúncia | MOBILE | {id} | FLASH | Generated |
| 4.10 | Resultado Diagnóstico | MOBILE | {id} | PRO | Generated |
| 4.10 | Resultado Diagnóstico | DESKTOP | {id} | PRO | Generated |
| 4.11 | Schedule Setup | MOBILE | {id} | FLASH | Generated |
| 4.12 | Dashboard | MOBILE | {id} | PRO | Generated |
| 4.12 | Dashboard | DESKTOP | {id} | PRO | Generated |
| 4.13 | Chat Session (DARK) | MOBILE | {id} | PRO | Generated |
| 4.13 | Chat Session (DARK) | DESKTOP | {id} | PRO | Generated |
| 4.14 | Lista de Lições | MOBILE | {id} | FLASH | Generated |
| 4.15 | Módulo da Lição | MOBILE | {id} | FLASH | Generated |
| 4.16 | Exercício Flashcard | MOBILE | {id} | FLASH | Generated |
| 4.17 | Exercício Quiz | MOBILE | {id} | FLASH | Generated |
| 4.18 | Agenda / Calendário | MOBILE | {id} | FLASH | Generated |
| 4.19 | Lista de Deveres | MOBILE | {id} | FLASH | Generated |
| 4.20 | Exercício do Dever | MOBILE | {id} | FLASH | Generated |
| 4.21 | Meu Progresso | MOBILE | {id} | PRO | Generated |
| 4.21 | Meu Progresso | DESKTOP | {id} | PRO | Generated |
| 4.22 | Comparação Re-teste | MOBILE | {id} | PRO | Generated |
| 4.22 | Comparação Re-teste | DESKTOP | {id} | PRO | Generated |
| 4.23 | Modal Reportar Erro | MOBILE | {id} | FLASH | Generated |
| 4.24 | Configurações | MOBILE | {id} | FLASH | Generated |

## Cobertura

- **Total de telas do UX Concept:** 24
- **Total de gerações Stitch:** 34 (24 MOBILE + 10 DESKTOP)
- **Cobertura:** 100%

## Insights para Design System

(Preencher após analisar os mockups gerados)

- **Cor primária observada:** [terracotta/amber do mockup]
- **Tipografia:** Lora (conteúdo pedagógico) + Inter (UI)
- **Geometria:** 8-12px border radius
- **Padrões notáveis:** sidebar iPadOS, cards com sombra sutil, dark mode apenas no chat
```

---

## Regras de Execução

1. **Gerar uma tela por vez.** Não pular nenhuma.
2. **Se timeout:** NÃO regenerar. Usar `mcp__stitch__get_screen` para verificar se completou no server.
3. **Se erro:** Registrar o erro e continuar com a próxima tela. Voltar para as que falharam no final.
4. **Ordem de geração:** Começar pelas telas-chave (PRO) e depois as secundárias (FLASH).
5. **Sempre MOBILE primeiro**, depois DESKTOP para telas-chave.
6. **Documentar TODOS os IDs** no arquivo de output.
7. **Não inventar telas** que não estão na Seção 4 do UX Concept.
8. **Após finalizar:** Listar todas as telas geradas e confirmar cobertura 100%.
