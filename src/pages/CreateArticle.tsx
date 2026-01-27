import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleEditor from '@/components/ArticleEditor';
import { BlogPost } from '@/types/blog';
import { toast } from 'sonner';

const CreateArticle = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const [isEditing, setIsEditing] = useState(!!id);

    const handleSave = (article: BlogPost) => {
        toast.success('Artigo salvo com sucesso!');
        navigate('/admin/blog');
    };

    const handlePublish = (article: BlogPost) => {
        toast.success('Artigo publicado com sucesso!');
        navigate('/admin/blog');
    };

    return (
        <>
            <Helmet>
                <title>
                    {isEditing ? 'Editar Artigo' : 'Criar Artigo'} - Admin
                </title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <Header />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
                {/* Header Navigation */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/admin/blog')}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {isEditing ? 'Editar Artigo' : 'Criar Novo Artigo'}
                                    </h1>
                                    <p className="text-slate-600">
                                        {isEditing 
                                            ? 'Edite o conteúdo e configurações do artigo'
                                            : 'Crie um novo artigo para o blog jurídico'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <ArticleEditor
                    articleId={id}
                    onSave={handleSave}
                    onPublish={handlePublish}
                />
            </div>

            <Footer />
        </>
    );
};

export default CreateArticle;
