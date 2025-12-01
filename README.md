# APA Control

Sistema ERP para instituição de adoção de animais desenvolvido com React, Node.js e PostgreSQL.

## 📋 Pré-requisitos

- **Node.js**: versão 20 ou superior
- **pnpm**: versão 10.13.1 ou superior
- **PostgreSQL**: banco de dados para armazenamento
- **Git**: para controle de versão

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
- **Autenticação**: JWT
- **Validação**: Zod
- **Logs**: Winston
- **Email**: Nodemailer

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
- **Migrações**: Drizzle Kit
- **Schema**: Definido em `apps/api/src/database/schema/`

### Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

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

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Suporte

Para suporte e dúvidas, entre em contato através dos issues do repositório.
