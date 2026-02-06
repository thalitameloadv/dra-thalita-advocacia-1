import { useState, useEffect, useRef } from 'react';
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
    User,
    BookOpen,
    Tag,
    MessageCircle,
    TrendingUp,
    Bookmark,
    Copy,
    Check,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Printer,
    FileText,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import { blogService } from '@/services/blogService';
import { seoService } from '@/services/seoService';
import { imageOptimizationService, getArticleImage, getSocialImage } from '@/services/imageOptimizationService';
import { BlogPost } from '@/types/blog';
import { toast } from 'sonner';
import '@/styles/blog-article-enhanced.css';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const BlogArticleEnhanced = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [estimatedReadingTime, setEstimatedReadingTime] = useState(0);
    const [copiedLink, setCopiedLink] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showTableOfContents, setShowTableOfContents] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    
    const contentRef = useRef<HTMLDivElement>(null);
    const tableOfContentsRef = useRef<HTMLDivElement>(null);

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
                setEstimatedReadingTime(calculateReadingTime(postData.content));

                // Increment views
                await blogService.incrementViews(postData.id);

                // Load related posts
                const allPosts = await blogService.getPosts({
                    status: 'published',
                    category: postData.category
                });
                const related = allPosts
                    .filter(p => p.id !== postData.id)
                    .slice(0, 4);
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

            // Update active section for table of contents
            updateActiveSection();
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Table of contents generation
    useEffect(() => {
        if (post && contentRef.current) {
            generateTableOfContents();
        }
    }, [post]);

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const generateTableOfContents = () => {
        if (!contentRef.current) return;

        const headings = contentRef.current.querySelectorAll('h2, h3, h4');
        const tocItems = Array.from(headings).map((heading, index) => ({
            id: `heading-${index}`,
            text: heading.textContent || '',
            level: parseInt(heading.tagName.charAt(1)),
            element: heading
        }));

        // Add IDs to headings
        headings.forEach((heading, index) => {
            heading.id = `heading-${index}`;
        });

        return tocItems;
    };

    const updateActiveSection = () => {
        if (!contentRef.current) return;

        const headings = contentRef.current.querySelectorAll('h2, h3, h4');
        const scrollPosition = window.scrollY + 100;

        let activeId = '';
        headings.forEach((heading) => {
            const element = heading as HTMLElement;
            if (element.offsetTop <= scrollPosition) {
                activeId = element.id;
            }
        });

        setActiveSection(activeId);
    };

    const handleLike = async () => {
        if (!post || liked) return;

        try {
            await blogService.toggleLike(post.id);
            setLiked(true);
            setPost({ ...post, likes: post.likes + 1 });
            toast.success('Artigo curtido!');
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('Erro ao curtir artigo');
        }
    };

    const handleBookmark = () => {
        setBookmarked(!bookmarked);
        toast.success(bookmarked ? 'Artigo removido dos favoritos' : 'Artigo salvo nos favoritos');
    };

    const handleShare = async (platform: string) => {
        if (!post) return;

        const url = window.location.href;
        const title = post.title;
        const description = post.excerpt;

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description)}%0A%0A${encodeURIComponent(url)}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            toast.success('Link copiado!');
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (error) {
            toast.error('Erro ao copiar link');
        }
    };

    const printArticle = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatContent = (content: string) => {
        return content
            .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-900">$1</h2>')
            .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-slate-800">$1</h3>')
            .replace(/^#### (.*?)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2 text-slate-700">$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-sm">$1</code>')
            .replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic">$1</blockquote>')
            .replace(/^- (.*?)$/gm, '<li class="ml-4">• $1</li>')
            .replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/\n/g, '<br />');
    };

    const generateTableOfContentsItems = () => {
        if (!contentRef.current) return [];

        const headings = contentRef.current.querySelectorAll('h2, h3, h4');
        return Array.from(headings).map((heading, index) => ({
            id: `heading-${index}`,
            text: heading.textContent || '',
            level: parseInt(heading.tagName.charAt(1)),
            element: heading
        }));
    };

    const tableOfContentsItems = generateTableOfContentsItems();

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-64 w-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return null;
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.featuredImage,
        "author": {
            "@type": "Person",
            "name": post.author,
            "jobTitle": "Advogada"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Dra. Thalita Melo Advocacia",
            "logo": {
                "@type": "ImageObject",
                "url": "/logo.png"
            }
        },
        "datePublished": post.publishedAt,
        "dateModified": post.updatedAt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        },
        "wordCount": post.content.split(/\s+/).length,
        "timeRequired": `PT${estimatedReadingTime}M`
    };

    return (
        <>
            <Helmet>
                <title>{post.title} - Blog - Dra. Thalita Melo Advocacia</title>
                <meta name="description" content={post.excerpt} />
                <meta name="keywords" content={post.tags.join(', ')} />
                <meta name="author" content={post.author} />
                
                {/* Open Graph */}
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:image" content={getSocialImage(post.featuredImage || '', 'ogImage')} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                <meta property="og:locale" content="pt_BR" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt} />
                <meta name="twitter:image" content={getSocialImage(post.featuredImage || '', 'twitterCard')} />
                
                {/* Article Meta */}
                <meta property="article:published_time" content={post.publishedAt} />
                <meta property="article:modified_time" content={post.updatedAt} />
                <meta property="article:author" content={post.author} />
                <meta property="article:section" content={post.category} />
                {post.tags.map((tag, index) => (
                    <meta key={index} property="article:tag" content={tag} />
                ))}
                
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

            <AnalyticsTracker postId={post.id} />
            
            <div className="min-h-screen bg-white">
                {/* Progress Bar */}
                <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 z-50">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${readingProgress}%` }}
                    />
                </div>

                <Header />
                
                {/* Hero Section */}
                <section className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10" />
                    <OptimizedImage
                        src={post.featuredImage || '/placeholder-hero.jpg'}
                        alt={post.title}
                        width={1920}
                        height={1080}
                        className="w-full h-96 object-cover"
                        priority
                        sizes="100vw"
                    />
                    <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-white">
                            <Link 
                                to="/blog"
                                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar para o blog
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                {post.title}
                            </h1>
                            <p className="text-xl text-white/90 mb-8 max-w-3xl">
                                {post.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 text-white/80">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>{formatDate(post.publishedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    <span>{estimatedReadingTime} min de leitura</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    <span>{post.views} visualizações</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                {/* Table of Contents */}
                                {tableOfContentsItems.length > 0 && (
                                    <Card className="sticky top-24">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Sumário
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <nav className="space-y-2">
                                                {tableOfContentsItems.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        to={`#${item.id}`}
                                                        className={`block py-1 text-sm hover:text-blue-600 transition-colors ${
                                                            activeSection === item.id ? 'text-blue-600 font-semibold' : 'text-slate-600'
                                                        }`}
                                                        style={{ paddingLeft: `${(item.level - 2) * 16}px` }}
                                                    >
                                                        {item.text}
                                                    </Link>
                                                ))}
                                            </nav>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Actions */}
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Ações</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={handleLike}
                                            disabled={liked}
                                        >
                                            <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                                            {liked ? 'Curtido' : 'Curtir'} ({post.likes})
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={handleBookmark}
                                        >
                                            <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
                                            {bookmarked ? 'Salvo' : 'Salvar'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={printArticle}
                                        >
                                            <Printer className="h-4 w-4 mr-2" />
                                            Imprimir
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Share */}
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Compartilhar</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => handleShare('facebook')}
                                        >
                                            <Facebook className="h-4 w-4 mr-2" />
                                            Facebook
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => handleShare('twitter')}
                                        >
                                            <Twitter className="h-4 w-4 mr-2" />
                                            Twitter
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => handleShare('linkedin')}
                                        >
                                            <Linkedin className="h-4 w-4 mr-2" />
                                            LinkedIn
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => handleShare('email')}
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            E-mail
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={copyLink}
                                        >
                                            {copiedLink ? (
                                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4 mr-2" />
                                            )}
                                            {copiedLink ? 'Copiado!' : 'Copiar link'}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Tags */}
                                {post.tags.length > 0 && (
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Tag className="h-5 w-5" />
                                                Tags
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {post.tags.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                <article className="prose prose-lg max-w-none">
                                    <div 
                                        ref={contentRef}
                                        className="blog-content"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtml(post.contentHtml || formatContent(post.content))
                                        }}
                                    />
                                </article>

                                {/* Related Posts */}
                                {relatedPosts.length > 0 && (
                                    <div className="mt-16">
                                        <Separator className="mb-8" />
                                        <h2 className="text-2xl font-bold mb-8">Artigos Relacionados</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {relatedPosts.map((relatedPost) => (
                                                <Card key={relatedPost.id} className="group hover:shadow-lg transition-shadow">
                                                    <Link to={`/blog/${relatedPost.slug}`}>
                                                        <OptimizedImage
                                                            src={relatedPost.featuredImage || '/placeholder-related.jpg'}
                                                            alt={relatedPost.title}
                                                            width={400}
                                                            height={225}
                                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    </Link>
                                                    <CardContent className="p-6">
                                                        <Link to={`/blog/${relatedPost.slug}`}>
                                                            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                                {relatedPost.title}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-slate-600 mb-4 line-clamp-2">
                                                            {relatedPost.excerpt}
                                                        </p>
                                                        <div className="flex items-center justify-between text-sm text-slate-500">
                                                            <span>{formatDate(relatedPost.publishedAt)}</span>
                                                            <span>{calculateReadingTime(relatedPost.content)} min</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default BlogArticleEnhanced;
