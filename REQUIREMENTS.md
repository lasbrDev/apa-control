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
| **Despesas** | Gastos com tratamentos, alimentação, manutenção e demais custos operacionais; clareza na alocação de recursos e planejamento financeiro. |
| **Receitas** | Entradas de doações, patrocínios, rifas e outras fontes. Em conjunto com despesas, fornece visão clara da situação financeira. |
| **Relatórios e análises** | A ser definido em momento posterior. |

> **Nota:** O módulo de Postagens da Página Pública foi descartado do escopo.

---

## 3. Requisitos Funcionais (RF)

### 3.1 Cadastros e segurança (RF_B)

| RF | Descrição | Status no projeto |
|----|-----------|-------------------|
| RF_B1 | Gerenciar Usuário – armazenamento consistente dos dados de cada usuário | ✅ Implementado (CRUD funcionário) |
| RF_B2 | Gerenciar Perfis de Acesso – proteção por perfil (admin/atendente) | ✅ Implementado (perfis + permissões por módulo) |
| RF_B3 | Gerenciar Tipo de Campanha | ✅ Implementado (CRUD tipo de campanha) |
| RF_B4 | Gerenciar Tipo de Procedimento | ✅ Implementado (CRUD tipo de procedimento) |
| RF_B5 | Gerenciar Tipos de Lançamento (Receita/Despesa) | ✅ Implementado (CRUD tipo de lançamento) |
| RF_B6 | Gerenciar Tipo de Atendimento | ✅ Implementado (CRUD tipo de consulta) |
| RF_B7 | Gerenciar Adotante | ✅ Implementado (CRUD adotante) |
| RF_B8 | Gerenciar Animal | ✅ Implementado (CRUD animal + status `pendente/ativo/inativo` + `birthYear`) |
| RF_B9 | Gerenciar Tipos de Destino Final | ✅ Implementado (CRUD tipo de destino final) |
| RF_B10 | Gerenciar Clínica Veterinária | ✅ Implementado (CRUD clínica) |
| RF_B11 | Gerenciar Tipos de Ocorrência | ✅ Implementado (CRUD tipo de ocorrência) |

### 3.2 Fluxos operacionais (RF_F)

| RF | Descrição | Status no projeto |
|----|-----------|-------------------|
| RF_F1 | Registrar Resgate | ✅ Implementado (API + telas + histórico; cria animal com status `ativo` e preenche `rescueAt`) |
| RF_F2 | Agendar Consulta Clínica | ✅ Implementado (API `appointment.*` + telas + histórico `consulta`) |
| RF_F3 | Registrar Anamnese Clínica | ✅ Implementado (API `anamnesis.*` + telas + vínculo obrigatório com consulta) |
| RF_F4 | Registrar Procedimento Clínico | ✅ Implementado (API `clinical-procedure.*` + telas + histórico `procedimento`) |
| RF_F5 | Registrar Adoção | ✅ Implementado (API `adoption.*` + telas; sincroniza `animal.status`) |
| RF_F6 | Registrar Destino Final | ✅ Implementado (API + telas + histórico; animal vai para `inativo`; reativação disponível) |
| RF_F7 | Registrar Despesas | ✅ Implementado (API `expense.*` + telas + batch cancel/confirmação + histórico do animal quando vinculado) |
| RF_F8 | Registrar Receitas | ✅ Implementado (API `revenue.*` + telas + batch cancel/confirmação + histórico do animal quando vinculado) |
| RF_F9 | Registrar Ocorrência do Animal | ✅ Implementado (API `occurrence.*` + telas + histórico `ocorrencia`) |

---

## 4. Decisões de Implementação

### 4.1 Resgate do animal

- **Abordagem híbrida:** Formulário de cadastro detalhado do animal no fluxo de resgate.
- Inclui **select** (busca/seleção de animal já cadastrado) que preenche os campos do formulário.
- Possível tanto registrar um animal novo no ato do resgate quanto vincular o resgate a um animal já existente.
- Formulário organizado em abas: **Dados do Animal**, **Dados do Resgate** e **Histórico do Animal**.

### 4.2 Ciclo de vida do animal (status)

O status do animal (`pendente/ativo/inativo`) é controlado automaticamente pelos fluxos:

| Evento | Status resultante |
|--------|------------------|
| Cadastro manual | `pendente` |
| Resgate criado | `ativo` + `rescueAt` preenchido |
| Resgate removido | `pendente` + `rescueAt` = null |
| Destino final registrado | `inativo` |
| Animal reativado (destino final removido) | `ativo` + `rescueAt` = now |
| Adoção confirmada | `inativo` |
| Adoção cancelada/removida | `ativo` |

- Selects de animal nos formulários de consulta, procedimento, ocorrência, destino final, adoção e financeiro filtram por `status=ativo`.
- Select do formulário de resgate filtra por `status=pendente`.

### 4.3 Histórico do animal

- Histórico rastreável por colaborador e data, com tipo de evento via enum.
- Enum `animal_history_type`: `resgate`, `cadastro`, `consulta`, `procedimento`, `ocorrencia`, `destino_final`, `adocao`, `despesa`, `receita`.
- `oldValue`/`newValue` são **nullable**: somente use-cases de **update** os preenchem (com diff campo a campo em JSON). Eventos de criação, remoção e eventos financeiros gravam `null`.
- Despesas e receitas vinculadas a um animal geram entrada no histórico automaticamente (criar/cancelar/confirmar).
- Exportação do histórico disponível em PDF, CSV e XLSX.

### 4.4 Campanha

- Campanha tratada **apenas como cabeçalho** (tipo, título, datas, meta, status).
- Doações e outras entradas são lançadas como **receitas** vinculadas à campanha.
- CRUD completo no administrativo e API (`campaign.*`).
- Campo de meta de arrecadação aceita vazio e normaliza para `0`.

### 4.5 Formulário de adoção configurável

- Decisão pendente de implementação: formulário de adoção **configurável** (perguntas/campos flexíveis).
- O modelo atual (`adoption` + `adopter`) não suporta isso. Requer:
  - Tabela de template de perguntas (ex.: `adoption_form_template`)
  - Tabela de respostas por adoção (ex.: `adoption_form_response`)
- Objetivo: permitir que a instituição adapte perguntas e termos sem alteração de código.

### 4.6 Perfis de acesso

- **Dois perfis configurados** por padrão: administrador e atendente.
- Controle por módulos/roles; o cliente pode ajustar sem mudar a arquitetura.

### 4.7 Destino final com comprovante

- Comprovante implementado como **upload de arquivo** (multipart/form-data), salvo em `apps/api/uploads/final-destination`.
- Ao atualizar com novo comprovante, o arquivo antigo é removido do disco.
- Ao remover o destino final, o comprovante é removido do disco.
- Campo `proof` compatível para futura migração a S3.

### 4.8 Página pública

- O módulo de **Postagens da Página Pública foi descartado** do escopo.
- Campanhas e animais disponíveis para adoção permanecem gerenciáveis pelo APA Control e poderão ser consumidos por um portal externo via API no futuro, caso retome a demanda.

### 4.9 Financeiro

- Não existe campo `transactionDate`; a data do lançamento é o `createdAt` (automático).
- Filtros de data usam `createdAtStart`/`createdAtEnd` com `::date` cast no backend.
- Status (`pendente/confirmado/cancelado`) é desabilitado nos formulários (sempre inicia como `pendente`).
- Ações em lote (batch): cancelamento e confirmação de pagamento/recebimento disponíveis nas listagens.
- Download de comprovante disponível nas listagens de despesa e receita.

### 4.10 Relatórios

- Escopo de relatórios e análises será definido **em conversa posterior**.
- Exportação em CSV, XLSX e PDF já implementada para histórico do animal e listagens financeiras.

### 4.11 Seleção de consulta via modal (anamnese/procedimentos)

- Para anamnese e procedimento clínico, a seleção de consulta é feita via modal de busca/seleção.
- Modal implementado com sobreposição global (portal no `document.body`).

---

## 5. Stack e Estrutura (referência)

- **Backend:** Fastify, Drizzle ORM, PostgreSQL (Neon), JWT, bcrypt, Zod, Playwright (PDFs), csv-stringify, exceljs.
- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Radix UI, React Router 7, React Hook Form + Zod.
- **Monorepo:** pnpm + Turborepo (`apps/api`, `apps/administrativo`); lint/format: Biome.

Entidades principais: `employee`, `access_profile`, `permission`, `module`, `animal`, `animal_history`, `adopter`, `adoption`, `rescue`, `appointment`, `appointment_type`, `anamnesis`, `clinical_procedure`, `procedure_type`, `campaign`, `campaign_type`, `final_destination`, `final_destination_type`, `financial_transaction`, `transaction_type`, `veterinary_clinic`, `occurrence`, `occurrence_type`.

---

## 6. Validação do schema e ajustes necessários

### 6.1 Schema atual – conformidade

| Domínio | Situação |
|---------|----------|
| Animal + status + ciclo de vida | ✅ Status `pendente/ativo/inativo`, `rescueAt`, reativação implementados. |
| Resgate | ✅ Híbrido (animal novo ou existente), histórico por tipo. |
| Consulta, Anamnese, Procedimento clínico | ✅ CRUD completo com rastreabilidade no histórico. |
| Destino final, Ocorrência | ✅ CRUD completo com rastreabilidade no histórico. |
| Adoção | ✅ CRUD operacional. Formulário configurável **não implementado** (ver 6.2). |
| Campanha + Receita/Despesa | ✅ CRUD operacional; batch e download de comprovante implementados. |
| Histórico do animal | ✅ `oldValue`/`newValue` nullable; tipos `despesa` e `receita` adicionados. |
| Usuário, Perfis, Cadastros base | ✅ |

### 6.2 Ajustes obrigatórios pendentes

**Formulário de adoção configurável (decisão 4.5)**

O modelo atual (`adoption` + `adopter`) não suporta formulário configurável. Implementar:

- **`adoption_form_template`** (ou equivalente): definição de perguntas/campos — ordem, tipo, obrigatoriedade, texto.
- **`adoption_form_response`** (ou equivalente): respostas por adoção — `adoptionId`, referência à pergunta, valor.

### 6.3 Ajustes opcionais

- **Consulta – local domiciliar:** Adicionar campo opcional (ex.: `locationDescription`) em `appointment` para consultas fora da clínica.
- **Comprovantes em storage externo:** Migrar `uploads/` local para S3/objeto externo mantendo `proof` como URL/chave.

---

## 7. Estado atual (abr/2026)

- `pnpm lint` no monorepo: **ok**
- Testes API (`vitest`): **208 testes passando em 61 arquivos**
- Todos os módulos operacionais implementados (ver RF_F1–RF_F9)
- Campos sem valor exibem **vazio** (sem traço) em toda a aplicação
- Módulo de Postagens removido completamente do código

---

## 8. Funcionalidades pendentes (ordem sugerida)

| # | Funcionalidade | Prioridade |
|---|----------------|------------|
| 1 | **Formulário de adoção configurável** — tabelas `adoption_form_template` + `adoption_form_response`, telas de configuração de perguntas e preenchimento no ato da adoção | Alta |
| 2 | **Relatórios e análises** — escopo a definir; base de exportação (CSV/XLSX/PDF) já existe | Média |
| 3 | **Consulta domiciliar com local detalhado** — campo opcional `locationDescription` em `appointment` | Baixa |
| 4 | **Migração de uploads para storage externo (S3)** — comprovantes de destino final e financeiro | Baixa |
