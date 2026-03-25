# APA Control – Escopo, Requisitos e Decisões de Implementação

Documento de referência do produto e das decisões tomadas para o desenvolvimento. O escopo está aberto a correções durante a implementação.

---

## 1. Visão do Produto

**APA Control** é o Sistema de Controle da Associação dos Protetores de Animais. Destina-se ao uso interno da associação, com foco no controle administrativo e no gerenciamento dos atendimentos aos animais resgatados ou acolhidos. O sistema substitui processos manuais, trazendo maior eficiência, segurança e rastreabilidade.

**Finalidade principal:** Centralizar informações, garantir a organização dos processos internos e oferecer suporte à tomada de decisões por meio de relatórios e análises.

**Controle de acesso:** Dois perfis com permissões — administrador e atendente. A implementação permite que o cliente altere permissões ou crie outros perfis (controle por módulos/roles).

---

## 2. Módulos e Escopo Funcional

| Módulo | Descrição |
|--------|-----------|
| **Resgate** | Cadastro detalhado do animal em acolhimento: local encontrado, padrão da raça, situação do resgate. Registro minucioso para tratamentos e histórico da trajetória do animal até a adoção, incluindo histórico de eventos do animal (ex.: quem registrou/atualizou/removou o resgate e quando). |
| **Agendamento de consultas** | Registro de atendimento (emergência a acompanhamento regular), integrado ao histórico clínico. Agendamento em clínica cadastrada ou visita de veterinário; data, hora e local. |
| **Anamnese** | Registro do diagnóstico da consulta e encaminhamento a procedimentos quando necessário. |
| **Procedimentos clínicos** | Procedimentos por animal: vacinas, medicações, exames (sangue, raio-x, etc.) e cirurgias (castração, remoção de tumores, etc.). Organização dos cuidados e levantamento de custos. |
| **Adoção** | Cadastro detalhado do adotante e formulário de adoção da instituição; registro da adoção com zelo. |
| **Destino final** | Registro de ocorrências definitivas: retorno ao local de origem, óbito, transferência a outra instituição ou outras saídas. Rastreabilidade do destino de cada animal. |
| **Postagens da página pública** | Conteúdo de interesse geral: animais para adoção, campanhas em andamento, comunicados e informações da instituição. Inclui registro e acompanhamento de campanhas de arrecadação (doações, rifas, patrocínios). |
| **Despesas** | Gastos com tratamentos, alimentação, manutenção e demais custos operacionais; clareza na alocação de recursos e planejamento financeiro. |
| **Receitas** | Entradas de doações, patrocínios, rifas e outras fontes. Em conjunto com despesas, fornece visão clara da situação financeira. |
| **Relatórios e análises** | A ser definido em momento posterior. |

---

## 3. Requisitos Funcionais (RF)

### 3.1 Cadastros e segurança (RF_B)

| RF | Descrição | Status no projeto |
|----|-----------|-------------------|
| RF_B1 | Gerenciar Usuário – armazenamento consistente dos dados de cada usuário | Implementado (CRUD funcionário) |
| RF_B2 | Gerenciar Perfis de Acesso – proteção por perfil (admin/atendente) | Implementado (perfis + permissões por módulo) |
| RF_B3 | Gerenciar Tipo de Campanha – proteção e rastreabilidade de doações | Implementado (CRUD tipo de campanha) |
| RF_B4 | Gerenciar Tipo de Procedimento – sem duplicidade, integridade | Implementado (CRUD tipo de procedimento) |
| RF_B5 | Gerenciar Tipos de Lançamento (Receita/Despesa) – rastreabilidade/auditoria | Implementado (CRUD tipo de lançamento) |
| RF_B6 | Gerenciar Tipo de Atendimento – tipos configuráveis, sem duplicidade | Implementado (CRUD tipo de consulta) |
| RF_B7 | Gerenciar Adotante – confidencialidade e integridade | Implementado (CRUD adotante) |
| RF_B8 | Gerenciar Animal – cadastro sem inconsistências | Implementado (CRUD animal) |
| RF_B9 | Gerenciar Tipos de Destino Final – rastreabilidade do destino | Implementado (CRUD tipo de destino final) |
| RF_B10 | Gerenciar Clínica Veterinária – dados consistentes por clínica | Implementado (CRUD clínica) |
| RF_B11 | Gerenciar Tipos de Ocorrência – classificação padronizada das ocorrências | Implementado (CRUD tipo de ocorrência) |

### 3.2 Fluxos operacionais (RF_F)

| RF | Descrição | Status no projeto |
|----|-----------|-------------------|
| RF_F1 | Registrar Resgate | Implementado (API + telas + histórico por tipo) |
| RF_F2 | Agendar Consulta Clínica | Implementado (API `appointment.*` + telas `/consultas` + histórico `consulta`) |
| RF_F3 | Registrar Anamnese Clínica | Implementado (API `anamnesis.*` + telas `/anamnese` + vínculo obrigatório com consulta) |
| RF_F4 | Registrar Procedimento Clínico | Implementado (API `clinical-procedure.*` + telas `/procedimentos` + histórico `procedimento`) |
| RF_F5 | Registrar Adoção | Implementado (API `adoption.*` + telas; status da adoção sincroniza `animal.status` quando concluída) |
| RF_F6 | Registrar Destino Final | Implementado (API + telas + histórico por tipo) |
| RF_F7 | Registrar Despesas | Implementado (API `expense.*` + telas em Financeiro / Despesas) |
| RF_F8 | Registrar Receitas | Implementado (API `revenue.*` + telas em Financeiro / Receitas) |
| RF_F9 | Registrar Postagem da Página Pública | Implementado (API CRUD `post.*` + telas `/publicacoes` + endpoints públicos `post.public.*`) |
| RF_F10 | Registrar Ocorrência do Animal | Implementado (API `occurrence.*` + telas `/ocorrencias` + integração com histórico do animal) |

---

## 4. Decisões de Implementação

### 4.1 Resgate do animal

- **Abordagem híbrida:** Manter formulário de cadastro detalhado do animal no fluxo de resgate.
- Incluir **select** (busca/seleção de animal já cadastrado) que, quando utilizado, **preencha os campos** do formulário.
- Assim é possível tanto registrar um animal novo no ato do resgate quanto vincular o resgate a um animal já existente.
- Formulário organizado em abas: **Dados do Animal**, **Dados do Resgate** e **Histórico do Animal**.
- Histórico com rastreabilidade por colaborador e data, incluindo `oldValue`/`newValue`.
- Logs separados por tipo (`resgate`, `cadastro`, `consulta`, `procedimento`, `destino_final`) via enum no banco.
- Regra de visualização por contexto:
  - tela de resgate exibe apenas tipo `resgate`;
  - tela de animal exibe apenas tipo `cadastro`;
  - página dedicada de histórico do animal permite múltiplos tipos.

### 4.2 Campanha

- Campanha tratada **apenas como cabeçalho** (dados da campanha: tipo, título, datas, meta, status).
- Doações, rifas e patrocínios entram como **lançamentos de receita** (e eventualmente outros fluxos) vinculados à campanha quando fizer sentido.
- Fluxo operacional de campanha implementado com CRUD completo no administrativo e API (`campaign.add`, `campaign.update`, `campaign.list`, `campaign.key`, `campaign.delete`).
- Campo de meta de arrecadação aceita vazio e normaliza para `0` no front/API.

### 4.7 Destino final com comprovante

- O fluxo de destino final foi implementado com cadastro/edição/listagem/remoção.
- O comprovante foi evoluído para **upload de arquivo** (multipart/form-data), salvo localmente em `apps/api/uploads/final-destination`.
- O caminho do arquivo fica em `final_destination.proof` (compatível para futura troca por S3 sem alterar o fluxo de tela).
- Ao atualizar com novo comprovante, o arquivo antigo é removido do disco.
- Ao remover o destino final, o comprovante associado também é removido do disco.

### 4.3 Página pública

- Haverá **implementação futura** de outro site/portal que exibirá os dados gerenciados pelo APA Control.
- O APA Control **apenas gerencia** (cadastro de posts, campanhas, animais para adoção, etc.).
- O outro sistema **consome** esses dados (API ou integração a definir).
- Este módulo (postagens e consumo público) fica **por último** na prioridade de implementação.

### 4.4 Formulário de adoção

- Adotar solução **flexível**: formulário de adoção configurável (modelo de formulário + respostas), em vez de conjunto fixo de campos.
- Objetivo: dar cara de **função fundamental** ao módulo de adoção e permitir que a instituição adapte perguntas e termos sem alteração de código.

### 4.5 Relatórios

- Escopo de relatórios e análises será definido **em conversa posterior**; não está fixado neste documento.

### 4.6 Perfis de acesso

- **Dois perfis configurados** por padrão: administrador e atendente.
- A solução já permite **alterar permissões** e **criar outros perfis**; o controle é por módulos/roles, de forma que o cliente possa ajustar sem mudar a arquitetura.

### 4.8 Ocorrências e histórico do animal

- Foi implementado CRUD completo de **tipos de ocorrência** e **ocorrências**.
- Ocorrências entram no histórico do animal com tipo `ocorrencia` e ações:
  - `occurrence.created`
  - `occurrence.updated`
  - `occurrence.deleted`
- O fluxo segue o mesmo padrão de rastreabilidade com `oldValue` e `newValue`.

### 4.9 Seleção de consulta via modal (anamnese/procedimentos)

- Para anamnese e procedimento clínico, a seleção de consulta foi ajustada para modal separado de busca/seleção.
- O modal foi implementado com sobreposição global (portal no `document.body`), evitando conflito com sidebar/topbar.
- A busca no modal respeita os filtros obrigatórios de data da API de consultas.

---

## 5. Stack e Estrutura (referência)

- **Backend:** Fastify, Drizzle ORM, PostgreSQL, JWT, bcrypt, Zod.
- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Radix UI, React Router 7.
- **Monorepo:** `apps/api`, `apps/administrativo`; configuração compartilhada em `config/`.

Entidades principais: `employee`, `access_profile`, `permission`, `module`, `animal`, `adopter`, `adoption`, `rescue`, `appointment`, `appointment_type`, `anamnesis`, `clinical_procedure`, `procedure_type`, `campaign`, `campaign_type`, `final_destination`, `final_destination_type`, `financial_transaction`, `transaction_type`, `veterinary_clinic`, `post`.

---

## 6. Validação do schema e ajustes necessários

Validação do schema do banco em relação ao escopo e às decisões acima. Ajustes a aplicar durante a implementação:

### 6.1 Schema atual – conformidade

| Domínio | Situação |
|--------|----------|
| Resgate + Animal | OK. Resgate com `animalId`; híbrido (animal novo ou existente) resolvido na aplicação. Histórico por tipo implementado com enum `animal_history_type` + `old_value`/`new_value`. |
| Consulta (appointment) | OK. Falta apenas campo explícito de local para consulta domiciliar (ver opcional abaixo). |
| Anamnese, Procedimento clínico, Destino final, Ocorrência | OK. Anamnese, procedimento clínico, destino final e ocorrência implementados com CRUD e rastreabilidade em histórico do animal. |
| Campanha (cabeçalho), Receita/Despesa | Campanha operacional OK (CRUD). `financial_transaction.campaignId` opcional. |
| Post, Usuário, Perfis, Cadastros base | OK. |

### 6.2 Ajustes obrigatórios no schema

**Formulário de adoção configurável (decisão 4.4)**  
O modelo atual (`adoption` + `adopter`) não suporta formulário de adoção configurável. Incluir:

- **Modelo do formulário:** tabela para definição das perguntas/campos do formulário de adoção (ex.: `adoption_form_template` ou `adoption_form_definition`), com ordem, tipo do campo, obrigatoriedade e texto da pergunta.
- **Respostas por adoção:** tabela para armazenar as respostas (ex.: `adoption_form_response` ou `adoption_form_answer`), com `adoptionId`, referência à pergunta e valor da resposta.

Assim o módulo de adoção passa a suportar formulário flexível sem alterar código ao mudar perguntas/termos.

### 6.3 Ajustes opcionais no schema

- **Consulta – local:** Se for necessário guardar endereço ou descrição do local quando a consulta for domiciliar (fora da clínica), acrescentar em `appointment` um campo opcional (ex.: `locationDescription` ou `address`) do tipo texto.
- **Tipo de campanha – categoria:** Se for necessário filtrar no banco por tipo (doação, rifa, evento, patrocínio), considerar enum ou campo `category` em `campaign_type`; hoje pode ser feito por nome/descrição.
- **Post – animais relacionados:** Para facilitar consumo pela página pública (consultas por animal ou por post), considerar tabela de relação N:N (ex.: `post_animal` com `post_id`, `animal_id`) em vez de ou além de `post.relatedAnimals` em texto; o campo texto pode ser mantido para compatibilidade ou removido após migração.
- **Comprovantes em storage externo:** Hoje o comprovante de destino final é salvo em disco local (`uploads`). Em produção, migrar para S3/objeto externo mantendo o campo `proof` como URL/chave do arquivo.

---

## 7. Validação geral recente (mar/2026)

Varredura técnica executada para consolidar o estado do projeto:

- `pnpm lint` no monorepo: **ok**
- Testes API (`vitest`) executados com sucesso: **61 arquivos / 208 testes passando**
- Verificação dos fluxos de histórico do animal em use-cases:
  - consultas: `appointment.created|updated|deleted`
  - anamnese: `anamnesis.created|updated|deleted`
  - procedimentos: `clinical-procedure.created|updated|deleted`
  - destino final: `final-destination.created|updated|deleted`
  - ocorrências: `occurrence.created|updated|deleted`

## 8. Próximos passos (ordem sugerida)

Com RF_F2, RF_F3, RF_F4, RF_F5, RF_F7, RF_F8 e RF_F9 implementados, os próximos passos sugeridos ficam concentrados em evoluções:

1. **Formulário de adoção configurável (item 6.2)**
   - Criar tabelas de template/perguntas/respostas e telas de configuração.

2. **Consulta domiciliar com local detalhado**
   - Adicionar campo opcional de local/endereço em `appointment` (item 6.3).

3. **Postagens com relação N:N de animais**
   - Evoluir de `relatedAnimals` textual para tabela relacional dedicada, mantendo compatibilidade durante transição.
