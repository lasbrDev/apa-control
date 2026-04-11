# APA Control

Sistema de Controle da Associação dos Protetores de Animais. Centraliza informações, organiza processos internos e oferece suporte à tomada de decisões por meio de relatórios e análises.

## Módulos Implementados

- **Resgate**: Cadastro e ciclo de vida do animal, integrado ao histórico de eventos
- **Consultas**: Agendamento clínico e domiciliar, integrado ao histórico clínico
- **Anamnese**: Registro de diagnóstico e encaminhamento a procedimentos
- **Procedimentos Clínicos**: Vacinas, medicações, exames e cirurgias
- **Adoção**: Cadastro de adotante, registro da adoção e confirmação em lote
- **Destino Final**: Registro de saídas definitivas (óbito, transferência, etc.)
- **Ocorrências**: Classificação de eventos relevantes do animal
- **Financeiro**: Controle de receitas e despesas, confirmação/cancelamento em lote, download de comprovante
- **Campanhas**: Controle de campanhas com receitas/despesas vinculadas
- **Relatórios**: Exportação em CSV, Excel e PDF em todas as listagens

## Ciclo de Vida do Animal

O animal passa por três status ao longo do sistema:

| Status | Descrição |
|---|---|
| `pendente` | Animal cadastrado, aguardando resgate vinculado |
| `ativo` | Resgate vinculado (`rescueAt` preenchido) |
| `inativo` | Destino final registrado (adoção, óbito, transferência, etc.) |

- Ao **criar um resgate**, o animal passa para `ativo` e `rescueAt` é preenchido.
- Ao **remover um resgate**, o animal volta para `pendente` e `rescueAt` é zerado.
- Ao **registrar destino final**, o animal passa para `inativo`.
- Ao **reativar** (remover destino final), o animal volta para `ativo` e o destino final é excluído.

## Rastreabilidade (Histórico do Animal)

Todas as operações relevantes geram uma entrada no histórico do animal (`animal_history`):

- Tipos de evento (enum): `resgate`, `cadastro`, `consulta`, `procedimento`, `destino_final`, `ocorrencia`, `adocao`, `despesa`, `receita`
- Updates preenchem `oldValue`/`newValue`; criações e deleções deixam esses campos nulos
- Despesas e receitas vinculadas ao animal geram entrada somente ao **confirmar** (não ao cancelar)

## Pré-requisitos

- **Node.js**: 20 ou superior
- **pnpm**: 10.13.1 ou superior
- **PostgreSQL**: local ou [Neon](https://neon.tech)

## Instalação

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd apa-control
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

## Configuração

### Variáveis de Ambiente

Copie o arquivo de exemplo e ajuste os valores:

```bash
cp apps/api/.env.example apps/api/.env
```

Edite `apps/api/.env`:

```bash
# Servidor
PORT=3333
NODE_ENV=development

# Aplicação
API_URL=http://localhost:3333
APP_SECRET=seu-secret-key-aqui
APP_NAME=APA Control
APP_LOG_DIR=./logs

# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco

# AWS S3 (uploads de comprovantes/documentos)
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=seu-access-key-id
AWS_SECRET_ACCESS_KEY=seu-secret-access-key
AWS_S3_BUCKET=nome-do-bucket
AWS_S3_PREFIX=apa-control

```
Crie `apps/administrativo/.env`:

```bash
VITE_API_URL=http://localhost:3333
```

### Migração do Banco de Dados

```bash
cd apps/api
pnpm drizzle-kit migrate
```

**Criando nova migração:**

```bash
cd apps/api
pnpm drizzle-kit generate --name nome_da_migracao
```

**Variáveis opcionais:** `API_URL` é usado internamente pelo backend (padrão: `http://localhost:3333`).

### Criação do Primeiro Usuário Admin

Não existe endpoint público para cadastro. O primeiro administrador deve ser inserido diretamente no banco após rodar as migrações:

```sql
-- 1. Criar perfil de administrador
INSERT INTO access_profile (description, type) VALUES ('Administrador', 'administrador');

-- 2. Criar o funcionário admin (substitua os valores)
INSERT INTO employee (name, login, password, profile_id)
VALUES (
  'Admin',
  'admin',
  -- hash bcrypt da senha desejada (custo 10)
  '$2b$10$...',
  (SELECT id FROM access_profile WHERE type = 'administrador' LIMIT 1)
);
```

Para gerar o hash da senha via Node.js:

```bash
node -e "require('bcrypt').hash('sua-senha', 10).then(console.log)"
```

### Playwright (geração de PDFs)

Instalado automaticamente via `pnpm install`. Para reinstalar manualmente:

```bash
cd apps/api
pnpm exec playwright install chromium
```

## Executando

### Desenvolvimento

```bash
pnpm dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3333

### Separadamente

```bash
# Frontend
cd apps/administrativo && pnpm dev

# Backend
cd apps/api && pnpm dev
```

### Produção

```bash
pnpm build
cd apps/api && pnpm start
```

## Docker (Backend)

O backend possui Dockerfile em `apps/api/Dockerfile`, baseado em `node:20-slim` com as dependências do Chromium (Playwright).

```bash
# Build da imagem
docker build -f apps/api/Dockerfile -t apa-control-api .

# Executar (expõe porta 3000)
docker run -p 3000:3000 --env-file apps/api/.env apa-control-api
```

**Variável necessária no container:** `DATABASE_URL` com a connection string do banco.

## Estrutura do Projeto

```
apa-control/
├── apps/
│   ├── administrativo/     # Frontend React
│   └── api/               # Backend Node.js
├── config/                # Configurações compartilhadas (TypeScript)
├── package.json           # Monorepo (pnpm workspaces)
└── turbo.json             # Turborepo
```

### Frontend (Administrativo)

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router 7

### Backend (API)

- **Framework**: Fastify
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Logs**: Winston
- **PDFs**: Playwright
- **Exports**: CSV (csv-stringify), Excel (exceljs)

## Scripts Disponíveis

### Monorepo

- `pnpm dev` — todas as apps em desenvolvimento
- `pnpm build` — build de todas as apps
- `pnpm lint` — linting em todas as apps
- `pnpm reinstall` — remove `node_modules` e reinstala

### Backend

- `pnpm dev` — servidor com hot reload
- `pnpm build` — build para produção
- `pnpm start` — executa o build
- `pnpm test` — testes (vitest)
- `pnpm test:coverage` — testes com coverage
- `pnpm test -- --run <arquivo>` — subconjunto de testes

## Testes

```bash
cd apps/api
pnpm test
```

208 testes em 61 arquivos (integração com banco real — sem mocks de repositório).

## Desenvolvimento

- **Linter/Formatter**: Biome
- **Commits**: Conventional Commits + Husky + commitlint
- **ORM/Migrações**: Drizzle ORM + Drizzle Kit
- **Schema**: `apps/api/src/database/schema/`
- **Controle de acesso**: Perfis com roles por módulo, autenticação JWT com refresh token

### Roles Disponíveis

Cada perfil de acesso define quais módulos o funcionário pode acessar:

| Role | Módulo |
|---|---|
| `AdminPanel` | Painel administrativo (necessário em todas as rotas) |
| `Animals` | Animais |
| `Rescues` | Resgates |
| `Appointments` | Consultas |
| `AppointmentTypes` | Tipos de consulta |
| `Anamnesis` | Anamnese |
| `ClinicalProcedures` | Procedimentos clínicos |
| `ProcedureTypes` | Tipos de procedimento |
| `Adoptions` | Adoções |
| `Adopters` | Adotantes |
| `FinalDestinations` | Destinos finais |
| `FinalDestinationTypes` | Tipos de destino final |
| `Registrations` | Ocorrências |
| `Financial` | Financeiro (geral) |
| `Expenses` | Despesas |
| `Revenues` | Receitas |
| `TransactionTypes` | Tipos de transação |
| `Campaigns` | Campanhas |
| `CampaignTypes` | Tipos de campanha |
| `VeterinaryClinics` | Clínicas veterinárias |
| `Employees` | Funcionários |
| `AccessProfiles` | Perfis de acesso |

## Integração com Neon Database

O projeto está configurado para usar o **Neon** (PostgreSQL serverless com database branching).

### Setup

1. Crie conta em [https://neon.tech](https://neon.tech)
2. Crie o projeto e copie a Connection String
3. Atualize `apps/api/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
   ```

### Migrar do PostgreSQL Local

```bash
# 1. Criar tabelas no Neon
cd apps/api && pnpm db:migrate

# 2. Exportar dados locais
pg_dump -h localhost -U postgres -d apacontrol --data-only --column-inserts --no-owner --disable-triggers -f data_only.sql

# 3. Importar no Neon
psql "YOUR_NEON_CONNECTION_STRING" -f data_only.sql
```

### Comandos Úteis

```bash
# Limpar e recriar banco
psql "YOUR_NEON_CONNECTION_STRING" -c "DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;"
cd apps/api && pnpm db:migrate

# Verificar tabelas
psql "YOUR_NEON_CONNECTION_STRING" -c "\dt"
```

**Importante:** Sempre dropar `drizzle` junto com `public`, senão as migrações não são reaplicadas.

## Troubleshooting

**Erro de conexão com banco:**
- Verifique se o PostgreSQL está rodando
- Confirme `DATABASE_URL` no `.env`
- Teste: `psql -h localhost -U usuario -d nome_do_banco`

**Erro de dependências:**
```bash
pnpm reinstall
```

**Porta já em uso:**
- Frontend: altere a porta no `vite.config.ts`
- Backend: altere `PORT` no `.env`

## Decisões de Arquitetura

**Uploads:** Comprovantes de destino final e transações financeiras salvos em `apps/api/uploads/`. Preparado para migração futura para S3.

**Campanha:** Tratada como cabeçalho (dados gerais). Receitas/despesas vinculadas opcionalmente à campanha via `campaignId`.

**Modelo financeiro:** Sem campo `transactionDate` — a data do lançamento é o `createdAt` (automático). Filtros usam `createdAtStart`/`createdAtEnd` com cast `::date` no backend.

**Formulários multi-tab:** Botão "Continuar" apenas avança a aba sem disparar validação. Validação ocorre apenas no "Salvar" (submit).

**Preview de animal:** Formulários que selecionam um animal (consulta, procedimento, etc.) usam campos `xxxPreview` no schema Zod, preenchidos via `setValue` no `useEffect` do `animalId`. Esses campos não são submetidos.

## Licença

MIT
