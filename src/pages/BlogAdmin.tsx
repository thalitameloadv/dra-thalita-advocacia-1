import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Eye,
    Heart,
    TrendingUp,
    Users,
    Mail,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Clock,
    Archive,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogAnalytics from '@/components/BlogAnalytics';
import { blogService } from '@/services/blogService';
import { newsletterService } from '@/services/newsletterService';
import { authService } from '@/lib/supabase';
import { BlogPost, BlogAnalytics } from '@/types/blog';
import { toast } from 'sonner';

const BlogAdmin = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [analytics, setAnalytics] = useState<BlogAnalytics | null>(null);
    const [subscriberStats, setSubscriberStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [postsData, analyticsData, statsData] = await Promise.all([
                blogService.getPosts(),
                blogService.getAnalytics(),
                newsletterService.getSubscriberStats()
            ]);

            setPosts(postsData);
            setAnalytics(analyticsData);
            setSubscriberStats(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

        try {
            await blogService.deletePost(id);
            setPosts(posts.filter(p => p.id !== id));
            toast.success('Artigo excluído com sucesso');
            loadData(); // Reload analytics
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Erro ao excluir artigo');
        }
    };

    const handleChangeStatus = async (id: string, status: 'draft' | 'published' | 'archived') => {
        try {
            await blogService.updatePost(id, { status });
            setPosts(posts.map(p => p.id === id ? { ...p, status } : p));
            toast.success('Status atualizado com sucesso');
            loadData(); // Reload analytics
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erro ao atualizar status');
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

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'draft':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'archived':
                return <Archive className="h-4 w-4 text-slate-600" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            published: 'default',
            draft: 'secondary',
            archived: 'outline'
        };

        const labels: Record<string, string> = {
            published: 'Publicado',
            draft: 'Rascunho',
            archived: 'Arquivado'
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
                <title>Admin - Blog Dashboard</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    Dashboard do Blog
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    Gerencie artigos, newsletter e analytics
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to="/admin/blog/novo">
                                    <Button size="lg" className="gap-2">
                                        <Plus className="h-5 w-5" />
                                        Novo Artigo
                                    </Button>
                                </Link>
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
                            <TabsTrigger value="posts">Artigos</TabsTrigger>
                            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Total de Artigos
                                        </CardTitle>
                                        <FileText className="h-4 w-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {analytics?.totalPosts || 0}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {analytics?.publishedPosts || 0} publicados
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Visualizações
                                        </CardTitle>
                                        <Eye className="h-4 w-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {analytics?.totalViews.toLocaleString() || 0}
                                        </div>
                                        <p className="text-xs text-green-600 mt-1 flex items-center">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            +12% este mês
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Curtidas
                                        </CardTitle>
                                        <Heart className="h-4 w-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {analytics?.totalLikes.toLocaleString() || 0}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Engajamento total
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Inscritos
                                        </CardTitle>
                                        <Users className="h-4 w-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {subscriberStats?.active || 0}
                                        </div>
                                        <p className="text-xs text-green-600 mt-1 flex items-center">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            +{subscriberStats?.growthRate || 0}% este mês
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Top Posts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Artigos Mais Populares</CardTitle>
                                    <CardDescription>
                                        Top 5 artigos por visualizações
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics?.topPosts.map((post, index) => (
                                            <div key={post.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{post.title}</p>
                                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                            <span className="flex items-center">
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                {post.views}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Heart className="h-3 w-3 mr-1" />
                                                                {post.likes}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link to={`/admin/blog/editar/${post.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Posts Tab */}
                        <TabsContent value="posts" className="space-y-6">
                            {/* Filters */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                            <Input
                                                placeholder="Buscar artigos..."
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
                                                <SelectItem value="published">Publicados</SelectItem>
                                                <SelectItem value="draft">Rascunhos</SelectItem>
                                                <SelectItem value="archived">Arquivados</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button variant="outline" onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('all');
                                        }}>
                                            Limpar Filtros
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Posts Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Todos os Artigos</CardTitle>
                                    <CardDescription>
                                        {filteredPosts.length} artigo(s) encontrado(s)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Título</TableHead>
                                                <TableHead>Categoria</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Data</TableHead>
                                                <TableHead className="text-center">Views</TableHead>
                                                <TableHead className="text-center">Likes</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPosts.map((post) => (
                                                <TableRow key={post.id}>
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <p className="text-slate-900">{post.title}</p>
                                                            <p className="text-sm text-slate-500 line-clamp-1">
                                                                {post.excerpt}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{post.category}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(post.status)}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {formatDate(post.publishedAt)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {post.views}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {post.likes}
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
                                                                <DropdownMenuItem asChild>
                                                                    <Link to={`/blog/${post.slug}`}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        Visualizar
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link to={`/admin/blog/editar/${post.id}`}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Editar
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {post.status !== 'published' && (
                                                                    <DropdownMenuItem onClick={() => handleChangeStatus(post.id, 'published')}>
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Publicar
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {post.status !== 'draft' && (
                                                                    <DropdownMenuItem onClick={() => handleChangeStatus(post.id, 'draft')}>
                                                                        <Clock className="h-4 w-4 mr-2" />
                                                                        Mover para Rascunho
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {post.status !== 'archived' && (
                                                                    <DropdownMenuItem onClick={() => handleChangeStatus(post.id, 'archived')}>
                                                                        <Archive className="h-4 w-4 mr-2" />
                                                                        Arquivar
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeletePost(post.id)}
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

                        {/* Newsletter Tab */}
                        <TabsContent value="newsletter" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Newsletter</CardTitle>
                                    <CardDescription>
                                        Gerencie inscritos e envie newsletters
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Link to="/admin/newsletter">
                                                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                                    <Mail className="h-6 w-6" />
                                                    <span>Gerenciar Newsletter</span>
                                                </Button>
                                            </Link>
                                            <Link to="/admin/newsletter/criar">
                                                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                                    <Plus className="h-6 w-6" />
                                                    <span>Criar Newsletter</span>
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="text-center pt-4">
                                            <Link to="/admin/newsletter">
                                                <Button>
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Acessar Newsletter
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="space-y-6">
                            <BlogAnalytics />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default BlogAdmin;
