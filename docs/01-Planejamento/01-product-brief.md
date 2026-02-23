# Product Brief: Espanhol — Tutor AI de Espanhol para iPad

## Metadados
- **Data de criacao:** 2026-02-22
- **Autor:** AI Product Manager
- **Versao:** 1.0
- **Status:** Draft

---

## 1. Visao do Produto

### 1.1 Declaracao de Visao
> "Para **uma familia brasileira vivendo no Paraguai** que **precisa evoluir em espanhol de forma flexivel, personalizada e sem vergonha de errar**, o **Espanhol** e um **tutor de idiomas com IA multimodal para iPad** que **oferece pratica de conversacao, correcao fonetica em tempo real e licoes adaptativas ao nivel e rotina de cada usuario**. Diferente de **apps genericos como Duolingo ou aulas presenciais rigidas**, nosso produto **usa camera, microfone e IA conversacional para criar uma experiencia imersiva, contextualizada ao vocabulario paraguaio e adaptada a tres perfis distintos de aprendizagem dentro da mesma familia.**"

### 1.2 Elevator Pitch (30 segundos)
Matheus, Renata e Joel moram no Paraguai e precisam de espanhol todos os dias -- na universidade, no hospital e na rua. Mas apps tradicionais ensinam espanhol generico, aulas presenciais nao cabem nas agendas e a vergonha de falar trava o progresso. O Espanhol e um tutor AI no iPad que ve, ouve e conversa: ele analisa pronuncia em tempo real, adapta licoes ao nivel de cada um e cobra disciplina com agenda fixa e exercicios com prazo. Sem gamificacao superficial, sem desculpas -- apenas progresso real, mensuravel, em familia.

---

## 2. Problema

### 2.1 Declaracao do Problema
| Aspecto | Descricao |
|---------|-----------|
| **O problema** | Dificuldade de praticar e evoluir em espanhol de forma autonoma, flexivel e pedagogicamente eficaz, agravada pela estagnacao no aprendizado e pela vergonha de falar o idioma no dia a dia |
| **Afeta** | Tres membros de uma familia brasileira vivendo/estudando no Paraguai: um universitario iniciante (Matheus), uma estudante de medicina intermediaria (Renata) e um profissional remoto que precisa de fluencia utilitaria (Joel) |
| **O impacto e** | Dependencia cronica de "portunhol" em contextos academicos, profissionais e cotidianos; perda de oportunidades por barreira linguistica; estagnacao no nivel de fluencia mesmo apos meses no pais |
| **Hoje e resolvido por** | Apps genericos (Duolingo) que focam em texto/gramatica desconectados de contexto visual e sem analise profunda de fala; ferramentas de IA genericas sem pedagogia estruturada; aulas presenciais inflexiveis que nao quebram totalmente a barreira da timidez |

### 2.2 Evidencias do Problema
- Tres usuarios reais com rotinas incompativeis com horarios fixos de cursos presenciais, gerando abandono recorrente de metodos tradicionais
- Apps como Duolingo nao oferecem analise fonetica profunda nem correcao de sotaque -- habilidades criticas para Renata em contexto medico e Joel em conversas de rua
- O fenomeno do "portunhol" como zona de conforto indica que, sem pressao estruturada e pratica de fala real, a evolucao estagna mesmo em contexto de imersao geografica
- Vergonha de errar perante falantes nativos ou professores humanos limita a frequencia de pratica oral -- um tutor AI elimina esse fator emocional

### 2.3 Consequencias de Nao Resolver
- **Curto prazo:** Matheus tem dificuldade para acompanhar aulas em espanhol na faculdade de medicina; Joel continua usando portunhol em interacoes diarias, limitando integracao social
- **Medio prazo:** Renata nao consegue corrigir sotaque e pronuncia, comprometendo comunicacao profissional com pacientes e colegas em ambiente hospitalar; habitos errados de pronuncia se cristalizam
- **Longo prazo:** A familia permanece linguisticamente isolada no Paraguai; oportunidades academicas e profissionais sao perdidas; a barreira do idioma se torna um fator de frustracao cronica e estagnacao pessoal

---

## 3. Solucao

### 3.1 Descricao da Solucao
O Espanhol e um aplicativo para iPad (PWA) que funciona como um tutor particular de espanhol com inteligencia artificial multimodal. Utilizando a camera e o microfone do iPad em conjunto com a API Gemini 3 Flash via WebSocket bidirecional, o app cria sessoes de conversacao onde o usuario fala, e ouvido, visto e corrigido em tempo real -- sem julgamento humano e sem rigidez de horario.

O sistema comeca com um teste diagnostico obrigatorio (voz + texto) que estabelece a linha de base de fluencia de cada usuario. A partir desse perfil, o app gera conteudo adaptativo: licoes teoricas com quizzes interativos para quem precisa de fundamento gramatical, sessoes de conversacao supervisionada com analise fonetica para quem precisa de pratica oral, e conversas rapidas e fluidas para quem quer vocabulario utilitario do dia a dia paraguaio.

O diferencial estrutural e o sistema de disciplina: o usuario define blocos fixos semanais de estudo e recebe exercicios com prazo baseados em curva de esquecimento. O sistema avalia taxas de acerto recentes e recalcula dinamicamente a dificuldade e o conteudo das proximas licoes, garantindo que o aprendizado nunca estagne nem fique facil demais.

### 3.2 Proposta de Valor Unica (UVP)
| Diferencial | Como entregamos | Beneficio para usuario |
|-------------|-----------------|----------------------|
| Tutoria multimodal (camera + voz + texto) | Gemini 3 Flash Multimodal via WebSocket bidirecional captura video e audio do iPad simultaneamente | Pratica imersiva que simula interacao presencial sem a vergonha de errar perante um humano |
| Correcao fonetica em tempo real | Analise de pronuncia frame-a-frame pelo modelo multimodal com feedback visual e auditivo instantaneo | Reducao mensuravel de vicios de pronuncia e sotaque brasileiro ao falar espanhol |
| Adaptacao dinamica de dificuldade | Algoritmo que avalia taxa de acerto das ultimas licoes e recalcula conteudo/dificuldade automaticamente | Aprendizado sempre no nivel ideal -- nem facil demais, nem frustrante |
| Sistema de disciplina com agenda rigida | Blocos semanais obrigatorios + exercicios com prazo baseados em curva de esquecimento | Consistencia de estudo que impede estagnacao e abandono |
| Contextualizacao paraguaia | Vocabulario, expressoes e cenarios especificos do espanhol falado no Paraguai | Aplicabilidade imediata no cotidiano real dos usuarios |

### 3.3 Funcionalidades Core do MVP
| # | Funcionalidade | Descricao | Justificativa (Por que MVP?) |
|---|----------------|-----------|------------------------------|
| 1 | **Teste Diagnostico** | Teste interativo obrigatorio no primeiro acesso (voz + texto) que avalia gramatica, compreensao e pronuncia para criar perfil de fluencia base | Sem diagnostico, o sistema nao sabe em que nivel iniciar -- e a fundacao de toda personalizacao |
| 2 | **Chat Supervisionado (Voz + Visao)** | Conversa com tutor AI usando camera + microfone do iPad; correcoes foneticas em tempo real com feedback visual (ondas sonoras, legendas, avatar) | E o diferencial central do produto -- elimina vergonha, permite pratica oral real e oferece o que nenhum app generico entrega |
| 3 | **Licoes Teoricas + Quizzes** | Material didatico interativo na tela (flashcards, exercicios de multipla escolha, preenchimento) supervisionado verbalmente pela IA | Matheus precisa de fundamento gramatical antes de conversar; sem base teorica, a pratica oral e ineficaz para iniciantes |
| 4 | **Adaptador de Agenda (Schedule Adapter)** | Sistema que avalia taxas de acerto recentes, recalcula dificuldade e gera dinamicamente o proximo conteudo personalizado | Sem adaptacao, o conteudo fica generico e a estagnacao -- o problema central -- nao e resolvida |
| 5 | **Agenda Rigida + Deveres** | Usuario define blocos fixos semanais de estudo; exercicios com prazo sao gerados com base na curva de esquecimento | A disciplina e o que diferencia aprendizado real de uso casual; sem cobranca, o habito nao se forma |

### 3.4 Fora do Escopo (Explicitamente)
| Funcionalidade | Por que nao esta no MVP | Versao planejada |
|----------------|-------------------------|------------------|
| Gamificacao complexa (moedas, ligas, pontos, ranking) | Adiciona complexidade de desenvolvimento sem resolver o problema central; o publico e familiar e motivado intrinsecamente | v2.0 (se houver expansao para usuarios externos) |
| Suporte a celular e computador | O iPad e o dispositivo primario da familia; otimizar para multiplas plataformas triplicaria o esforco de UI/UX | v2.0 |
| Tutores humanos | Contradiz a proposta de autonomia e flexibilidade; adiciona custo operacional e dependencia de terceiros | Fora do roadmap |
| Conteudo para outros idiomas | Foco total em espanhol paraguaio; generalizar diluiria a qualidade | v3.0 |
| Modo offline completo | WebSocket bidirecional com Gemini exige conexao; offline comprometeria a funcionalidade core | v2.0 (cache de licoes teoricas) |

---

## 4. Publico-Alvo

### 4.1 Persona Primaria: Matheus (Iniciante)
| Atributo | Descricao |
|----------|-----------|
| **Nome** | Matheus |
| **Cargo/Papel** | Estudante universitario, 1o semestre de Medicina |
| **Contexto** | Universidade no Paraguai com aulas ministradas em espanhol; vive com a familia |
| **Objetivos** | Construir base gramatical solida para acompanhar aulas, entender textos academicos e participar de discussoes em sala |
| **Frustracoes** | Apps genericos nao ensinam gramatica de forma estruturada; aulas presenciais tem horarios que conflitam com a faculdade; sente vergonha de falar errado na frente de colegas nativos |
| **Comportamento digital** | Nativo digital, acostumado com apps no iPad, prefere conteudo visual e interativo a leitura densa |
| **Quote caracteristica** | *"Eu entendo quando leio, mas na hora de falar trava tudo. Preciso de alguem que me corrija sem eu morrer de vergonha."* |

### 4.2 Persona Secundaria: Renata (Intermediaria)
| Atributo | Descricao |
|----------|-----------|
| **Nome** | Renata |
| **Cargo/Papel** | Estudante avancada de Medicina (semestres finais / residencia) |
| **Contexto** | Ambiente hospitalar no Paraguai; precisa se comunicar com pacientes e colegas em espanhol tecnico/medico |
| **Objetivos** | Aperfeicoar conversacao em temas medicos, corrigir pronuncia e reduzir sotaque brasileiro para ser compreendida com clareza |
| **Frustracoes** | Nenhum app oferece pratica oral com vocabulario medico; professores generalistas nao entendem o contexto clinico; sente que estagna no intermediario sem conseguir dar o salto para fluencia |
| **Comportamento digital** | Usa iPad para estudos medicos; valoriza ferramentas que otimizam tempo entre plantoes e aulas |
| **Quote caracteristica** | *"Meus pacientes me entendem, mas eu sei que meu sotaque atrapalha. Preciso de alguem que me faca repetir ate sair certo."* |

### 4.3 Persona Terciaria: Joel (Profissional)
| Atributo | Descricao |
|----------|-----------|
| **Nome** | Joel |
| **Cargo/Papel** | Profissional em home-office (trabalho remoto) |
| **Contexto** | Vive no Paraguai, precisa de espanhol para interacoes cotidianas -- supermercado, vizinhos, servicos, burocracia |
| **Objetivos** | Conversas rapidas e fluidas com vocabulario utilitario paraguaio; nao quer estudar gramatica formal, quer se virar no dia a dia |
| **Frustracoes** | Apps ensinam espanhol da Espanha ou generico latino-americano, nao o espanhol falado nas ruas de Asuncion; interrupcoes constantes para correcao quebram o fluxo da conversa |
| **Comportamento digital** | Usa iPad em casa; prefere sessoes curtas (10-15 min) entre reunioes de trabalho; Product Owner do projeto |
| **Quote caracteristica** | *"Eu nao quero virar professor de espanhol. So quero parar de falar portunhol no mercado."* |

### 4.4 Anti-Persona
| Perfil | Por que NAO e usuario |
|--------|----------------------|
| **Estudante formal de Letras/Linguistica** | Precisa de profundidade academica, analise contrastiva e certificacao oficial que o app nao oferece |
| **Turista de passagem** | Nao tem compromisso de longo prazo com o idioma; nao se beneficiaria do sistema de agenda rigida |
| **Crianca em fase de alfabetizacao** | O app assume letramento completo em portugues e capacidade de interacao complexa com IA |
| **Falante nativo de espanhol** | O produto e exclusivamente para aprendizes brasileiros de espanhol |

---

## 5. Metricas de Sucesso

### 5.1 North Star Metric
> **A unica metrica:** Taxa de Conclusao de Licoes Mensais > 85% (media dos 3 usuarios)

Essa metrica captura engajamento, disciplina e valor percebido simultaneamente. Se os usuarios completam mais de 85% das licoes agendadas, significa que o conteudo e relevante, a dificuldade e adequada e o sistema de agenda funciona.

### 5.2 Metricas de Acompanhamento
| Categoria | Metrica | Meta MVP | Como medir |
|-----------|---------|----------|------------|
| **Performance** | Latencia E2E da conversacao (tempo entre fala do usuario e resposta da IA) | < 1.5 segundos | Timestamp no WebSocket: delta entre ultimo frame de audio enviado e primeiro frame de audio recebido |
| **Disciplina** | Aderencia ao calendario semanal | >= 80% dos blocos agendados cumpridos | Registro de sessoes iniciadas vs. blocos definidos no calendario, por semana |
| **Eficacia Fonetica** | Reducao de vicios de pronuncia recorrentes | 30% de reducao nos primeiros 10 exercicios de pratica | Comparacao do score fonetico do teste diagnostico inicial vs. score acumulado apos 10 sessoes de pratica oral |
| **Progressao** | Avanco de nivel no teste diagnostico | Pelo menos 1 nivel acima em 60 dias | Re-aplicacao automatica do teste diagnostico a cada 30 dias; comparacao com baseline |
| **Retencao** | Dias ativos por semana (media) | >= 4 dias/semana | Contagem de dias com pelo menos 1 sessao iniciada, media movel de 4 semanas |
| **Adaptacao** | Taxa de acerto pos-recalibragem | Entre 60-80% (zona ideal de aprendizado) | Percentual de acerto nos exercicios gerados pelo Schedule Adapter -- se muito alto (>80%), o sistema deve aumentar dificuldade |

### 5.3 Criterios de Sucesso do MVP
- [ ] Os 3 usuarios (Matheus, Renata, Joel) completam o teste diagnostico e recebem perfis de fluencia distintos e coerentes com seus niveis reais
- [ ] Sessao de chat supervisionado funciona com camera + microfone + correcao fonetica em tempo real com latencia < 1.5s
- [ ] Matheus consegue completar um modulo teorico com flashcards e quizzes e demonstra melhora mensuravel em gramatica basica
- [ ] Renata pratica conversa sobre tema medico e recebe feedback fonetico especifico com indicacao de fonemas a corrigir
- [ ] Joel realiza conversa fluida de 5 minutos sobre vocabulario cotidiano paraguaio sem interrupcoes excessivas da IA
- [ ] O Schedule Adapter ajusta dificuldade automaticamente apos detectar taxa de acerto acima de 80% por 3 sessoes consecutivas
- [ ] Os 3 usuarios mantem aderencia de >= 80% a agenda semanal durante as primeiras 4 semanas
- [ ] Taxa de conclusao de licoes mensais atinge >= 85% no primeiro mes de uso

---

## 6. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| **Latencia do WebSocket com Gemini 3 Flash excede 1.5s** | Media | Alto | Implementar buffer de audio local + resposta parcial (streaming token-by-token); testar com conexoes paraguaias reais antes do lancamento; fallback para modo texto se latencia > 3s |
| **Qualidade da analise fonetica insuficiente para correcao de sotaque** | Media | Alto | Testar extensivamente com gravacoes reais dos 3 usuarios durante desenvolvimento; calibrar prompts do modelo com exemplos de sotaque brasileiro; definir metricas minimas de acuracia antes de considerar feature pronta |
| **Custos da API Gemini escalam alem do esperado** | Baixa | Medio | Monitorar consumo diario desde o dia 1; definir limites de minutos de conversacao por usuario/dia; otimizar prompts para reduzir tokens; considerar cache de respostas para exercicios repetitivos |
| **Usuarios abandonam agenda rigida por falta de motivacao** | Media | Alto | Notificacoes gentis mas firmes no iPad; relatorios semanais de progresso visivel; sistema de "streak" simples (sem gamificacao complexa); Joel como PO reforcar compromisso familiar |
| **PWA no iPad tem limitacoes de acesso a camera/microfone** | Baixa | Critico | Testar no Safari/iPadOS desde o Sprint 0; se PWA for insuficiente, pivotar para app nativo via Capacitor/Ionic como fallback; documentar requisitos minimos de versao do iPadOS |
| **Conteudo gerado pela IA contem erros gramaticais ou foneticos** | Baixa | Alto | Implementar camada de validacao pos-geracao para exercicios teoricos; usuarios reportam erros via botao de feedback; Joel revisa conteudo periodicamente como PO |
| **Firestore nao suporta queries complexas para analytics do Schedule Adapter** | Baixa | Medio | Projetar schema do Firestore com desnormalizacao intencional para os padroes de query necessarios; se insuficiente, adicionar camada de agregacao em Cloud Functions |
| **Apenas 3 usuarios nao geram dados suficientes para validar metricas** | Alta | Medio | Aceitar que metricas serao qualitativas no inicio; definir criterios de sucesso por usuario individual, nao por media estatistica; feedback semanal presencial (familia) complementa dados |

---

## 7. Premissas e Restricoes

### 7.1 Premissas
| # | Premissa |
|---|----------|
| 1 | Os 3 usuarios possuem iPad com camera e microfone funcionais e conexao estavel com internet |
| 2 | A API Gemini 3 Flash Multimodal suporta WebSocket bidirecional com audio + video streaming simultaneo |
| 3 | O Safari no iPadOS permite acesso completo a camera e microfone via PWA sem restricoes criticas |
| 4 | Os usuarios se comprometem a definir e cumprir blocos semanais de estudo |
| 5 | O espanhol paraguaio pode ser adequadamente representado via prompt engineering no modelo, sem necessidade de fine-tuning |

### 7.2 Restricoes
| # | Restricao |
|---|-----------|
| 1 | Plataforma unica: iPad (nao otimizar para celular ou desktop no MVP) |
| 2 | Sem monetizacao: ferramenta fechada para uso familiar, sem necessidade de sistema de pagamento |
| 3 | Sem backend complexo: Firebase (Auth + Firestore + Functions + Hosting) como infra completa |
| 4 | Sem tutores humanos: toda interacao pedagogica e via IA |
| 5 | Sem modo offline: funcionalidades core dependem de conexao com a API Gemini |

---

## Aprovacoes

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| Product Owner | Joel | Pendente | - |
| Usuario Primario | Matheus | Pendente | - |
| Usuario Secundario | Renata | Pendente | - |
