# APA Control

Sistema de Controle da Associação dos Protetores de Animais. Centraliza informações, organiza processos internos e oferece suporte à tomada de decisões por meio de relatórios e análises.

## 📦 Módulos Implementados

- **Resgate**: Cadastro detalhado do animal, histórico de eventos e rastreabilidade
- **Consultas**: Agendamento em clínica ou domiciliar, integrado ao histórico clínico
- **Anamnese**: Registro de diagnóstico e encaminhamento a procedimentos
- **Procedimentos Clínicos**: Vacinas, medicações, exames e cirurgias
- **Adoção**: Cadastro de adotante e registro da adoção
- **Destino Final**: Registro de saídas definitivas (óbito, transferência, etc.)
- **Ocorrências**: Classificação de eventos relevantes do animal
- **Postagens**: Gerenciamento de conteúdo público (animais para adoção, campanhas)
- **Financeiro**: Controle de receitas e despesas
- **Relatórios**: Exportação em CSV, Excel e PDF

## ✅ Atualizações Recentes (mar/2026)

- CRUD completo de **Consultas**, **Anamnese**, **Procedimentos Clínicos**, **Adoção**, **Destino Final**, **Ocorrências** e **Tipos de Ocorrência** (API + Administrativo).
- Integração de histórico do animal com rastreabilidade (`oldValue`/`newValue`) nos fluxos clínicos e operacionais:
  - `appointment.created|updated|deleted`
  - `anamnesis.created|updated|deleted`
  - `clinical-procedure.created|updated|deleted`
  - `final-destination.created|updated|deleted`
  - `occurrence.created|updated|deleted`
- Relatórios de listagens padronizados em **CSV, Excel e PDF** (com filtros aplicados e sem paginação no export).
- Padronização visual das listagens administrativas (toolbar, botões de exportação, paginação e loading em overlay).
- Formulários com seleção de animal via componente de busca e organização por abas conforme padrão do projeto.
- Em anamnese/procedimento, seleção de consulta com **modal de busca dedicado** (overlay global via portal), evitando conflito com sidebar/topbar.

## 📋 Pré-requisitos

- **Node.js**: versão 20 ou superior
- **pnpm**: versão 10.13.1 ou superior
- **PostgreSQL**: banco de dados para armazenamento (local ou [Neon](https://neon.tech))
- **Git**: para controle de versão
- **GitHub**: para integração com Neon e workflows automatizados (opcional)

## 🚀 Instalação

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd apa-control
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

## ⚙️ Configuração

### Banco de Dados

1. **Configure o PostgreSQL**

   - Crie um banco de dados para o projeto
   - Anote as credenciais de conexão

2. **Configure as variáveis de ambiente**

   Crie um arquivo `.env` na pasta `apps/api/` com as seguintes variáveis:

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

   # Email (para envio de notificações)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=seu-email@gmail.com
   EMAIL_PASSWORD=sua-senha-de-app
   OVERRIDE_EMAIL=email-para-testes@exemplo.com
   ```

3. **Configure as variáveis de ambiente do Frontend**

   Crie um arquivo `.env` na pasta `apps/administrativo/` com:

   ```bash
   VITE_API_URL=http://localhost:3333
   ```

   **Nota:** Se não configurar, o frontend usará `http://localhost:3333` como padrão.

### Migração do Banco de Dados

Execute as migrações para criar as tabelas:

```bash
cd apps/api
pnpm drizzle-kit migrate
```

**Criando uma nova migração:**

```bash
cd apps/api
pnpm drizzle-kit generate --name nome_da_migracao
```

Exemplo:

```bash
pnpm drizzle-kit generate --name add_user_table
```

### Playwright (para geração de PDFs)

O Playwright é instalado automaticamente ao executar `pnpm install`. Caso precise reinstalar manualmente:

```bash
cd apps/api
pnpm exec playwright install chromium
```

**Nota:** Em ambientes sem sudo, o comando tentará instalar sem dependências do sistema automaticamente.

## 🏃‍♂️ Executando a Aplicação

### Desenvolvimento

Para executar tanto o frontend quanto o backend em modo de desenvolvimento:

```bash
pnpm dev
```

Este comando irá iniciar:

- **Frontend (Administrativo)**: http://localhost:5173
- **Backend (API)**: http://localhost:3333 (porta padrão, configurável via variável `PORT`)

### Executando Aplicações Separadamente

**Frontend apenas:**

```bash
cd apps/administrativo
pnpm dev
```

**Backend apenas:**

```bash
cd apps/api
pnpm dev
```

### Produção

1. **Build das aplicações**

   ```bash
   pnpm build
   ```

2. **Executar o backend**

   ```bash
   cd apps/api
   pnpm start
   ```

3. **Servir o frontend**
   ```bash
   cd apps/administrativo
   pnpm preview
   ```

## 📁 Estrutura do Projeto

```
apa-control/
├── apps/
│   ├── administrativo/     # Frontend React
│   └── api/               # Backend Node.js
├── config/                # Configurações compartilhadas
├── package.json           # Configuração do monorepo
└── turbo.json            # Configuração do Turbo
```

### Frontend (Administrativo)

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM

### Backend (API)

- **Framework**: Fastify
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Logs**: Winston
- **Email**: Nodemailer
- **PDFs**: Playwright
- **Exports**: CSV (csv-stringify), Excel (exceljs)

## 🛠️ Scripts Disponíveis

### Scripts do Monorepo

- `pnpm dev` - Executa todas as aplicações em modo desenvolvimento
- `pnpm build` - Build de todas as aplicações
- `pnpm lint` - Executa linting em todas as aplicações
- `pnpm reinstall` - Remove node_modules e reinstala dependências

### Scripts do Frontend

- `pnpm dev` - Servidor de desenvolvimento
- `pnpm build` - Build para produção
- `pnpm preview` - Preview do build de produção
- `pnpm lint` - Verificação de tipos TypeScript

### Scripts do Backend

- `pnpm dev` - Servidor de desenvolvimento com hot reload
- `pnpm build` - Build para produção
- `pnpm start` - Executa o build de produção
- `pnpm test` - Executa os testes
- `pnpm test:coverage` - Executa testes com coverage
- `pnpm test -- --run <arquivos>` - Executa subconjunto de testes (ex.: por caso de uso)

## 🧪 Testes

```bash
cd apps/api
pnpm test
```

## 📝 Desenvolvimento

### Convenções de Código

- **Linter**: Biome
- **Formatação**: Biome
- **Commits**: Conventional Commits com Husky

### Banco de Dados

- **ORM**: Drizzle ORM
- **Migrações**: Drizzle Kit (`pnpm db:generate`, `pnpm db:migrate`)
- **Schema**: Definido em `apps/api/src/database/schema/`

### Controle de Acesso

- **Perfis**: Administrador e Atendente (configuráveis)
- **Permissões**: Por módulo/roles, permitindo customização sem alterar código
- **Autenticação**: JWT com refresh token

## 🚀 Integração com Neon Database (Opcional)

O projeto está configurado para usar o **Neon** - um PostgreSQL serverless com database branching.

### Setup Rápido

1. Crie conta em [https://neon.tech](https://neon.tech)
2. Crie projeto e copie a Connection String
3. Atualize `apps/api/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
   ```

### Migrar do PostgreSQL Local

```bash
# 1. Criar tabelas no Neon
cd apps/api
pnpm db:migrate

# 2. Exportar dados do local
pg_dump -h localhost -U postgres -d apacontrol --data-only --column-inserts --no-owner --disable-triggers -f data_only.sql

# 3. Importar no Neon
psql "YOUR_NEON_CONNECTION_STRING" -f data_only.sql

# 4. Testar
pnpm dev
```

### Integração GitHub

1. No Neon Console → **Integrations** → **GitHub** → **Add**
2. Autorize o repositório
3. Workflows em [.github/workflows/](.github/workflows/) criarão branches de banco automaticamente para cada PR

### Comandos Úteis

**Limpar e recriar banco:**
```bash
psql "YOUR_NEON_CONNECTION_STRING" -c "DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;"
cd apps/api && pnpm db:migrate
```

**Importante:** Sempre dropar `drizzle` junto com `public`, senão as migrations não são aplicadas.

**Verificar tabelas:**
```bash
psql "YOUR_NEON_CONNECTION_STRING" -c "\dt"
```

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de conexão com banco de dados:**

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `psql -h localhost -U usuario -d nome_do_banco`
- Em caso de múltiplas requisições simultâneas, verifique se o pool de conexões está configurado adequadamente (padrão: mínimo 2, máximo 30 conexões)

**Erro de dependências:**

```bash
pnpm reinstall
```

**Porta já em uso:**

- Frontend: altere a porta no `vite.config.ts`
- Backend: altere a variável `PORT` no `.env`

## 📋 Arquitetura e Decisões

**Histórico do Animal:**
- Rastreabilidade completa com `oldValue`/`newValue`
- Logs separados por tipo via enum (`resgate`, `cadastro`, `consulta`, `procedimento`, `destino_final`, `ocorrencia`)
- Visualização contextual por tipo de evento

**Uploads:**
- Comprovantes de destino final salvos em `apps/api/uploads/final-destination`
- Preparado para migração futura para S3/storage externo

**Campanha:**
- Tratada como cabeçalho (dados gerais)
- Receitas/despesas vinculadas opcionalmente à campanha

**Formulários:**
- Anamnese e procedimentos com modal de busca de consulta (overlay global via portal)
- Resgate com abordagem híbrida (animal novo ou existente)

**Pendências futuras:**
- Formulário de adoção configurável (template + respostas)
- Página pública para consumo de dados (API dedicada)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

## 📚 Documentação Adicional

- [REQUIREMENTS.md](REQUIREMENTS.md) - Requisitos funcionais, escopo e decisões de implementação
