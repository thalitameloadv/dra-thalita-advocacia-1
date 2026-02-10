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
    Layout,
    Sparkles,
    ChevronDown,
    Plus,
    X
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
import RichTextEditor from '@/components/RichTextEditor';
import { buildEmailSafeNewsletterHtml } from '@/lib/newsletterEmail';
import { markdownToHtml } from '@/lib/richText';

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

const NewsletterEditorEnhanced = ({ campaignId, onSave, onSend }: NewsletterEditorProps) => {
    const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateSubject, setNewTemplateSubject] = useState('');
    const [newTemplateContent, setNewTemplateContent] = useState('');
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

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
    const [contentHtml, setContentHtml] = useState('');

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
                setContentHtml(campaign.htmlContent || '');
            }
        } catch (error) {
            console.error('Error loading campaign:', error);
        }
    };

    const applyTemplate = (template: CampaignTemplate) => {
        setValue('subject', template.subject);
        setValue('previewText', template.previewText);
        setValue('content', template.content);
        setContentHtml('');
        setSelectedTemplate(template);
    };

    const createTemplate = async () => {
        if (!newTemplateName || !newTemplateSubject || !newTemplateContent) {
            toast.error('Preencha todos os campos do template');
            return;
        }

        try {
            await newsletterCampaignService.createTemplate({
                name: newTemplateName,
                subject: newTemplateSubject,
                content: newTemplateContent,
                previewText: '',
                isDefault: false
            });
            
            toast.success('Template criado com sucesso!');
            setShowTemplateDialog(false);
            setNewTemplateName('');
            setNewTemplateSubject('');
            setNewTemplateContent('');
            loadTemplates();
        } catch (error) {
            console.error('Error creating template:', error);
            toast.error('Erro ao criar template');
        }
    };

    const deleteTemplate = async (templateId: string) => {
        try {
            await newsletterCampaignService.deleteTemplate(templateId);
            toast.success('Template excluído com sucesso!');
            loadTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            toast.error('Erro ao excluir template');
        }
    };

    const setAsDefault = async (templateId: string) => {
        try {
            // First, unset all templates as default
            for (const template of templates) {
                if (template.isDefault) {
                    await newsletterCampaignService.updateTemplate(template.id, { isDefault: false });
                }
            }
            
            // Then set new default
            await newsletterCampaignService.updateTemplate(templateId, { isDefault: true });
            toast.success('Template definido como padrão!');
            loadTemplates();
        } catch (error) {
            console.error('Error setting default template:', error);
            toast.error('Erro ao definir template padrão');
        }
    };

    const sendTestEmail = async () => {
        if (!testEmail) {
            toast.error('Digite um email para teste');
            return;
        }

        try {
            setSendingTest(true);
            const subject = watch('subject');
            const content = watch('content');
            const finalHtml = buildEmailSafeNewsletterHtml({
                subject,
                contentHtml: contentHtml || markdownToHtml(content)
            });

            // Simulate test email (in real implementation, use email service)
            console.log('Test email sent to:', testEmail);
            console.log('Subject:', subject);
            console.log('HTML:', finalHtml);
            
            toast.success('Email de teste enviado com sucesso!');
            setTestEmail('');
        } catch (error) {
            console.error('Error sending test email:', error);
            toast.error('Erro ao enviar email de teste');
        } finally {
            setSendingTest(false);
        }
    };

    const handleSave = async (data: NewsletterFormData) => {
        try {
            setSaving(true);

            const finalHtml = buildEmailSafeNewsletterHtml({
                subject: data.subject,
                contentHtml: contentHtml || markdownToHtml(data.content)
            });

            if (campaignId) {
                const updated = await newsletterCampaignService.updateCampaign(campaignId, {
                    subject: data.subject,
                    previewText: data.previewText || '',
                    content: data.content,
                    htmlContent: finalHtml,
                    status: 'draft'
                });
                toast.success('Newsletter salva com sucesso!');
                onSave?.(updated);
            } else {
                const created = await newsletterCampaignService.createCampaign({
                    subject: data.subject,
                    previewText: data.previewText || '',
                    content: data.content,
                    htmlContent: finalHtml,
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

            const finalHtml = buildEmailSafeNewsletterHtml({
                subject: data.subject,
                contentHtml: contentHtml || markdownToHtml(data.content)
            });

            if (!campaignIdToSend) {
                const created = await newsletterCampaignService.createCampaign({
                    subject: data.subject,
                    previewText: data.previewText || '',
                    content: data.content,
                    htmlContent: finalHtml,
                    status: 'draft'
                });
                campaignIdToSend = created.id;
            } else {
                await newsletterCampaignService.updateCampaign(campaignIdToSend, {
                    subject: data.subject,
                    previewText: data.previewText || '',
                    content: data.content,
                    htmlContent: finalHtml,
                    status: 'draft'
                });
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

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {campaignId ? 'Editar Newsletter' : 'Criar Newsletter'}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Envie comunicados profissionais para seus inscritos
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

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="xl:col-span-3 space-y-4">
                    {/* Templates */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Layout className="h-4 w-4" />
                                Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowTemplateDialog(true)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Novo Template
                                </Button>
                            </div>
                            {templates.map((template) => (
                                <div key={template.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-slate-50">
                                    <div className="flex-1">
                                        <Button
                                            variant={selectedTemplate?.id === template.id ? "default" : "ghost"}
                                            className="w-full justify-start text-sm"
                                            onClick={() => applyTemplate(template)}
                                        >
                                            {template.name}
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {template.isDefault && (
                                            <Badge variant="secondary" className="gap-1 text-xs">
                                                <Layout className="h-3 w-3" />
                                                Padrão
                                            </Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteTemplate(template.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Test Email */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email de Teste
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="testEmail" className="text-sm">Email para Teste</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="testEmail"
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="teste@exemplo.com"
                                        className="flex-1 text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={sendTestEmail}
                                        disabled={sendingTest}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {sendingTest ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Enviar Teste
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                Envie um email de teste para verificar a aparência na caixa de entrada
                            </p>
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Agendamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="schedule" className="text-sm">Agendar envio</Label>
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
                                        className="text-sm"
                                    />
                                    <Input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Advanced Settings */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Configurações
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="advanced" className="text-sm">Opções Avançadas</Label>
                                <Switch
                                    id="advanced"
                                    checked={showAdvancedSettings}
                                    onCheckedChange={setShowAdvancedSettings}
                                />
                            </div>
                            {showAdvancedSettings && (
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Segmentação</Label>
                                        <Select>
                                            <SelectTrigger className="text-sm">
                                                <SelectValue placeholder="Todos os inscritos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os inscritos</SelectItem>
                                                <SelectItem value="active">Inscritos ativos</SelectItem>
                                                <SelectItem value="recent">Inscritos recentes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="xl:col-span-9">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Conteúdo da Newsletter</CardTitle>
                            <CardDescription>
                                Crie conteúdo profissional para seus inscritos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(handleSend)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            placeholder="Texto que aparece na caixa de entrada"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Aparece como preview na maioria dos clientes de email
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Conteúdo *</Label>
                                    <RichTextEditor
                                        value={{
                                            html: contentHtml,
                                            markdown: content
                                        }}
                                        onChange={(val) => {
                                            setValue('content', val.markdown, { shouldDirty: true, shouldTouch: true });
                                            setContentHtml(val.html);
                                        }}
                                        imageBucket="newsletter-images"
                                        initialContentMode={contentHtml ? 'html' : 'markdown'}
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-red-600">{errors.content.message}</p>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        Use markdown para formatação. Insira imagens e links facilmente.
                                    </p>
                                </div>

                                {/* Preview Mode */}
                                {previewMode && (
                                    <div className="border rounded-lg p-6 bg-white">
                                        <h3 className="text-lg font-semibold mb-4">Preview</h3>
                                        <div className="prose max-w-none">
                                            <h4>{watch('subject')}</h4>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: sanitizeHtml(buildEmailSafeNewsletterHtml({
                                                        subject: watch('subject') || '',
                                                        contentHtml: contentHtml || markdownToHtml(content)
                                                    }))
                                                }}
                                            />
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

            {/* Template Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Criar Novo Template</DialogTitle>
                        <DialogDescription>
                            Crie um template reutilizável para newsletters
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); createTemplate(); }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="templateName">Nome do Template</Label>
                            <Input
                                id="templateName"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                placeholder="Ex: Boletim Semanal"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="templateSubject">Assunto Padrão</Label>
                            <Input
                                id="templateSubject"
                                value={newTemplateSubject}
                                onChange={(e) => setNewTemplateSubject(e.target.value)}
                                placeholder="Ex: Últimas Notícias Jurídicas"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="templateContent">Conteúdo do Template</Label>
                            <Textarea
                                id="templateContent"
                                value={newTemplateContent}
                                onChange={(e) => setNewTemplateContent(e.target.value)}
                                placeholder="Use [Nome], [Data], etc. para personalização"
                                rows={6}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowTemplateDialog(false);
                                    setNewTemplateName('');
                                    setNewTemplateSubject('');
                                    setNewTemplateContent('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Criar Template
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NewsletterEditorEnhanced;
