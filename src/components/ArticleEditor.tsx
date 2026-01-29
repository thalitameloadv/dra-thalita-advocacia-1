import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    FileText,
    Save,
    Send,
    Eye,
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
    AlertCircle
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
import { Switch } from '@/components/ui/switch';
import { blogService } from '@/services/blogService';
import { BlogPost, BlogCategory } from '@/types/blog';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const articleSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório'),
    slug: z.string().min(1, 'O slug é obrigatório'),
    excerpt: z.string().min(1, 'O resumo é obrigatório'),
    content: z.string().min(1, 'O conteúdo é obrigatório'),
    category: z.string().min(1, 'A categoria é obrigatória'),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
    articleId?: string;
    onSave?: (article: BlogPost) => void;
    onPublish?: (article: BlogPost) => void;
}

const ArticleEditor = ({ articleId, onSave, onPublish }: ArticleEditorProps) => {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [featuredImage, setFeaturedImage] = useState('');
    const [newTag, setNewTag] = useState('');
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [readingTime, setReadingTime] = useState(0);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty }
    } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            status: 'draft',
            tags: [],
            seoKeywords: [],
            featured: false
        }
    });

    const title = watch('title');
    const content = watch('content');
    const tags = watch('tags') || [];
    const seoKeywords = watch('seoKeywords') || [];

    const loadArticle = useCallback(async () => {
        try {
            const article = await blogService.getPost(articleId!);
            if (article) {
                reset({
                    title: article.title,
                    slug: article.slug,
                    excerpt: article.excerpt,
                    content: article.content,
                    category: article.category,
                    tags: article.tags,
                    seoTitle: article.seoTitle,
                    seoDescription: article.seoDescription,
                    seoKeywords: article.seoKeywords || [],
                    featured: article.featured,
                    status: article.status
                });
                setFeaturedImage(article.featuredImage || '');
            }
        } catch (error) {
            console.error('Error loading article:', error);
        }
    }, [articleId, reset]);

    useEffect(() => {
        loadCategories();
        loadTagSuggestions();

        if (articleId) {
            loadArticle();
        }
    }, [articleId, loadArticle]);

    useEffect(() => {
        // Generate slug from title
        if (title && !articleId) {
            const slug = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setValue('slug', slug);
        }
    }, [title, setValue, articleId]);

    useEffect(() => {
        // Calculate reading time
        if (content) {
            const wordsPerMinute = 200;
            const words = content.split(/\s+/).length;
            const minutes = Math.ceil(words / wordsPerMinute);
            setReadingTime(minutes);
        }
    }, [content]);

    const loadCategories = async () => {
        try {
            // Mock categories for now
            const mockCategories: BlogCategory[] = [
                { id: '1', name: 'Direito Civil', slug: 'direito-civil' },
                { id: '2', name: 'Direito Trabalhista', slug: 'direito-trabalhista' },
                { id: '3', name: 'Direito Empresarial', slug: 'direito-empresarial' },
                { id: '4', name: 'Direito Família', slug: 'direito-familia' },
                { id: '5', name: 'Direito Tributário', slug: 'direito-tributario' }
            ];
            setCategories(mockCategories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadTagSuggestions = async () => {
        try {
            // Mock tag suggestions
            const suggestions = [
                'contratos', 'divórcio', 'herança', 'empresa', 'trabalho',
                'tributação', 'família', 'civil', 'empresarial', 'previdência',
                'sucessão', 'guarda', 'pensão', 'reparação', 'danos'
            ];
            setTagSuggestions(suggestions);
        } catch (error) {
            console.error('Error loading tag suggestions:', error);
        }
    };


    const insertText = (text: string, tag?: string) => {
        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        let newText = '';

        if (tag) {
            switch (tag) {
                case 'bold':
                    newText = `**${selectedText || text}**`;
                    break;
                case 'italic':
                    newText = `*${selectedText || text}*`;
                    break;
                case 'link':
                    newText = `[${selectedText || text}](url)`;
                    break;
                case 'heading':
                    newText = `\n## ${selectedText || text}`;
                    break;
                case 'list':
                    newText = `\n- ${selectedText || text}`;
                    break;
                case 'ordered':
                    newText = `\n1. ${selectedText || text}`;
                    break;
                case 'quote':
                    newText = `\n> ${selectedText || text}`;
                    break;
                case 'code':
                    newText = `\`${selectedText || text}\``;
                    break;
                case 'codeblock':
                    newText = `\n\`\`\`\n${selectedText || text}\n\`\`\``;
                    break;
                default:
                    newText = text;
            }
        } else {
            newText = text;
        }

        const newContent = content.substring(0, start) + newText + content.substring(end);
        setValue('content', newContent);

        // Focus back to textarea
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + newText.length, start + newText.length);
        }, 0);
    };

    const addTag = (tag: string) => {
        if (tag && !tags.includes(tag)) {
            setValue('tags', [...tags, tag]);
        }
        setNewTag('');
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', tags.filter(tag => tag !== tagToRemove));
    };

    const addSeoKeyword = (keyword: string) => {
        if (keyword && !seoKeywords.includes(keyword)) {
            setValue('seoKeywords', [...seoKeywords, keyword]);
        }
    };

    const removeSeoKeyword = (keywordToRemove: string) => {
        setValue('seoKeywords', seoKeywords.filter(keyword => keyword !== keywordToRemove));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // In a real implementation, you would upload to a service
            const reader = new FileReader();
            reader.onloadend = () => {
                setFeaturedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (data: ArticleFormData) => {
        try {
            setSaving(true);

            const articleData = {
                ...data,
                featuredImage,
                readingTime,
                updatedAt: new Date().toISOString()
            };

            let savedArticle: BlogPost;

            if (articleId) {
                savedArticle = await blogService.updatePost(articleId, articleData);
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

    const handlePublish = async (data: ArticleFormData) => {
        try {
            setPublishing(true);

            const articleData = {
                ...data,
                featuredImage,
                readingTime,
                status: isScheduled ? 'draft' : 'published',
                publishedAt: isScheduled ? undefined : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            let publishedArticle: BlogPost;

            if (articleId) {
                publishedArticle = await blogService.updatePost(articleId, articleData);
            } else {
                publishedArticle = await blogService.createPost(articleData);
            }

            if (isScheduled && scheduledDate && scheduledTime) {
                // In a real implementation, you would schedule the publication
                const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
                toast.success(`Artigo agendado para ${new Date(scheduledAt).toLocaleString('pt-BR')}!`);
            } else {
                toast.success('Artigo publicado com sucesso!');
            }

            onPublish?.(publishedArticle);
        } catch (error) {
            console.error('Error publishing article:', error);
            toast.error('Erro ao publicar artigo');
        } finally {
            setPublishing(false);
        }
    };

    const formatContent = (text: string) => {
        // Simple markdown-like formatting for preview
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

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {articleId ? 'Editar Artigo' : 'Criar Novo Artigo'}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        {articleId ? 'Edite o conteúdo e configurações do artigo' : 'Crie um novo artigo para o blog'}
                    </p>
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
                            {readingTime} min de leitura
                        </Badge>
                    )}
                </div>
            </div>

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
                                    onClick={() => insertText('', 'bold')}
                                    className="gap-1"
                                >
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('', 'italic')}
                                    className="gap-1"
                                >
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('', 'heading')}
                                    className="gap-1"
                                >
                                    <h1 className="text-xs font-bold">H2</h1>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('', 'link')}
                                    className="gap-1"
                                >
                                    <Link className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('', 'list')}
                                    className="gap-1"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('', 'ordered')}
                                    className="gap-1"
                                >
                                    <ListOrdered className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('', 'quote')}
                                    className="gap-1"
                                >
                                    <Quote className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('', 'code')}
                                    className="gap-1"
                                >
                                    <Code className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Tags
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
                                            addTag(newTag);
                                        }
                                    }}
                                    className="text-sm"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => addTag(newTag)}
                                    disabled={!newTag}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Tag Suggestions */}
                            {tagSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {tagSuggestions.slice(0, 6).map((tag) => (
                                        <Button
                                            key={tag}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addTag(tag)}
                                            className="text-xs h-6"
                                        >
                                            {tag}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Selected Tags */}
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publishing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                Publicação
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select {...register('status')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Rascunho</SelectItem>
                                        <SelectItem value="published">Publicado</SelectItem>
                                        <SelectItem value="archived">Arquivado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="featured">Artigo em destaque</Label>
                                <Switch
                                    id="featured"
                                    {...register('featured')}
                                    checked={watch('featured')}
                                    onCheckedChange={(checked) => setValue('featured', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="schedule">Agendar publicação</Label>
                                <Switch
                                    id="schedule"
                                    checked={isScheduled}
                                    onCheckedChange={setIsScheduled}
                                />
                            </div>

                            {isScheduled && (
                                <div className="space-y-2">
                                    <Input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                    />
                                    <Input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit(handlePublish)} className="space-y-6">
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
                                            {...register('title')}
                                            placeholder="Título do artigo"
                                            className="text-lg"
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-600">{errors.title.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug *</Label>
                                        <Input
                                            id="slug"
                                            {...register('slug')}
                                            placeholder="url-do-artigo"
                                        />
                                        {errors.slug && (
                                            <p className="text-sm text-red-600">{errors.slug.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Resumo *</Label>
                                    <Textarea
                                        id="excerpt"
                                        {...register('excerpt')}
                                        placeholder="Breve resumo do artigo (aparece na lista de artigos)"
                                        rows={3}
                                    />
                                    {errors.excerpt && (
                                        <p className="text-sm text-red-600">{errors.excerpt.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoria *</Label>
                                        <Select {...register('category')}>
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
                                        {errors.category && (
                                            <p className="text-sm text-red-600">{errors.category.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="featuredImage">Imagem em Destaque</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="featuredImage"
                                                value={featuredImage}
                                                onChange={(e) => setFeaturedImage(e.target.value)}
                                                placeholder="URL da imagem"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('imageUpload')?.click()}
                                            >
                                                <Upload className="h-4 w-4" />
                                            </Button>
                                            <input
                                                id="imageUpload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </div>
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
                                    <Textarea
                                        id="content"
                                        {...register('content')}
                                        placeholder="Digite o conteúdo do artigo aqui..."
                                        rows={20}
                                        className="font-mono"
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-red-600">{errors.content.message}</p>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        Você pode usar markdown básico para formatação. Use ## para subtítulos, **texto** para negrito, *texto* para itálico.
                                    </p>
                                </div>

                                {/* Preview Mode */}
                                {previewMode && (
                                    <div className="border rounded-lg p-6 bg-white">
                                        <h3 className="text-lg font-semibold mb-4">Preview</h3>
                                        <div className="prose max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatContent(content)) }} />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* SEO */}
                        <Card>
                            <CardHeader>
                                <CardTitle>SEO</CardTitle>
                                <CardDescription>
                                    Otimize seu artigo para mecanismos de busca
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="seoTitle">Título SEO</Label>
                                    <Input
                                        id="seoTitle"
                                        {...register('seoTitle')}
                                        placeholder="Título para SEO (opcional)"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Se não preenchido, usará o título do artigo
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="seoDescription">Descrição SEO</Label>
                                    <Textarea
                                        id="seoDescription"
                                        {...register('seoDescription')}
                                        placeholder="Descrição para SEO (opcional)"
                                        rows={3}
                                    />
                                    <p className="text-xs text-slate-500">
                                        Se não preenchida, usará o resumo do artigo
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Palavras-chave SEO</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Adicionar palavra-chave..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const target = e.target as HTMLInputElement;
                                                    addSeoKeyword(target.value);
                                                    target.value = '';
                                                }
                                            }}
                                            className="text-sm"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                                const input = document.querySelector('input[placeholder*="palavra-chave"]') as HTMLInputElement;
                                                if (input?.value) {
                                                    addSeoKeyword(input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {seoKeywords.map((keyword) => (
                                            <Badge key={keyword} variant="outline" className="gap-1">
                                                {keyword}
                                                <X
                                                    className="h-3 w-3 cursor-pointer"
                                                    onClick={() => removeSeoKeyword(keyword)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            <div className="text-sm text-slate-500">
                                {isDirty && 'Você tem alterações não salvas'}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSubmit(handleSave)}
                                    disabled={saving}
                                    className="gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? 'Salvando...' : 'Salvar Rascunho'}
                                </Button>
                                <Button
                                    type="submit"
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
                                            {isScheduled ? 'Agendar' : 'Publicar'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ArticleEditor;
