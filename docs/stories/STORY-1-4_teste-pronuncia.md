---
story: "1.4"
epic: "Epic 1: Teste Diagnostico"
status: pending
agent: backend-specialist
tool: claude_code
depends_on: ["1.3"]
unlocks: ["1.5"]
priority: P0
model: opus-4-6
---

# Story 1.4: Teste de pronuncia (Gemini audio analysis)

## Contexto do Epic
Epic 1 implementa o teste diagnostico obrigatorio. Esta story cobre a Secao 3: o usuario le 5 frases em voz alta e o Gemini analisa a pronuncia via Cloud Function.

## Requisito
Como novo usuario, quero ler 5 frases em espanhol em voz alta para que o Gemini analise minha pronuncia e identifique fonemas problematicos.

## Criterios de Aceite
```gherkin
DADO que o usuario completou a secao de compreensao
QUANDO chega na Secao 3 (Pronuncia)
ENTAO ve a primeira frase para ler em voz alta + botao "Gravar"
E o app solicita permissao de microfone (se ainda nao concedida)

DADO que o usuario grava sua pronuncia
QUANDO o audio e enviado ao Cloud Function
ENTAO o Gemini REST API analisa a pronuncia e retorna score fonetico (0-100) + lista de fonemas problematicos

DADO que o score fonetico e calculado para cada frase
QUANDO as 5 frases sao completadas
ENTAO o sistema salva score de pronuncia e fonemas problematicos em diagnostics/{uid}/speaking

DADO que o microfone nao esta disponivel
QUANDO o usuario tenta gravar
ENTAO exibe instrucoes para habilitar permissao de microfone no Safari
E nao permite pular a secao (pronuncia e obrigatoria)
```

## Contexto Tecnico
- RF02 criterios de aceite (secao pronuncia): 02-prd.md
- RN06: Gemini 3 Flash Multimodal com prompt calibrado para sotaque brasileiro falando espanhol
- RN07: Peso maior em pronuncia (40%) no calculo final
- Cloud Function: `createDiagnosticSession` recebe audio blob, envia ao Gemini REST, retorna score + fonemas
- MediaRecorder API para gravar audio no Safari iPadOS
- Schema: diagnostics/{uid}/speaking (score, phonemes[], recordedAt)
- Prompt engineering: considerar sotaque brasileiro, fonemas criticos (rr, ll, j, z)
- G-PRD-02: Motor IA pedagogica (primeiro ponto de contato com Gemini para analise fonetica)

## GAPs Cobertos
- G-PRD-02: Motor de IA pedagogica (parcial — analise fonetica no diagnostico)

## Contexto de Dependencias
> Story 1.3: Secao de compreensao completa; routing para secao 3

## Agent Workspace
> Notas do agente durante implementacao
