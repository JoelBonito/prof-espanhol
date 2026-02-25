# PLAN - Aula Adaptativa Multimodal (execucao para Claude)

## 1) Objetivo

Transformar o chat de voz atual em uma aula estruturada com quadro virtual, mantendo o comportamento existente e corrigindo regressoes de legenda.

Resultado esperado:
- Aula guiada por fases (nao conversa livre solta).
- Legendas sempre no idioma falado (ES ou PT-BR), nunca texto interno do modelo.
- Quadro virtual com trecho de leitura + estado da fase atual.
- Base pronta para progressao adaptativa por nivel.

---

## 2) Estado atual validado (2026-02-24)

Arquivos reais que ja existem e devem ser usados:
- `src/features/chat/lib/geminiLive.ts`
- `src/features/chat/lib/buildSystemPrompt.ts` (copia client-side legacy — NAO usada no fluxo real; o prompt real e construido server-side em `functions/src/createChatSession.ts` via `buildSystemPrompt()`)
- `src/stores/chatStore.ts`
- `src/features/chat/components/ChatContainer.tsx`
- `src/features/chat/components/MessageFeed.tsx`
- `functions/src/createChatSession.ts`
- `functions/src/evaluateAdaptiveSession.ts`

Observacao importante:
- O plano antigo citava caminhos que nao existem no frontend (`createChatSession.ts` client-side). O endpoint real e Cloud Function em `functions/src/createChatSession.ts`.

---

## 3) Escopo (MVP)

Incluido no MVP:
- Correcao de legendas (P0).
- Contrato de idioma (ES por padrao, PT-BR sob gatilho).
- Quadro virtual com texto, fase e progresso de trecho.
- Parsing de marcador estruturado de quadro vindo do tutor.
- Integracao com store para renderizar fases basicas da aula.

Fora do MVP (deixar para fase posterior):
- Avaliacao fonetica palavra-a-palavra precisa com alinhamento forense de audio.
- Motor de recomendacao pedagogica complexo em tempo real.
- Conteudo multimidia (imagem/video no quadro).

---

## 4) Contrato tecnico obrigatorio

### 4.1 Canais de dados do Gemini Live (nativo audio)

Com `responseModalities: [AUDIO]`, o modelo envia 3 canais distintos:

| Campo | Conteudo | Uso no app |
|-------|----------|------------|
| `serverContent.outputTranscription.text` | Transcricao do audio falado pelo tutor | **Legendas** (fonte primaria) |
| `serverContent.modelTurn.parts[].text` | Texto estruturado nao-falado (raciocinio, comandos) | **Parsing de `BOARD_JSON` e `CORRECTION_JSON`** |
| `serverContent.modelTurn.parts[].inlineData` | Chunks de audio PCM | **Playback de audio** |

Regras:
1. Legendas: usar `outputTranscription.text`. Fallback: `message.text`. NUNCA exibir `parts.text` como legenda.
2. Marcadores: parsear `parts.text` para extrair `BOARD_JSON` e `CORRECTION_JSON`. Nao exibir no feed.
3. Audio: encaminhar `inlineData` para playback como ja funciona hoje.

### 4.1.1 Pre-requisito: habilitar transcription

`outputTranscription` so aparece se `outputAudioTranscription: {}` estiver habilitado na config.
`inputTranscription` (fala do aluno) so aparece se `inputAudioTranscription: {}` estiver habilitado.

Ambos devem ser habilitados em DOIS lugares:

1. **Server** — `functions/src/createChatSession.ts` no `liveConnectConstraints.config`:
```typescript
config: {
  temperature: 0.7,
  responseModalities: [Modality.AUDIO],
  systemInstruction: systemPrompt,
  outputAudioTranscription: {},  // transcricao do tutor
  inputAudioTranscription: {},   // transcricao do aluno
}
```

2. **Client** — `src/features/chat/lib/geminiLive.ts` no `ai.live.connect()`:
```typescript
config: {
  responseModalities: [Modality.AUDIO],
  outputAudioTranscription: {},
  inputAudioTranscription: {},
}
```

Nota: o token ephemero TRAVA os campos da config. Se `outputAudioTranscription` estiver no token, o valor do client e ignorado pelo servidor — mas manter nos dois garante compatibilidade.

### 4.2 Marcador de quadro (novo)

Padrao de mensagem textual para o tutor emitir:

```text
[BOARD_JSON:{"lessonTitle":"...","text":"...","state":"presentation","level":"A1","sectionIndex":1,"sectionTotal":5}]
```

Regras:
- Sempre JSON valido.
- Um marcador por turno quando houver troca de trecho/fase.
- O texto falado para aluno continua separado do marcador.

### 4.3 Estados de fase (MVP)

Estados suportados no cliente:
- `presentation`
- `tutor_reading`
- `student_reading`
- `analyzing`
- `correcting`
- `request_translation`
- `student_translating`
- `correcting_translation`
- `next_section`
- `completed`

Se estado desconhecido chegar:
- fazer fallback para `presentation` sem quebrar UI.

### 4.4 Contrato de idioma

Padrao:
- Tutor em espanhol paraguaio.
- Muda para PT-BR quando aluno pede ajuda explicitamente ou quando houver erro repetido.
- Legenda sempre no idioma falado na resposta.

---

## 5) Plano de implementacao (ordem obrigatoria)

## Fase 0 - P0 (bloqueante)

1. Habilitar transcription no token ephemero em `functions/src/createChatSession.ts`:
   - Adicionar `outputAudioTranscription: {}` e `inputAudioTranscription: {}` ao `liveConnectConstraints.config`.
2. Habilitar transcription no client em `src/features/chat/lib/geminiLive.ts`:
   - Adicionar `outputAudioTranscription: {}` e `inputAudioTranscription: {}` ao config de `ai.live.connect()`.
3. Corrigir legendas em `geminiLive.ts` `handleMessage()`:
   - Usar `serverContent.outputTranscription.text` como fonte de legendas.
   - Parsear `modelTurn.parts.text` apenas para marcadores (`BOARD_JSON`, `CORRECTION_JSON`). Nao exibir como legenda.
   - Manter fallback `message.text` para modos sem audio.
4. Ajustar system prompt server-side em `functions/src/createChatSession.ts`:
   - Reforcar contrato de idioma (ES padrao, PT-BR sob gatilho).
   - Adicionar instrucoes para emissao de `BOARD_JSON` quando conduzindo aula com quadro.

DoD Fase 0:
- `outputTranscription` retorna texto no idioma falado (ES ou PT-BR).
- Nao aparece ingles de raciocinio interno nas legendas.
- `inputTranscription` retorna transcricao da fala do aluno.
- Fluxo audio/texto continua funcional.
- Build do functions passa apos alteracao.

## Fase 1 - Modelo de dados de board

1. Estender `src/stores/chatStore.ts` com estado de board:
   - `board` (dados do trecho atual)
   - `boardState`
   - acoes para `setBoardFromMarker`, `clearBoard`.
2. Criar tipos TS para payload do `BOARD_JSON`.
3. Validar parse defensivo (try/catch + schema simples):
   - `state` deve ser validado contra enum de estados conhecidos (secao 4.3).
   - Valor fora do enum: fallback silencioso para `presentation`.

DoD Fase 1:
- Recebe marcador valido e store atualiza sem erros.
- Marcador invalido nao derruba sessao.

## Fase 2 - UI do quadro virtual (MVP visual)

1. Criar componente `src/features/chat/components/VirtualBoard.tsx`.
2. Renderizar no `ChatContainer.tsx` quando `board` ativo.
3. Exibir:
   - titulo da licao
   - texto do trecho
   - fase atual
   - progresso `Trecho X/Y`
4. Responsividade minima:
   - mobile portrait: quadro acima do feed
   - landscape/desktop: quadro ao lado da conversa

DoD Fase 2:
- Quadro aparece/desaparece conforme estado da store.
- Sem quebrar layout existente do chat.

## Fase 3 - Integracao live -> board

1. Em `geminiLive.ts`, detectar e extrair `BOARD_JSON` de `modelTurn.parts.text` (canal de texto estruturado, nao de legendas).
2. Encaminhar callback especifico para atualizar board no hook/store.
3. Em `useGeminiLive.ts` (se necessario), conectar callback ao `chatStore`.
4. `MessageFeed.tsx`: adicionar badge simples de idioma `(ES)` / `(PT)` por heuristica basica.

DoD Fase 3:
- Mudanca de fase via marcador atualiza quadro em tempo real.
- Mensagem comum sem marcador continua aparecendo no feed normalmente.

## Fase 4 - Testes e estabilizacao

1. Unit tests para parser de marcador (`BOARD_JSON`) e fallback.
2. Unit tests para transicao de estado no store.
3. Smoke test manual de sessao real:
   - entrada em ES
   - pedido de explicacao em PT-BR
   - retorno para ES
4. Verificar regressao no fim de sessao e summary.

DoD Fase 4:
- Testes novos passando.
- Sem regressao no fluxo atual de chat.

---

## 6) Arquivos-alvo (checklist de edicao)

Obrigatorios:
- `src/features/chat/lib/geminiLive.ts`
- `src/stores/chatStore.ts`
- `src/features/chat/components/ChatContainer.tsx`
- `src/features/chat/components/MessageFeed.tsx`
- `functions/src/createChatSession.ts`

Novos (MVP):
- `src/features/chat/components/VirtualBoard.tsx`
- `src/features/chat/lib/boardParser.ts`
- `src/features/chat/lib/__tests__/boardParser.test.ts`
- `src/stores/__tests__/chatStore.board.test.ts` (ou pasta equivalente ja usada no repo)

---

## 7) Criterios de aceite finais

1. Legenda nao exibe texto interno em ingles.
2. Tutor consegue conduzir ciclo minimo:
   - apresentacao -> leitura -> correcao -> traducao -> proximo trecho.
3. Quadro virtual renderiza e atualiza fase sem flicker grave.
4. Em iPad Safari portrait, area de board permanece legivel e operavel.
5. Build, type-check e testes relevantes passam.

---

## 8) Riscos e mitigacoes

Risco: modelo nao respeitar formato do marcador.
Mitigacao: parser tolerante + fallback sem interromper chat + reforco no prompt.

Risco: duplicidade de texto (fala + marcador no feed).
Mitigacao: remover marcador bruto do texto exibido ao usuario.

Risco: regressao no fluxo de audio em tempo real.
Mitigacao: manter alteracoes isoladas e validar manualmente conectividade WebSocket.

---

## 9) Script de validacao para entrega

Rodar antes de considerar pronto:

```bash
# frontend
npm run lint
npm run test
npm run build

# functions
cd functions
npm run lint
npm run build
npm run test
```

Se algum comando nao existir, registrar no PR quais checks foram executados e por que os demais nao foram.

---

## 10) Entregavel esperado do Claude

Ao finalizar, Claude deve devolver:
1. Lista de arquivos alterados.
2. Resumo objetivo do que foi implementado por fase.
3. Evidencia de validacao (tests/checks executados).
4. Pendencias nao resolvidas (se houver) com impacto.

