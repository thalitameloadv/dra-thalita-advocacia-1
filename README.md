# 👩‍⚖️ Dra. Thalita Melo - Site Advocacia

Site profissional para escritório de advocacia com blog, newsletter e calculadoras jurídicas.

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase (para backend)

### Instalação

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd DraThalitaMelo

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Acesse

- **Site:** http://localhost:5173
- **Admin:** http://localhost:5173/admin/login

---

## 📚 Documentação

**⭐ COMECE AQUI:** [`INDICE_DOCUMENTACAO.md`](./INDICE_DOCUMENTACAO.md)

### Documentos Principais

| Documento | Descrição |
|-----------|-----------|
| [`INDICE_DOCUMENTACAO.md`](./INDICE_DOCUMENTACAO.md) | 📚 Índice completo da documentação |
| [`RESUMO_CORRECOES.md`](./RESUMO_CORRECOES.md) | ✅ Resumo de correções aplicadas |
| [`GUIA_TESTES.md`](./GUIA_TESTES.md) | 🧪 Guia de testes e validação |
| [`ANALISE_E_CORRECOES.md`](./ANALISE_E_CORRECOES.md) | 🔍 Análise técnica detalhada |
| [`BLOG_EDITOR_FIXES.md`](./BLOG_EDITOR_FIXES.md) | 🔧 Correções do editor de blog |

---

## 🏗️ Tecnologias

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### UI/UX
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **Sonner** - Notificações toast

### Backend/Serviços
- **Supabase** - Backend as a Service
  - Autenticação
  - Database (PostgreSQL)
  - Storage (imagens)
  - Row Level Security (RLS)

### Outras Bibliotecas
- **React Helmet Async** - SEO e meta tags
- **DOMPurify** - Sanitização de HTML
- **date-fns** - Manipulação de datas
- **jsPDF** - Geração de PDFs

---

## 📁 Estrutura do Projeto

```
DraThalitaMelo/
│
├── 📄 Documentação
│   ├── INDICE_DOCUMENTACAO.md      ⭐ Índice principal
│   ├── RESUMO_CORRECOES.md         ✅ Correções aplicadas
│   ├── GUIA_TESTES.md              🧪 Guia de testes
│   ├── ANALISE_E_CORRECOES.md      🔍 Análise técnica
│   ├── BLOG_EDITOR_FIXES.md        🔧 Correções do editor
│   ├── .env.example                ⚙️ Template de configuração
│   └── uploaded_images_table.sql   💾 Script SQL (opcional)
│
├── src/
│   ├── pages/                      📄 Páginas da aplicação
│   │   ├── Index.tsx               🏠 Página inicial
│   │   ├── BlogEnhanced.tsx        📝 Listagem do blog
│   │   ├── BlogArticleEnhanced.tsx 📰 Página de artigo
│   │   ├── BlogAdmin.tsx           📊 Dashboard admin
│   │   ├── CreateArticleDirect.tsx ✍️ Editor de artigos
│   │   ├── NewsletterAdminEnhanced.tsx 📧 Admin newsletter
│   │   ├── Calculadoras.tsx        🧮 Calculadoras jurídicas
│   │   └── ...
│   │
│   ├── components/                 🧩 Componentes reutilizáveis
│   │   ├── ui/                     🎨 Componentes UI (shadcn)
│   │   ├── ImageUpload.tsx         📸 Upload de imagens
│   │   ├── ImageEditor.tsx         🖼️ Editor de imagens
│   │   ├── ProtectedRoute.tsx      🔐 Proteção de rotas
│   │   └── ...
│   │
│   ├── services/                   ⚙️ Serviços e APIs
│   │   ├── blogService.ts          📝 Serviço do blog
│   │   ├── imageUploadService.ts   📸 Upload de imagens
│   │   ├── newsletterService.ts    📧 Serviço de newsletter
│   │   └── ...
│   │
│   ├── lib/                        📚 Bibliotecas e utilitários
│   │   ├── supabase.ts             🔌 Cliente Supabase
│   │   ├── sanitizeHtml.ts         🧹 Sanitização HTML
│   │   └── ...
│   │
│   ├── types/                      📋 Definições TypeScript
│   │   ├── blog.ts                 📝 Tipos do blog
│   │   └── ...
│   │
│   └── App.tsx                     🚀 Componente raiz
│
├── public/                         🌐 Arquivos públicos
└── ...
```

---

## 🗺️ Rotas da Aplicação

### Rotas Públicas
```
/                                  → Página inicial
/calculadoras                      → Calculadoras jurídicas
/calculadora-aposentadoria         → Calculadora de aposentadoria
/calculadora-rescisao-trabalhista  → Calculadora de rescisão
/blog                              → Listagem de artigos
/blog/:slug                        → Artigo individual
```

### Rotas de Autenticação
```
/admin/login                       → Login administrativo
/admin/reset-password              → Recuperação de senha
```

### Rotas Admin (Protegidas)
```
/admin/blog                        → Dashboard do blog
/admin/blog/seo                    → Configurações SEO
/admin/blog/novo                   → Criar novo artigo
/admin/blog/editar/:id             → Editar artigo

/admin/newsletter                  → Dashboard newsletter
/admin/newsletter/criar            → Criar newsletter
/admin/newsletter/editar/:id       → Editar newsletter
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica

# Admin (IMPORTANTE!)
VITE_ADMIN_EMAILS=admin@thalitamelo.adv.br

# Site
VITE_SITE_URL=https://thalitamelo.adv.br
VITE_SITE_NAME=Dra. Thalita Melo - Advocacia
```

⚠️ **IMPORTANTE:** Se `VITE_ADMIN_EMAILS` não estiver configurado, qualquer usuário autenticado terá acesso admin!

### 2. Supabase Setup

#### Criar Bucket de Imagens
```sql
-- No Supabase Dashboard > Storage
-- Criar bucket: blog-images
-- Configurar como público
```

#### Criar Tabela de Imagens (Opcional)
```bash
# Execute o script SQL no Supabase
# Arquivo: uploaded_images_table.sql
```

---

## 🧪 Testes

### Testes Rápidos (5 min)
```bash
npm run dev

# Acesse:
# 1. http://localhost:5173/admin/blog/novo
# 2. Teste os botões de formatação
# 3. Teste upload de imagem
```

### Testes Completos
Consulte [`GUIA_TESTES.md`](./GUIA_TESTES.md) para guia detalhado.

---

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Deploy via Lovable
1. Acesse [Lovable Project](https://lovable.dev/projects/a366f4c6-8b6a-466e-895a-4e02bc71515c)
2. Clique em Share → Publish

### Deploy Manual
```bash
# Build
npm run build

# Preview
npm run preview

# Deploy para Vercel, Netlify, etc.
```

---

## 🔐 Segurança

### Proteção de Rotas
- Rotas `/admin/*` são protegidas por `ProtectedRoute`
- Verificação de autenticação via Supabase
- Verificação de email admin via `VITE_ADMIN_EMAILS`

### Row Level Security (RLS)
- Políticas RLS configuradas no Supabase
- Acesso controlado por usuário autenticado
- Consulte `uploaded_images_table.sql` para exemplos

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build            # Build de produção
npm run build:dev        # Build de desenvolvimento
npm run preview          # Preview do build

# Qualidade de Código
npm run lint             # Executa ESLint
npm run typecheck        # Verifica tipos TypeScript

# Testes
npm run test             # Executa testes
npm run test:watch       # Testes em modo watch
```

---

## 🐛 Troubleshooting

### Problema: Rotas não funcionam
```bash
# Limpe o cache e reinicie
rm -rf node_modules/.vite
npm run dev
```

### Problema: Upload de imagem falha
1. Verifique se o bucket `blog-images` existe
2. Verifique se está configurado como público
3. Verifique as credenciais do Supabase no `.env`

### Problema: Acesso negado ao admin
1. Verifique `VITE_ADMIN_EMAILS` no `.env`
2. Reinicie o servidor após alterar `.env`
3. Limpe o cache do navegador

**Mais soluções:** Consulte [`GUIA_TESTES.md`](./GUIA_TESTES.md)

---

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação shadcn/ui](https://ui.shadcn.com/)
- [Documentação React Router](https://reactrouter.com/)
- [Documentação Tailwind CSS](https://tailwindcss.com/)

---

## 🤝 Contribuindo

1. Leia [`INDICE_DOCUMENTACAO.md`](./INDICE_DOCUMENTACAO.md)
2. Siga os padrões de código existentes
3. Teste suas alterações com [`GUIA_TESTES.md`](./GUIA_TESTES.md)
4. Atualize a documentação se necessário

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Consulte [`INDICE_DOCUMENTACAO.md`](./INDICE_DOCUMENTACAO.md)
2. Verifique [`GUIA_TESTES.md`](./GUIA_TESTES.md)
3. Revise [`ANALISE_E_CORRECOES.md`](./ANALISE_E_CORRECOES.md)

---

**Última atualização:** 31/01/2026  
**Versão:** 2.0
