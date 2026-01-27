import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// IMPORTANTE: Em produção, mova estas variáveis para .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Debug: Verificar se as variáveis estão configuradas
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase configured:', supabaseUrl !== 'https://your-project.supabase.co');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Auth helper functions
export const authService = {
    // Sign in with email and password
    async signIn(email: string, password: string) {
        // Debug mode: Allow login with hardcoded credentials for development
        if (supabaseUrl === 'https://your-project.supabase.co') {
            console.log('Modo de desenvolvimento: usando autenticação simulada');
            
            // Simular autenticação para desenvolvimento
            if (email === 'marketing@thalitameloadv.com.br' && password === 'Thalitaadv1!') {
                // Simular sessão de usuário
                const mockUser = {
                    id: 'dev-user-id',
                    email: 'marketing@thalitameloadv.com.br',
                    role: 'admin'
                };
                
                // Salvar no localStorage para persistência
                localStorage.setItem('admin-auth', JSON.stringify({
                    user: mockUser,
                    authenticated: true,
                    timestamp: Date.now()
                }));
                
                return { user: mockUser, session: { user: mockUser } };
            } else {
                throw new Error('Email ou senha incorretos');
            }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        // Debug mode: Clear localStorage
        if (supabaseUrl === 'https://your-project.supabase.co') {
            localStorage.removeItem('admin-auth');
            return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current user
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Check if user is authenticated
    async isAuthenticated() {
        // Debug mode: Check localStorage for simulated auth
        if (supabaseUrl === 'https://your-project.supabase.co') {
            const authData = localStorage.getItem('admin-auth');
            if (authData) {
                const { authenticated, timestamp } = JSON.parse(authData);
                // Considerar autenticação válida por 24 horas
                const isValid = authenticated && (Date.now() - timestamp < 24 * 60 * 60 * 1000);
                return isValid;
            }
            return false;
        }

        const session = await this.getSession();
        return !!session;
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    },

    // Reset password
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) throw error;
    },

    // Update password
    async updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error) throw error;
    }
};
