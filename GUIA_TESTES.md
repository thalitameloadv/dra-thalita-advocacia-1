# 🧪 Guia Rápido de Testes - Pós Correções

## ⚡ Testes Rápidos (5 minutos)

### 1️⃣ Teste de Rotas do Blog Admin

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

**Teste A: Criar Novo Artigo**
1. Acesse: `http://localhost:5173/admin/blog/novo`
2. ✅ Deve mostrar "Novo Artigo" no badge
3. ✅ Deve abrir o editor `CreateArticleDirect`
4. ✅ Não deve mostrar erro de rota

**Teste B: Editar Artigo**
1. Acesse: `http://localhost:5173/admin/blog`
2. Clique em "Editar" em qualquer artigo
3. ✅ Deve redirecionar para `/admin/blog/editar/:id`
4. ✅ Deve carregar os dados do artigo
5. ✅ Deve mostrar "Editando" no badge

---

### 2️⃣ Teste de Formatação de Texto

**No editor de artigo:**
1. Digite: `Este é um teste`
2. Selecione a palavra "teste"
3. Clique no botão **B** (negrito)
4. ✅ Deve aparecer: `Este é um **teste**`

**Teste outros botões:**
- **I** (itálico) → `*texto*`
- **Link** → `[texto](url)`
- **Lista** → `\n- texto`
- **Citação** → `\n> texto`
- **Código** → `` `texto` ``

---

### 3️⃣ Teste de Upload de Imagem

**Teste A: Upload Básico**
1. No editor, role até "Imagens do Artigo"
2. Clique em "Clique para fazer upload"
3. Selecione uma imagem (JPG, PNG, WebP)
4. ✅ Deve mostrar barra de progresso
5. ✅ Deve exibir preview da imagem
6. ✅ Deve salvar a URL no formulário

**Teste B: Galeria de Imagens**
1. Clique no botão de imagem na barra de ferramentas
2. Clique em "Ver Galeria"
3. ✅ Modal deve abrir com título "Galeria de Imagens"
4. ✅ Botão X deve fechar o modal
5. ✅ Não deve haver erros no console

---

## 🔍 Testes Detalhados (15 minutos)

### 4️⃣ Teste Completo de Criação de Artigo

1. Acesse `/admin/blog/novo`
2. Preencha todos os campos:
   - **Título:** "Teste de Artigo Completo"
   - **Slug:** (deve ser gerado automaticamente)
   - **Resumo:** "Este é um resumo de teste com mais de 10 caracteres"
   - **Conteúdo:** Digite pelo menos 300 palavras
   - **Categoria:** Selecione uma categoria
   - **Tags:** Adicione pelo menos 3 tags
   - **Imagem de Capa:** Faça upload
   - **Imagem do Post:** Faça upload

3. Teste formatação no conteúdo:
   - Adicione texto em **negrito**
   - Adicione texto em *itálico*
   - Adicione um link
   - Adicione uma lista
   - Insira uma imagem

4. Verifique o Score SEO:
   - ✅ Deve estar acima de 70/100
   - ✅ Contador de palavras deve funcionar
   - ✅ Dicas SEO devem aparecer

5. Salve como rascunho:
   - Clique em "Salvar Rascunho"
   - ✅ Deve mostrar mensagem de sucesso
   - ✅ Deve redirecionar para `/admin/blog/editar/:id`

6. Publique o artigo:
   - Clique em "Publicar"
   - ✅ Deve mostrar mensagem de sucesso
   - ✅ Status deve mudar para "Publicado"

---

### 5️⃣ Teste de Edição de Artigo

1. No dashboard (`/admin/blog`), clique em "Editar" em um artigo
2. ✅ Todos os campos devem estar preenchidos
3. Modifique o título
4. Adicione uma nova tag
5. Clique em "Salvar Rascunho"
6. ✅ Deve salvar as alterações
7. ✅ Não deve criar um novo artigo

---

### 6️⃣ Teste de Segurança

**Teste A: Acesso sem autenticação**
1. Abra uma aba anônima
2. Tente acessar `/admin/blog`
3. ✅ Deve redirecionar para `/admin/login`

**Teste B: Verificação de email admin**
1. Verifique se `VITE_ADMIN_EMAILS` está configurado no `.env`
2. Faça login com um email que **não** está na lista
3. ✅ Deve negar acesso às rotas admin

**Teste C: Email admin válido**
1. Faça login com um email que **está** na lista `VITE_ADMIN_EMAILS`
2. ✅ Deve permitir acesso às rotas admin

---

## 🐛 Checklist de Problemas Conhecidos

Verifique se estes problemas **NÃO** ocorrem mais:

- [ ] ❌ Ao acessar `/admin/blog/novo`, abre o `BlogEditor` antigo
- [ ] ❌ Botões de formatação não funcionam
- [ ] ❌ Upload de imagem retorna erro
- [ ] ❌ Modal da galeria não abre
- [ ] ❌ CardHeader aparece com estilo quebrado
- [ ] ❌ Erro "Cannot read property 'content' of undefined"

Se algum destes problemas ocorrer, consulte `ANALISE_E_CORRECOES.md`.

---

## 📊 Console do Navegador

**Durante os testes, verifique o console (F12):**

### ✅ Mensagens Esperadas (OK)
```
✅ Image uploaded successfully
✅ Article saved successfully
✅ Could not save image metadata to database (AVISO - OK se tabela não existir)
```

### ❌ Erros que NÃO devem aparecer
```
❌ Cannot read property 'content' of undefined
❌ Route conflict detected
❌ CardHeader className error
❌ Failed to upload image
```

---

## 🎯 Critérios de Sucesso

### ✅ Todos os testes passaram se:

1. **Rotas funcionam corretamente:**
   - ✅ `/admin/blog/novo` abre CreateArticleDirect
   - ✅ `/admin/blog/editar/:id` abre CreateArticleDirect com dados
   - ✅ Não há conflitos de rota

2. **Editor funciona completamente:**
   - ✅ Todos os botões de formatação funcionam
   - ✅ Upload de imagens funciona
   - ✅ Galeria de imagens abre corretamente
   - ✅ Salvar e publicar funcionam

3. **Sem erros no console:**
   - ✅ Nenhum erro crítico aparece
   - ✅ Avisos são apenas informativos

4. **Segurança funciona:**
   - ✅ Rotas admin são protegidas
   - ✅ Verificação de email admin funciona (se configurado)

---

## 🚨 Se Algo Não Funcionar

### Problema: Rota `/admin/blog/novo` não funciona
**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Reinicie o servidor de desenvolvimento (`npm run dev`)
3. Verifique se não há erros no terminal

### Problema: Botões de formatação não funcionam
**Solução:**
1. Verifique se o arquivo `CreateArticleDirect.tsx` foi atualizado
2. Limpe o cache e recarregue a página
3. Verifique o console para erros

### Problema: Upload de imagem falha
**Solução:**
1. Verifique se o bucket `blog-images` existe no Supabase
2. Verifique se o bucket está configurado como público
3. Verifique as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)

### Problema: Acesso negado mesmo sendo admin
**Solução:**
1. Verifique se `VITE_ADMIN_EMAILS` está configurado no `.env`
2. Verifique se o email está escrito corretamente (sem espaços extras)
3. Reinicie o servidor após alterar o `.env`

---

## 📞 Suporte

Se após seguir este guia ainda houver problemas:

1. Consulte `ANALISE_E_CORRECOES.md` para detalhes técnicos
2. Consulte `BLOG_EDITOR_FIXES.md` para correções específicas do editor
3. Verifique os logs no console do navegador (F12)
4. Verifique os logs no terminal do servidor

---

**Última atualização:** 31/01/2026  
**Versão:** 1.0
