import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// IMPORTANTE: Em produção, mova estas variáveis para .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Development fallback - permitir execução sem Supabase configurado
if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
        console.warn('⚠️ Development mode: Supabase not configured. Some features will be limited.');
        console.log('📋 Required environment variables:');
        console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ Missing');
        console.log('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗ Missing');
    } else {
        throw new Error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
}

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: import.meta.env.PROD,
        persistSession: true,
        detectSessionInUrl: true
    }
}) : null;

// Auth helper functions
export const authService = {
    // Sign in with email and password
    async signIn(email: string, password: string) {
        if (!supabase) {
            console.warn('⚠️ Supabase not configured in development');
            return { data: { user: null, session: null }, error: null };
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
        if (!supabase) {
            console.warn('⚠️ Supabase not configured in development');
            return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current user
    async getCurrentUser() {
        if (!supabase) {
            console.warn('⚠️ Supabase not configured in development');
            return null;
        }
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    // Get current session
    async getSession() {
        if (!supabase) {
            console.warn('⚠️ Supabase not configured in development');
            return null;
        }
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Check if user is authenticated
    async isAuthenticated() {
        if (!supabase) {
            // Em desenvolvimento com debug, retorna true para bypass
            return import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true';
        }
        const session = await this.getSession();
        return !!session;
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (event: string, session: { user: any } | null) => void) {
        if (!supabase) {
            console.warn('⚠️ Supabase not configured in development');
            // Return mock subscription
            return { data: { subscription: { unsubscribe: () => {} } } };
        }
        return supabase.auth.onAuthStateChange(callback);
    },

    // Reset password
    async resetPassword(email: string) {
        if (!supabase) {
            console.warn('⚠️ Supabase not configured in development');
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) throw error;
    },

    // Update password
    async updatePassword(newPassword: string) {
        if (!supabase) {
            console.warn('⚠️ Supabase not configured in development');
            return;
        }
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error) throw error;
    }
};
