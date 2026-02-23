# Stack: Espanhol — Tutor AI de Espanhol para iPad

## Metadados
- **Baseado em:** 01-product-brief.md, 02-prd.md, 04-architecture.md, 05-security.md
- **Data:** 2026-02-23
- **Autor:** AI Project Planner
- **Versao:** 1.0
- **Status:** Draft

---

## 1. Stack por Camada

| Camada | Tecnologia | Versao | Justificativa | Alternativas Avaliadas |
|--------|------------|--------|---------------|----------------------|
| Framework Frontend | React | 19.2.x | Ecossistema maduro; hooks nativos; ref como prop (sem forwardRef); comunidade massiva | Vue 3, Svelte 5, Solid |
| Build Tool | Vite | 6.x | HMR instantaneo; plugin PWA nativo; zero config para SPA; build otimizado com Rollup | Next.js (SSR desnecessario), Turbopack |
| Linguagem | TypeScript | 5.7.x | Type safety end-to-end (client + Cloud Functions); IntelliSense; catch errors em compile time | JavaScript puro |
| Styling | Tailwind CSS | 4.x | CSS-first config (v4); utility classes; design tokens via CSS custom properties; otimo para iPad responsive | CSS Modules, Styled Components |
| State Management | Zustand | 5.x | < 2KB bundle; zero boilerplate; selectors para re-renders; persist middleware; TypeScript nativo | Redux Toolkit, Jotai, React Context |
| Routing | React Router | 7.x | Padrao da industria para SPAs React; lazy loading nativo; typed routes | TanStack Router |
| Backend Runtime | Cloud Functions 2nd gen | Node.js 22 | Runtime LTS; integrado com Firebase; TypeScript nativo; event-driven | Cloud Run, Express standalone |
| Database | Cloud Firestore | - | Real-time listeners; Security Rules por uid; subcollections; offline cache (futuro); escalavel | Supabase (Postgres), PlanetScale |
| Auth | Firebase Auth | - | SDK client-side; email/senha; JWT integrado com Firestore Rules; zero backend custom | Clerk, Auth0, Supabase Auth |
| AI Engine (real-time) | Gemini Live API | Gemini 3 Flash | WebSocket bidirecional; audio+video streaming; ephemeral tokens; correcao fonetica em tempo real | OpenAI Realtime API, Azure Speech |
| AI Engine (content gen) | Gemini REST API | Gemini 3 Flash | Geracao de licoes, exercicios, diagnostico; server-side via Cloud Functions | GPT-4o, Claude API |
| AI SDK | @google/genai | latest | SDK oficial Google para Gemini; suporta Live API + REST; TypeScript types | REST direto, Vertex AI SDK |
| Hosting | Firebase Hosting | - | CDN global; HTTPS automatico; rewrites para SPA; preview channels para PRs | Vercel (SSR desnecessario), Netlify |
| PWA | vite-plugin-pwa | 1.x | Zero-config PWA manifest + service worker via Workbox; auto-update prompt | Custom service worker |

---

## 2. Compatibilidade

### 2.1 Matriz de Compatibilidade
| Pacote A | Pacote B | Compativel? | Notas |
|----------|----------|-------------|-------|
| React 19.2 | Zustand 5.x | Sim | Zustand 5 suporta React 19 nativamente |
| React 19.2 | React Router 7.x | Sim | RR7 projetado para React 19 |
| Vite 6.x | vite-plugin-pwa 1.x | Sim | Plugin mantido pelo time Vite |
| Tailwind 4.x | Vite 6.x | Sim | Tailwind v4 usa CSS-first, integra via PostCSS ou Vite plugin |
| Firebase SDK (web) | React 19.2 | Sim | Firebase JS SDK e framework-agnostic |
| @google/genai | Browser (Safari iPadOS) | Sim | SDK funciona no browser; Live API via WebSocket nativo |
| TypeScript 5.7 | Todas as libs acima | Sim | Todas as libs tem types nativos ou @types |

### 2.2 Deprecation Watch
| Tecnologia | Versao Planejada | EOL Estimado | Risco | Acao |
|------------|-----------------|-------------|-------|------|
| React 19 | 19.2.x | ~2028+ (React 20 nao anunciado) | Baixo | Manter atualizado |
| Node.js 22 | 22 LTS | Abril 2027 (LTS end) | Baixo | Migrar para Node 24 LTS quando disponivel |
| Tailwind 4 | 4.x | ~2027+ | Baixo | Versao recente; CSS-first e futureproof |
| Zustand 5 | 5.x | N/A (ativo) | Baixo | API estavel; migracao de major seria simples |
| Vite 6 | 6.x | ~2027 (Vite 7) | Baixo | Migracao de major historicamente suave |
| Gemini 3 Flash | API atual | Dependente do Google | Medio | Google pode deprecar modelo; monitorar anuncios; adaptar prompts |

### 2.3 Compatibilidade Safari iPadOS
| Web API | Necessidade | Suporte iPadOS 17+ | Status | Fallback |
|---------|------------|-------------------|--------|----------|
| MediaDevices (camera+mic) | Critico (chat) | Sim (getUserMedia) | OK | N/A — bloqueador se falhar |
| WebSocket (wss://) | Critico (Gemini Live) | Sim | OK | Modo texto (degradacao graceful) |
| Web Push Notifications | Importante (agenda) | Sim (Safari 16.4+) | OK | Sem notificacao; usuario ve ao abrir |
| Screen Wake Lock | Importante (chat session) | Parcial (Safari 16.4+ com limitacoes) | Testar Sprint 0 | AudioContext hack para manter ativo |
| Service Worker | Necessario (PWA) | Sim | OK | N/A |
| Web App Manifest | Necessario (PWA install) | Sim | OK | N/A |
| AudioContext | Critico (audio processing) | Sim | OK | N/A |
| MediaRecorder | Importante (gravar audio) | Sim (Safari 14.5+) | OK | Fallback para AudioWorklet |
| IndexedDB | Util (Firebase Auth persistence) | Sim | OK | N/A |
| Web Speech API | Util (transcricao visual) | Parcial (Safari suporte limitado) | Testar Sprint 0 | Gemini faz transcricao server-side |

> **Sprint 0 obrigatorio:** Antes de qualquer desenvolvimento, validar Wake Lock + Web Speech API + getUserMedia no iPad real com Safari iPadOS 17+.

---

## 3. Dependencias

### 3.1 Core (dependencies)
| Pacote | Versao | Proposito | Bundle Size (gzip) |
|--------|--------|---------|-------------------|
| `react` | ^19.2.0 | UI library | ~6 KB |
| `react-dom` | ^19.2.0 | DOM renderer | ~40 KB |
| `react-router` | ^7.x | Client-side routing | ~14 KB |
| `zustand` | ^5.0.0 | State management | ~1.5 KB |
| `firebase` | ^11.x | Auth + Firestore SDK (modular/tree-shakeable) | ~30 KB (auth+firestore only) |
| `@google/genai` | latest | Gemini Live API + REST client | ~15 KB (estimado) |
| `tailwindcss` | ^4.0.0 | Utility-first CSS framework | 0 KB runtime (CSS only) |
| `dompurify` | ^3.x | Sanitizacao de HTML (output Gemini) | ~7 KB |
| `zod` | ^3.x | Schema validation (shared client+server) | ~4 KB |
| `date-fns` | ^4.x | Manipulacao de datas (agenda, deadlines) | ~2 KB (tree-shaken) |

### 3.2 Dev (devDependencies)
| Pacote | Versao | Proposito |
|--------|--------|---------|
| `typescript` | ^5.7.0 | TypeScript compiler |
| `vite` | ^6.x | Build tool + dev server |
| `vite-plugin-pwa` | ^1.x | PWA manifest + service worker generation |
| `@tailwindcss/vite` | ^4.x | Tailwind CSS plugin para Vite |
| `vitest` | ^3.x | Unit testing (compativel com Vite) |
| `@testing-library/react` | ^16.x | Testing utilities para React |
| `@firebase/rules-unit-testing` | ^4.x | Testes de Firestore Security Rules |
| `eslint` | ^9.x | Linting (flat config) |
| `eslint-plugin-security` | latest | Regras de seguranca ESLint |
| `prettier` | ^3.x | Formatacao de codigo |
| `@types/react` | ^19.x | TypeScript types para React |
| `firebase-tools` | latest | Firebase CLI (emulador, deploy) |
| `workbox-window` | ^7.x | Service worker client-side (vite-plugin-pwa) |

### 3.3 Cloud Functions (dependencies)
| Pacote | Versao | Proposito |
|--------|--------|---------|
| `firebase-admin` | ^13.x | Firebase Admin SDK (Firestore, Auth server-side) |
| `firebase-functions` | ^6.x | Cloud Functions 2nd gen triggers + HTTPS |
| `@google/genai` | latest | Gemini REST API (content generation, scoring) |
| `zod` | ^3.x | Input validation em todas as functions |

### 3.4 Bundle Budget
| Metrica | Alvo | Justificativa |
|---------|------|---------------|
| Total JS bundle (gzip) | < 150 KB | LCP < 3s no iPad com 5Mbps (RNF01) |
| First Load JS | < 80 KB | TTI < 4s (RNF01) |
| Largest chunk | < 50 KB | Code splitting por rota |
| CSS total | < 30 KB | Tailwind purge em producao |

---

## 4. Tooling

### 4.1 Developer Experience
| Ferramenta | Proposito | Config File |
|------------|---------|-------------|
| TypeScript | Type checking end-to-end | `tsconfig.json` (strict mode) |
| ESLint | Linting (flat config, security rules) | `eslint.config.js` |
| Prettier | Formatacao consistente | `.prettierrc` |
| Vite | Dev server com HMR + build | `vite.config.ts` |
| Firebase Emulators | Auth + Firestore + Functions local | `firebase.json` |

### 4.2 Testing Stack
| Tipo | Ferramenta | Config | Prioridade |
|------|-----------|-------|------------|
| Unit (components + hooks) | Vitest + Testing Library | `vitest.config.ts` | P0 |
| Unit (Cloud Functions) | Vitest | `functions/vitest.config.ts` | P0 |
| Firestore Rules | @firebase/rules-unit-testing | Inline em test files | P0 |
| E2E (futuro) | Playwright | `playwright.config.ts` | P1 (pos-MVP) |

### 4.3 CI/CD (GitHub Actions)
| Stage | Ferramenta | Trigger | Timeout |
|-------|-----------|---------|---------|
| Lint + Typecheck | ESLint + tsc | Cada push/PR | 3 min |
| Unit Tests (client) | Vitest | Cada push/PR | 5 min |
| Unit Tests (functions) | Vitest | Cada push/PR | 3 min |
| Firestore Rules Tests | @firebase/rules-unit-testing | Cada push/PR que modifica rules | 3 min |
| Security Audit | npm audit | Cada push/PR | 1 min |
| Build | vite build | Cada push/PR | 3 min |
| Preview Deploy | firebase hosting:channel:deploy | Cada PR | 2 min |
| Production Deploy | firebase deploy (hosting + functions + rules) | Tag v* em main | 5 min |

### 4.4 Scripts de package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:rules": "firebase emulators:exec --only firestore 'vitest run tests/rules'",
    "firebase:emulators": "firebase emulators:start",
    "firebase:deploy": "firebase deploy",
    "firebase:deploy:preview": "firebase hosting:channel:deploy preview"
  }
}
```

---

## 5. Estrutura de Arquivos

```
espanhol/
├── docs/                              # Documentacao de planejamento
│   ├── 01-Planejamento/               # Brief, PRD, UX, Architecture, Security, Stack, Design System
│   ├── 03-Arquitetura/ADRs/           # ADRs avulsos
│   ├── stitch-screens/                # Prototipos Stitch (35 telas)
│   ├── BACKLOG.md                     # Indice de epics/stories
│   ├── PROJECT_STATUS.md              # Status consolidado
│   └── stories/                       # Story files detalhados
│
├── src/                               # PWA (React + Vite)
│   ├── app/
│   │   ├── App.tsx                    # Root component (providers + router)
│   │   ├── router.tsx                 # React Router config (lazy routes)
│   │   └── providers.tsx              # AuthProvider, FirestoreProvider
│   ├── features/
│   │   ├── auth/                      # Login, Register, AuthGuard
│   │   ├── onboarding/                # Welcome slides, flow control
│   │   ├── diagnostic/                # Gramatica, Compreensao, Pronuncia, Resultado
│   │   ├── chat/                      # Gemini Live session, subtitles, corrections
│   │   ├── lessons/                   # Lesson library, content, flashcards, quizzes
│   │   ├── homework/                  # Homework list, exercises, deadlines
│   │   ├── schedule/                  # Weekly calendar, block editor, setup
│   │   ├── progress/                  # Charts, evolution, diagnostic comparison
│   │   ├── dashboard/                 # Main dashboard, streak, quick actions
│   │   └── settings/                  # Account, notifications, permissions
│   ├── shared/
│   │   ├── components/ui/             # Button, Card, Input, Modal, Sidebar, ProgressBar
│   │   ├── components/layout/         # AppLayout, SidebarLayout, FullScreenLayout
│   │   ├── components/feedback/       # ErrorBoundary, Loading, EmptyState, Toast
│   │   ├── hooks/                     # useFirestore, useWakeLock, useMediaPermissions
│   │   ├── lib/                       # firebase.ts, firestore.ts, utils.ts
│   │   └── types/                     # Shared TypeScript types
│   ├── assets/                        # SVGs, images, audio samples
│   ├── styles/
│   │   └── globals.css                # Tailwind imports + custom tokens
│   ├── main.tsx                       # Entry point
│   └── sw.ts                          # Service worker config (vite-plugin-pwa)
│
├── functions/                         # Cloud Functions (Node.js 22)
│   ├── src/
│   │   ├── index.ts                   # Export all functions
│   │   ├── chat/                      # createChatSession, onSessionComplete
│   │   ├── diagnostic/                # createDiagSession, calculateResult
│   │   ├── adapter/                   # runAdapter (Firestore trigger)
│   │   ├── homework/                  # generateHomework, checkDeadlines
│   │   ├── lessons/                   # generateLesson, cacheManager
│   │   ├── schedule/                  # checkBlocks (cron), weeklyReport
│   │   ├── streak/                    # updateStreak utility
│   │   └── shared/                    # gemini.ts, auth.ts, schemas.ts, prompts/
│   ├── package.json
│   └── tsconfig.json
│
├── tests/                             # Testes globais
│   ├── rules/                         # Firestore Security Rules tests
│   └── setup.ts                       # Test setup (Firebase emulator)
│
├── public/                            # Static assets (PWA icons, manifest base)
│   ├── icons/                         # PWA icons (192x192, 512x512)
│   └── favicon.svg
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Lint + test + build (PRs)
│       └── deploy.yml                 # Deploy to Firebase (tags)
│
├── firebase.json                      # Firebase config (hosting, functions, rules, emulators)
├── firestore.rules                    # Firestore Security Rules
├── firestore.indexes.json             # Composite indexes
├── .firebaserc                        # Firebase project aliases
├── vite.config.ts                     # Vite + PWA plugin config
├── tailwind.config.ts                 # Tailwind v4 config (se necessario — v4 usa CSS-first)
├── tsconfig.json                      # TypeScript config (client)
├── eslint.config.js                   # ESLint flat config
├── .prettierrc                        # Prettier config
├── package.json                       # Client dependencies + scripts
└── package-lock.json                  # Lock file (obrigatorio commitar)
```

---

## 6. Configuracoes Iniciais Chave

### 6.1 vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',  // prompt user to update
      manifest: {
        name: 'Espanhol — Tutor AI',
        short_name: 'Espanhol',
        description: 'Tutor particular de espanhol com IA',
        theme_color: '#1E40AF',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'safari17',  // iPad target
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          vendor: ['react', 'react-dom', 'react-router', 'zustand'],
        },
      },
    },
  },
});
```

### 6.2 firebase.json (Resumo)
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(self), microphone=(self), geolocation=()" }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs22"
    }
  ],
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true }
  }
}
```

### 6.3 Ephemeral Token Flow (Gemini Live API)

```typescript
// functions/src/chat/createChatSession.ts (Cloud Function)
import { GoogleGenAI } from '@google/genai';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

// 1. Cloud Function gera token efemero
export const createChatSession = onCall(async (request) => {
  // Validate Firebase Auth
  if (!request.auth) throw new HttpsError('unauthenticated', 'Auth required');

  const client = new GoogleGenAI({ apiKey: geminiApiKey.value() });

  // Token com TTL de 35 minutos (sessao max 30min + margem)
  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
      newSessionExpireTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      httpOptions: { apiVersion: 'v1alpha' },
    },
  });

  return { token: token.name, model: 'gemini-3-flash' };
});

// 2. Client usa token para conectar diretamente ao Gemini
// src/features/chat/lib/websocket-manager.ts
const ai = new GoogleGenAI({ apiKey: ephemeralToken });
const session = await ai.live.connect({
  model: 'gemini-3-flash',
  config: {
    responseModalities: ['AUDIO', 'TEXT'],
    systemInstruction: systemPrompt, // enviado pelo Cloud Function
  },
  callbacks: {
    onAudio: (audio) => { /* play audio response */ },
    onText: (text) => { /* show subtitle */ },
    onError: (error) => { /* handle error, fallback to text */ },
  },
});
```

---

## 7. GAP Analysis: Tecnologia

> Skill: `gap-analysis` — Dimensao: Technology

### 7.1 Stack Atual vs Necessaria
| Camada | Atual | Necessaria | Motivo | Esforco |
|--------|-------|-----------|--------|---------|
| Frontend Framework | Inexistente | React 19.2 + Vite 6 | SPA com real-time listeners, camera/mic access | L |
| Styling | Inexistente | Tailwind CSS 4 | Utility-first, design tokens, responsive iPad | M |
| State Management | Inexistente | Zustand 5 | Stores por feature com Firestore listeners | S |
| Routing | Inexistente | React Router 7 | SPA navigation com lazy loading | S |
| Backend | Inexistente | Cloud Functions 2nd gen (Node 22) | ~10 functions (chat, diagnostic, adapter, homework, schedule) | L |
| Database | Inexistente | Firestore (subcollections por uid) | Schema + Rules + indices | M |
| Auth | Inexistente | Firebase Auth (email/senha) | Setup + config + rate limiting | S |
| AI Real-time | Inexistente | Gemini Live API + @google/genai | WebSocket integration + ephemeral tokens | L |
| AI Content | Inexistente | Gemini REST API | Prompt engineering + geracao de licoes | M |
| PWA | Inexistente | vite-plugin-pwa + manifest | Service worker + install prompt + icons | S |
| CI/CD | Inexistente | GitHub Actions | 2 workflows (CI + deploy) | S |
| Testing | Inexistente | Vitest + Testing Library + Rules tests | Unit tests + Firestore Rules tests | M |

### 7.2 Bibliotecas Faltantes (Necessidades Especificas)
| Necessidade | Solucao Escolhida | Alternativas | Prioridade |
|-------------|------------------|-------------|------------|
| Sanitizacao de HTML (output Gemini) | `dompurify` | `sanitize-html`, `xss` | P0 |
| Schema validation (client + server) | `zod` | `yup`, `joi` | P0 |
| Manipulacao de datas (agenda, deadlines) | `date-fns` | `dayjs`, `luxon` | P0 |
| Charts de progresso | `recharts` ou `chart.js` via `react-chartjs-2` | `nivo`, `visx` | P1 |
| Audio waveform visualization | Canvas API nativo + `AudioContext` | `wavesurfer.js` | P1 |
| Markdown rendering (licoes com formatacao) | `react-markdown` | `marked` + `dompurify` | P1 |
| Drag-to-schedule (agenda semanal) | Custom com touch events (iPad-otimizado) | `react-dnd`, `@dnd-kit/core` | P1 |

### 7.3 Riscos Tecnologicos
| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Safari iPadOS limita Wake Lock durante chat | Media | Alto | Testar Sprint 0; fallback AudioContext hack; documentar workaround |
| Gemini Live API muda de versao/endpoint | Baixa | Alto | Abstrair conexao em `websocket-manager.ts`; facil de adaptar |
| Gemini 3 Flash nao suporta analise fonetica granular | Media | Alto | Testar com gravacoes reais; calibrar prompts; definir metricas minimas de acuracia |
| Tailwind v4 breaking changes em minor | Baixa | Baixo | Lock version; CSS-first approach minimiza dependencia de JS config |
| Bundle size excede 150KB | Baixa | Medio | Code splitting por rota; tree-shaking do Firebase SDK (modular); monitorar com `vite-bundle-analyzer` |
| Web Push nao funciona reliably no Safari | Media | Medio | Implementar como P1; nao depender 100% para agenda; usuario ve deveres ao abrir app |

### 7.4 GAP Inventory
| ID | Area | AS-IS | TO-BE | GAP | Severidade | Prioridade |
|----|------|-------|-------|-----|------------|------------|
| G-STACK-01 | Projeto React + Vite | Inexistente | SPA React 19.2 com Vite 6, TypeScript strict, PWA manifest, Tailwind 4 | Scaffold completo do projeto | Critical | P0 |
| G-STACK-02 | Firebase setup | Inexistente | Firebase project criado com Auth + Firestore + Functions + Hosting configurados | Criar projeto Firebase, configurar emuladores, escrever `firebase.json` | Critical | P0 |
| G-STACK-03 | Gemini SDK integration | Inexistente | @google/genai configurado com ephemeral tokens + Live API connection + REST calls | Integrar SDK, implementar token flow, testar com iPad | Critical | P0 |
| G-STACK-04 | CI/CD Pipeline | Inexistente | GitHub Actions com lint + test + build + deploy (preview + prod) | Criar 2 workflow files + configurar Firebase deploy tokens | Medium | P1 |
| G-STACK-05 | Sprint 0 validation | Desconhecido | Safari iPadOS 17+ validado para: getUserMedia, WebSocket, Wake Lock, Web Push, ServiceWorker | Criar app de teste no iPad real antes de comecar desenvolvimento | Critical | P0 |
| G-STACK-06 | Testing infrastructure | Inexistente | Vitest + Testing Library + @firebase/rules-unit-testing configurados com emulador | Setup de configs de teste + emulador | Medium | P1 |
| G-STACK-07 | Bundle optimization | N/A | Bundle < 150KB gzip com code splitting por rota e manual chunks (firebase, vendor) | Configurar Vite rollupOptions + monitorar tamanho | Medium | P1 |
| G-STACK-08 | Prompt engineering base | Inexistente | System prompts calibrados para: chat (3 niveis), diagnostico, geracao de licoes | Criar, testar e iterar prompts no diretorio `functions/src/shared/prompts/` | High | P0 |

---

## Aprovacoes

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| Product Owner | Joel | Pendente | - |
