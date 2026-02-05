-- Atualização do schema do blog para as novas funcionalidades
-- Execute no SQL Editor do Supabase

-- 1. Verificar e adicionar colunas SEO na tabela blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[], -- Array de palavras-chave
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array de tags
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS author_avatar TEXT,
ADD COLUMN IF NOT EXISTS author_bio TEXT;

-- 2. Criar tabela de categorias (se não existir)
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de comentários (se não existir)
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE
);

-- 4. Criar tabela de autores (se não existir)
CREATE TABLE IF NOT EXISTS blog_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    bio TEXT,
    role TEXT DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author')),
    social_links JSONB,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de templates de artigos (opcional)
CREATE TABLE IF NOT EXISTS article_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- 7. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS Policies (corrige usando DO block para verificar existência)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Política: Posts publicados são visíveis para todos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blog_posts' 
        AND policyname = 'Public posts are viewable by everyone'
    ) THEN
        CREATE POLICY "Public posts are viewable by everyone" 
        ON blog_posts FOR SELECT 
        USING (status = 'published');
    END IF;
END $$;

-- Política: Apenas usuários autenticados podem criar/editar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blog_posts' 
        AND policyname = 'Authenticated users can manage posts'
    ) THEN
        CREATE POLICY "Authenticated users can manage posts" 
        ON blog_posts FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- Política: Categorias visíveis para todos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blog_categories' 
        AND policyname = 'Categories are viewable by everyone'
    ) THEN
        CREATE POLICY "Categories are viewable by everyone" 
        ON blog_categories FOR SELECT 
        TO anon, authenticated 
        USING (true);
    END IF;
END $$;

-- Política: Comentários aprovados visíveis para todos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blog_comments' 
        AND policyname = 'Approved comments are viewable'
    ) THEN
        CREATE POLICY "Approved comments are viewable" 
        ON blog_comments FOR SELECT 
        USING (status = 'approved');
    END IF;
END $$;

-- 9. Inserir templates padrão (opcional)
INSERT INTO article_templates (name, description, content, category) VALUES
('Guia Jurídico Completo', 'Template para guias e tutoriais jurídicos', E'# Guia Completo: [Tema]\n\n## O que é [Tema]?\n\n[Explicação clara e objetiva do tema jurídico]\n\n## Quando você precisa de um advogado?\n\n- [Situação 1: quando procurar ajuda]\n- [Situação 2: sinais de alerta]\n- [Situação 3: prazos importantes]\n\n## Como funciona o processo?\n\n1. [Primeira etapa do processo]\n2. [Segunda etapa do processo]\n3. [Terceira etapa do processo]\n\n## Prazos importantes\n\n⚠️ **Atenção**: [Informações sobre prazos prescricionais e decadenciais]\n\n## Conclusão\n\n[Resumo dos principais pontos e call-to-action]\n\n---\n\n**Precisa de ajuda com [tema]?**\n\nEntre em contato com nossa equipe especializada para uma avaliação personalizada do seu caso.', 'guia'),

('Perguntas Frequentes', 'Template FAQ para esclarecer dúvidas comuns', E'# Perguntas Frequentes sobre [Tema]\n\n## 1. [Pergunta mais comum sobre o tema]?\n\n[Resposta detalhada e completa]\n\n## 2. [Segunda pergunta frequente]?\n\n[Resposta esclarecendo a dúvida]\n\n## 3. [Terceira pergunta frequente]?\n\n[Resposta com exemplos práticos]\n\n## 4. [Quarta pergunta]?\n\n[Resposta direta e objetiva]\n\n## Precisa de mais esclarecimentos?\n\nSe você tem outras dúvidas sobre [tema] ou precisa de orientação jurídica personalizada, nossa equipe está pronta para ajudar.\n\n[Link para contato ou agendamento]', 'faq'),

('Caso de Sucesso', 'Template para compartilhar casos reais de sucesso', E'# Caso de Sucesso: [Título do Caso]\n\n## O Desafio\n\n[Descrição detalhada da situação complexa que o cliente enfrentava. Contexto, obstáculos e riscos envolvidos.]\n\n> \"[Citação do cliente sobre a dificuldade da situação]\"\n\n## Nossa Solução\n\n[Estratégia desenvolvida pela equipe jurídica. Abordagem personalizada e diferenciais do trabalho.]\n\n### Ações realizadas:\n\n1. [Ação estratégica 1]\n2. [Ação estratégica 2]\n3. [Ação estratégica 3]\n\n## O Resultado\n\n[Resultado alcançado com números e dados quando possível]\n\n> \"[Depoimento do cliente sobre o resultado e experiência]\"\n\n## Por que funciona?\n\n[Explicação dos fatores-chave que contribuíram para o sucesso do caso]\n\n---\n\n## Quer um resultado similar?\n\nSe você está passando por uma situação semelhante, **não espere mais**. Entre em contato hoje mesmo para uma avaliação gratuita do seu caso.\n\n[Botão/Link para contato]', 'caso')
ON CONFLICT DO NOTHING;

-- 10. Função para buscar posts por categoria com paginação
CREATE OR REPLACE FUNCTION get_posts_by_category(
    category_slug TEXT,
    page_number INTEGER DEFAULT 1,
    items_per_page INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT,
    tags TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    reading_time INTEGER,
    views INTEGER,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        bp.category,
        bp.tags,
        bp.published_at,
        bp.reading_time,
        bp.views,
        COUNT(*) OVER() as total_count
    FROM blog_posts bp
    WHERE bp.category = category_slug 
      AND bp.status = 'published'
    ORDER BY bp.published_at DESC
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page;
END;
$$ LANGUAGE plpgsql;

-- 11. Função para incrementar views
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE blog_posts 
    SET views = views + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Função para buscar posts relacionados
CREATE OR REPLACE FUNCTION get_related_posts(
    target_post_id UUID,
    target_category TEXT,
    limit_count INTEGER DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT,
    published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        bp.category,
        bp.published_at
    FROM blog_posts bp
    WHERE bp.id != target_post_id 
      AND bp.category = target_category
      AND bp.status = 'published'
    ORDER BY bp.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
