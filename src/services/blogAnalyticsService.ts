import { supabase } from '@/lib/supabase';

export interface BlogAnalyticsData {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    archivedPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    averageReadingTime: number;
    postsByCategory: Array<{
        category: string;
        count: number;
        views: number;
        likes: number;
    }>;
    postsByMonth: Array<{
        month: string;
        posts: number;
        views: number;
        likes: number;
    }>;
    topPerformingPosts: Array<{
        id: string;
        title: string;
        slug: string;
        views: number;
        likes: number;
        comments: number;
        readingTime: number;
        category: string;
        publishedAt: string;
    }>;
    recentActivity: Array<{
        id: string;
        type: 'post_created' | 'post_updated' | 'post_published' | 'comment_added';
        title: string;
        timestamp: string;
        author: string;
    }>;
    engagementMetrics: {
        averageViewsPerPost: number;
        averageLikesPerPost: number;
        averageCommentsPerPost: number;
        likeToViewRatio: number;
        commentToViewRatio: number;
        engagementScore: number;
    };
    trafficSources: Array<{
        source: string;
        visits: number;
        percentage: number;
    }>;
    readerDemographics: {
        newVsReturning: {
            new: number;
            returning: number;
        };
        devices: {
            desktop: number;
            mobile: number;
            tablet: number;
        };
        browsers: Array<{
            browser: string;
            percentage: number;
        }>;
    };
}

class BlogAnalyticsService {
    async getComprehensiveAnalytics(): Promise<BlogAnalyticsData> {
        try {
            // Get basic post statistics
            const { data: posts, error: postsError } = await supabase
                .from('blog_posts')
                .select('*');

            if (postsError) throw postsError;

            // Calculate basic metrics
            const totalPosts = posts?.length || 0;
            const publishedPosts = posts?.filter(p => p.status === 'published').length || 0;
            const draftPosts = posts?.filter(p => p.status === 'draft').length || 0;
            const archivedPosts = posts?.filter(p => p.status === 'archived').length || 0;
            
            const totalViews = posts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
            const totalLikes = posts?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0;
            const totalComments = posts?.reduce((sum, p) => sum + (p.comments_count || 0), 0) || 0;
            
            const averageReadingTime = posts?.reduce((sum, p) => sum + (p.reading_time || 0), 0) / totalPosts || 0;

            // Posts by category
            const postsByCategory = this.calculatePostsByCategory(posts || []);

            // Posts by month
            const postsByMonth = this.calculatePostsByMonth(posts || []);

            // Top performing posts
            const topPerformingPosts = this.getTopPerformingPosts(posts || []);

            // Recent activity (mock data for now)
            const recentActivity = this.getRecentActivity(posts || []);

            // Engagement metrics
            const engagementMetrics = this.calculateEngagementMetrics(
                publishedPosts, totalViews, totalLikes, totalComments
            );

            // Traffic sources (mock data)
            const trafficSources = this.getTrafficSources();

            // Reader demographics (mock data)
            const readerDemographics = this.getReaderDemographics();

            return {
                totalPosts,
                publishedPosts,
                draftPosts,
                archivedPosts,
                totalViews,
                totalLikes,
                totalComments,
                averageReadingTime,
                postsByCategory,
                postsByMonth,
                topPerformingPosts,
                recentActivity,
                engagementMetrics,
                trafficSources,
                readerDemographics
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }

    async getPostAnalytics(postId: string) {
        try {
            const { data: post, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', postId)
                .single();

            if (error) throw error;

            // Get detailed analytics for this specific post
            const analytics = {
                ...post,
                dailyViews: this.getDailyViews(postId),
                engagementRate: this.calculateEngagementRate(post),
                shareMetrics: this.getShareMetrics(postId),
                seoPerformance: this.getSEOPerformance(postId),
                readerRetention: this.getReaderRetention(postId)
            };

            return analytics;
        } catch (error) {
            console.error('Error fetching post analytics:', error);
            throw error;
        }
    }

    async getRealTimeAnalytics() {
        try {
            // Get real-time data
            const { data: activeUsers } = await supabase
                .from('blog_analytics_sessions')
                .select('*')
                .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

            const { data: recentViews } = await supabase
                .from('blog_analytics_views')
                .select('*')
                .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

            return {
                activeUsers: activeUsers?.length || 0,
                recentViews: recentViews?.length || 0,
                topPosts: this.getTopPostsInRealTime(recentViews || []),
                averageSessionDuration: this.calculateAverageSessionDuration(activeUsers || [])
            };
        } catch (error) {
            console.error('Error fetching real-time analytics:', error);
            return {
                activeUsers: 0,
                recentViews: 0,
                topPosts: [],
                averageSessionDuration: 0
            };
        }
    }

    async trackView(postId: string, sessionId?: string) {
        try {
            await supabase
                .from('blog_analytics_views')
                .insert([{
                    post_id: postId,
                    session_id: sessionId,
                    user_agent: navigator.userAgent,
                    referrer: document.referrer,
                    created_at: new Date().toISOString()
                }]);

            // Increment post views
            await supabase
                .from('blog_posts')
                .update({ views: supabase.raw('views + 1') })
                .eq('id', postId);
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    }

    async trackEngagement(postId: string, type: 'like' | 'comment' | 'share', data?: any) {
        try {
            await supabase
                .from('blog_analytics_engagement')
                .insert([{
                    post_id: postId,
                    type,
                    data,
                    created_at: new Date().toISOString()
                }]);
        } catch (error) {
            console.error('Error tracking engagement:', error);
        }
    }

    private calculatePostsByCategory(posts: any[]) {
        const categoryMap = new Map();
        
        posts.forEach(post => {
            const category = post.category || 'Uncategorized';
            if (!categoryMap.has(category)) {
                categoryMap.set(category, { count: 0, views: 0, likes: 0 });
            }
            const categoryData = categoryMap.get(category);
            categoryData.count++;
            categoryData.views += post.views || 0;
            categoryData.likes += post.likes || 0;
        });

        return Array.from(categoryMap.entries()).map(([category, data]) => ({
            category,
            ...data
        }));
    }

    private calculatePostsByMonth(posts: any[]) {
        const monthMap = new Map();
        
        posts.forEach(post => {
            if (post.published_at) {
                const month = new Date(post.published_at).toISOString().slice(0, 7);
                if (!monthMap.has(month)) {
                    monthMap.set(month, { posts: 0, views: 0, likes: 0 });
                }
                const monthData = monthMap.get(month);
                monthData.posts++;
                monthData.views += post.views || 0;
                monthData.likes += post.likes || 0;
            }
        });

        return Array.from(monthMap.entries())
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12); // Last 12 months
    }

    private getTopPerformingPosts(posts: any[]) {
        return posts
            .filter(post => post.status === 'published')
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 10)
            .map(post => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                views: post.views || 0,
                likes: post.likes || 0,
                comments: post.comments_count || 0,
                readingTime: post.reading_time || 0,
                category: post.category,
                publishedAt: post.published_at
            }));
    }

    private getRecentActivity(posts: any[]) {
        // Mock recent activity - in real implementation, this would come from activity logs
        return [
            {
                id: '1',
                type: 'post_published' as const,
                title: 'Novo artigo sobre Direito Civil',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                author: 'Dra. Thalita Melo'
            },
            {
                id: '2',
                type: 'comment_added' as const,
                title: 'Comentário em "Direito Trabalhista"',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                author: 'Visitante'
            }
        ];
    }

    private calculateEngagementMetrics(publishedPosts: number, totalViews: number, totalLikes: number, totalComments: number) {
        const averageViewsPerPost = publishedPosts > 0 ? totalViews / publishedPosts : 0;
        const averageLikesPerPost = publishedPosts > 0 ? totalLikes / publishedPosts : 0;
        const averageCommentsPerPost = publishedPosts > 0 ? totalComments / publishedPosts : 0;
        const likeToViewRatio = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;
        const commentToViewRatio = totalViews > 0 ? (totalComments / totalViews) * 100 : 0;
        
        // Engagement score (weighted formula)
        const engagementScore = (
            (likeToViewRatio * 0.4) +
            (commentToViewRatio * 0.6)
        ) * 10;

        return {
            averageViewsPerPost,
            averageLikesPerPost,
            averageCommentsPerPost,
            likeToViewRatio,
            commentToViewRatio,
            engagementScore
        };
    }

    private getTrafficSources() {
        // Mock traffic sources - in real implementation, this would come from referrer tracking
        return [
            { source: 'Organic Search', visits: 1250, percentage: 45.2 },
            { source: 'Direct', visits: 890, percentage: 32.1 },
            { source: 'Social Media', visits: 420, percentage: 15.2 },
            { source: 'Referral', visits: 210, percentage: 7.6 }
        ];
    }

    private getReaderDemographics() {
        // Mock demographics - in real implementation, this would come from analytics tracking
        return {
            newVsReturning: {
                new: 68,
                returning: 32
            },
            devices: {
                desktop: 52,
                mobile: 41,
                tablet: 7
            },
            browsers: [
                { browser: 'Chrome', percentage: 45.2 },
                { browser: 'Safari', percentage: 22.1 },
                { browser: 'Firefox', percentage: 18.3 },
                { browser: 'Edge', percentage: 14.4 }
            ]
        };
    }

    private getDailyViews(postId: string) {
        // Mock daily views - in real implementation, this would come from analytics data
        return Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            views: Math.floor(Math.random() * 100) + 20
        }));
    }

    private calculateEngagementRate(post: any) {
        const views = post.views || 0;
        const likes = post.likes || 0;
        const comments = post.comments_count || 0;
        
        if (views === 0) return 0;
        
        return ((likes + comments) / views) * 100;
    }

    private getShareMetrics(postId: string) {
        // Mock share metrics
        return {
            facebook: Math.floor(Math.random() * 50) + 10,
            twitter: Math.floor(Math.random() * 30) + 5,
            linkedin: Math.floor(Math.random() * 20) + 3,
            whatsapp: Math.floor(Math.random() * 40) + 8
        };
    }

    private getSEOPerformance(postId: string) {
        // Mock SEO performance
        return {
            keywordRankings: Math.floor(Math.random() * 50) + 10,
            organicTraffic: Math.floor(Math.random() * 200) + 50,
            backlinks: Math.floor(Math.random() * 15) + 2,
            pageSpeed: Math.floor(Math.random() * 30) + 70
        };
    }

    private getReaderRetention(postId: string) {
        // Mock reader retention
        return {
            averageTimeOnPage: Math.floor(Math.random() * 180) + 60, // seconds
            bounceRate: Math.floor(Math.random() * 40) + 20, // percentage
            scrollDepth: Math.floor(Math.random() * 40) + 60 // percentage
        };
    }

    private getTopPostsInRealTime(recentViews: any[]) {
        // Mock real-time top posts
        return [
            { id: '1', title: 'Guia Completo de Direito Civil', views: 45 },
            { id: '2', title: 'Novidades do Direito Trabalhista', views: 32 },
            { id: '3', title: 'Direito Empresarial Explicado', views: 28 }
        ];
    }

    private calculateAverageSessionDuration(sessions: any[]) {
        // Mock average session duration
        return Math.floor(Math.random() * 300) + 120; // seconds
    }
}

export const blogAnalyticsService = new BlogAnalyticsService();
