# PLAN — Aba Perfil (Stitch Redesign)

> **Status:** AGUARDANDO APROVAÇÃO
> **Data:** 2026-02-26
> **Stitch Project:** 5663344124088709367
> **Agente:** `project-planner` + `frontend-specialist`

## 1. Contexto
No redesign para o "Premium Dark" (Stitch), a página de Perfil e sua respectiva aba na navegação não foram completamente integradas no app. Este plano aborda a implementação fiel das telas mobile e desktop de Perfil baseadas no Stitch.

## 2. Ações Planejadas

### Fase 1: Roteamento e Navegação (`router.tsx` e `nav-items.ts`)
- Registrar a rota `/profile` apontando para `src/pages/ProfilePage.tsx` (sob `AppLayout` e `ProtectedRoute`).
- Adicionar o item **"Perfil"** (`{ icon: 'person', label: 'Perfil', path: '/profile' }`) em `nav-items.ts`.
- Ajustar `BottomNav.tsx` para comportar 6 itens fluidamente (ajuste no grid ou espaçamento).
- No Desktop (`Sidebar.tsx`), o item aparecerá na listagem principal e o `UserCard` do rodapé também terá o link direto para `/profile`.

### Fase 2: Refatoração da UI (`ProfilePage.tsx`)
A página atual será reescrita para refletir os designs do Stitch:

**Layout Desktop (Premium):**
- Sidebar secundária interna para "Preferências" (Perfil e Conta, Idioma, Notificações, Privacidade).
- Área de conteúdo baseada em painéis "glassmorphism".
- Inputs no dark theme para: Avatar (com badge de editar), Nome, E-mail, Telefone, Nível de Espanhol e Bio.
- Header de página contendo o botão laranja de "Salvar Alterações".

**Layout Mobile (Premium):**
- Header no topo com texto "Configurações de Perfil" e ícone check laranja.
- Card unificado agrupando inputs "Conta" (Nome, Email, Senha).
- Opções em lista com Chevron para sub-telas de configurações (Idioma, Notificações, Privacidade).
- Botão "Sair da Conta" destacado na parte inferior em card escuro.
- Bottom Nav exibindo a aba "Perfil" ativa (com "glow" laranja).

### Fase 3: Estado e Integração
- Preservar a lógica de fetch do Firebase Auth e Firestore (`db`) que já está mapeada.
- Refinar funções de logout e inputs com Tailwind forms.

## 3. Arquivos Afetados
- `src/app/router.tsx`
- `src/components/layout/nav-items.ts`
- `src/pages/ProfilePage.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/Sidebar.tsx`