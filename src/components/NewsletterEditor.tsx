import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Mail,
    Send,
    Save,
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
    Users,
    BarChart3,
    Layout
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
import { newsletterCampaignService, CampaignTemplate } from '@/services/newsletterCampaignService';
import { newsletterService } from '@/services/newsletterService';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import NewsletterImageUpload from '@/components/NewsletterImageUpload';

const newsletterSchema = z.object({
    subject: z.string().min(1, 'O assunto é obrigatório'),
    previewText: z.string().optional(),
    content: z.string().min(1, 'O conteúdo é obrigatório'),
    templateId: z.string().optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterEditorProps {
    campaignId?: string;
    onSave?: (campaign: any) => void;
    onSend?: (campaign: any) => void;
}

const NewsletterEditor = ({ campaignId, onSave, onSend }: NewsletterEditorProps) => {
    const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [showImageDialog, setShowImageDialog] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty }
    } = useForm<NewsletterFormData>({
        resolver: zodResolver(newsletterSchema)
    });

    const content = watch('content');

    const insertMarkdownAtCursor = (markdown: string) => {
        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + markdown + content.substring(end);
        setValue('content', newContent);

        setTimeout(() => {
            textarea.focus();
            const pos = start + markdown.length;
            textarea.setSelectionRange(pos, pos);
        }, 0);
    };

    useEffect(() => {
        loadTemplates();
        loadStats();

        if (campaignId) {
            loadCampaign();
        }
    }, [campaignId]);

    const loadTemplates = async () => {
        try {
            const templatesData = await newsletterCampaignService.getTemplates();
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await newsletterService.getSubscriberStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadCampaign = async () => {
        try {
            const campaign = await newsletterCampaignService.getCampaign(campaignId);
            if (campaign) {
                reset({
                    subject: campaign.subject,
                    previewText: campaign.previewText,
                    content: campaign.content
                });
            }
        } catch (error) {
            console.error('Error loading campaign:', error);
        }
    };

    const applyTemplate = (template: CampaignTemplate) => {
        setValue('subject', template.subject);
        setValue('previewText', template.previewText);
        setValue('content', template.content);
        setSelectedTemplate(template);
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

    const generatePreview = async () => {
        const subject = watch('subject');
        const newsletterContent = watch('content');

        try {
            const preview = await newsletterCampaignService.generatePreview(subject, newsletterContent);
            return preview;
        } catch (error) {
            console.error('Error generating preview:', error);
            return '';
        }
    };

    const handleSave = async (data: NewsletterFormData) => {
        try {
            setSaving(true);

            if (campaignId) {
                const updated = await newsletterCampaignService.updateCampaign(campaignId, {
                    subject: data.subject,
                    previewText: data.previewText || '',
                    content: data.content,
                    status: 'draft'
                });
                toast.success('Newsletter salva com sucesso!');
                onSave?.(updated);
            } else {
                const created = await newsletterCampaignService.createCampaign({
                    subject: data.subject,
                    previewText: data.previewText || '',
                    content: data.content,
                    status: 'draft'
                });
                toast.success('Newsletter criada com sucesso!');
                onSave?.(created);
            }
        } catch (error) {
            console.error('Error saving newsletter:', error);
            toast.error('Erro ao salvar newsletter');
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async (data: NewsletterFormData) => {
        try {
            setSending(true);

            let campaignIdToSend = campaignId;

            if (!campaignIdToSend) {
                const created = await newsletterCampaignService.createCampaign({
                    subject: data.subject,
                    previewText: data.previewText || '',
                    content: data.content,
                    status: 'draft'
                });
                campaignIdToSend = created.id;
            }

            if (isScheduled && scheduledDate && scheduledTime) {
                const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
                await newsletterCampaignService.scheduleCampaign(campaignIdToSend, scheduledAt);
                toast.success('Newsletter agendada com sucesso!');
            } else {
                await newsletterCampaignService.sendCampaign(campaignIdToSend);
                toast.success('Newsletter enviada com sucesso!');
            }

            onSend?.({ id: campaignIdToSend });
        } catch (error) {
            console.error('Error sending newsletter:', error);
            toast.error('Erro ao enviar newsletter');
        } finally {
            setSending(false);
        }
    };

    const formatContent = (text: string) => {
        // Simple markdown-like formatting for preview
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
            .replace(/^- (.*?)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')
            .replace(/\n/g, '<br>');
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {campaignId ? 'Editar Newsletter' : 'Criar Newsletter'}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Envie comunicados para seus inscritos
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
                    {stats && (
                        <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {stats.active} inscritos
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Templates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Layout className="h-5 w-5" />
                                Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {templates.map((template) => (
                                <Button
                                    key={template.id}
                                    variant={selectedTemplate?.id === template.id ? "default" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => applyTemplate(template)}
                                >
                                    {template.name}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

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
                                    onClick={() => setShowImageDialog(true)}
                                    className="gap-1"
                                >
                                    <Image className="h-4 w-4" />
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('', 'codeblock')}
                                    className="gap-1"
                                >
                                    <Code className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertText('[Assinatura]')}
                                    className="gap-1"
                                >
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Inserir imagem</DialogTitle>
                                <DialogDescription>
                                    Faça upload de uma imagem e ela será inserida no conteúdo da newsletter.
                                </DialogDescription>
                            </DialogHeader>
                            <NewsletterImageUpload
                                onChange={(url) => {
                                    if (!url) return;
                                    insertMarkdownAtCursor(`\n![](${url})\n`);
                                    setShowImageDialog(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Agendamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="schedule">Agendar envio</Label>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Conteúdo da Newsletter</CardTitle>
                            <CardDescription>
                                Preencha os campos abaixo para criar sua newsletter
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(handleSend)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Assunto *</Label>
                                    <Input
                                        id="subject"
                                        {...register('subject')}
                                        placeholder="Assunto do email"
                                        className="text-lg"
                                    />
                                    {errors.subject && (
                                        <p className="text-sm text-red-600">{errors.subject.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="preview">Texto de Preview</Label>
                                    <Input
                                        id="preview"
                                        {...register('previewText')}
                                        placeholder="Texto que aparece na caixa de entrada (opcional)"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Este texto aparece como preview na maioria dos clientes de email
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Conteúdo *</Label>
                                    <Textarea
                                        id="content"
                                        {...register('content')}
                                        placeholder="Digite o conteúdo da newsletter aqui..."
                                        rows={15}
                                        className="font-mono"
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-red-600">{errors.content.message}</p>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        Você pode usar markdown básico para formatação. Use [Assinatura] para inserir a assinatura padrão.
                                    </p>
                                </div>

                                {/* Preview Mode */}
                                {previewMode && (
                                    <div className="border rounded-lg p-6 bg-white">
                                        <h3 className="text-lg font-semibold mb-4">Preview</h3>
                                        <div className="prose max-w-none">
                                            <h4>{watch('subject')}</h4>
                                            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatContent(content)) }} />
                                        </div>
                                    </div>
                                )}

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
                                            disabled={sending}
                                            className="gap-2"
                                        >
                                            {sending ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    {isScheduled ? 'Agendar' : 'Enviar Agora'}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NewsletterEditor;
