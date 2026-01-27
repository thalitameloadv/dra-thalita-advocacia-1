import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Calculadoras from "./pages/Calculadoras";
import CalculadoraAposentadoria from "./pages/CalculadoraAposentadoria";
import CalculadoraRescisao from "./pages/CalculadoraRescisao";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import BlogAdmin from "./pages/BlogAdmin";
import BlogEditor from "./pages/BlogEditor";
import BlogSEO from "./pages/BlogSEO";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import NewsletterAdmin from "./pages/NewsletterAdmin";
import CreateNewsletter from "./pages/CreateNewsletter";
import CreateArticle from "./pages/CreateArticle";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route path="/admin/blog" element={
              <ProtectedRoute>
                <BlogAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/blog/seo" element={
              <ProtectedRoute>
                <BlogSEO />
              </ProtectedRoute>
            } />
            <Route path="/admin/blog/:id" element={
              <ProtectedRoute>
                <BlogEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/blog/novo" element={
              <ProtectedRoute>
                <CreateArticle />
              </ProtectedRoute>
            } />
            <Route path="/admin/blog/editar/:id" element={
              <ProtectedRoute>
                <CreateArticle />
              </ProtectedRoute>
            } />

            {/* Newsletter Admin Routes */}
            <Route path="/admin/newsletter" element={
              <ProtectedRoute>
                <NewsletterAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/newsletter/criar" element={
              <ProtectedRoute>
                <CreateNewsletter />
              </ProtectedRoute>
            } />
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
);

export default App;
