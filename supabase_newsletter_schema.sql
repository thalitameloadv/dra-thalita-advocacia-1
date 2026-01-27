-- Newsletter Campaigns Table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    preview_text TEXT,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Templates Table
CREATE TABLE IF NOT EXISTS newsletter_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    preview_text TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Analytics Table
CREATE TABLE IF NOT EXISTS newsletter_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
    subscriber_email VARCHAR(255) NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#1e293b',
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add icon column if it doesn't exist (for existing tables)
ALTER TABLE blog_categories 
ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

-- Blog Posts Enhanced Table (add new columns if table exists)
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS author_avatar TEXT,
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS related_posts TEXT[];

-- Newsletter Subscribers Enhanced Table (add new columns if table exists)
ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'blog';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at ON newsletter_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_campaign_id ON newsletter_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_subscriber_email ON newsletter_analytics(subscriber_email);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Insert default newsletter templates
INSERT INTO newsletter_templates (name, subject, content, preview_text, is_default) VALUES
(
    'Template Padrão',
    'Novidades do Blog Dra. Thalita Melo',
    '<h1>Olá {{name}}!</h1>
    <p>Confira as últimas novidades do nosso blog jurídico:</p>
    <ul>
        <li>Artigo 1: Título do artigo</li>
        <li>Artigo 2: Título do artigo</li>
        <li>Artigo 3: Título do artigo</li>
    </ul>
    <p>Visite nosso blog para ler mais: <a href="{{blog_url}}">{{blog_url}}</a></p>
    <p>Atenciosamente,<br>Dra. Thalita Melo</p>',
    'Confira as últimas novidades do nosso blog jurídico',
    true
),
(
    'Template de Boas-vindas',
    'Bem-vindo(a) à Newsletter Dra. Thalita Melo',
    '<h1>Seja bem-vindo(a)!</h1>
    <p>Olá {{name}},</p>
    <p>Obrigado por se inscrever na newsletter do Dra. Thalita Melo Advocacia!</p>
    <p>Você receberá semanalmente os melhores artigos jurídicos, atualizações legislativas e dicas importantes.</p>
    <p>Fique atento aos nossos próximos emails!</p>
    <p>Atenciosamente,<br>Dra. Thalita Melo</p>',
    'Obrigado por se inscrever na nossa newsletter!',
    false
);

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color, icon) VALUES
('Direito Civil', 'direito-civil', 'Artigos sobre direito civil, contratos, obrigações e responsabilidade civil', '#2563eb', 'scale'),
('Direito Trabalhista', 'direito-trabalhista', 'Conteúdo sobre direito do trabalho, CLT, processos trabalhistas', '#dc2626', 'briefcase'),
('Direito Empresarial', 'direito-empresarial', 'Artigos sobre direito empresarial, sociedades, contratos comerciais', '#059669', 'building'),
('Direito de Família', 'direito-familia', 'Conteúdo sobre direito de família, divórcio, guarda, pensão alimentícia', '#7c3aed', 'users'),
('Direito Tributário', 'direito-tributario', 'Artigos sobre tributos, fiscalização, planejamento tributário', '#ea580c', 'calculator'),
('Direito Previdenciário', 'direito-previdenciario', 'Conteúdo sobre INSS, aposentadorias, benefícios previdenciários', '#0891b2', 'shield');

-- Create Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Policy for newsletter_campaigns (only authenticated users can manage)
CREATE POLICY "Users can manage newsletter campaigns" ON newsletter_campaigns
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy for newsletter_templates (only authenticated users can manage)
CREATE POLICY "Users can manage newsletter templates" ON newsletter_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy for newsletter_analytics (only authenticated users can read)
CREATE POLICY "Users can read newsletter analytics" ON newsletter_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for blog_categories (everyone can read, authenticated can manage)
CREATE POLICY "Everyone can read blog categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage blog categories" ON blog_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_newsletter_campaigns_updated_at BEFORE UPDATE ON newsletter_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_templates_updated_at BEFORE UPDATE ON newsletter_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for campaign statistics
CREATE OR REPLACE VIEW campaign_stats AS
SELECT 
    c.id,
    c.subject,
    c.status,
    c.recipient_count,
    c.opened_count,
    c.clicked_count,
    c.unsubscribed_count,
    CASE 
        WHEN c.recipient_count > 0 THEN ROUND((c.opened_count::decimal / c.recipient_count) * 100, 2)
        ELSE 0 
    END as open_rate,
    CASE 
        WHEN c.opened_count > 0 THEN ROUND((c.clicked_count::decimal / c.opened_count) * 100, 2)
        ELSE 0 
    END as click_rate,
    CASE 
        WHEN c.recipient_count > 0 THEN ROUND((c.unsubscribed_count::decimal / c.recipient_count) * 100, 2)
        ELSE 0 
    END as unsubscribe_rate,
    c.created_at,
    c.sent_at
FROM newsletter_campaigns c;

-- Create view for subscriber statistics
CREATE OR REPLACE VIEW subscriber_stats AS
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_subscribers,
    COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_subscribers,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'active')::decimal / COUNT(*)) * 100, 2
    ) as active_rate,
    ROUND(
        (COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '30 days')::decimal / COUNT(*)) * 100, 2
    ) as recent_growth_rate
FROM newsletter_subscribers;
