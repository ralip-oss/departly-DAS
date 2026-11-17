# **Product Requirements Document (PRD): Departly**

# **1. Executive Summary (TL;DR)**
O **Departly** é um assistente de calendário inteligente em modelo SaaS que lê a sua agenda, analisa o tráfego em tempo real através de APIs como o Google Maps e alerta exatamente quando deve arrancar para cada compromisso. O sistema adiciona uma margem de segurança inteligente para garantir chegadas antecipadas e envia uma notificação no momento ideal de partida. Para além desta fundação, a aplicação destaca-se ao integrar um assistente de voz IA que permite ao condutor gerar e enviar avisos de atraso contextualizados aos clientes, de forma autónoma e segura, perante imprevistos na estrada.

# **2. Narrative**
Imagine o João, um consultor imobiliário de sucesso com cinco visitas agendadas para hoje em diferentes pontos da cidade. No passado, o João vivia ansioso e com "cegueira temporal": estava sempre a verificar o telemóvel para não perder a hora de saída e, frequentemente, os clientes marcavam chamadas nos curtos espaços de tempo em que ele devia estar a conduzir. Se apanhasse um acidente na autoestrada, enfrentava um dilema perigoso: pegar no telemóvel enquanto conduzia para avisar o cliente, ou chegar tarde sem avisar, parecendo pouco profissional.

Com o Departly, a rotina do João transforma-se. Durante a noite, a plataforma leu a sua agenda e bloqueou automaticamente os intervalos precisos de deslocação no seu calendário, garantindo que ninguém lhe marca reuniões nesse período. Quando, às 14h30, o trânsito pára subitamente, o João não entra em pânico nem tira os olhos da estrada. Através de um comando de voz, diz apenas: *"Avisa o meu cliente das 15h que apanhei um acidente e vou chegar atrasado"*. A IA do Departly cruza o GPS em tempo real, estima a nova hora de chegada, redige um e-mail empático e profissional e envia-o automaticamente aos convidados do calendário. O João conduz com segurança e a sua imagem profissional mantém-se intocável.

# **3. Goals Framework**

## **Business Goals**
* Captar profissionais B2B (equipas de vendas no exterior, consultores imobiliários, gestores de contas) através de um modelo SaaS de subscrição mensal/anual.
* Atingir um rácio LTV/CAC de, pelo menos, 3:1.
* Posicionar o Departly não como uma simples "ferramenta de calendário", mas como a solução definitiva de "Gestão de Trajeto e Imagem Profissional em Tempo Real".

## **User Goals**
* Eliminar a carga mental e o tempo gasto a estimar e introduzir tempos de viagem manualmente no calendário.
* Manter a reputação e confiança perante clientes sem ter de cometer infrações perigosas ao volante.
* Reduzir drasticamente o stress e ansiedade diários nas deslocações.

## **Non-Goals**
* Não queremos substituir plataformas base como o Google Calendar ou Microsoft Outlook (o objetivo é atuar como uma camada inteligente por cima destas).
* Não somos uma aplicação de navegação GPS curva-a-curva (vamos utilizar as APIs de mapas já existentes no mercado).
* Não vamos criar lógicas de otimização para reuniões puramente virtuais via Zoom/Teams (o foco é na fricção do mundo físico).

# **4. User Stories**
* **Como representante de vendas B2B**, quero que o meu tempo de viagem seja calculado e bloqueado automaticamente no meu calendário, para que a minha equipa não agende chamadas enquanto estou em trânsito.
* **Como consultor com dificuldades na gestão de tempo**, quero ser notificado da hora exata a que devo sair baseada no trânsito atual, para que nunca mais chegue atrasado ao primeiro compromisso do dia.
* **Como condutor**, quero utilizar comandos de voz "hands-free" para sinalizar um imprevisto, para que não coloque a minha segurança e a dos outros em risco.
* **Como profissional focado no atendimento**, quero que a IA do Departly escreva e envie o e-mail de aviso de atraso com o tempo de chegada atualizado aos meus clientes, para que eu preserve uma imagem responsável, previsível e cortês.

# **5. User Experience Flow**
1. **Onboarding & Conexão:** O utilizador acede ao Dashboard Web, cria conta, e liga o seu Google Calendar/iCal e contact book. Define o seu perfil e as suas regras de segurança (ex: "Gosto de chegar 10 minutos mais cedo aos compromissos").
2. **Planeamento Invisível:** O Departly analisa a agenda do dia seguinte, identifica todos os eventos com moradas físicas, calcula as distâncias e injeta blocos dinâmicos marcados como "Em Deslocação" antes de cada evento.
3. **Alerta de Início:** 15 minutos antes da "hora ideal de saída" (com base em dados de trânsito em tempo real), o sistema envia uma notificação push a avisar para a necessidade iminente de partida.
4. **Gestão do Imprevisto (Ação Voicebot):** Durante o trajeto, perante um engarrafamento brutal, o utilizador aciona o assistente (via widget no telemóvel ou integração Apple CarPlay/Android Auto) e diz: *"Estou preso no trânsito, avisa a minha próxima reunião do meu atraso"*.
5. **Ação IA e Resolução:** O Departly (a) processa o áudio, (b) consulta as APIs de mapas para rever a hora real de chegada, (c) identifica o evento atual e os convidados, (d) gera um e-mail educado detalhando o atraso e o novo ETA, (e) envia-o. Finalmente, responde por voz ao condutor: *"E-mail de atraso enviado com sucesso. Chegará às 14h25."*

# **6. Potential Feature Set**

| Funcionalidade | Descrição | Rationale |
| :--- | :--- | :--- |
| **Sincronização Bidirecional Inteligente** | Integração profunda com calendários principais (GSuite/Office365) para leitura contínua de novas reuniões e injeção automática de blocos de tempo "Ocupado". | Garante que o Departly se integra perfeitamente no fluxo de trabalho atual, sem duplicação de esforço manual. |
| **Motor de Cálculo Dinâmico de Trânsito** | Algoritmo que consulta constantemente uma API de trânsito (ex: Google Maps) não só no momento de criar o bloco, mas atualizando ativamente o alerta nos 60 minutos antes da partida. | Combate a "cegueira temporal", oferecendo precisão inigualável adaptada a incidentes em tempo real. |
| **Assistente de Voz Contextual (Voicebot)** | Interface interativa de áudio com processamento de linguagem natural preparada para receber comandos curtos do condutor e interpretar intenções. | O principal diferencial do mercado; garante uma interação totalmente segura e sem recurso ao ecrã ("hands-free"). |
| **Gerador de Comunicação IA** | Ligação a um LLM focado em extrair dados de telemetria e transformá-los num e-mail profissional para os convidados. | Resolve a dor de gerir expectativas em tempo real, preservando a reputação do profissional e a confiança do cliente B2B. |
| **Dashboard Web Central** | Interface responsiva mobile-first para gerir rotinas, personalizar templates de respostas e consultar notificações. | Permite personalização granular e garante acesso ubíquo através de qualquer browser. |

# **7. Success Metrics**
* **Engagement / Adoção:** Percentagem de eventos físicos semanais em que os utilizadores ativam o bloqueio automático de viagem; DAU (Daily Active Users) em dias úteis.
* **Métricas de Negócio:** Taxa de conversão do período experimental grátis para clientes pagantes B2B; Retenção ao mês 6.
* **Rentabilidade:** Rastreio rigoroso do custo das chamadas às APIs de mapas e geração de texto (LLM) face à margem da subscrição do SaaS.
* **Métricas de Qualidade:** Feedback do utilizador após o uso do Voicebot. Redução de queixas sobre atrasos não comunicados reportada pelos clientes.

# **8. Technical Considerations**
* **APIs de Terceiros:** Forte dependência da API do Google Maps (Directions/Places) e APIs de Calendário.
* **Custos Ocultos:** Uso de sistema inteligente de caching de localizações para evitar estourar o limite (quota) de chamadas à API de mapas.
* **Plataforma:** Um Web Dashboard central construído numa lógica PWA responsiva para acesso adequado mobile/desktop.
* **Segurança e RGPD:** Gestão segura de acessos via Firebase Auth e proteção de dados de localização B2B com políticas de privacidade rigorosas.

# **9. Technical Decisions**
As seguintes decisões arquiteturais foram consolidadas durante o desenvolvimento do MVP:
* **Frontend UI/UX:** Desenvolvido em React com Vite e TypeScript. A prototipagem e o código base da interface (Dashboard, Landing Page) foram gerados recorrendo ao Google AI Studio / Google Stitch, garantindo um design coeso e acelerando a entrega visual.
* **Backend & Base de Dados:** Adoção do ecossistema Firebase. O Firebase Authentication gere o registo e login seguro dos utilizadores, enquanto o Cloud Firestore opera como base de dados NoSQL em tempo real para armazenamento de perfis e viagens (trips). A lógica de servidor foi gerada com o auxílio da extensão AntiGravity no VS Code (Vibe Coding).
* **Inteligência Artificial:** Integração da API do Google Gemini como motor de LLM. O modelo processa as intenções de áudio capturadas pela Web Speech API e redige os e-mails B2B corporativos de aviso de atraso.
* **Deployment (CI/CD):** Alojamento do SaaS na plataforma Vercel, com integração contínua (CI/CD) ligada diretamente à *branch* principal do repositório GitHub (`ralip-oss/departly-DAS`), assegurando atualizações automáticas e ambiente de produção estável.

# **10. Milestones & Sequencing (Current State)**
O ciclo de desenvolvimento foi executado numa abordagem Agile/Scrum de 4 Sprints focados na entrega do MVP funcional.

| Fase | Foco Principal | Estado Atual | Entregáveis e Observações |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Fundação, Autenticação e UI | **Concluído** | Exportação da UI do AI Studio para o GitHub. Estruturação base do projeto no VS Code e configuração do Firebase Auth. A ligação completa para persistência de perfis na Firestore transitou como dívida técnica para iterações seguintes. |
| **Sprint 2** | Motor Central (Mapas e Rotas) | **Concluído** | Ligação básica à API do Google Maps estabelecida com sucesso. Lógica repetitiva das Cloud Functions gerada rapidamente via AntiGravity. A automação completa da API de e-mail não foi finalizada neste ciclo. |
| **Sprint 3** | Inteligência Artificial e Voicebot | **Concluído** | Integração bem-sucedida do Gemini para geração de e-mails em tom profissional. Detetou-se um bug crítico (*loop* infinito) nas permissões de microfone do *browser* (Web Speech API) que bloqueava a interface. |
| **Sprint 4** | Deploy, QA e Fecho de Projeto | **Concluído** | Correção bem-sucedida do bug do microfone. Deploy oficial realizado na Vercel com HTTPS e domínios automáticos a funcionar em pleno. Projeto encerrado tecnicamente; equipa focada na preparação do *pitch* final. |