import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    Plus,
    Edit,
    Trash2,
    Send,
    Users,
    TrendingUp,
    Eye,
    MousePointer,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    BarChart3,
    FileText,
    Settings,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { newsletterService } from '@/services/newsletterService';
import { authService } from '@/lib/supabase';
import { NewsletterSubscriber } from '@/types/blog';
import { toast } from 'sonner';

const NewsletterAdmin = () => {
    const navigate = useNavigate();
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'unsubscribed'>('all');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newNewsletter, setNewNewsletter] = useState({
        subject: '',
        content: '',
        previewText: ''
    });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [subscribersData, statsData] = await Promise.all([
                newsletterService.getSubscribers(),
                newsletterService.getSubscriberStats()
            ]);

            setSubscribers(subscribersData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubscriber = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este inscrito?')) return;

        try {
            await newsletterService.deleteSubscriber(id);
            setSubscribers(subscribers.filter(s => s.id !== id));
            toast.success('Inscrito excluído com sucesso');
            loadData();
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            toast.error('Erro ao excluir inscrito');
        }
    };

    const handleUnsubscribe = async (email: string) => {
        if (!confirm('Tem certeza que deseja cancelar a inscrição deste email?')) return;

        try {
            await newsletterService.unsubscribe(email);
            toast.success('Inscrição cancelada com sucesso');
            loadData();
        } catch (error) {
            console.error('Error unsubscribing:', error);
            toast.error('Erro ao cancelar inscrição');
        }
    };

    const handleSendNewsletter = async () => {
        if (!newNewsletter.subject || !newNewsletter.content) {
            toast.error('Preencha todos os campos');
            return;
        }

        try {
            setSending(true);
            
            // Simulate sending newsletter
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            toast.success('Newsletter enviada com sucesso!');
            setShowCreateDialog(false);
            setNewNewsletter({ subject: '', content: '', previewText: '' });
        } catch (error) {
            console.error('Error sending newsletter:', error);
            toast.error('Erro ao enviar newsletter');
        } finally {
            setSending(false);
        }
    };

    const handleExportSubscribers = async (format: 'csv' | 'json') => {
        try {
            const data = await newsletterService.exportSubscribers(format);
            
            // Create download link
            const blob = new Blob([data], { 
                type: format === 'json' ? 'application/json' : 'text/csv' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `subscribers.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success(`Lista exportada como ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Error exporting:', error);
            toast.error('Erro ao exportar lista');
        }
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            toast.success('Logout realizado com sucesso');
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Erro ao fazer logout');
        }
    };

    const filteredSubscribers = subscribers.filter(subscriber => {
        const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'unsubscribed':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            active: 'default',
            pending: 'secondary',
            unsubscribed: 'destructive'
        };

        const labels: Record<string, string> = {
            active: 'Ativo',
            pending: 'Pendente',
            unsubscribed: 'Cancelado'
        };

        return (
            <Badge variant={variants[status] || 'default'}>
                {labels[status] || status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
                    <p className="mt-4 text-slate-600">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Admin - Newsletter Dashboard</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    Dashboard da Newsletter
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    Gerencie inscritos e campanhas de email
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" className="gap-2">
                                            <Plus className="h-5 w-5" />
                                            Nova Newsletter
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Criar Nova Newsletter</DialogTitle>
                                            <DialogDescription>
                                                Envie uma newsletter para todos os inscritos ativos
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="subject">Assunto</Label>
                                                <Input
                                                    id="subject"
                                                    value={newNewsletter.subject}
                                                    onChange={(e) => setNewNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                                                    placeholder="Assunto da newsletter"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="preview">Texto de Preview</Label>
                                                <Input
                                                    id="preview"
                                                    value={newNewsletter.previewText}
                                                    onChange={(e) => setNewNewsletter(prev => ({ ...prev, previewText: e.target.value }))}
                                                    placeholder="Texto que aparece na caixa de entrada"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="content">Conteúdo</Label>
                                                <Textarea
                                                    id="content"
                                                    value={newNewsletter.content}
                                                    onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                                                    placeholder="Conteúdo da newsletter (HTML permitido)"
                                                    rows={10}
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-4">
                                                <Button 
                                                    onClick={handleSendNewsletter} 
                                                    disabled={sending}
                                                    className="flex-1"
                                                >
                                                    {sending ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Enviando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4 mr-2" />
                                                            Enviar Newsletter
                                                        </>
                                                    )}
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => setShowCreateDialog(false)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleLogout}
                                    className="gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                            <TabsTrigger value="subscribers">Inscritos</TabsTrigger>
                            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Total de Inscritos
                                        </CardTitle>
                                        <Users className="h-4 w-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {stats?.total || 0}
                                        </div>
                                        <p className="text-xs text-green-600 mt-1 flex items-center">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            +{stats?.growthRate || 0}% este mês
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Inscritos Ativos
                                        </CardTitle>
                                        <CheckCircle className="h-4 w-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {stats?.active || 0}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {stats?.pending || 0} pendentes
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Taxa de Abertura
                                        </CardTitle>
                                        <Eye className="h-4 w-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            68%
                                        </div>
                                        <p className="text-xs text-green-600 mt-1 flex items-center">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            +5% este mês
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Taxa de Cliques
                                        </CardTitle>
                                        <MousePointer className="h-4 w-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            12%
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Média das campanhas
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ações Rápidas</CardTitle>
                                    <CardDescription>
                                        Operações comuns de newsletter
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex-col gap-2"
                                            onClick={() => setShowCreateDialog(true)}
                                        >
                                            <Mail className="h-6 w-6" />
                                            <span>Enviar Newsletter</span>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex-col gap-2"
                                            onClick={() => handleExportSubscribers('csv')}
                                        >
                                            <Download className="h-6 w-6" />
                                            <span>Exportar CSV</span>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-20 flex-col gap-2"
                                            onClick={() => navigate('/admin/blog')}
                                        >
                                            <FileText className="h-6 w-6" />
                                            <span>Ver Blog</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Subscribers Tab */}
                        <TabsContent value="subscribers" className="space-y-6">
                            {/* Filters */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                            <Input
                                                placeholder="Buscar inscritos..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>

                                        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os Status</SelectItem>
                                                <SelectItem value="active">Ativos</SelectItem>
                                                <SelectItem value="pending">Pendentes</SelectItem>
                                                <SelectItem value="unsubscribed">Cancelados</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button variant="outline" onClick={() => handleExportSubscribers('csv')}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Exportar CSV
                                        </Button>

                                        <Button variant="outline" onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('all');
                                        }}>
                                            Limpar Filtros
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subscribers Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Todos os Inscritos</CardTitle>
                                    <CardDescription>
                                        {filteredSubscribers.length} inscrito(s) encontrado(s)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Fonte</TableHead>
                                                <TableHead>Data de Inscrição</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSubscribers.map((subscriber) => (
                                                <TableRow key={subscriber.id}>
                                                    <TableCell className="font-medium">
                                                        {subscriber.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {subscriber.name || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(subscriber.status)}
                                                            {getStatusBadge(subscriber.status)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{subscriber.source}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {formatDate(subscriber.subscribedAt)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                {subscriber.status === 'active' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleUnsubscribe(subscriber.email)}
                                                                        className="text-red-600"
                                                                    >
                                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                                        Cancelar Inscrição
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Campaigns Tab */}
                        <TabsContent value="campaigns" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Campanhas de Newsletter</CardTitle>
                                    <CardDescription>
                                        Histórico de campanhas enviadas
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 mb-4">
                                            Nenhuma campanha enviada ainda
                                        </p>
                                        <Button onClick={() => setShowCreateDialog(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Criar Primeira Campanha
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Analytics da Newsletter</CardTitle>
                                    <CardDescription>
                                        Métricas detalhadas de engajamento
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 mb-4">
                                            Analytics em desenvolvimento
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Em breve: taxas de abertura, cliques, conversões e mais
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default NewsletterAdmin;
