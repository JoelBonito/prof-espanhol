# Sprint 0 — Resultados de Validação iPad Safari

**Data do teste:**
**Dispositivo:** iPad (modelo)
**iPadOS:**
**Safari:**
**URL testada:** https://prof-espanhol-joel.web.app/device-test

---

## Resultados por API

| API | Status | Notas |
|-----|--------|-------|
| getUserMedia (câmera + mic) | ⬜ Pendente | |
| WebSocket wss:// (30 min) | ⬜ Pendente | |
| Wake Lock API | ⬜ Pendente | |
| Web Push Notifications | ⬜ Pendente | |
| PWA Install (Add to Home Screen) | ⬜ Pendente | |
| MediaRecorder | ⬜ Pendente | |
| AudioContext | ⬜ Pendente | |
| Web Speech API | ⬜ Pendente | |

**Legenda:** ✅ Passou | ⚠️ Parcial | ❌ Falhou | ⬜ Pendente

---

## Decisões Arquiteturais (preencher após teste)

### getUserMedia
- [ ] ✅ Funciona → Prosseguir com Chat via browser
- [ ] ❌ Falhou → Avaliar Capacitor (wrapper nativo)

### WebSocket (wss://)
- [ ] ✅ Estável 30min → Prosseguir com Gemini Live API
- [ ] ⚠️ Cai após X min → Implementar reconexão automática
- [ ] ❌ Falhou → Avaliar Capacitor

### Wake Lock
- [ ] ✅ Nativo funciona
- [ ] ⚠️ Fallback AudioContext necessário → Implementar em Story 2.1
- [ ] ❌ Ambos falharam → Chat mostra aviso "mantenha tela ativa"

### Web Push
- [ ] ✅ Funciona → Implementar notificações de agenda (Story 5.3)
- [ ] ⚠️ Parcial (permissão ok, push manager limitado) → Apenas notificações locais
- [ ] ❌ Falhou → App mostra lembretes apenas ao abrir

### Web Speech API
- [ ] ✅ Funciona → Considerar como opção além do Gemini
- [ ] ❌ Falhou → Confirmar: usar Gemini server-side transcription (já planejado)

---

## Bloqueadores identificados

> Listar aqui qualquer bloqueador crítico (getUserMedia ou WebSocket falhando)
> que exija revisão arquitetural antes de prosseguir com o Epic 2.

---

## User-Agent completo

```
(colar aqui o User-Agent copiado da página de teste)
```

---

## Próximo passo

- Se sem bloqueadores → prosseguir com Story 0.6 e depois Epic 1
- Se getUserMedia ou WebSocket falharem → abrir ADR de revisão arquitetural (Capacitor vs PWA)
