-- SUPABASE COMPLETE SCHEMA (FIXED)
-- Dra Thalita Melo Advocacia - Blog, Newsletter & Analytics
-- Updated with all implemented features and syntax fixes

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Blog Categories Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#060629',
    icon VARCHAR(50),
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add icon column if it doesn't exist (for existing tables)
DO $$
BEGIN
    -- Check if column exists, add if it doesn't
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_categories' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE public.blog_categories 
        ADD COLUMN icon VARCHAR(50);
    END IF;
END $$;

-- 3. Blog Posts Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    author TEXT DEFAULT 'Dra. Thalita Melo',
    author_avatar TEXT,
    author_bio TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured_image TEXT,
    category TEXT REFERENCES public.blog_categories(name) ON UPDATE CASCADE,
    tags TEXT[] DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}',
    reading_time INTEGER,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    related_posts TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Check and add comments_count
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE public.blog_posts 
        ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
    
    -- Check and add featured
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'featured'
    ) THEN
        ALTER TABLE public.blog_posts 
        ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Check and add related_posts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'related_posts'
    ) THEN
        ALTER TABLE public.blog_posts 
        ADD COLUMN related_posts TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 4. Newsletter Subscribers Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'pending')),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'blog',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Check and add tags
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletter_subscribers' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE public.newsletter_subscribers 
        ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Check and add source
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'newsletter_subscribers' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.newsletter_subscribers 
        ADD COLUMN source TEXT DEFAULT 'blog';
    END IF;
END $$;

-- 5. Newsletter Campaigns Table
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 6. Newsletter Templates Table
CREATE TABLE IF NOT EXISTS public.newsletter_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    preview_text TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Newsletter Analytics Table
CREATE TABLE IF NOT EXISTS public.newsletter_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
    subscriber_email TEXT NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Blog Analytics Sessions Table
CREATE TABLE IF NOT EXISTS public.blog_analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    landing_page VARCHAR(500),
    entry_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_timestamp TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 1,
    is_bounce BOOLEAN DEFAULT FALSE,
    device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(2),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Blog Analytics Views Table
CREATE TABLE IF NOT EXISTS public.blog_analytics_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    view_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_on_page_seconds INTEGER,
    scroll_depth INTEGER,
    is_unique_view BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Blog Analytics Engagement Table
CREATE TABLE IF NOT EXISTS public.blog_analytics_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    engagement_type VARCHAR(20) NOT NULL CHECK (engagement_type IN ('like', 'comment', 'share', 'bookmark')),
    engagement_data JSONB,
    engagement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Blog Analytics Traffic Sources Table
CREATE TABLE IF NOT EXISTS public.blog_analytics_traffic_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('organic', 'direct', 'referral', 'social', 'email', 'paid', 'other')),
    source VARCHAR(100),
    medium VARCHAR(50),
    campaign VARCHAR(100),
    term VARCHAR(255),
    content VARCHAR(255),
    first_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Blog Analytics Performance Table
CREATE TABLE IF NOT EXISTS public.blog_analytics_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    average_time_on_page_seconds INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    exit_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, date)
);

-- 13. Blog Analytics Search Terms Table
CREATE TABLE IF NOT EXISTS public.blog_analytics_search_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_term VARCHAR(255) NOT NULL,
    search_count INTEGER DEFAULT 1,
    result_clicks INTEGER DEFAULT 0,
    avg_position DECIMAL(5,2) DEFAULT 0,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Blog Analytics Events Table
CREATE TABLE IF NOT EXISTS public.blog_analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50),
    event_action VARCHAR(50),
    event_label VARCHAR(255),
    event_value INTEGER,
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id),
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_name ON public.blog_categories(name);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at ON public.newsletter_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_campaign_id ON public.newsletter_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_sessions_session_id ON public.blog_analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_sessions_entry_timestamp ON public.blog_analytics_sessions(entry_timestamp);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_session_id ON public.blog_analytics_views(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_post_id ON public.blog_analytics_views(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_view_timestamp ON public.blog_analytics_views(view_timestamp);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_session_id ON public.blog_analytics_engagement(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_post_id ON public.blog_analytics_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_type ON public.blog_analytics_engagement(engagement_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_traffic_sources_session_id ON public.blog_analytics_traffic_sources(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_traffic_sources_source_type ON public.blog_analytics_traffic_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_performance_post_id ON public.blog_analytics_performance(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_performance_date ON public.blog_analytics_performance(date);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_search_terms_term ON public.blog_analytics_search_terms(search_term);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_events_session_id ON public.blog_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_events_type ON public.blog_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_events_timestamp ON public.blog_analytics_events(event_timestamp);

-- 16. Enable Row Level Security (RLS)
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_search_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_events ENABLE ROW LEVEL SECURITY;

-- 17. RLS Policies (Fixed - no IF NOT EXISTS)
-- Blog Categories
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access on blog_categories" ON public.blog_categories;
    DROP POLICY IF EXISTS "Allow admin all access on blog_categories" ON public.blog_categories;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
END $$;

CREATE POLICY "Allow public read access on blog_categories" 
ON public.blog_categories FOR SELECT USING (true);

CREATE POLICY "Allow admin all access on blog_categories" 
ON public.blog_categories FOR ALL USING (auth.role() = 'authenticated');

-- Blog Posts
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access on published blog_posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Allow admin read access on all blog_posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Allow admin all access on blog_posts" ON public.blog_posts;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
END $$;

CREATE POLICY "Allow public read access on published blog_posts" 
ON public.blog_posts FOR SELECT USING (status = 'published');

CREATE POLICY "Allow admin read access on all blog_posts" 
ON public.blog_posts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin all access on blog_posts" 
ON public.blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- Newsletter Subscribers
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public insert on newsletter_subscribers" ON public.newsletter_subscribers;
    DROP POLICY IF EXISTS "Allow admin all access on newsletter_subscribers" ON public.newsletter_subscribers;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
END $$;

CREATE POLICY "Allow public insert on newsletter_subscribers" 
ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin all access on newsletter_subscribers" 
ON public.newsletter_subscribers FOR ALL USING (auth.role() = 'authenticated');

-- Newsletter Campaigns & Templates
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow admin all access on newsletter_campaigns" ON public.newsletter_campaigns;
    DROP POLICY IF EXISTS "Allow admin all access on newsletter_templates" ON public.newsletter_templates;
    DROP POLICY IF EXISTS "Allow admin read access on newsletter_analytics" ON public.newsletter_analytics;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
END $$;

CREATE POLICY "Allow admin all access on newsletter_campaigns" 
ON public.newsletter_campaigns FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin all access on newsletter_templates" 
ON public.newsletter_templates FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin read access on newsletter_analytics" 
ON public.newsletter_analytics FOR SELECT USING (auth.role() = 'authenticated');

-- Analytics Tables (Read-only for authenticated users)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated read access on blog_analytics_sessions" ON public.blog_analytics_sessions;
    DROP POLICY IF EXISTS "Allow service role write access on blog_analytics_sessions" ON public.blog_analytics_sessions;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
END $$;

CREATE POLICY "Allow authenticated read access on blog_analytics_sessions" 
ON public.blog_analytics_sessions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role write access on blog_analytics_sessions" 
ON public.blog_analytics_sessions FOR ALL USING (auth.role() = 'service_role');

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated read access on blog_analytics_views" ON public.blog_analytics_views;
    DROP POLICY IF EXISTS "Allow service role write access on blog_analytics_views" ON public.blog_analytics_views;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
$$;

CREATE POLICY "Allow authenticated read access on blog_analytics_views" 
ON public.blog_analytics_views FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role write access on blog_analytics_views" 
ON public.blog_analytics_views FOR ALL USING (auth.role() = 'service_role');

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated read access on blog_analytics_engagement" ON public.blog_analytics_engagement;
    DROP POLICY IF EXISTS "Allow service role write access on blog_analytics_engagement" ON public.blog_analytics_engagement;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
$$;

CREATE POLICY "Allow authenticated read access on blog_analytics_engagement" 
ON public.blog_analytics_engagement FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role write access on blog_analytics_engagement" 
ON public.blog_analytics_engagement FOR ALL USING (auth.role() = 'service_role');

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated read access on blog_analytics_traffic_sources" ON public.blog_analytics_traffic_sources;
    DROP POLICY IF EXISTS "Allow service role write access on blog_analytics_traffic_sources" ON public.blog_analytics_traffic_sources;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
$$;

CREATE POLICY "Allow authenticated read access on blog_analytics_traffic_sources" 
ON public.blog_analytics_traffic_sources FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role write access on blog_analytics_traffic_sources" 
ON public.blog_analytics_traffic_sources FOR ALL USING (auth.role() = 'service_role');

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated read access on blog_analytics_performance" ON public.blog_analytics_performance;
    DROP POLICY IF EXISTS "Allow service role write access on blog_analytics_performance" ON public.blog_analytics_performance;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
$$;

CREATE POLICY "Allow authenticated read access on blog_analytics_performance" 
ON public.blog_analytics_performance FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role write access on blog_analytics_performance" 
ON public.blog_analytics_performance FOR ALL USING (auth.role() = 'service_role');

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated read access on blog_analytics_search_terms" ON public.blog_analytics_search_terms;
    DROP POLICY IF EXISTS "Allow service role write access on blog_analytics_search_terms" ON public.blog_analytics_search_terms;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
$$;

CREATE POLICY "Allow authenticated read access on blog_analytics_search_terms" 
ON public.blog_analytics_search_terms FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role write access on blog_analytics_search_terms" 
ON public.blog_analytics_search_terms FOR ALL USING (auth.role() = 'service_role');

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated read access on blog_analytics_events" ON public.blog_analytics_events;
    DROP POLICY IF EXISTS "Allow service role write access on blog_analytics_events" ON public.blog_analytics_events;
EXCEPTION WHEN OTHERS THEN
    -- Policies don't exist, continue
END;
$$;

CREATE POLICY "Allow authenticated read access on blog_analytics_events" 
ON public.blog_analytics_events FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role write access on blog_analytics_events" 
ON public.blog_analytics_events FOR ALL USING (auth.role() = 'service_role');

-- 18. Functions and Triggers

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_blog_categories_updated_at 
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_blog_posts_updated_at 
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_newsletter_campaigns_updated_at 
BEFORE UPDATE ON public.newsletter_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_newsletter_templates_updated_at 
BEFORE UPDATE ON public.newsletter_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_blog_analytics_sessions_updated_at 
BEFORE UPDATE ON public.blog_analytics_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_blog_analytics_performance_updated_at 
BEFORE UPDATE ON public.blog_analytics_performance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_blog_analytics_search_terms_updated_at 
BEFORE UPDATE ON public.blog_analytics_search_terms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Analytics Performance Trigger
CREATE OR REPLACE FUNCTION update_analytics_performance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.blog_analytics_performance (
        post_id, 
        date, 
        views, 
        unique_views, 
        likes, 
        comments, 
        shares,
        average_time_on_page_seconds,
        bounce_rate
    )
    VALUES (
        NEW.post_id,
        DATE(NEW.view_timestamp),
        1,
        CASE WHEN NEW.is_unique_view = TRUE THEN 1 ELSE 0 END,
        0,
        0,
        0,
        NEW.time_on_page_seconds,
        0
    )
    ON CONFLICT (post_id, date) 
    DO UPDATE SET
        views = public.blog_analytics_performance.views + 1,
        unique_views = public.blog_analytics_performance.unique_views + 
            CASE WHEN NEW.is_unique_view = TRUE THEN 1 ELSE 0 END,
        average_time_on_page_seconds = (
            (public.blog_analytics_performance.average_time_on_page_seconds * public.blog_analytics_performance.views) + 
            NEW.time_on_page_seconds
        ) / (public.blog_analytics_performance.views + 1),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_analytics_performance
    AFTER INSERT ON public.blog_analytics_views
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_performance();

-- 19. Views for Analytics

CREATE OR REPLACE VIEW blog_analytics_daily_summary AS
SELECT 
    DATE(view_timestamp) as date,
    COUNT(*) as total_views,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT post_id) as unique_posts_viewed,
    AVG(time_on_page_seconds) as avg_time_on_page,
    AVG(scroll_depth) as avg_scroll_depth
FROM public.blog_analytics_views
GROUP BY DATE(view_timestamp)
ORDER BY date DESC;

CREATE OR REPLACE VIEW blog_analytics_post_summary AS
SELECT 
    p.id as post_id,
    p.title,
    p.slug,
    p.category,
    p.published_at,
    COUNT(v.id) as total_views,
    COUNT(DISTINCT v.session_id) as unique_views,
    COUNT(DISTINCT CASE WHEN v.is_unique_view = TRUE THEN v.session_id END) as unique_first_views,
    AVG(v.time_on_page_seconds) as avg_time_on_page,
    AVG(v.scroll_depth) as avg_scroll_depth,
    COUNT(e.id) as total_engagements,
    COUNT(CASE WHEN e.engagement_type = 'like' THEN 1 END) as likes,
    COUNT(CASE WHEN e.engagement_type = 'comment' THEN 1 END) as comments,
    COUNT(CASE WHEN e.engagement_type = 'share' THEN 1 END) as shares
FROM public.blog_posts p
LEFT JOIN public.blog_analytics_views v ON p.id = v.post_id
LEFT JOIN public.blog_analytics_engagement e ON p.id = e.post_id
WHERE p.status = 'published'
GROUP BY p.id, p.title, p.slug, p.category, p.published_at
ORDER BY total_views DESC;

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
FROM public.newsletter_campaigns c;

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
FROM public.newsletter_subscribers;

-- 20. Initial Data Seeding

-- Blog Categories (Safe Insert)
DO $$
BEGIN
    -- Update existing categories with icons
    UPDATE public.blog_categories 
    SET icon = 'scale' 
    WHERE name = 'Direito Civil' AND icon IS NULL;

    UPDATE public.blog_categories 
    SET icon = 'briefcase' 
    WHERE name = 'Direito Trabalhista' AND icon IS NULL;

    UPDATE public.blog_categories 
    SET icon = 'building' 
    WHERE name = 'Direito Empresarial' AND icon IS NULL;

    UPDATE public.blog_categories 
    SET icon = 'users' 
    WHERE name = 'Direito de Família' AND icon IS NULL;

    UPDATE public.blog_categories 
    SET icon = 'calculator' 
    WHERE name = 'Direito Tributário' AND icon IS NULL;

    UPDATE public.blog_categories 
    SET icon = 'shield' 
    WHERE name = 'Direito Previdenciário' AND icon IS NULL;
END $$;

-- Insert new categories if they don't exist
INSERT INTO public.blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Civil', 'direito-civil', 'Artigos sobre direito civil, contratos, obrigações e responsabilidade civil', '#2563eb', 'scale'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_categories WHERE slug = 'direito-civil');

INSERT INTO public.blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Trabalhista', 'direito-trabalhista', 'Conteúdo sobre direito do trabalho, CLT, processos trabalhistas', '#dc2626', 'briefcase'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_categories WHERE slug = 'direito-trabalhista');

INSERT INTO public.blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Empresarial', 'direito-empresarial', 'Artigos sobre direito empresarial, sociedades, contratos comerciais', '#059669', 'building'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_categories WHERE slug = 'direito-empresarial');

INSERT INTO public.blog_categories (name, slug, description, color, icon) 
SELECT 'Direito de Família', 'direito-familia', 'Conteúdo sobre direito de família, divórcio, guarda, pensão alimentícia', '#7c3aed', 'users'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_categories WHERE slug = 'direito-familia');

INSERT INTO public.blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Tributário', 'direito-tributario', 'Artigos sobre tributos, fiscalização, planejamento tributário', '#ea580c', 'calculator'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_categories WHERE slug = 'direito-tributario');

INSERT INTO public.blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Previdenciário', 'direito-previdenciario', 'Conteúdo sobre INSS, aposentadorias, benefícios previdenciários', '#0891b2', 'shield'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_categories WHERE slug = 'direito-previdenciario');

-- Newsletter Templates
INSERT INTO public.newsletter_templates (name, subject, content, preview_text, is_default) VALUES
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
) ON CONFLICT DO NOTHING;

-- Analytics Search Terms Sample Data
INSERT INTO public.blog_analytics_search_terms (search_term, search_count, result_clicks, avg_position) VALUES
('direito civil', 45, 12, 3.2),
('divórcio', 38, 15, 2.8),
('contrato de trabalho', 29, 8, 4.1),
('herança', 22, 6, 3.9),
('empresa', 31, 11, 2.5)
ON CONFLICT (search_term) DO NOTHING;

-- 21. Final Verification Queries

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%blog%' OR table_name LIKE '%newsletter%' OR table_name LIKE '%analytics%')
ORDER BY table_name;

-- Check categories
SELECT name, slug, icon, color 
FROM public.blog_categories 
ORDER BY name;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('blog_posts', 'blog_categories', 'newsletter_campaigns', 'blog_analytics_views')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT tablename, policyname, permissive, roles 
FROM pg_policies 
WHERE tablename IN ('blog_posts', 'blog_categories', 'newsletter_campaigns')
ORDER BY tablename, policyname;

-- Complete! 🎉
DO $$
BEGIN
    RAISE NOTICE 'Schema completo criado com sucesso!';
    RAISE NOTICE 'Tabelas, índices, policies e dados iniciais configurados.';
    RAISE NOTICE 'O sistema está pronto para uso.';
END $$;
