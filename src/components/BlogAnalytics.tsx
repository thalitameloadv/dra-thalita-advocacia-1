import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Eye,
    Heart,
    MessageCircle,
    Users,
    Clock,
    Calendar,
    MousePointer,
    Smartphone,
    Monitor,
    Tablet,
    Search,
    Share2,
    Activity,
    Zap,
    Target,
    Globe,
    Download,
    RefreshCw,
    Filter,
    ChevronDown,
    ChevronUp,
    Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { blogAnalyticsService, BlogAnalyticsData } from '@/services/blogAnalyticsService';
import { toast } from 'sonner';

const BlogAnalytics = () => {
    const [analytics, setAnalytics] = useState<BlogAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('30d');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await blogAnalyticsService.getComprehensiveAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Erro ao carregar analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await loadAnalytics();
            toast.success('Dados atualizados com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar dados');
        } finally {
            setRefreshing(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatPercentage = (num: number) => {
        return num.toFixed(1) + '%';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Nenhum dado de analytics disponível</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Analytics Detalhado</h2>
                    <p className="text-slate-600">Métricas e insights completos do blog</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Últimos 7 dias</SelectItem>
                            <SelectItem value="30d">Últimos 30 dias</SelectItem>
                            <SelectItem value="90d">Últimos 90 dias</SelectItem>
                            <SelectItem value="1y">Último ano</SelectItem>
                            <SelectItem value="all">Todo período</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
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
                            {analytics.totalPosts}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                            <span>{analytics.publishedPosts} publicados</span>
                            <span>{analytics.draftPosts} rascunhos</span>
                        </div>
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
                            {formatNumber(analytics.totalViews)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                            <TrendingUp className="h-3 w-3" />
                            <span>+12.5% este mês</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Engajamento
                        </CardTitle>
                        <Heart className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {formatNumber(analytics.totalLikes)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                            <span>{formatNumber(analytics.totalLikes)} curtidas</span>
                            <span>{formatNumber(analytics.totalComments)} comentários</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Tempo Médio de Leitura
                        </CardTitle>
                        <Clock className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {Math.round(analytics.averageReadingTime)}min
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                            <span>Por artigo</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="audience">Audiência</TabsTrigger>
                    <TabsTrigger value="engagement">Engajamento</TabsTrigger>
                    <TabsTrigger value="traffic">Tráfego</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Posts by Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Artigos por Categoria</CardTitle>
                                <CardDescription>
                                    Distribuição de conteúdo por categorias
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics.postsByCategory.map((category, index) => (
                                        <div key={category.category} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{category.category}</span>
                                                <span className="text-sm text-slate-500">{category.count} artigos</span>
                                            </div>
                                            <Progress value={(category.count / analytics.totalPosts) * 100} className="h-2" />
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>{formatNumber(category.views)} visualizações</span>
                                                <span>{formatNumber(category.likes)} curtidas</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Posts by Month */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Publicações por Mês</CardTitle>
                                <CardDescription>
                                    Frequência de publicação nos últimos meses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics.postsByMonth.map((month) => (
                                        <div key={month.month} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {new Date(month.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                                </span>
                                                <span className="text-sm text-slate-500">{month.posts} artigos</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>{formatNumber(month.views)} views</span>
                                                <span>{formatNumber(month.likes)} curtidas</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Engagement Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Métricas de Engajamento</CardTitle>
                            <CardDescription>
                                Indicadores de performance e engajamento
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900">
                                        {formatNumber(analytics.engagementMetrics.averageViewsPerPost)}
                                    </div>
                                    <p className="text-sm text-slate-600">Views Médias por Artigo</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900">
                                        {formatPercentage(analytics.engagementMetrics.likeToViewRatio)}
                                    </div>
                                    <p className="text-sm text-slate-600">Taxa de Curtidas</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900">
                                        {analytics.engagementMetrics.engagementScore.toFixed(1)}
                                    </div>
                                    <p className="text-sm text-slate-600">Score de Engajamento</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                    {/* Top Performing Posts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Artigos Mais Populares</CardTitle>
                            <CardDescription>
                                Top 10 artigos com melhor performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics.topPerformingPosts.map((post, index) => (
                                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900">{post.title}</h4>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                    <Badge variant="outline">{post.category}</Badge>
                                                    <span>{post.readingTime} min de leitura</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-4 w-4" />
                                                    {formatNumber(post.views)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Heart className="h-4 w-4" />
                                                    {formatNumber(post.likes)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="h-4 w-4" />
                                                    {post.comments}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Atividade Recente</CardTitle>
                            <CardDescription>
                                Últimas atividades no blog
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                activity.type === 'post_published' ? 'bg-green-500' :
                                                activity.type === 'comment_added' ? 'bg-blue-500' :
                                                activity.type === 'post_updated' ? 'bg-yellow-500' :
                                                'bg-slate-500'
                                            }`} />
                                            <div>
                                                <p className="font-medium text-slate-900">{activity.title}</p>
                                                <p className="text-sm text-slate-500">por {activity.author}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">
                                                {new Date(activity.timestamp).toLocaleDateString('pt-BR')}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Audience Tab */}
                <TabsContent value="audience" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* New vs Returning */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Novos vs. Recorrentes</CardTitle>
                                <CardDescription>
                                    Distribuição de visitantes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Novos Visitantes</span>
                                            <span className="text-sm text-slate-500">{analytics.readerDemographics.newVsReturning.new}%</span>
                                        </div>
                                        <Progress value={analytics.readerDemographics.newVsReturning.new} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Visitantes Recorrentes</span>
                                            <span className="text-sm text-slate-500">{analytics.readerDemographics.newVsReturning.returning}%</span>
                                        </div>
                                        <Progress value={analytics.readerDemographics.newVsReturning.returning} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Devices */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Dispositivos</CardTitle>
                                <CardDescription>
                                    Acesso por tipo de dispositivo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                <Monitor className="h-4 w-4" />
                                                Desktop
                                            </span>
                                            <span className="text-sm text-slate-500">{analytics.readerDemographics.devices.desktop}%</span>
                                        </div>
                                        <Progress value={analytics.readerDemographics.devices.desktop} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                <Smartphone className="h-4 w-4" />
                                                Mobile
                                            </span>
                                            <span className="text-sm text-slate-500">{analytics.readerDemographics.devices.mobile}%</span>
                                        </div>
                                        <Progress value={analytics.readerDemographics.devices.mobile} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                <Tablet className="h-4 w-4" />
                                                Tablet
                                            </span>
                                            <span className="text-sm text-slate-500">{analytics.readerDemographics.devices.tablet}%</span>
                                        </div>
                                        <Progress value={analytics.readerDemographics.devices.tablet} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Browsers */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Navegadores</CardTitle>
                                <CardDescription>
                                    Principais navegadores utilizados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {analytics.readerDemographics.browsers.map((browser) => (
                                        <div key={browser.browser} className="text-center">
                                            <div className="text-2xl font-bold text-slate-900">
                                                {formatPercentage(browser.percentage)}
                                            </div>
                                            <p className="text-sm text-slate-600">{browser.browser}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Engagement Tab */}
                <TabsContent value="engagement" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5" />
                                    Curtidas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900">
                                        {formatNumber(analytics.totalLikes)}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">Total de curtidas</p>
                                    <div className="mt-4">
                                        <p className="text-xs text-slate-500">
                                            {formatNumber(analytics.engagementMetrics.averageLikesPerPost)} por artigo
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    Comentários
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900">
                                        {formatNumber(analytics.totalComments)}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">Total de comentários</p>
                                    <div className="mt-4">
                                        <p className="text-xs text-slate-500">
                                            {formatNumber(analytics.engagementMetrics.averageCommentsPerPost)} por artigo
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Taxa de Engajamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-900">
                                        {formatPercentage(analytics.engagementMetrics.likeToViewRatio)}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">Curtidas por visualização</p>
                                    <div className="mt-4">
                                        <p className="text-xs text-slate-500">
                                            Score: {analytics.engagementMetrics.engagementScore.toFixed(1)}/10
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Traffic Tab */}
                <TabsContent value="traffic" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fontes de Tráfego</CardTitle>
                            <CardDescription>
                                Origem dos visitantes do blog
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics.trafficSources.map((source) => (
                                    <div key={source.source} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                {source.source === 'Organic Search' && <Search className="h-4 w-4" />}
                                                {source.source === 'Direct' && <Globe className="h-4 w-4" />}
                                                {source.source === 'Social Media' && <Share2 className="h-4 w-4" />}
                                                {source.source === 'Referral' && <Users className="h-4 w-4" />}
                                                {source.source}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {formatNumber(source.visits)} ({formatPercentage(source.percentage)})
                                            </span>
                                        </div>
                                        <Progress value={source.percentage} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BlogAnalytics;
