-- =====================================================
-- TABELA DE IMAGENS ENVIADAS (OPCIONAL)
-- =====================================================
-- Esta tabela armazena metadados das imagens enviadas
-- para o blog. É OPCIONAL - o upload funcionará mesmo
-- sem esta tabela.
-- =====================================================
-- Criar tabela de imagens
CREATE TABLE IF NOT EXISTS uploaded_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_uploaded_images_bucket ON uploaded_images(bucket);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at ON uploaded_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_type ON uploaded_images(type);
-- Habilitar RLS (Row Level Security)
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;
-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================
-- Política para permitir inserção de imagens (apenas usuários autenticados)
DROP POLICY IF EXISTS "Usuários autenticados podem inserir imagens" ON uploaded_images;
CREATE POLICY "Usuários autenticados podem inserir imagens" ON uploaded_images FOR
INSERT TO authenticated WITH CHECK (true);
-- Política para permitir leitura de imagens (todos podem ver)
DROP POLICY IF EXISTS "Todos podem ver imagens" ON uploaded_images;
CREATE POLICY "Todos podem ver imagens" ON uploaded_images FOR
SELECT TO public USING (true);
-- Política para permitir atualização de imagens (apenas usuários autenticados)
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar imagens" ON uploaded_images;
CREATE POLICY "Usuários autenticados podem atualizar imagens" ON uploaded_images FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
-- Política para permitir exclusão de imagens (apenas usuários autenticados)
DROP POLICY IF EXISTS "Usuários autenticados podem deletar imagens" ON uploaded_images;
CREATE POLICY "Usuários autenticados podem deletar imagens" ON uploaded_images FOR DELETE TO authenticated USING (true);
-- =====================================================
-- FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =====================================================
-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_uploaded_images_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_uploaded_images_updated_at ON uploaded_images;
CREATE TRIGGER trigger_update_uploaded_images_updated_at BEFORE
UPDATE ON uploaded_images FOR EACH ROW EXECUTE FUNCTION update_uploaded_images_updated_at();
-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE uploaded_images IS 'Armazena metadados das imagens enviadas para o blog';
COMMENT ON COLUMN uploaded_images.id IS 'ID único da imagem';
COMMENT ON COLUMN uploaded_images.name IS 'Nome original do arquivo';
COMMENT ON COLUMN uploaded_images.url IS 'URL pública da imagem no Supabase Storage';
COMMENT ON COLUMN uploaded_images.size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN uploaded_images.type IS 'Tipo MIME da imagem (ex: image/jpeg)';
COMMENT ON COLUMN uploaded_images.bucket IS 'Nome do bucket no Supabase Storage';
COMMENT ON COLUMN uploaded_images.path IS 'Caminho completo da imagem no bucket';
COMMENT ON COLUMN uploaded_images.created_at IS 'Data e hora de criação';
COMMENT ON COLUMN uploaded_images.updated_at IS 'Data e hora da última atualização';