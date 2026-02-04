import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/supabase';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
        .split(',')
        .map((e: string) => e.trim())
        .filter(Boolean);

    // Development bypass - remover em produção
    const isDevelopment = import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true';

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Development bypass
                if (isDevelopment) {
                    console.log('🔓 Development mode: Bypassing authentication');
                    setIsAuthenticated(true);
                    setLoading(false);
                    return;
                }

                const authenticated = await authService.isAuthenticated();
                if (!authenticated) {
                    setIsAuthenticated(false);
                    return;
                }

                if (adminEmails.length === 0) {
                    setIsAuthenticated(true);
                    return;
                }

                const user = await authService.getCurrentUser();
                const email = user?.email ?? '';
                setIsAuthenticated(adminEmails.includes(email));
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Listen to auth changes
        const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
            if (!session) {
                setIsAuthenticated(false);
                return;
            }

            if (adminEmails.length === 0) {
                setIsAuthenticated(true);
                return;
            }

            const email = session.user?.email ?? '';
            setIsAuthenticated(adminEmails.includes(email));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [adminEmails, isDevelopment]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
                    <p className="text-slate-600">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
