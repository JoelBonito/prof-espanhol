# Plano de Correcao Consolidado — Epic 0 e Epic 1

**Data:** 2026-02-24
**Origem:** Review do Codex + analise do Claude + decisoes do usuario
**Executor:** Codex
**Revisor:** Claude Code (code review pos-implementacao)

---

## Contexto

O Codex identificou 7 problemas nos Epics 0 e 1. O Claude validou todos como verdadeiros com evidencia no codigo. O usuario aprovou o plano com 5 ajustes + 4 refinamentos adicionais do Codex. Este documento e a fonte unica de verdade para a execucao.

---

## Fase 1 — Estabilizacao (P0/P1)

### Fix 1: Criacao de diagnostico sem campo `type` (P0 CRITICO)

**Problema:** `addDoc` em `src/features/diagnostic/GrammarSection.tsx:49-56` nao inclui `type`, mas `firestore.rules:63-64` exige `hasAll(['type', 'status', 'startedAt'])` com `type in ['initial', 'retest']`. O `.catch(() => {})` na linha 58 engole o erro silenciosamente. O diagnostico prossegue sem `diagnosticId`, e quando chega a `calculateDiagnosticResult` (CF), falha porque nao encontra o documento.

**Correcao:**

1. Adicionar `type: 'initial'` ao objeto do `addDoc` (linha 49-56):
```ts
addDoc(collection(db, 'users', uid, 'diagnostics'), {
  type: 'initial',        // <-- ADICIONAR
  status: 'in_progress',
  startedAt: serverTimestamp(),
  grammarScore: null,
  listeningScore: null,
  pronunciationScore: null,
  overallScore: null,
})
```

2. Substituir `.catch(() => {})` (linha 58) por tratamento real de erro:
   - Mostrar mensagem visivel ao usuario (toast ou alerta inline) informando que nao foi possivel iniciar o diagnostico
   - Oferecer botao de retry
   - **Bloquear avanço:** sem `diagnosticId` valido, NAO permitir que o fluxo continue para as proximas questoes
   - **Bloqueio de UI:** Desabilitar botao "Proximo"/"Concluir" enquanto `diagnosticId` nao existir. O botao so fica ativo apos criacao bem-sucedida da sessao no Firestore.

3. Proteger o fluxo downstream: antes de chamar `calculateDiagnosticResult`, verificar que `diagnosticId` existe. Se nao existir, mostrar erro e oferecer retry.

**Arquivos afetados:**
- `src/features/diagnostic/GrammarSection.tsx` (principal)
- Verificar se `DiagnosticPage.tsx` ou store precisam de guarda contra `diagnosticId` nulo

---

### Fix 2: Tipagem do componente Icon (P1)

**Problema:** `src/components/ui/Icon.tsx:6` define `size?: 20 | 24 | 48`, mas existem 7 usos com tamanhos `12`, `16`, `18`, `36` em:
- `src/features/diagnostic/DiagnosticResultView.tsx` (linhas 148, 200, 220, 269)
- `src/features/diagnostic/PronunciationSection.tsx` (linhas 275, 287, 296)

**Correcao:** Alterar o tipo de `size` para `number`:
```ts
size?: number;
```

Isso e preferivel a expandir a union porque Material Symbols aceita qualquer valor de pixel.

**Validacao:** `npm run type-check` e `npm run build` devem passar sem erros.

**Arquivos afetados:**
- `src/components/ui/Icon.tsx` (unica alteracao)

---

### Fix 3: Links de navegacao para rotas inexistentes (P1)

**Problema:** `src/components/layout/nav-items.ts:9-12` define paths `/chat`, `/lessons`, `/schedule`, `/progress` que nao existem em `src/app/router.tsx`. Alem disso, `DiagnosticResultView.tsx:240` navega para `/schedule`. O `Sidebar.tsx:42-43` tambem tem um `<Link to="/settings">` hardcoded fora do `NAV_ITEMS`, e `/settings` nao existe no router.

**Correcao — Decisao do usuario: desabilitar, NAO criar placeholders.**

1. Adicionar campo `disabled` ao tipo `NavItem` em `nav-items.ts`:
```ts
export interface NavItem {
  icon: string;
  label: string;
  path: string;
  disabled?: boolean;
  disabledLabel?: string;  // ex: "Em breve"
}
```

2. Marcar rotas nao implementadas como disabled:
```ts
export const NAV_ITEMS: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'chat', label: 'Chat', path: '/chat', disabled: true, disabledLabel: 'Em breve' },
  { icon: 'menu_book', label: 'Licoes', path: '/lessons', disabled: true, disabledLabel: 'Em breve' },
  { icon: 'calendar_today', label: 'Agenda', path: '/schedule', disabled: true, disabledLabel: 'Em breve' },
  { icon: 'insights', label: 'Progresso', path: '/progress', disabled: true, disabledLabel: 'Em breve' },
];
```

3. Nos componentes que renderizam `NAV_ITEMS` (`BottomNav.tsx` e `Sidebar.tsx`), verificar `disabled`:
   - Se `disabled === true`: renderizar como `<span>` (nao `<Link>`)
   - Visual: opacidade reduzida + badge "Em breve" pequeno
   - Sem evento de click/navegacao

4. **Link `/settings` no Sidebar** (`Sidebar.tsx:42-54`): o link esta hardcoded fora do `NAV_ITEMS`. Aplicar mesmo tratamento: substituir `<Link>` por `<span>` com visual disabled + "Em breve", ou remover o item ate que a rota exista. Preferencia: desabilitar com mesmo padrao dos outros itens.

5. CTA em `DiagnosticResultView.tsx:237-244`: substituir navegacao para `/schedule` por navegacao para `/` (Dashboard) com texto "Ir para o Dashboard", ja que `/schedule` nao existe ainda.

**Arquivos afetados:**
- `src/components/layout/nav-items.ts`
- `src/components/layout/BottomNav.tsx` (renderiza `NAV_ITEMS`)
- `src/components/layout/Sidebar.tsx` (renderiza `NAV_ITEMS` + link hardcoded `/settings`)
- `src/features/diagnostic/DiagnosticResultView.tsx` (linha 240)

---

## Fase 2 — Robustez Funcional (P2)

### Fix 4: Retry nao refaz chamada a CF (P2)

**Problema:** `DiagnosticResultView.tsx:97` — botao "Tentar novamente" faz `setState('loading')`, mas o `useEffect` na linha 51 depende de `[diagnosticId]` que nao muda. O retry mostra spinner infinito sem nunca refazer a chamada.

**Correcao:** Extrair funcao `loadResult()` e usar em ambos os contextos:
```ts
const [retryCount, setRetryCount] = useState(0);

useEffect(() => {
  let cancelled = false;
  setState('loading');

  calculateFn({ diagnosticId })
    .then((res) => {
      if (!cancelled) {
        setResult(res.data);
        setState('result');
      }
    })
    .catch((err) => {
      if (!cancelled) {
        console.error('calculateDiagnosticResult error:', err);
        setErrorMsg('Nao foi possivel calcular o resultado. Tente novamente.');
        setState('error');
      }
    });

  return () => { cancelled = true; };
}, [diagnosticId, retryCount]);

// No botao:
<Button onClick={() => setRetryCount(c => c + 1)}>
```

**Arquivos afetados:**
- `src/features/diagnostic/DiagnosticResultView.tsx`

---

### Fix 5: CF nao persiste todos os campos no perfil (P2)

**Problema:** `functions/src/calculateDiagnosticResult.ts:106-116` salva no perfil do user apenas `level`, `levelScore`, `diagnosticCompleted`, `lastDiagnosticDate`, `updatedAt`. Faltam campos exigidos pela Story 1.5 (linha 39): `grammarScore`, `listeningScore`, `speakingScore`, `weakPhonemes[]`, `diagnosticDate`.

**Correcao — Decisao do usuario: OBRIGATORIO persistir no perfil.**

Atualizar o batch write do perfil (linhas 106-116):
```ts
batch.set(
  userRef,
  {
    level: levelAssigned,
    levelScore: overallScore,
    grammarScore,                    // ADICIONAR
    listeningScore,                  // ADICIONAR
    speakingScore: pronunciationScore, // ADICIONAR (mapear nome)
    weakPhonemes: phonemesToWork,    // ADICIONAR
    diagnosticDate: completedAt,     // ADICIONAR (nome conforme spec)
    diagnosticCompleted: true,
    lastDiagnosticDate: completedAt, // manter para backward compat
    updatedAt: completedAt,
  },
  { merge: true },
);
```

**Nota:** A spec diz `speakingScore` mas o codigo usa `pronunciationScore`. Mapear `pronunciationScore` -> `speakingScore` no perfil conforme spec. No doc do diagnostico, manter `pronunciationScore` (ja esta la).

**Tipagem:** Atualizar `UserProfile` em `functions/src/types/firestore.ts:4-22` para incluir os novos campos, evitando drift de schema:
```ts
export interface UserProfile {
  // ... campos existentes ...
  grammarScore: number | null;       // ADICIONAR
  listeningScore: number | null;     // ADICIONAR
  speakingScore: number | null;      // ADICIONAR
  weakPhonemes: string[];            // ADICIONAR
  diagnosticDate: Timestamp | null;  // ADICIONAR
}
```

**Arquivos afetados:**
- `functions/src/calculateDiagnosticResult.ts`
- `functions/src/types/firestore.ts`

---

### Fix 6: Zero testes frontend + passWithNoTests (P2)

**Problema:** Nenhum arquivo `.test.tsx` em `src/`. `package.json:15` usa `--passWithNoTests` que mascara a ausencia.

**Correcao — Escopo reduzido ao caminho critico (decisao do usuario):**

1. Remover `--passWithNoTests` de `package.json`:
```json
"test:run": "vitest run --exclude tests/firestore-rules.test.ts"
```

2. Criar testes APENAS para o caminho critico:
   - **Teste 1:** Criacao do doc de diagnostico com campos corretos (incluindo `type: 'initial'`)
   - **Teste 2:** Salvamento das 3 secoes (grammar, listening, pronunciation) no doc
   - **Teste 3:** `calculateDiagnosticResult` — calculo correto de scores + persistencia no perfil

   Para testes 1 e 2: testes unitarios com mocks do Firestore.
   Para teste 3: pode ser teste de integracao na CF com emulador, ou teste unitario da logica pura (extrair funcoes `scoreToLevel`, `deriveStrengths`, `deriveWeaknesses` e testar).

**Arquivos a criar:**
- `src/features/diagnostic/__tests__/diagnosticFlow.test.ts` (testes 1-2)
- `functions/src/__tests__/calculateDiagnosticResult.test.ts` (teste 3) — OU mover logica pura para funcoes testaveIs

---

## Fase 3 — Higiene de Processo (P3)

### Fix 7: Sincronizar status das stories 1.1-1.3

**Problema:** `docs/BACKLOG.md` marca stories 1.1, 1.2, 1.3 com `[x]`, mas os story files em `docs/stories/` ainda tem `status: pending` no frontmatter.

**Correcao:**
```bash
python3 .agents/scripts/finish_task.py "1.1"
python3 .agents/scripts/finish_task.py "1.2"
python3 .agents/scripts/finish_task.py "1.3"
python3 .agents/scripts/progress_tracker.py
```

Se `finish_task.py` falhar, investigar o motivo e corrigir o script — NAO editar frontmatter manualmente. O fluxo oficial via script garante consistencia entre backlog, story files e PROJECT_STATUS.

**Arquivos afetados:**
- `docs/stories/STORY-1-1_onboarding-slides.md`
- `docs/stories/STORY-1-2_teste-gramatica.md`
- `docs/stories/STORY-1-3_teste-compreensao.md`

---

## Criterios de Pronto (Definition of Done)

Todos devem passar para considerar o plano completo:

- [ ] `npm run lint` — zero erros
- [ ] `npm run type-check` — zero erros
- [ ] `npm run build` — sucesso
- [ ] `npm run test:run` — testes passando (sem `--passWithNoTests`)
- [ ] Fluxo diagnostico funcional fim-a-fim com Firestore rules ativas
- [ ] Navegacao sem links quebrados (itens desabilitados com "Em breve")
- [ ] Retry de resultado funcional (refaz chamada a CF)
- [ ] Perfil do usuario contem todos os campos: `level`, `levelScore`, `grammarScore`, `listeningScore`, `speakingScore`, `weakPhonemes[]`, `diagnosticDate`
- [ ] `UserProfile` em `functions/src/types/firestore.ts` atualizado com os 5 novos campos
- [ ] Stories 1.1-1.3 com `status: done` no frontmatter

---

## Agentes para Execucao

| Dominio | Agente | Fixes |
|---------|--------|-------|
| Frontend | `frontend-specialist` | Fix 1, 2, 3, 4 |
| Backend | `backend-specialist` | Fix 5 |
| Testes | `test-engineer` | Fix 6 |
| Processo | (script) | Fix 7 |

---

## Notas para o Executor

1. **Ordem de execucao:** Fase 1 -> Fase 2 -> Fase 3. Nao pular fases.
2. **Commits:** Um commit por fix (ou agrupar por fase se preferir). Mensagens descritivas.
3. **Nao fazer:** Nao refatorar codigo adjacente. Nao adicionar features. Escopo fechado.
4. **Design system:** O projeto usa Tailwind 4 + Material Symbols. Para o badge "Em breve", usar classes existentes (`text-xs`, `text-neutral-400`, `bg-neutral-100`, `rounded-full`, `px-2`, `py-0.5`).
5. **Tratamento de erro (Fix 1):** O projeto nao tem componente de toast. Usar alerta inline (div com bg-error/10, texto de erro, botao de retry) no mesmo padrao visual de `DiagnosticResultView.tsx:88-103`.
6. **Branch:** Criar branch `fix/epic-0-1-review-corrections` a partir de `main`.
