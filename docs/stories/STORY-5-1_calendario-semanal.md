---
story: "5.1"
epic: "Epic 5: Agenda e Disciplina"
status: pending
agent: frontend-specialist
tool: claude_code
depends_on: ["0.2", "0.4", "1.5"]
unlocks: ["5.2", "5.3"]
priority: P0
model: sonnet
---

# Story 5.1: Calendario semanal + tolerancia 75min

## Contexto do Epic
Epic 5 implementa agenda rigida com deveres e prazos. Esta story cria o calendario semanal onde o usuario define blocos fixos de estudo. RF06.

## Requisito
Como usuario, quero definir blocos fixos de estudo na minha semana (minimo 3 blocos de 15min) para que eu mantenha disciplina e consistencia no aprendizado.

## Criterios de Aceite
```gherkin
DADO que o usuario acessa "Minha Agenda" apos diagnostico
QUANDO ve o calendario semanal
ENTAO ve grade de 7 dias x 24h com slots de 15min
E pode definir blocos arrastando/tocando nos horarios desejados

DADO que o usuario tenta salvar com menos de 3 blocos
QUANDO toca "Salvar"
ENTAO ve mensagem "Minimo de 3 blocos por semana para garantir progresso"

DADO que o usuario definiu blocos e salvou
QUANDO os blocos sao persistidos
ENTAO sao salvos em schedule/{uid} no Firestore com: dia, horario, tipo (licao/chat), duracao

DADO que uma sessao e iniciada dentro da janela de 75 minutos
QUANDO o usuario comeca ate 75min antes ou depois do horario agendado
ENTAO o slot correspondente e marcado como "completed" em scheduleLogs/{uid}

DADO que uma sessao e iniciada fora da janela de 75 minutos
QUANDO o usuario comeca mais de 75min fora do horario
ENTAO a sessao nao conta para o slot agendado
E gera evento de alerta

DADO que a agenda pode ser editada
QUANDO o usuario modifica blocos futuros
ENTAO a mudanca e salva imediatamente
E blocos passados nao-cumpridos permanecem como "missed"
```

## Contexto Tecnico
- RF06 criterios: 02-prd.md
- RN21: Minimo 3 blocos semanais de 15min
- RN25: Agenda editavel, blocos passados nao-cumpridos = missed
- RN26-RF06: Janela de tolerancia 75min (G-ARCH-10)
- Schema: schedule/{uid} com weeklyBlocks[], scheduleLogs/{uid} com entries por slot
- UI: Grade semanal touch-friendly (drag to define no iPad)
- Wireframe: 03-ux-concept.md secao 4.8 (Agenda)
- Prototipos Stitch: tela de agenda/calendario

## GAPs Cobertos
- G-ARCH-10: Tolerancia de agenda 75min

## Contexto de Dependencias
> Story 0.2: Firestore schema com schedule/{uid} e scheduleLogs/{uid}
> Story 0.4: Design System components para calendario
> Story 1.5: Nivel do usuario calculado (blocos podem sugerir tipo de atividade por nivel)
> Story 0.4 (Design System core components): implementada

## Agent Workspace
> Notas do agente durante implementacao
