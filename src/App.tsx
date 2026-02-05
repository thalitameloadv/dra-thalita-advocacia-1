import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import React from "react";
import Index from "./pages/Index";
import Calculadoras from "./pages/Calculadoras";
import CalculadoraAposentadoria from "./pages/CalculadoraAposentadoria";
import CalculadoraRescisao from "./pages/CalculadoraRescisao";
import BlogEnhanced from "./pages/BlogEnhanced";
import BlogArticleEnhanced from "./pages/BlogArticleEnhanced";
import BlogAdmin from "./pages/BlogAdmin";
import BlogSEO from "./pages/BlogSEO";
import AdminLogin from "./pages/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import NewsletterAdminEnhanced from "./pages/NewsletterAdminEnhanced";
import CreateNewsletter from "./pages/CreateNewsletter";
import CreateArticleEnhanced from "./pages/CreateArticleEnhanced";

import ErrorBoundaryEnhanced from "./components/ErrorBoundaryEnhanced";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundaryEnhanced>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/calculadoras" element={<Calculadoras />} />
                <Route path="/calculadora-aposentadoria" element={<CalculadoraAposentadoria />} />
                <Route path="/calculadora-rescisao-trabalhista" element={<CalculadoraRescisao />} />

                {/* Blog Routes */}
                <Route path="/blog" element={<BlogEnhanced />} />
                <Route path="/blog/:slug" element={<BlogArticleEnhanced />} />

                {/* Admin Login */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />

                {/* Protected Admin Routes - Blog */}
                {/* Dashboard principal do blog */}
                <Route path="/admin/blog" element={
                  <ProtectedRoute>
                    <BlogAdmin />
                  </ProtectedRoute>
                } />

                {/* Configurações de SEO */}
                <Route path="/admin/blog/seo" element={
                  <ProtectedRoute>
                    <BlogSEO />
                  </ProtectedRoute>
                } />

                {/* Criar novo artigo - DEVE vir antes de rotas com parâmetros */}
                <Route path="/admin/blog/novo" element={
                  <ProtectedRoute>
                    <CreateArticleEnhanced />
                  </ProtectedRoute>
                } />

                {/* Editar artigo existente */}
                <Route path="/admin/blog/editar/:id" element={
                  <ProtectedRoute>
                    <CreateArticleEnhanced />
                  </ProtectedRoute>
                } />

                {/* Protected Admin Routes - Newsletter */}
                {/* Dashboard de gerenciamento de newsletter */}
                <Route path="/admin/newsletter" element={
                  <ProtectedRoute>
                    <NewsletterAdminEnhanced />
                  </ProtectedRoute>
                } />

                {/* Criar nova newsletter */}
                <Route path="/admin/newsletter/criar" element={
                  <ProtectedRoute>
                    <CreateNewsletter />
                  </ProtectedRoute>
                } />

                {/* Editar newsletter existente */}
                <Route path="/admin/newsletter/editar/:id" element={
                  <ProtectedRoute>
                    <CreateNewsletter />
                  </ProtectedRoute>
                } />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundaryEnhanced>
  );
};

export default App;
