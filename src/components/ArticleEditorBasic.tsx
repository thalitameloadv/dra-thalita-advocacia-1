import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ArrowLeft, Save, Send, Eye, Bold, Italic, Link, List, ListOrdered, Quote, Code,
    Plus, X, Clock, Search, BarChart3, Target, FileText, Layout, Sparkles, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible';
import { blogService } from '@/services/blogService';
import { BlogPost } from '@/types/blog';
import { toast } from 'sonner';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { markdownToHtml } from '@/lib/richText';

interface ArticleEditorBasicProps {
    articleId?: string;
    onSave?: (article: BlogPost) => void;
    onPublish?: (article: BlogPost) => void;
}

const ArticleEditorBasic = ({ articleId, onSave, onPublish }: ArticleEditorBasicProps) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(!!articleId);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [featuredImage, setFeaturedImage] = useState('');
    const [readingTime, setReadingTime] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [lastSelection, setLastSelection] = useState<{ start: number; end: number } | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        contentHtml: '',
        category: '',
        tags: [] as string[],
        seoTitle: '',
        seoDescription: '',
        seoKeywords: [] as string[],
        featured: false,
        status: 'draft' as 'draft' | 'published' | 'archived'
    });

    const [categories] = [
        { id: '1', name: 'Direito Civil', slug: 'direito-civil' },
        { id: '2', name: 'Direito Trabalhista', slug: 'direito-trabalhista' },
        { id: '3', name: 'Direito Empresarial', slug: 'direito-empresarial' },
        { id: '4', name: 'Direito Família', slug: 'direito-familia' },
        { id: '5', name: 'Direito Tributário', slug: 'direito-tributario' }
    ];

    const [newTag, setNewTag] = useState('');
    const [seoScore, setSeoScore] = useState(0);
    const [showTemplates, setShowTemplates] = useState(false);

    // Article templates
    const templates = [
        { id: 'blank', name: 'Em branco', icon: FileText, content: '' },
        { id: 'legal-guide', name: 'Guia Jurídico', icon: Layout, content: '# Guia Completo: [Tema]\n\n## O que é [Tema]?\n\n[Explicação clara e objetiva]\n\n## Quando você precisa de um advogado?\n\n- [Situação 1]\n- [Situação 2]\n- [Situação 3]\n\n## Como funciona o processo?\n\n1. [Etapa 1]\n2. [Etapa 2]\n3. [Etapa 3]\n\n## Prazos importantes\n\n⚠️ **Atenção**: [Informações sobre prazos]\n\n## Conclusão\n\n[Resumo e call-to-action]' },
        { id: 'faq', name: 'Perguntas Frequentes', icon: Target, content: '# Perguntas Frequentes sobre [Tema]\n\n## 1. [Pergunta 1]?\n\n[Resposta detalhada]\n\n## 2. [Pergunta 2]?\n\n[Resposta detalhada]\n\n## 3. [Pergunta 3]?\n\n[Resposta detalhada]\n\n## Precisa de ajuda?\n\nEntre em contato com nossa equipe especializada.' },
        { id: 'case-study', name: 'Caso de Sucesso', icon: Sparkles, content: '# Caso de Sucesso: [Título]\n\n## O Desafio\n\n[Descrição da situação do cliente]\n\n## Nossa Solução\n\n[Como ajudamos o cliente]\n\n## O Resultado\n\n[Resultado alcançado]\n\n> "[Depoimento do cliente]"\n\n## Quer um resultado similar?\n\n[Call-to-action]' }
    ];

    useEffect(() => {
        if (articleId) {
            loadArticle();
        }
    }, [articleId]);

    useEffect(() => {
        // Generate slug from title
        if (formData.title && !isEditing) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, isEditing]);

    useEffect(() => {
        // Calculate reading time
        if (formData.content) {
            const wordsPerMinute = 200;
            const words = formData.content.split(/\s+/).length;
            const minutes = Math.ceil(words / wordsPerMinute);
            setReadingTime(minutes);
        }
    }, [formData.content]);

    // Calculate SEO Score
    useEffect(() => {
        let score = 0;
        const maxScore = 100;
        
        // Title optimization (20 points)
        if (formData.title) {
            if (formData.title.length >= 30 && formData.title.length <= 60) score += 20;
            else if (formData.title.length >= 20) score += 10;
            else score += 5;
        }
        
        // Meta description (20 points)
        if (formData.seoDescription) {
            if (formData.seoDescription.length >= 120 && formData.seoDescription.length <= 160) score += 20;
            else if (formData.seoDescription.length >= 50) score += 10;
            else score += 5;
        }
        
        // Content length (20 points)
        if (formData.content) {
            const wordCount = formData.content.split(/\s+/).length;
            if (wordCount >= 500) score += 20;
            else if (wordCount >= 300) score += 15;
            else if (wordCount >= 100) score += 10;
            else score += 5;
        }
        
        // Keywords (15 points)
        if (formData.seoKeywords && formData.seoKeywords.length >= 3) score += 15;
        else if (formData.seoKeywords && formData.seoKeywords.length > 0) score += 5;
        
        // Featured image (15 points)
        if (featuredImage) score += 15;
        
        // Excerpt (10 points)
        if (formData.excerpt && formData.excerpt.length >= 50) score += 10;
        else if (formData.excerpt) score += 5;
        
        setSeoScore(Math.min(score, maxScore));
    }, [formData.title, formData.seoDescription, formData.content, formData.seoKeywords, formData.excerpt, featuredImage]);

    const loadArticle = async () => {
        try {
            setLoading(true);
            const article = await blogService.getPost(articleId!);
            if (article) {
                setFormData({
                    title: article.title,
                    slug: article.slug,
                    excerpt: article.excerpt,
                    content: article.content,
                    contentHtml: article.contentHtml || '',
                    category: article.category,
                    tags: article.tags || [],
                    seoTitle: article.seoTitle || '',
                    seoDescription: article.seoDescription || '',
                    seoKeywords: article.seoKeywords || [],
                    featured: article.featured || false,
                    status: article.status
                });
                setFeaturedImage(article.featuredImage || '');
            }
        } catch (error) {
            console.error('Error loading article:', error);
            toast.error('Erro ao carregar artigo');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const insertText = (tag: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Use stored selection if available, otherwise get current
        const start = lastSelection?.start ?? textarea.selectionStart;
        const end = lastSelection?.end ?? textarea.selectionEnd;
        const selectedText = formData.content.substring(start, end);

        let newText = '';
        switch (tag) {
            case 'bold':
                newText = `**${selectedText || 'texto em negrito'}**`;
                break;
            case 'italic':
                newText = `*${selectedText || 'texto em itálico'}*`;
                break;
            case 'link':
                newText = `[${selectedText || 'texto do link'}](url)`;
                break;
            case 'heading':
                newText = `\n## ${selectedText || 'título'}`;
                break;
            case 'list':
                newText = `\n- ${selectedText || 'item da lista'}`;
                break;
            case 'ordered':
                newText = `\n1. ${selectedText || 'item da lista'}`;
                break;
            case 'quote':
                newText = `\n> ${selectedText || 'citação'}`;
                break;
            case 'code':
                newText = `\`${selectedText || 'código'}\``;
                break;
            default:
                newText = selectedText;
        }

        const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
        handleInputChange('content', newContent);

        requestAnimationFrame(() => {
            textarea.focus();
            const newPosition = start + newText.length;
            textarea.setSelectionRange(newPosition, newPosition);
            setLastSelection({ start: newPosition, end: newPosition });
        });
    };

    const addTag = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            handleInputChange('tags', [...formData.tags, newTag]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
    };

    const applyTemplate = (templateContent: string) => {
        handleInputChange('content', templateContent);
        setShowTemplates(false);
        toast.success('Template aplicado!');
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const articleData = {
                ...formData,
                featuredImage,
                readingTime,
                updatedAt: new Date().toISOString()
            };

            let savedArticle: BlogPost;

            if (isEditing) {
                savedArticle = await blogService.updatePost(articleId!, articleData);
                toast.success('Artigo salvo com sucesso!');
            } else {
                savedArticle = await blogService.createPost(articleData);
                toast.success('Artigo criado com sucesso!');
            }

            onSave?.(savedArticle);
        } catch (error) {
            console.error('Error saving article:', error);
            toast.error('Erro ao salvar artigo');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        try {
            setPublishing(true);

            const articleData = {
                ...formData,
                featuredImage,
                readingTime,
                status: 'published',
                publishedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            let publishedArticle: BlogPost;

            if (isEditing) {
                publishedArticle = await blogService.updatePost(articleId!, articleData);
            } else {
                publishedArticle = await blogService.createPost(articleData);
            }

            toast.success('Artigo publicado com sucesso!');
            onPublish?.(publishedArticle);
        } catch (error) {
            console.error('Error publishing article:', error);
            toast.error('Erro ao publicar artigo');
        } finally {
            setPublishing(false);
        }
    };

    const formatContent = (text: string) => {
        return text
            .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
            .replace(/^- (.*?)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')
            .replace(/\n/g, '<br>');
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

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
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
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {isEditing ? 'Editar Artigo' : 'Criar Novo Artigo'}
                                    </h1>
                                    <p className="text-slate-600">
                                        {isEditing 
                                            ? 'Edite o conteúdo e configurações do artigo'
                                            : 'Crie um novo artigo para o blog jurídico'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewMode(!previewMode)}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    {previewMode ? 'Editar' : 'Preview'}
                                </Button>
                                {readingTime > 0 && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        {readingTime} min
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Formatting Tools */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Formatação</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => insertText('bold', e)}
                                            className="gap-1"
                                        >
                                            <Bold className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => insertText('italic', e)}
                                            className="gap-1"
                                        >
                                            <Italic className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => insertText('heading', e)}
                                            className="gap-1"
                                        >
                                            <span className="text-xs font-bold">H2</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => insertText('link', e)}
                                            className="gap-1"
                                        >
                                            <Link className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => insertText('list', e)}
                                            className="gap-1"
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => insertText('ordered', e)}
                                            className="gap-1"
                                        >
                                            <ListOrdered className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => insertText('quote', e)}
                                            className="gap-1"
                                        >
                                            <Quote className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => insertText('code', e)}
                                            className="gap-1"
                                        >
                                            <Code className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SEO Score */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        SEO Score
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Progress value={seoScore} className="flex-1" />
                                        <span className={`font-bold ${seoScore >= 80 ? 'text-green-600' : seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {seoScore}%
                                        </span>
                                    </div>
                                    <Collapsible>
                                        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                                            <ChevronDown className="h-4 w-4" />
                                            Ver detalhes
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="space-y-2 mt-2">
                                            <div className="text-xs space-y-1">
                                                <p className={formData.title.length >= 30 ? 'text-green-600' : 'text-red-500'}>
                                                    • Título: {formData.title.length}/60 caracteres
                                                </p>
                                                <p className={formData.seoDescription.length >= 120 ? 'text-green-600' : 'text-red-500'}>
                                                    • Meta descrição: {formData.seoDescription.length}/160 caracteres
                                                </p>
                                                <p className={formData.content.split(/\s+/).length >= 300 ? 'text-green-600' : 'text-red-500'}>
                                                    • Conteúdo: {formData.content.split(/\s+/).length} palavras
                                                </p>
                                                <p className={featuredImage ? 'text-green-600' : 'text-red-500'}>
                                                    • {featuredImage ? 'Imagem definida' : 'Imagem em destaque ausente'}
                                                </p>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </CardContent>
                            </Card>

                            {/* Templates */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Layout className="h-5 w-5" />
                                        Templates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Collapsible open={showTemplates} onOpenChange={setShowTemplates}>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                Escolher template
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="space-y-2 mt-2">
                                            {templates.map((template) => (
                                                <Button
                                                    key={template.id}
                                                    variant="ghost"
                                                    className="w-full justify-start gap-2"
                                                    onClick={() => applyTemplate(template.content)}
                                                >
                                                    <template.icon className="h-4 w-4" />
                                                    {template.name}
                                                </Button>
                                            ))}
                                        </CollapsibleContent>
                                    </Collapsible>
                                </CardContent>
                            </Card>

                            {/* Tags */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        Tags & Keywords
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Adicionar tag..."
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                        />
                                        <Button type="button" size="sm" onClick={addTag}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="gap-1">
                                                {tag}
                                                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="space-y-2 pt-2 border-t">
                                        <Label className="text-xs text-slate-500">Palavras-chave SEO</Label>
                                        <Input
                                            placeholder="keyword1, keyword2, keyword3"
                                            value={formData.seoKeywords?.join(', ') || ''}
                                            onChange={(e) => handleInputChange('seoKeywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informações Básicas</CardTitle>
                                        <CardDescription>
                                            Preencha as informações principais do artigo
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Título *</Label>
                                                <Input
                                                    id="title"
                                                    value={formData.title}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                    placeholder="Título do artigo"
                                                    className="text-lg"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="slug">Slug *</Label>
                                                <Input
                                                    id="slug"
                                                    value={formData.slug}
                                                    onChange={(e) => handleInputChange('slug', e.target.value)}
                                                    placeholder="url-do-artigo"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="excerpt">Resumo *</Label>
                                            <Textarea
                                                id="excerpt"
                                                value={formData.excerpt}
                                                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                                                placeholder="Breve resumo do artigo"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Categoria *</Label>
                                                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione uma categoria" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.slug}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="featuredImage">Imagem em Destaque</Label>
                                                <ImageUpload
                                                    value={featuredImage}
                                                    onChange={(url) => setFeaturedImage(url)}
                                                    bucket="blog-images"
                                                    aspectRatio="wide"
                                                    placeholder="Upload da imagem de destaque"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Conteúdo do Artigo</CardTitle>
                                        <CardDescription>
                                            Escreva o conteúdo principal do artigo
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="content">Conteúdo *</Label>
                                            <RichTextEditor
                                                value={{
                                                    html: formData.contentHtml,
                                                    markdown: formData.content
                                                }}
                                                onChange={(val) => {
                                                    handleInputChange('content', val.markdown);
                                                    handleInputChange('contentHtml', val.html);
                                                }}
                                                imageBucket="blog-images"
                                                initialContentMode={formData.contentHtml ? 'html' : 'markdown'}
                                            />
                                        </div>

                                        {/* Preview Mode */}
                                        {previewMode && (
                                            <div className="border rounded-lg p-6 bg-white">
                                                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                                                <div className="prose max-w-none">
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: sanitizeHtml(formData.contentHtml || markdownToHtml(formData.content))
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-6 border-t">
                                    <div className="text-sm text-slate-500">
                                        {/* Status indicator */}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {saving ? 'Salvando...' : 'Salvar Rascunho'}
                                        </Button>
                                        <Button
                                            onClick={handlePublish}
                                            disabled={publishing}
                                            className="gap-2"
                                        >
                                            {publishing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Publicando...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Publicar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticleEditorBasic;
