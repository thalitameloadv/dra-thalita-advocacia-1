-- Blog Analytics Tables
-- These tables support the advanced analytics system

-- Blog Analytics Sessions Table
CREATE TABLE IF NOT EXISTS blog_analytics_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Blog Analytics Views Table
CREATE TABLE IF NOT EXISTS blog_analytics_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    view_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_on_page_seconds INTEGER,
    scroll_depth INTEGER, -- Percentage of page scrolled
    is_unique_view BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Analytics Engagement Table
CREATE TABLE IF NOT EXISTS blog_analytics_engagement (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    engagement_type VARCHAR(20) NOT NULL CHECK (engagement_type IN ('like', 'comment', 'share', 'bookmark')),
    engagement_data JSONB, -- Additional data like platform, comment_id, etc.
    engagement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Analytics Traffic Sources Table
CREATE TABLE IF NOT EXISTS blog_analytics_traffic_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('organic', 'direct', 'referral', 'social', 'email', 'paid', 'other')),
    source VARCHAR(100), -- Specific source like 'google', 'facebook', 'newsletter', etc.
    medium VARCHAR(50), -- Medium like 'organic', 'cpc', 'email', etc.
    campaign VARCHAR(100), -- Campaign name if applicable
    term VARCHAR(255), -- Search term if applicable
    content VARCHAR(255), -- Content identifier if applicable
    first_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Analytics Performance Table
CREATE TABLE IF NOT EXISTS blog_analytics_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
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

-- Blog Analytics Search Terms Table
CREATE TABLE IF NOT EXISTS blog_analytics_search_terms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    search_term VARCHAR(255) NOT NULL,
    search_count INTEGER DEFAULT 1,
    result_clicks INTEGER DEFAULT 0,
    avg_position DECIMAL(5,2) DEFAULT 0,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Analytics Events Table (for custom tracking)
CREATE TABLE IF NOT EXISTS blog_analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50),
    event_action VARCHAR(50),
    event_label VARCHAR(255),
    event_value INTEGER,
    post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id),
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_analytics_sessions_session_id ON blog_analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_sessions_user_id ON blog_analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_sessions_entry_timestamp ON blog_analytics_sessions(entry_timestamp);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_sessions_device_type ON blog_analytics_sessions(device_type);

CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_session_id ON blog_analytics_views(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_post_id ON blog_analytics_views(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_view_timestamp ON blog_analytics_views(view_timestamp);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_unique_view ON blog_analytics_views(post_id, session_id, is_unique_view);

CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_session_id ON blog_analytics_engagement(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_post_id ON blog_analytics_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_type ON blog_analytics_engagement(engagement_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_timestamp ON blog_analytics_engagement(engagement_timestamp);

CREATE INDEX IF NOT EXISTS idx_blog_analytics_traffic_sources_session_id ON blog_analytics_traffic_sources(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_traffic_sources_source_type ON blog_analytics_traffic_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_traffic_sources_source ON blog_analytics_traffic_sources(source);

CREATE INDEX IF NOT EXISTS idx_blog_analytics_performance_post_id ON blog_analytics_performance(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_performance_date ON blog_analytics_performance(date);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_performance_views ON blog_analytics_performance(views);

CREATE INDEX IF NOT EXISTS idx_blog_analytics_search_terms_term ON blog_analytics_search_terms(search_term);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_search_terms_count ON blog_analytics_search_terms(search_count);

CREATE INDEX IF NOT EXISTS idx_blog_analytics_events_session_id ON blog_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_events_type ON blog_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_events_timestamp ON blog_analytics_events(event_timestamp);

-- Create views for common analytics queries
CREATE OR REPLACE VIEW blog_analytics_daily_summary AS
SELECT 
    DATE(view_timestamp) as date,
    COUNT(*) as total_views,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT post_id) as unique_posts_viewed,
    AVG(time_on_page_seconds) as avg_time_on_page,
    AVG(scroll_depth) as avg_scroll_depth
FROM blog_analytics_views
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
FROM blog_posts p
LEFT JOIN blog_analytics_views v ON p.id = v.post_id
LEFT JOIN blog_analytics_engagement e ON p.id = e.post_id
WHERE p.status = 'published'
GROUP BY p.id, p.title, p.slug, p.category, p.published_at
ORDER BY total_views DESC;

CREATE OR REPLACE VIEW blog_analytics_traffic_summary AS
SELECT 
    source_type,
    source,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(*) as total_events,
    AVG(CASE WHEN e.event_type = 'page_view' THEN 1 END) as conversion_rate
FROM blog_analytics_traffic_sources ts
LEFT JOIN blog_analytics_events e ON ts.session_id = e.session_id
GROUP BY source_type, source
ORDER BY sessions DESC;

-- Create functions for automated data processing
CREATE OR REPLACE FUNCTION update_analytics_performance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO blog_analytics_performance (
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
        views = blog_analytics_performance.views + 1,
        unique_views = blog_analytics_performance.unique_views + 
            CASE WHEN NEW.is_unique_view = TRUE THEN 1 ELSE 0 END,
        average_time_on_page_seconds = (
            (blog_analytics_performance.average_time_on_page_seconds * blog_analytics_performance.views) + 
            NEW.time_on_page_seconds
        ) / (blog_analytics_performance.views + 1),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_analytics_performance
    AFTER INSERT ON blog_analytics_views
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_performance();

-- Function to calculate engagement metrics
CREATE OR REPLACE FUNCTION calculate_post_engagement_metrics(post_uuid UUID)
RETURNS TABLE(
    total_views BIGINT,
    unique_views BIGINT,
    likes_count BIGINT,
    comments_count BIGINT,
    shares_count BIGINT,
    engagement_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(COUNT(v.id), 0) as total_views,
        COALESCE(COUNT(DISTINCT v.session_id), 0) as unique_views,
        COALESCE(COUNT(CASE WHEN e.engagement_type = 'like' THEN 1 END), 0) as likes_count,
        COALESCE(COUNT(CASE WHEN e.engagement_type = 'comment' THEN 1 END), 0) as comments_count,
        COALESCE(COUNT(CASE WHEN e.engagement_type = 'share' THEN 1 END), 0) as shares_count,
        CASE 
            WHEN COUNT(v.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN e.engagement_type IN ('like', 'comment', 'share') THEN 1 END) * 100.0) / COUNT(v.id), 2)
            ELSE 0 
        END as engagement_rate
    FROM blog_posts p
    LEFT JOIN blog_analytics_views v ON p.id = v.post_id
    LEFT JOIN blog_analytics_engagement e ON p.id = e.post_id
    WHERE p.id = post_uuid;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE blog_analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics_traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics_search_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Analytics tables can be read by authenticated users, but only written by system/service roles
CREATE POLICY "Users can read analytics data" ON blog_analytics_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read view analytics" ON blog_analytics_views
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read engagement analytics" ON blog_analytics_engagement
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read traffic analytics" ON blog_analytics_traffic_sources
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read performance analytics" ON blog_analytics_performance
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read search analytics" ON blog_analytics_search_terms
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read event analytics" ON blog_analytics_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can write to all analytics tables
CREATE POLICY "Service role can write analytics" ON blog_analytics_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can write views" ON blog_analytics_views
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can write engagement" ON blog_analytics_engagement
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can write traffic sources" ON blog_analytics_traffic_sources
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can write performance" ON blog_analytics_performance
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can write search terms" ON blog_analytics_search_terms
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can write events" ON blog_analytics_events
    FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_blog_analytics_sessions_updated_at BEFORE UPDATE ON blog_analytics_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_analytics_performance_updated_at BEFORE UPDATE ON blog_analytics_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_analytics_search_terms_updated_at BEFORE UPDATE ON blog_analytics_search_terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO blog_analytics_search_terms (search_term, search_count, result_clicks, avg_position) VALUES
('direito civil', 45, 12, 3.2),
('divórcio', 38, 15, 2.8),
('contrato de trabalho', 29, 8, 4.1),
('herança', 22, 6, 3.9),
('empresa', 31, 11, 2.5)
ON CONFLICT (search_term) DO NOTHING;
