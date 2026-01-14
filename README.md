# Kairós Webapp

Aplicação web desenvolvida com Next.js, TypeScript e Tailwind CSS.

## Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **Firebase** - Autenticação, Firestore e Storage
- **Ant Design** - Biblioteca de componentes UI
- **React Query** - Gerenciamento de estado do servidor
- **PrimeReact** - Componentes adicionais

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Firebase Configuration (obrigatórias)
NEXT_PUBLIC_API_KEY=your_api_key_here
NEXT_PUBLIC_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_STORAGE_BUCKET=your_storage_bucket_here

# Opcionais
NEXT_PUBLIC_DEFAULT_USER_EMAIL=your_email_here
NEXT_PUBLIC_DEFAULT_USER_TOKEN=your_token_here
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/your-page
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/your-page
NEXT_PUBLIC_PTCP_APP_ID=your_ptcp_app_id_here
```

**Importante:** No Next.js, todas as variáveis de ambiente que precisam ser acessadas no cliente (browser) devem começar com `NEXT_PUBLIC_`. Sem esse prefixo, as variáveis não estarão disponíveis no código do cliente.

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build

```bash
npm run build
```

### Iniciar produção

```bash
npm start
```

## Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Página inicial
│   ├── gallery/            # Rotas da galeria
│   ├── management/         # Rotas de gerenciamento
│   └── membership-form/    # Formulário de membro
├── components/            # Componentes reutilizáveis
├── pages/                 # Componentes de página
├── services/              # Serviços de API
├── store/                 # Contextos e estado global
├── types/                 # Definições TypeScript
└── utils/                 # Utilitários
```

## Migração de Vite para Next.js

Este projeto foi migrado de Vite + React Router para Next.js com App Router. As principais mudanças incluem:

- Rotas convertidas para o sistema de arquivos do Next.js
- React Router substituído por Next.js Router
- Estilos SCSS convertidos para Tailwind CSS
- Configuração do Firebase atualizada para Next.js
- Variáveis de ambiente migradas para `NEXT_PUBLIC_*`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa o linter
