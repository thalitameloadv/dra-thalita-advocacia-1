import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Calendar,
    Clock,
    Eye,
    Heart,
    Share2,
    ArrowLeft,
    Facebook,
    Twitter,
    Linkedin,
    Mail,
    ChevronRight,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogService } from '@/services/blogService';
import { seoService } from '@/services/seoService';
import { BlogPost } from '@/types/blog';
import { toast } from 'sonner';
import '@/styles/blog-article.css';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const BlogArticle = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        const loadPost = async () => {
            if (!slug) return;

            try {
                const postData = await blogService.getPostBySlug(slug);

                if (!postData) {
                    navigate('/404');
                    return;
                }

                setPost(postData);

                // Increment views
                await blogService.incrementViews(postData.id);

                // Load related posts
                const allPosts = await blogService.getPosts({
                    status: 'published',
                    category: postData.category
                });
                const related = allPosts
                    .filter(p => p.id !== postData.id)
                    .slice(0, 3);
                setRelatedPosts(related);

            } catch (error) {
                console.error('Error loading post:', error);
                toast.error('Erro ao carregar artigo');
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [slug, navigate]);

    // Reading progress tracker
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const trackLength = documentHeight - windowHeight;
            const progress = (scrollTop / trackLength) * 100;
            setReadingProgress(Math.min(progress, 100));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLike = async () => {
        if (!post || liked) return;

        try {
            await blogService.toggleLike(post.id);
            setLiked(true);
            setPost({ ...post, likes: post.likes + 1 });
            toast.success('Obrigado por curtir!');
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleShare = (platform: string) => {
        if (!post) return;

        const url = window.location.href;
        const text = post.title;

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
                    <p className="mt-4 text-slate-600">Carregando artigo...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    const canonicalUrl = `${window.location.origin}/blog/${post.slug}`;

    // Generate advanced SEO metadata
    const aiMetaTags = seoService.generateComprehensiveMetaTags(post);
    const structuredData = seoService.generateAdvancedStructuredData(post, relatedPosts);

    return (
        <>
            <Helmet>
                {/* Basic SEO */}
                <title>{aiMetaTags.title}</title>
                <meta name="description" content={aiMetaTags.description} />
                <meta name="keywords" content={aiMetaTags.keywords} />
                <meta name="author" content={aiMetaTags.author} />
                <meta name="robots" content={aiMetaTags.robots} />
                <meta name="googlebot" content={aiMetaTags.googlebot} />

                {/* Open Graph */}
                <meta property="og:type" content={aiMetaTags['og:type']} />
                <meta property="og:title" content={aiMetaTags['og:title']} />
                <meta property="og:description" content={aiMetaTags['og:description']} />
                <meta property="og:url" content={aiMetaTags['og:url']} />
                <meta property="og:image" content={aiMetaTags['og:image']} />
                <meta property="og:image:width" content={aiMetaTags['og:image:width']} />
                <meta property="og:image:height" content={aiMetaTags['og:image:height']} />
                <meta property="og:image:alt" content={aiMetaTags['og:image:alt']} />
                <meta property="og:site_name" content={aiMetaTags['og:site_name']} />
                <meta property="og:locale" content={aiMetaTags['og:locale']} />

                {/* Twitter Card */}
                <meta name="twitter:card" content={aiMetaTags['twitter:card']} />
                <meta name="twitter:title" content={aiMetaTags['twitter:title']} />
                <meta name="twitter:description" content={aiMetaTags['twitter:description']} />
                <meta name="twitter:image" content={aiMetaTags['twitter:image']} />
                <meta name="twitter:image:alt" content={aiMetaTags['twitter:image:alt']} />

                {/* Article Metadata */}
                <meta property="article:published_time" content={aiMetaTags['article:published_time']} />
                <meta property="article:modified_time" content={aiMetaTags['article:modified_time']} />
                <meta property="article:author" content={aiMetaTags['article:author']} />
                <meta property="article:section" content={aiMetaTags['article:section']} />
                <meta property="article:tag" content={aiMetaTags['article:tag']} />

                {/* AI-Specific Meta Tags for ChatGPT, Perplexity, Claude */}
                <meta name="openai:title" content={aiMetaTags['openai:title']} />
                <meta name="openai:description" content={aiMetaTags['openai:description']} />
                <meta name="openai:url" content={aiMetaTags['openai:url']} />
                <meta name="openai:image" content={aiMetaTags['openai:image']} />
                <meta name="openai:type" content={aiMetaTags['openai:type']} />
                <meta name="openai:category" content={aiMetaTags['openai:category']} />

                <meta name="perplexity:title" content={aiMetaTags['perplexity:title']} />
                <meta name="perplexity:snippet" content={aiMetaTags['perplexity:snippet']} />
                <meta name="perplexity:url" content={aiMetaTags['perplexity:url']} />
                <meta name="perplexity:category" content={aiMetaTags['perplexity:category']} />

                <meta name="anthropic:content-type" content={aiMetaTags['anthropic:content-type']} />
                <meta name="anthropic:category" content={aiMetaTags['anthropic:category']} />
                <meta name="anthropic:expertise" content={aiMetaTags['anthropic:expertise']} />
                <meta name="anthropic:language" content={aiMetaTags['anthropic:language']} />

                {/* AI Content Classification */}
                <meta name="ai:content-quality" content={aiMetaTags['ai:content-quality']} />
                <meta name="ai:expertise-level" content={aiMetaTags['ai:expertise-level']} />
                <meta name="ai:fact-checked" content={aiMetaTags['ai:fact-checked']} />
                <meta name="ai:original-content" content={aiMetaTags['ai:original-content']} />
                <meta name="ai:domain" content={aiMetaTags['ai:domain']} />
                <meta name="ai:subdomain" content={aiMetaTags['ai:subdomain']} />
                <meta name="ai:language" content={aiMetaTags['ai:language']} />
                <meta name="ai:reading-time" content={aiMetaTags['ai:reading-time']} />

                {/* Additional Meta Tags */}
                <meta name="google" content={aiMetaTags.google} />
                <meta name="theme-color" content={aiMetaTags['theme-color']} />
                <meta name="color-scheme" content={aiMetaTags['color-scheme']} />
                <meta name="viewport" content={aiMetaTags.viewport} />
                <meta name="format-detection" content={aiMetaTags['format-detection']} />
                <meta name="referrer" content={aiMetaTags.referrer} />

                {/* Canonical */}
                <link rel="canonical" href={canonicalUrl} />

                {/* Advanced Structured Data with AI optimization */}
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

            {/* Reading Progress Bar */}
            <div
                className="reading-progress"
                style={{ width: `${readingProgress}%` }}
            />

            <Header />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
                {/* Header Navigation */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <Link to="/blog">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar para o Blog
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Article Header */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* Featured Image */}
                        {post.featuredImage && (
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8 lg:p-12">
                            {/* Category & Reading Time */}
                            <div className="flex items-center justify-between mb-6">
                                <Badge className="text-sm">{post.category}</Badge>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {post.readingTime} min de leitura
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                {post.title}
                            </h1>

                            {/* Excerpt */}
                            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                {post.excerpt}
                            </p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center">
                                    {post.authorAvatar ? (
                                        <img
                                            src={post.authorAvatar}
                                            alt={post.author}
                                            className="h-10 w-10 rounded-full mr-3"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-slate-900">{post.author}</p>
                                        <p className="text-sm text-slate-500">Advogada</p>
                                    </div>
                                </div>

                                <div className="flex items-center text-slate-500">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {formatDate(post.publishedAt)}
                                </div>

                                <div className="flex items-center text-slate-500">
                                    <Eye className="h-4 w-4 mr-2" />
                                    {post.views} visualizações
                                </div>

                                <div className="flex items-center text-slate-500">
                                    <Heart className="h-4 w-4 mr-2" />
                                    {post.likes} curtidas
                                </div>
                            </div>

                            {/* Content */}
                            <div
                                className="prose prose-lg max-w-none mb-12 article-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Tags */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Tags:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <Badge key={tag} variant="outline">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Separator className="my-8" />

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <Button
                                    onClick={handleLike}
                                    variant={liked ? "default" : "outline"}
                                    disabled={liked}
                                    className={`gap-2 ${liked ? 'like-button-active' : ''}`}
                                    size="lg"
                                    data-analytics-like
                                >
                                    <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                                    {liked ? 'Curtido!' : 'Curtir Artigo'}
                                </Button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700 mr-2">Compartilhar:</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleShare('facebook')}
                                        className="share-button hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                                        data-analytics-share
                                        data-platform="facebook"
                                    >
                                        <Facebook className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleShare('twitter')}
                                        className="share-button hover:bg-sky-50 hover:text-sky-600 hover:border-sky-600"
                                        data-analytics-share
                                        data-platform="twitter"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleShare('linkedin')}
                                        className="share-button hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700"
                                        data-analytics-share
                                        data-platform="linkedin"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleShare('email')}
                                        className="share-button hover:bg-slate-50 hover:text-slate-700 hover:border-slate-700"
                                        data-analytics-share
                                        data-platform="email"
                                    >
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                Artigos Relacionados
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map(relatedPost => (
                                    <Card key={relatedPost.id} className="related-post-card group hover:shadow-xl transition-all duration-300">
                                        {relatedPost.featuredImage && (
                                            <div className="aspect-video overflow-hidden rounded-t-lg">
                                                <img
                                                    src={relatedPost.featuredImage}
                                                    alt={relatedPost.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <CardHeader>
                                            <Badge variant="secondary" className="w-fit mb-2">
                                                {relatedPost.category}
                                            </Badge>
                                            <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                <Link to={`/blog/${relatedPost.slug}`}>
                                                    {relatedPost.title}
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Link to={`/blog/${relatedPost.slug}`}>
                                                <Button variant="ghost" className="w-full justify-between">
                                                    Ler Artigo
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </div>

            <Footer />
            
            {/* Analytics Tracker */}
            {post && (
                <AnalyticsTracker 
                    postId={post.id}
                    trackEngagement={true}
                    trackScrollDepth={true}
                    trackTimeOnPage={true}
                />
            )}
        </>
    );
};

export default BlogArticle;
