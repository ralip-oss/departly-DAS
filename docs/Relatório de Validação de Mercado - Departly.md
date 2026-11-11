# **Departly**

# **Documento de Especificação de Produto e Estratégia de Mercado**

# **1\. Definição do Produto/Serviço**

O **Departly** é um assistente inteligente de calendário que calcula e bloqueia o tempo de viagem entre compromissos e envia automaticamente avisos de atraso aos seus clientes caso apanhe trânsito inesperado.

# **2\. Declaração do Problema**

Profissionais com dias cheios perdem a noção do tempo ou calculam mal as distâncias de viagem, o que os leva a chegar atrasados a reuniões presenciais importantes. O problema afeta principalmente equipas de vendas, consultores e trabalhadores no terreno que passam grande parte do dia em trânsito, causando stress diário, perda de tempo a verificar constantemente o GPS e danos na sua imagem profissional quando se atrasam sem avisar o cliente atempadamente.

# **3\. Validação e Fundamentação Estratégica**

## **A. Por Que Motivo Isto é Importante**

* **Impacto no Cliente:** Para quem passa o dia no exterior, não ter de adivinhar constantemente a que horas deve sair de uma reunião para chegar à próxima retira uma enorme carga mental. A falha na gestão deste tempo resulta em ansiedade, condução perigosa e desrespeito pelo tempo dos clientes.  
* **Impacto no Negócio:** No setor B2B, a pontualidade é um fator crítico de confiança. Se um comercial se atrasar e o cliente não for avisado, o negócio pode estar em risco. Ferramentas que automatizam o agendamento geram grande valor para as empresas porque maximizam o tempo útil dos seus colaboradores sem sacrificar o atendimento.

## **B. Evidências e Provas**

O mercado já demonstra ativamente que a gestão do tempo de viagem é uma dor real. Aplicações recentes como o *Morgen* adicionaram funcionalidades que bloqueiam o tempo de deslocação de forma automática através do Google Maps. Ao mesmo tempo, existem várias queixas e comunidades inteiras dedicadas a resolver problemas de pontualidade; por exemplo, a aplicação para iPhone "Can't be Late" conta com mais de 200.000 chegadas a tempo, focando-se em utilizadores com "cegueira temporal" (dificuldade crónica em estimar a passagem do tempo) alertando-os sobre a hora exata de saída com base no trânsito real. Existem também ferramentas dedicadas, como o BoardSpy, desenhadas especificamente para tocar um alarme quando deve arrancar para o próximo compromisso físico.

## **C. Contexto Estratégico**

O regresso global ao modelo híbrido e às reuniões presenciais reintroduziu a imprevisibilidade do trânsito na rotina diária. Ao mesmo tempo, os grandes avanços em Modelos de Linguagem (LLMs) tornam possível criar, pela primeira vez, interfaces de voz confiáveis e seguras ao volante. Anteriormente, era impossível para uma aplicação interpretar a intenção de um condutor e redigir proativamente um e-mail de contexto e justificação de atraso sem intervenção manual perigosa.

# **4\. Métricas de Sucesso e Critérios de Fracasso**

## **A. Indicadores de Sucesso**

| Categoria | Métrica / Indicador | Descrição e Objetivo |
| :---- | :---- | :---- |
| **Quantitativa** | Adoção (Utilizadores Ativos) | Frequência com que os utilizadores ativam o bloqueio automático de viagem semanalmente. |
| **Quantitativa** | Taxa de Conversão | Percentagem de utilizadores a transitar do teste gratuito para a subscrição paga B2B. |
| **Quantitativa** | Rácio LTV / CAC | O valor gerado por cliente ao longo do tempo (LTV) deve ser, no mínimo, 3x o custo de aquisição (CAC). |
| **Qualitativa** | Redução de Stress | Feedback direto dos clientes sobre a perceção de segurança e menor ansiedade ao conduzir. |
| **Qualitativa** | Precisão da IA | Eficácia, tom adequado e relevância dos e-mails de justificação gerados automaticamente. |

## **B. Sinais de Fracasso (Quando abortar)**

* **Custo Técnico Elevado:** Se os custos de cada chamada à API de mapas e de trânsito em tempo real superarem a margem da subscrição mensal do SaaS.  
* **Falta de Tração B2B:** Se, após 6 meses do lançamento da versão funcional (MVP), não houver pelo menos 3 equipas de vendas ou consultoras ativas dispostas a pagar pelo serviço.  
* **Avanço Tecnológico da Concorrência:** Se ferramentas gigantes como o Google Calendar ou a Microsoft anunciarem a integração nativa de funcionalidades de comunicação de atrasos por IA nativa antes de o Leavy Web ganhar a sua quota de mercado.

# **5\. Público-Alvo**

## **Segmentos Principais**

* Representantes de vendas B2B no exterior (*Field Sales*) e gestores de contas territoriais.  
* Consultores imobiliários que gerem múltiplas visitas num só dia.  
* Prestadores de serviços (ex: técnicos especializados) com rotas dinâmicas diárias.

## **Comportamento e Disposição a Pagar**

Este público já utiliza sistemas avançados de CRM, calendários partilhados e investe (ou tem a empresa a investir) em ferramentas de agendamento tipo Calendly (que cobra para criar limites de tempo de viagem fixos, mas manuais). Como cada reunião perdida pode custar milhares de euros em comissões, estão dispostos a pagar um valor mensal por uma solução focada especificamente em resolver e otimizar este problema.

# **6\. Panorama Competitivo**

## **A. Soluções Atuais**

1. **Morgen e Calendly:** Permitem bloquear tempos de viagem ou criar janelas extra, mas estes bloqueios não interagem com assistentes de voz nem enviam justificações dinâmicas de atrasos.  
2. **Can't be Late / BoardSpy / OnTimer:** Aplicações móveis sólidas que rastreiam o trânsito em direto e soam alarmes precisos indicando a hora de saída do local atual.  
3. **Google Calendar / Apple Maps (Nativos):** Emitem avisos básicos "Hora de Sair" baseados no trânsito, mas não gerem interações, limitando-se apenas a enviar uma notificação para o telemóvel.

## **B. Lacunas do Mercado**

Embora as aplicações atuais indiquem ao utilizador *quando* deve sair, elas ignoram completamente a componente de gestão de crise caso ocorra um imprevisto grave já a meio da viagem. Atualmente, quando um utilizador está a conduzir e sabe que o atraso é inevitável, é obrigado a pegar perigosamente no telemóvel para enviar uma mensagem aos clientes.

## **C. A Sua Diferenciação**

A sua ideia tem grande mérito para o mercado corporativo graças ao seu diferenciador principal: a ação corretiva autónoma através da Inteligência Artificial.

Enquanto a concorrência se foca em otimizar e avisar o horário de partida (um problema que já está preenchido), o Leavy Web atua ativamente na gestão do trajeto. A funcionalidade de monitorizar passivamente a rota e utilizar um agente de voz (ao qual basta dar um comando rápido por voz para a IA analisar o GPS, prever o atraso e redigir um aviso contextualizado) ataca de frente um problema de segurança e reputação que o mercado atual ainda não conseguiu resolver na íntegra.