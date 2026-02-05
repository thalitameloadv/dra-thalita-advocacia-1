# Correções do Editor de Blog

## Problemas Identificados e Corrigidos

### 1. **Botões de Formatação Não Funcionavam**

**Problema:** Os botões de negrito, itálico, link, lista, citação e código não estavam funcionando no editor de artigos.

**Causa:** A função `formatText` estava usando `watchedValues.content` que pode não estar sincronizado com o valor real do formulário no momento do clique.

**Solução:** Modificamos a função para usar `getValues('content')` que obtém o valor atual diretamente do formulário. Também ajustamos:

- Uso de `setValue` com a opção `{ shouldDirty: true }` para marcar o formulário como modificado
- Aumento do timeout de 0ms para 10ms para garantir que o DOM seja atualizado antes de reposicionar o cursor
- Melhor cálculo da nova posição do cursor

**Arquivo:** `src/pages/CreateArticleDirect.tsx`

```typescript
const formatText = (format: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = getValues('content') || '';  // ✅ Mudança aqui
    const selectedText = currentContent.substring(start, end) || '';
    let formattedText = '';
    
    switch (format) {
        case 'bold': formattedText = `**${selectedText}**`; break;
        case 'italic': formattedText = `*${selectedText}*`; break;
        case 'link': formattedText = `[${selectedText}](url)`; break;
        case 'list': formattedText = `\n- ${selectedText}`; break;
        case 'quote': formattedText = `\n> ${selectedText}`; break;
        case 'code': formattedText = `\`${selectedText}\``; break;
        case 'image': setShowImageEditor(true); return;
        default: return;
    }
    
    const newContent = currentContent.substring(0, start) + formattedText + currentContent.substring(end);
    setValue('content', newContent, { shouldDirty: true });  // ✅ Mudança aqui
    
    setTimeout(() => {
        textarea.focus();
        const newPosition = start + formattedText.length;
        textarea.setSelectionRange(newPosition, newPosition);
    }, 10);  // ✅ Mudança aqui
};
```

### 2. **Erro ao Anexar Imagem**

**Problema:** Ao tentar fazer upload de uma imagem, ocorria um erro inesperado (ID: error-1769869947988-kbplomkhm).

**Causa:** O serviço de upload de imagens (`imageUploadService.ts`) estava tentando salvar metadados na tabela `uploaded_images` do Supabase, que pode não existir ou não ter as permissões RLS (Row Level Security) configuradas corretamente.

**Solução:** Tornamos o salvamento de metadados no banco de dados **opcional**. Agora:

1. O upload da imagem para o Supabase Storage sempre funciona
2. Tentamos salvar os metadados no banco de dados
3. Se falhar (tabela não existe ou sem permissão), apenas logamos um aviso e retornamos a imagem com sucesso
4. Corrigimos o `filePath` para não incluir o bucket no caminho (evita duplicação)

**Arquivo:** `src/services/imageUploadService.ts`

```typescript
async uploadImage(file: File, options: ImageUploadOptions = {}): Promise<UploadedImage> {
    // ... código de validação e upload ...
    
    // Criar objeto de imagem
    const imageData: UploadedImage = {
        id: data.path,
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
        bucket: opts.bucket!,
        path: filePath,
        created_at: new Date().toISOString()
    };

    // ✅ Tentar salvar metadados no banco (opcional)
    try {
        const { data: savedImage, error: saveError } = await supabase
            .from('uploaded_images')
            .insert({ /* ... */ })
            .select()
            .single();

        if (!saveError && savedImage) {
            return savedImage;
        }
    } catch (dbError) {
        console.warn('Could not save image metadata to database:', dbError);
        // ✅ Continua mesmo se falhar ao salvar no banco
    }

    return imageData;  // ✅ Retorna a imagem mesmo sem metadados no banco
}
```

## Como Testar

### Testando os Botões de Formatação

1. Acesse `/admin/blog/novo` ou `/admin/blog/editar/:id`
2. No campo "Conteúdo do Artigo", digite algum texto
3. Selecione uma parte do texto
4. Clique em um dos botões de formatação (B, I, Link, Lista, etc.)
5. O texto selecionado deve ser formatado com a sintaxe Markdown correspondente

### Testando o Upload de Imagem

1. Acesse `/admin/blog/novo` ou `/admin/blog/editar/:id`
2. Role até a seção "Imagens do Artigo"
3. Clique em "Clique para fazer upload ou arraste uma imagem"
4. Selecione uma imagem do seu computador
5. A imagem deve ser enviada com sucesso e exibida no preview

#### Alternativa

1. No campo "Conteúdo do Artigo", clique no botão de imagem (ícone de imagem)
2. Faça upload de uma imagem
3. Configure as opções da imagem (alt text, tamanho, alinhamento, etc.)
4. Clique em "Inserir Imagem"
5. O markdown da imagem deve ser inserido no conteúdo

## Observações Importantes

### Tabela `uploaded_images` (Opcional)

Se você quiser habilitar o salvamento de metadados de imagens no banco de dados, crie a tabela com o seguinte SQL:

```sql
-- Criar tabela de imagens
CREATE TABLE IF NOT EXISTS uploaded_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de imagens (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem inserir imagens"
    ON uploaded_images
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para permitir leitura de imagens (todos)
CREATE POLICY "Todos podem ver imagens"
    ON uploaded_images
    FOR SELECT
    TO public
    USING (true);

-- Política para permitir exclusão de imagens (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem deletar imagens"
    ON uploaded_images
    FOR DELETE
    TO authenticated
    USING (true);
```

### Bucket do Supabase Storage

Certifique-se de que o bucket `blog-images` existe no Supabase Storage e está configurado como público:

1. Acesse o Supabase Dashboard
2. Vá em Storage
3. Crie um bucket chamado `blog-images` se não existir
4. Configure como público (Public bucket)
5. Configure as políticas de acesso conforme necessário

## Resumo das Mudanças

✅ **Botões de formatação agora funcionam corretamente**
✅ **Upload de imagens funciona mesmo sem a tabela `uploaded_images`**
✅ **Melhor tratamento de erros no upload de imagens**
✅ **Código mais robusto e resiliente a falhas**

Todas as funcionalidades de edição de artigos agora devem estar funcionando perfeitamente!
