import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Mail,
    Eye,
    MousePointer,
    Calendar,
    Globe,
    Clock,
    Target,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface NewsletterAnalyticsProps {
    subscriberCount?: number;
}

interface AnalyticsData {
    subscriberGrowth: { month: string; count: number }[];
    emailPerformance: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        unsubscribed: number;
    };
    engagementRates: {
        openRate: number;
        clickRate: number;
        clickToOpenRate: number;
        bounceRate: number;
        unsubscribeRate: number;
    };
    topPerformingCampaigns: {
        id: string;
        subject: string;
        sentDate: string;
        openRate: number;
        clickRate: number;
    }[];
    deviceStats: {
        desktop: number;
        mobile: number;
        tablet: number;
    };
    timeStats: {
        hour: string;
        opens: number;
    }[];
    geographicData: {
        country: string;
        subscribers: number;
        percentage: number;
    }[];
}

const NewsletterAnalytics = ({ subscriberCount = 0 }: NewsletterAnalyticsProps) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        subscriberGrowth: [
            { month: 'Jan', count: 120 },
            { month: 'Fev', count: 185 },
            { month: 'Mar', count: 245 },
            { month: 'Abr', count: 320 },
            { month: 'Mai', count: 410 },
            { month: 'Jun', count: 520 }
        ],
        emailPerformance: {
            sent: 5420,
            delivered: 5350,
            opened: 3640,
            clicked: 650,
            bounced: 70,
            unsubscribed: 45
        },
        engagementRates: {
            openRate: 68.0,
            clickRate: 12.0,
            clickToOpenRate: 17.9,
            bounceRate: 1.3,
            unsubscribeRate: 0.8
        },
        topPerformingCampaigns: [
            {
                id: '1',
                subject: 'Novidades em Direito Trabalhista - Maio 2026',
                sentDate: '2026-05-15',
                openRate: 75.2,
                clickRate: 18.5
            },
            {
                id: '2',
                subject: 'Guia Completo: Direitos na Rescisão',
                sentDate: '2026-05-08',
                openRate: 72.8,
                clickRate: 16.3
            },
            {
                id: '3',
                subject: 'Reforma Trabalhista: O que Mudou?',
                sentDate: '2026-04-22',
                openRate: 69.5,
                clickRate: 14.7
            }
        ],
        deviceStats: {
            desktop: 45,
            mobile: 48,
            tablet: 7
        },
        timeStats: [
            { hour: '00h', opens: 12 },
            { hour: '04h', opens: 8 },
            { hour: '08h', opens: 145 },
            { hour: '12h', opens: 210 },
            { hour: '16h', opens: 180 },
            { hour: '20h', opens: 95 }
        ],
        geographicData: [
            { country: 'Brasil', subscribers: 450, percentage: 86.5 },
            { country: 'Portugal', subscribers: 35, percentage: 6.7 },
            { country: 'Estados Unidos', subscribers: 20, percentage: 3.8 },
            { country: 'Outros', subscribers: 15, percentage: 2.9 }
        ]
    });

    useEffect(() => {
        // Simulate loading analytics data
        const loadAnalytics = async () => {
            setLoading(true);
            // In production, fetch real data from Supabase
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
        };

        loadAnalytics();
    }, [timeRange]);

    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
    const formatNumber = (value: number) => value.toLocaleString('pt-BR');

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) {
            return <TrendingUp className="h-4 w-4 text-green-600" />;
        }
        return <TrendingDown className="h-4 w-4 text-red-600" />;
    };

    const getTrendColor = (current: number, previous: number) => {
        return current > previous ? 'text-green-600' : 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
                    <p className="mt-4 text-slate-600">Carregando analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Time Range Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Analytics da Newsletter</h2>
                    <p className="text-slate-600 mt-1">Métricas detalhadas de engajamento e performance</p>
                </div>
                <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Últimos 7 dias</SelectItem>
                        <SelectItem value="30d">Últimos 30 dias</SelectItem>
                        <SelectItem value="90d">Últimos 90 dias</SelectItem>
                        <SelectItem value="1y">Último ano</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Taxa de Abertura
                        </CardTitle>
                        <Eye className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {formatPercentage(analyticsData.engagementRates.openRate)}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <p className="text-xs text-green-600">
                                +5.2% vs período anterior
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Taxa de Cliques
                        </CardTitle>
                        <MousePointer className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {formatPercentage(analyticsData.engagementRates.clickRate)}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <p className="text-xs text-green-600">
                                +2.8% vs período anterior
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Emails Enviados
                        </CardTitle>
                        <Mail className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {formatNumber(analyticsData.emailPerformance.sent)}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {formatNumber(analyticsData.emailPerformance.delivered)} entregues
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Taxa de Rejeição
                        </CardTitle>
                        <Activity className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {formatPercentage(analyticsData.engagementRates.bounceRate)}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingDown className="h-3 w-3 text-green-600" />
                            <p className="text-xs text-green-600">
                                -0.5% vs período anterior
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Subscriber Growth Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Crescimento de Inscritos
                    </CardTitle>
                    <CardDescription>
                        Evolução do número de inscritos ao longo do tempo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analyticsData.subscriberGrowth.map((data, index) => {
                            const maxCount = Math.max(...analyticsData.subscriberGrowth.map(d => d.count));
                            const percentage = (data.count / maxCount) * 100;

                            return (
                                <div key={data.month} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">{data.month}</span>
                                        <span className="text-slate-900 font-semibold">{formatNumber(data.count)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Email Performance & Device Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Performance Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Performance de Emails
                        </CardTitle>
                        <CardDescription>
                            Detalhamento de entrega e engajamento
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Enviados</p>
                                    <p className="text-xs text-slate-500">Total de emails</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-900">
                                {formatNumber(analyticsData.emailPerformance.sent)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Eye className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Abertos</p>
                                    <p className="text-xs text-slate-500">
                                        {formatPercentage(analyticsData.engagementRates.openRate)} dos entregues
                                    </p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-900">
                                {formatNumber(analyticsData.emailPerformance.opened)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <MousePointer className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Cliques</p>
                                    <p className="text-xs text-slate-500">
                                        {formatPercentage(analyticsData.engagementRates.clickRate)} dos entregues
                                    </p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-900">
                                {formatNumber(analyticsData.emailPerformance.clicked)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Rejeitados</p>
                                    <p className="text-xs text-slate-500">
                                        {formatPercentage(analyticsData.engagementRates.bounceRate)} dos enviados
                                    </p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-900">
                                {formatNumber(analyticsData.emailPerformance.bounced)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Device & Geographic Stats */}
                <div className="space-y-6">
                    {/* Device Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Dispositivos
                            </CardTitle>
                            <CardDescription>
                                Distribuição por tipo de dispositivo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    <span className="text-sm text-slate-700">Desktop</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900">
                                    {analyticsData.deviceStats.desktop}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-full rounded-full"
                                    style={{ width: `${analyticsData.deviceStats.desktop}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    <span className="text-sm text-slate-700">Mobile</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900">
                                    {analyticsData.deviceStats.mobile}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-full rounded-full"
                                    style={{ width: `${analyticsData.deviceStats.mobile}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                                    <span className="text-sm text-slate-700">Tablet</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900">
                                    {analyticsData.deviceStats.tablet}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-purple-500 h-full rounded-full"
                                    style={{ width: `${analyticsData.deviceStats.tablet}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Geographic Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Distribuição Geográfica
                            </CardTitle>
                            <CardDescription>
                                Inscritos por país
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analyticsData.geographicData.map((country) => (
                                <div key={country.country} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-700">
                                                {country.country}
                                            </span>
                                            <span className="text-sm text-slate-600">
                                                {formatNumber(country.subscribers)} ({formatPercentage(country.percentage)})
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                                                style={{ width: `${country.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Top Performing Campaigns */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Campanhas com Melhor Performance
                    </CardTitle>
                    <CardDescription>
                        Top 3 newsletters com maior engajamento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analyticsData.topPerformingCampaigns.map((campaign, index) => (
                            <div
                                key={campaign.id}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{campaign.subject}</h4>
                                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(campaign.sentDate).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-slate-600">Taxa de Abertura</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatPercentage(campaign.openRate)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-600">Taxa de Cliques</p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {formatPercentage(campaign.clickRate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Best Time to Send */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Melhor Horário para Envio
                    </CardTitle>
                    <CardDescription>
                        Horários com maior taxa de abertura
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {analyticsData.timeStats.map((stat) => {
                            const maxOpens = Math.max(...analyticsData.timeStats.map(s => s.opens));
                            const percentage = (stat.opens / maxOpens) * 100;

                            return (
                                <div key={stat.hour} className="text-center">
                                    <div className="mb-2">
                                        <div
                                            className="mx-auto bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300"
                                            style={{
                                                height: `${Math.max(percentage, 10)}px`,
                                                maxHeight: '120px'
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-slate-700">{stat.hour}</p>
                                    <p className="text-xs text-slate-500">{stat.opens} aberturas</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <strong>Recomendação:</strong> Os melhores horários para envio são entre 12h e 16h,
                            quando há maior engajamento dos inscritos.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewsletterAnalytics;
