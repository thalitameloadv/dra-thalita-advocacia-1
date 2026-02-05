import { supabase } from '@/lib/supabase';
import { BlogPost, BlogCategory, BlogAnalytics } from '@/types/blog';
import { seoService } from './seoService';

class BlogService {
    // Posts
    async getPosts(filters?: {
        status?: 'draft' | 'published' | 'archived';
        category?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<BlogPost[]> {
        if (!supabase) {
            console.warn('⚠️ Supabase not configured - returning mock data');
            return [];
        }
        
        let query = supabase
            .from('blog_posts')
            .select('*')
            .order('published_at', { ascending: false });

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.category) {
            query = query.eq('category', filters.category);
        }

        if (filters?.search) {
            query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }

        if (filters?.limit) {
            const offset = filters.offset || 0;
            query = query.range(offset, offset + filters.limit - 1);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            return [];
        }

        return (data || []).map(this.mapPost);
    }

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !data) return null;
        return this.mapPost(data);
    }

    async getPostById(id: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return this.mapPost(data);
    }

    async createPost(post: Omit<BlogPost, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .insert([{
                ...post,
                views: 0,
                likes: 0,
                published_at: post.publishedAt || (post.status === 'published' ? new Date().toISOString() : null)
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating post:', error);
            throw error;
        }

        return this.mapPost(data);
    }

    async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating post:', error);
            throw error;
        }

        return this.mapPost(data);
    }

    async deletePost(id: string): Promise<void> {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async incrementViews(id: string): Promise<void> {
        // We use a simple update for views, though atomic increment might be better via RPC if needed
        const { data } = await supabase
            .from('blog_posts')
            .select('views')
            .eq('id', id)
            .single();

        if (data) {
            await supabase
                .from('blog_posts')
                .update({ views: (data.views || 0) + 1 })
                .eq('id', id);
        }
    }

    async toggleLike(id: string): Promise<number> {
        const { data } = await supabase
            .from('blog_posts')
            .select('likes')
            .eq('id', id)
            .single();

        if (data) {
            const newLikes = (data.likes || 0) + 1;
            await supabase
                .from('blog_posts')
                .update({ likes: newLikes })
                .eq('id', id);
            return newLikes;
        }
        return 0;
    }

    // Categories
    async getCategories(): Promise<BlogCategory[]> {
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        return (data || []).map(this.mapCategory);
    }

    async getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !data) return null;
        return this.mapCategory(data);
    }

    async createCategory(category: Omit<BlogCategory, 'id'>): Promise<BlogCategory> {
        const { data, error } = await supabase
            .from('blog_categories')
            .insert([category])
            .select()
            .single();

        if (error) throw error;
        return this.mapCategory(data);
    }

    async updateCategory(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory> {
        const { data, error } = await supabase
            .from('blog_categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapCategory(data);
    }

    async deleteCategory(id: string): Promise<void> {
        const { error } = await supabase
            .from('blog_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Analytics
    async getAnalytics(): Promise<BlogAnalytics> {
        const [
            { count: totalPosts },
            { count: publishedPosts },
            { count: draftPosts },
            { data: topPostsData },
            { count: totalSubscribers }
        ] = await Promise.all([
            supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
            supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
            supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
            supabase.from('blog_posts').select('id, title, views, likes').order('views', { ascending: false }).limit(5),
            supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true })
        ]);

        const stats = await supabase.from('blog_posts').select('views, likes');
        const totalViews = stats.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
        const totalLikes = stats.data?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0;

        return {
            totalPosts: totalPosts || 0,
            publishedPosts: publishedPosts || 0,
            draftPosts: draftPosts || 0,
            totalViews,
            totalLikes,
            totalSubscribers: totalSubscribers || 0,
            topPosts: (topPostsData || []).map(p => ({
                id: p.id,
                title: p.title,
                views: p.views || 0,
                likes: p.likes || 0
            })),
            recentActivity: [],
            viewsByMonth: [],
            subscriberGrowth: []
        };
    }

    // SEO
    async generateSitemap(): Promise<string> {
        const posts = await this.getPosts({ status: 'published' });
        return seoService.generateAISitemap(posts);
    }

    async generateRSSFeed(): Promise<string> {
        const posts = await this.getPosts({ status: 'published' });
        return seoService.generateEnhancedRSS(posts);
    }

    // Helpers
    private mapPost(dbPost: Record<string, unknown>): BlogPost {
        return {
            id: dbPost.id as string,
            title: dbPost.title as string,
            slug: dbPost.slug as string,
            excerpt: (dbPost.excerpt as string) || '',
            content: (dbPost.content as string) || '',
            author: (dbPost.author as string) || 'Dra. Thalita Melo',
            authorAvatar: dbPost.author_avatar as string | undefined,
            authorBio: dbPost.author_bio as string | undefined,
            publishedAt: dbPost.published_at as string,
            updatedAt: dbPost.updated_at as string,
            status: dbPost.status as 'draft' | 'published' | 'archived',
            featuredImage: dbPost.featured_image as string | undefined,
            category: dbPost.category as string,
            tags: (dbPost.tags as string[]) || [],
            seoTitle: dbPost.seo_title as string | undefined,
            seoDescription: dbPost.seo_description as string | undefined,
            seoKeywords: dbPost.seo_keywords as string[] | undefined,
            readingTime: (dbPost.reading_time as number) || 0,
            views: (dbPost.views as number) || 0,
            likes: (dbPost.likes as number) || 0
        };
    }

    private mapCategory(dbCat: Record<string, unknown>): BlogCategory {
        return {
            id: dbCat.id as string,
            name: dbCat.name as string,
            slug: dbCat.slug as string,
            description: dbCat.description as string | undefined,
            color: dbCat.color as string | undefined
        };
    }
}

export const blogService = new BlogService();

