import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ArrowLeft,
    Save,
    Send,
    Eye,
    FileText,
    Image,
    Bold,
    Italic,
    Link,
    List,
    ListOrdered,
    Quote,
    Code,
    Undo,
    Redo,
    HelpCircle,
    Calendar,
    Clock,
    Tag,
    User,
    Upload,
    Settings,
    Search,
    Plus,
    X,
    CheckCircle,
    AlertCircle,
    Zap,
    Target,
    BarChart3,
    TrendingUp,
    Users,
    MessageCircle,
    Heart,
    Share2,
    Bookmark,
    Copy,
    Download,
    RefreshCw,
    Globe,
    Smartphone,
    Tablet,
    Monitor,
    Layout,
    Type,
    Palette,
    Sparkles,
    Timer,
    Archive,
    Star,
    Award,
    Bell,
    Lock,
    Unlock,
    Edit3,
    Trash2,
    Move,
    Maximize2,
    Minimize2,
    Sun,
    Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { blogService } from '@/services/blogService';
import { BlogPost } from '@/types/blog';
import { toast } from 'sonner';
import ArticleEditorBasic from '@/components/ArticleEditorBasic';

interface ArticleEnhanced extends BlogPost {
    seoScore?: number;
    readabilityScore?: number;
    estimatedReadingTime?: number;
    wordCount?: number;
    lastSaved?: string;
    autoSaveEnabled?: boolean;
    isDraft?: boolean;
    scheduledPublishAt?: string;
    tags?: string[];
    featuredImageAlt?: string;
    socialImage?: string;
    customExcerpt?: string;
    tableOfContents?: boolean;
    commentsEnabled?: boolean;
    sharingEnabled?: boolean;
    relatedPosts?: string[];
    authorBio?: string;
    authorAvatar?: string;
    authorSocial?: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
    metaDescription?: string;
    metaKeywords?: string[];
    openGraphTitle?: string;
    openGraphDescription?: string;
    twitterCard?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    priority?: number;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

const CreateArticleEnhanced = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const [isEditing, setIsEditing] = useState(!!id);
    const [article, setArticle] = useState<ArticleEnhanced | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState('editor');
    const [showPreview, setShowPreview] = useState(false);
    const [showSEOSettings, setShowSEOSettings] = useState(false);
    const [showPublishSettings, setShowPublishSettings] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [lastSaved, setLastSaved] = useState<string>('');
    const [wordCount, setWordCount] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [seoScore, setSeoScore] = useState(0);
    const [readabilityScore, setReadabilityScore] = useState(0);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        loadAvailableTags();
        
        if (id) {
            loadArticle();
        } else {
            // Initialize with empty article for new creation
            setArticle({
                id: '',
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                author: 'Dra. Thalita Melo',
                category: '',
                tags: [],
                status: 'draft',
                featured: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                wordCount: 0,
                estimatedReadingTime: 0,
                seoScore: 0,
                readabilityScore: 0,
                autoSaveEnabled: true,
                isDraft: true
            });
        }
    }, [id]);

    useEffect(() => {
        if (autoSaveEnabled && article) {
            if (autoSaveRef.current) {
                clearTimeout(autoSaveRef.current);
            }
            autoSaveRef.current = setTimeout(() => {
                handleAutoSave();
            }, 30000); // Auto-save every 30 seconds
        }

        return () => {
            if (autoSaveRef.current) {
                clearTimeout(autoSaveRef.current);
            }
        };
    }, [article, autoSaveEnabled]);

    const loadArticle = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const data = await blogService.getPostById(id);
            if (data) {
                setArticle({
                    ...data,
                    wordCount: data.content?.split(' ').length || 0,
                    estimatedReadingTime: Math.ceil((data.content?.split(' ').length || 0) / 200),
                    autoSaveEnabled: true,
                    isDraft: data.status === 'draft'
                });
                updateMetrics(data.content || '');
            }
        } catch (error) {
            console.error('Error loading article:', error);
            toast.error('Erro ao carregar artigo');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableTags = async () => {
        try {
            const tags = await blogService.getAvailableTags();
            setAvailableTags(tags);
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    };

    const updateMetrics = useCallback((content: string) => {
        const words = content.split(' ').filter(word => word.length > 0);
        const wordCount = words.length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
        
        setWordCount(wordCount);
        setReadingTime(readingTime);
        
        // Calculate SEO score (simplified)
        const seoScore = calculateSEOScore();
        setSeoScore(seoScore);
        
        // Calculate readability score (simplified)
        const readabilityScore = calculateReadabilityScore(content);
        setReadabilityScore(readabilityScore);
        
        // Generate suggested tags based on content
        generateSuggestedTags(content);
    }, []);

    const calculateSEOScore = (): number => {
        if (!article) return 0;
        
        let score = 0;
        const maxScore = 100;
        
        // Title check (20 points)
        if (article.title && article.title.length >= 30 && article.title.length <= 60) {
            score += 20;
        }
        
        // Meta description check (20 points)
        if (article.seoDescription && article.seoDescription.length >= 120 && article.seoDescription.length <= 160) {
            score += 20;
        }
        
        // Content length check (20 points)
        if (article.content && article.content.length >= 300) {
            score += 20;
        }
        
        // Keywords check (20 points)
        if (article.seoKeywords && article.seoKeywords.length >= 3) {
            score += 20;
        }
        
        // Featured image check (20 points)
        if (article.featuredImage) {
            score += 20;
        }
        
        return Math.min(score, maxScore);
    };

    const calculateReadabilityScore = (content: string): number => {
        if (!content) return 0;
        
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = content.split(' ').filter(w => w.length > 0);
        const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
        
        if (sentences.length === 0 || words.length === 0) return 0;
        
        // Simplified Flesch Reading Ease score
        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        
        const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        
        return Math.max(0, Math.min(100, Math.round(score)));
    };

    const countSyllables = (word: string): number => {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    };

    const generateSuggestedTags = (content: string) => {
        // Simple tag suggestion based on content analysis
        const commonWords = ['direito', 'advocacia', 'lei', 'justiça', 'tribunal', 'processo', 'contrato', 'civil', 'trabalhista', 'empresarial'];
        const words = content.toLowerCase().split(/\s+/);
        const foundTags = commonWords.filter(word => words.includes(word));
        setSuggestedTags(foundTags);
    };

    const handleAutoSave = async () => {
        if (!article) return;

        try {
            setSaving(true);
            const updatedArticle = {
                ...article,
                lastSaved: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (isEditing) {
                await blogService.updatePost(article.id, updatedArticle);
            } else {
                const savedArticle = await blogService.createPost(updatedArticle);
                if (savedArticle.id) {
                    setArticle(savedArticle);
                    setIsEditing(true);
                    navigate(`/admin/blog/editar/${savedArticle.id}`, { replace: true });
                }
            }

            setLastSaved(new Date().toLocaleTimeString('pt-BR'));
            toast.success('Artigo salvo automaticamente');
        } catch (error) {
            console.error('Error auto-saving:', error);
            toast.error('Erro ao salvar automaticamente');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (articleData: BlogPost) => {
        try {
            setSaving(true);
            
            const enhancedData: ArticleEnhanced = {
                ...articleData,
                wordCount,
                estimatedReadingTime: readingTime,
                seoScore,
                readabilityScore,
                lastSaved: new Date().toISOString(),
                autoSaveEnabled
            };

            if (isEditing) {
                await blogService.updatePost(articleData.id, enhancedData);
                toast.success('Artigo atualizado com sucesso!');
            } else {
                const savedArticle = await blogService.createPost(enhancedData);
                toast.success('Artigo criado com sucesso!');
                navigate(`/admin/blog/editar/${savedArticle.id}`, { replace: true });
            }
            
            setLastSaved(new Date().toLocaleTimeString('pt-BR'));
        } catch (error) {
            console.error('Error saving article:', error);
            toast.error('Erro ao salvar artigo');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async (articleData: BlogPost) => {
        try {
            setPublishing(true);
            
            const publishData = {
                ...articleData,
                status: 'published' as const,
                publishedAt: new Date().toISOString(),
                wordCount,
                estimatedReadingTime: readingTime,
                seoScore,
                readabilityScore
            };

            if (isEditing) {
                await blogService.updatePost(articleData.id, publishData);
                toast.success('Artigo publicado com sucesso!');
            } else {
                const publishedArticle = await blogService.createPost(publishData);
                toast.success('Artigo criado e publicado com sucesso!');
                navigate(`/admin/blog/editar/${publishedArticle.id}`, { replace: true });
            }
            
            navigate('/admin/blog');
        } catch (error) {
            console.error('Error publishing article:', error);
            toast.error('Erro ao publicar artigo');
        } finally {
            setPublishing(false);
        }
    };

    const handleSchedulePublish = async (scheduledDate: string) => {
        if (!article) return;

        try {
            setPublishing(true);
            
            const scheduledData = {
                ...article,
                status: 'scheduled' as const,
                scheduledPublishAt: scheduledDate
            };

            await blogService.updatePost(article.id, scheduledData);
            toast.success('Artigo agendado para publicação!');
            setShowPublishSettings(false);
        } catch (error) {
            console.error('Error scheduling article:', error);
            toast.error('Erro ao agendar publicação');
        } finally {
            setPublishing(false);
        }
    };

    const handleAddTag = (tag: string) => {
        if (!article || !tag) return;
        
        const currentTags = article.tags || [];
        if (!currentTags.includes(tag)) {
            setArticle({
                ...article,
                tags: [...currentTags, tag]
            });
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (!article) return;
        
        const currentTags = article.tags || [];
        setArticle({
            ...article,
            tags: currentTags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleDuplicateArticle = async () => {
        if (!article) return;

        try {
            const duplicatedArticle = {
                ...article,
                title: `${article.title} (Cópia)`,
                slug: `${article.slug}-copia`,
                status: 'draft' as const,
                publishedAt: null,
                id: undefined
            };

            const newArticle = await blogService.createPost(duplicatedArticle);
            toast.success('Artigo duplicado com sucesso!');
            navigate(`/admin/blog/editar/${newArticle.id}`);
        } catch (error) {
            console.error('Error duplicating article:', error);
            toast.error('Erro ao duplicar artigo');
        }
    };

    const handleExportArticle = () => {
        if (!article) return;

        const exportData = {
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            author: article.author,
            publishedAt: article.publishedAt,
            tags: article.tags,
            category: article.category
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.slug}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Artigo exportado com sucesso!');
    };

    const getPreviewWidth = () => {
        switch (previewMode) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            default: return '100%';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>
                    {isEditing ? 'Editar Artigo' : 'Criar Artigo'} - Admin
                </title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/admin/blog')}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar
                                </Button>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">
                                        {isEditing ? 'Editar Artigo' : 'Criar Novo Artigo'}
                                    </h1>
                                    <p className="text-sm text-slate-600">
                                        {article?.title || 'Novo artigo'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Status indicators */}
                                {autoSaveEnabled && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                                        {lastSaved ? `Salvo às ${lastSaved}` : 'Aguardando salvamento...'}
                                    </div>
                                )}
                                
                                {/* Quick actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            {autoSaveEnabled ? 'Desativar' : 'Ativar'} Auto-Save
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setShowPreview(!showPreview)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            {showPreview ? 'Ocultar' : 'Mostrar'} Preview
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDuplicateArticle}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Duplicar Artigo
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleExportArticle}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Exportar Artigo
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setShowSEOSettings(true)}>
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Configurações SEO
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setShowPublishSettings(true)}>
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Agendar Publicação
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Preview mode selector */}
                                {showPreview && (
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                        <Button
                                            variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setPreviewMode('desktop')}
                                        >
                                            <Monitor className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setPreviewMode('tablet')}
                                        >
                                            <Tablet className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setPreviewMode('mobile')}
                                        >
                                            <Smartphone className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* Main actions */}
                                <Button
                                    variant="outline"
                                    onClick={() => article && handleSave(article)}
                                    disabled={saving}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? 'Salvando...' : 'Salvar Rascunho'}
                                </Button>
                                <Button
                                    onClick={() => article && handlePublish(article)}
                                    disabled={publishing}
                                    className="gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {publishing ? 'Publicando...' : 'Publicar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Article Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Estatísticas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Palavras</span>
                                        <span className="font-medium">{wordCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Tempo de leitura</span>
                                        <span className="font-medium">{readingTime} min</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Score SEO</span>
                                        <div className="flex items-center gap-2">
                                            <Progress value={seoScore} className="w-16 h-2" />
                                            <span className="font-medium text-sm">{seoScore}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Legibilidade</span>
                                        <div className="flex items-center gap-2">
                                            <Progress value={readabilityScore} className="w-16 h-2" />
                                            <span className="font-medium text-sm">{readabilityScore}%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tags */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Tags</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {article?.tags?.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="gap-1">
                                                {tag}
                                                <X
                                                    className="h-3 w-3 cursor-pointer"
                                                    onClick={() => handleRemoveTag(tag)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Tags sugeridas</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedTags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-slate-100"
                                                    onClick={() => handleAddTag(tag)}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Configurações</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="comments">Comentários</Label>
                                        <Switch id="comments" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="sharing">Compartilhamento</Label>
                                        <Switch id="sharing" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="featured">Artigo em destaque</Label>
                                        <Switch id="featured" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="toc">Índice</Label>
                                        <Switch id="toc" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Editor Area */}
                        <div className="lg:col-span-3">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="editor">Editor</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                    <TabsTrigger value="seo">SEO</TabsTrigger>
                                </TabsList>

                                <TabsContent value="editor" className="space-y-6">
                                    <ArticleEditorBasic
                                        articleId={id}
                                        onSave={handleSave}
                                        onPublish={handlePublish}
                                    />
                                </TabsContent>

                                <TabsContent value="preview" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Preview do Artigo</CardTitle>
                                            <CardDescription>
                                                Visualize como seu artigo aparecerá para os leitores
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="border rounded-lg overflow-hidden" style={{ maxWidth: getPreviewWidth() }}>
                                                <div className="bg-white p-6">
                                                    {article?.title && (
                                                        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                                                    )}
                                                    {article?.excerpt && (
                                                        <p className="text-slate-600 mb-6">{article.excerpt}</p>
                                                    )}
                                                    {article?.featuredImage && (
                                                        <img
                                                            src={article.featuredImage}
                                                            alt={article.title}
                                                            className="w-full h-64 object-cover rounded-lg mb-6"
                                                        />
                                                    )}
                                                    <div
                                                        className="prose prose-lg max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: article?.content || '' }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="seo" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Análise SEO</CardTitle>
                                            <CardDescription>
                                                Otimização para motores de busca
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label>Título SEO</Label>
                                                    <Input
                                                        value={article?.seoTitle || ''}
                                                        onChange={(e) => setArticle({...article, seoTitle: e.target.value})}
                                                        placeholder="Título otimizado para SEO (30-60 caracteres)"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {article?.seoTitle?.length || 0}/60 caracteres
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label>Meta Descrição</Label>
                                                    <Textarea
                                                        value={article?.seoDescription || ''}
                                                        onChange={(e) => setArticle({...(article || {}), seoDescription: e.target.value})}
                                                        placeholder="Descrição para resultados de busca (120-160 caracteres)"
                                                        rows={3}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {article?.seoDescription?.length || 0}/160 caracteres
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <Label>Palavras-chave</Label>
                                                <Input
                                                    value={article?.seoKeywords?.join(', ') || ''}
                                                    onChange={(e) => setArticle({...(article || {}), seoKeywords: e.target.value.split(',').map(k => k.trim())})}
                                                    placeholder="palavra1, palavra2, palavra3"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-medium">Checklist SEO</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className={`h-4 w-4 ${article?.title && article.title.length >= 30 && article.title.length <= 60 ? 'text-green-500' : 'text-slate-300'}`} />
                                                        <span className="text-sm">Título otimizado (30-60 caracteres)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className={`h-4 w-4 ${article?.seoDescription && article.seoDescription.length >= 120 && article.seoDescription.length <= 160 ? 'text-green-500' : 'text-slate-300'}`} />
                                                        <span className="text-sm">Meta descrição otimizada (120-160 caracteres)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className={`h-4 w-4 ${article?.featuredImage ? 'text-green-500' : 'text-slate-300'}`} />
                                                        <span className="text-sm">Imagem em destaque</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className={`h-4 w-4 ${wordCount >= 300 ? 'text-green-500' : 'text-slate-300'}`} />
                                                        <span className="text-sm">Conteúdo mínimo de 300 palavras</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>

                {/* SEO Settings Dialog */}
                <Dialog open={showSEOSettings} onOpenChange={setShowSEOSettings}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Configurações Avançadas SEO</DialogTitle>
                            <DialogDescription>
                                Configure opções avançadas de SEO para este artigo
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>URL Canônica</Label>
                                    <Input
                                        value={article?.canonicalUrl || ''}
                                        onChange={(e) => setArticle({...(article || {}), canonicalUrl: e.target.value})}
                                        placeholder="https://exemplo.com/artigo"
                                    />
                                </div>
                                <div>
                                    <Label>Priority</Label>
                                    <Select value={article?.priority?.toString() || '0.5'} onValueChange={(value) => setArticle({...(article || {}), priority: parseFloat(value)})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0.1">0.1 (Baixa)</SelectItem>
                                            <SelectItem value="0.5">0.5 (Média)</SelectItem>
                                            <SelectItem value="0.9">0.9 (Alta)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Change Frequency</Label>
                                <Select value={article?.changeFrequency || 'weekly'} onValueChange={(value: any) => setArticle({...(article || {}), changeFrequency: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="always">Sempre</SelectItem>
                                        <SelectItem value="hourly">A cada hora</SelectItem>
                                        <SelectItem value="daily">Diariamente</SelectItem>
                                        <SelectItem value="weekly">Semanalmente</SelectItem>
                                        <SelectItem value="monthly">Mensalmente</SelectItem>
                                        <SelectItem value="yearly">Anualmente</SelectItem>
                                        <SelectItem value="never">Nunca</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="noindex">No Index (Não indexar)</Label>
                                <Switch id="noindex" />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Publish Settings Dialog */}
                <Dialog open={showPublishSettings} onOpenChange={setShowPublishSettings}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agendar Publicação</DialogTitle>
                            <DialogDescription>
                                Agende a publicação deste artigo para uma data específica
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Data e Hora</Label>
                                <Input
                                    type="datetime-local"
                                    onChange={(e) => setArticle({...(article || {}), scheduledPublishAt: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => article?.scheduledPublishAt && handleSchedulePublish(article.scheduledPublishAt)}>
                                    Agendar Publicação
                                </Button>
                                <Button variant="outline" onClick={() => setShowPublishSettings(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default CreateArticleEnhanced;
