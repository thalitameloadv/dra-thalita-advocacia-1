-- Fix for blog_categories icon column
-- This script adds the icon column if it doesn't exist and then inserts the categories

-- Add icon column if it doesn't exist
ALTER TABLE blog_categories 
ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

-- Insert default blog categories (only if they don't exist)
INSERT INTO blog_categories (name, slug, description, color, icon) VALUES
('Direito Civil', 'direito-civil', 'Artigos sobre direito civil, contratos, obrigações e responsabilidade civil', '#2563eb', 'scale'),
('Direito Trabalhista', 'direito-trabalhista', 'Conteúdo sobre direito do trabalho, CLT, processos trabalhistas', '#dc2626', 'briefcase'),
('Direito Empresarial', 'direito-empresarial', 'Artigos sobre direito empresarial, sociedades, contratos comerciais', '#059669', 'building'),
('Direito de Família', 'direito-familia', 'Conteúdo sobre direito de família, divórcio, guarda, pensão alimentícia', '#7c3aed', 'users'),
('Direito Tributário', 'direito-tributario', 'Artigos sobre tributos, fiscalização, planejamento tributário', '#ea580c', 'calculator'),
('Direito Previdenciário', 'direito-previdenciario', 'Conteúdo sobre INSS, aposentadorias, benefícios previdenciários', '#0891b2', 'shield')
ON CONFLICT (slug) DO NOTHING;
