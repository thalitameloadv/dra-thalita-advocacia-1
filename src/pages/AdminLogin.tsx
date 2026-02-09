import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/lib/supabase';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkAuth = useCallback(async () => {
        try {
            const isAuth = await authService.isAuthenticated();
            if (isAuth) {
                navigate('/admin/blog');
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }, [navigate]);

    useEffect(() => {
        // Check if already authenticated
        checkAuth();
    }, [checkAuth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.signIn(email, password);
            toast.success('Login realizado com sucesso!');
            navigate('/admin/blog');
        } catch (error: unknown) {
            console.error('Login error:', error);
            const message = error instanceof Error ? error.message : undefined;
            setError(message || 'Email ou senha incorretos');
            toast.error('Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Login - Thalita Melo Advocacia</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <img
                            src={logo}
                            alt="Thalita Melo Advocacia"
                            className="h-20 mx-auto mb-4"
                        />
                        <h1 className="text-2xl font-bold text-slate-900">
                            Área Administrativa
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Acesse o painel de controle do blog
                        </p>
                    </div>

                    <Card className="shadow-xl">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center">Login</CardTitle>
                            <CardDescription className="text-center">
                                Entre com suas credenciais de administrador
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="marketing@thalitameloadv.com.br"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 pr-10"
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Entrando...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-4 w-4 mr-2" />
                                            Entrar
                                        </>
                                    )}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (email) {
                                                authService.resetPassword(email);
                                                toast.success('Email de recuperação enviado!');
                                            } else {
                                                toast.error('Digite seu email primeiro');
                                            }
                                        }}
                                        className="text-sm text-navy hover:text-navy/80 hover:underline"
                                    >
                                        Esqueceu sua senha?
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-6">
                        <a
                            href="/"
                            className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                        >
                            ← Voltar para o site
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
