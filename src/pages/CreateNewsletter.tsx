import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterEditorEnhanced from '@/components/NewsletterEditorEnhanced';
import { toast } from 'sonner';

const CreateNewsletter = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const [isEditing, setIsEditing] = useState(!!id);

    const handleSave = (campaign: any) => {
        toast.success('Newsletter salva com sucesso!');
        navigate('/admin/newsletter');
    };

    const handleSend = (campaign: any) => {
        toast.success('Newsletter enviada com sucesso!');
        navigate('/admin/newsletter');
    };

    return (
        <>
            <Helmet>
                <title>
                    {isEditing ? 'Editar Newsletter' : 'Criar Newsletter'} - Admin
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
                                    onClick={() => navigate('/admin/newsletter')}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {isEditing ? 'Editar Newsletter' : 'Criar Nova Newsletter'}
                                    </h1>
                                    <p className="text-slate-600">
                                        {isEditing 
                                            ? 'Edite o conteúdo e configurações da newsletter'
                                            : 'Crie uma nova newsletter para enviar aos seus inscritos'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <NewsletterEditorEnhanced
                    campaignId={id}
                    onSave={handleSave}
                    onSend={handleSend}
                />
            </div>

            <Footer />
        </>
    );
};

export default CreateNewsletter;
