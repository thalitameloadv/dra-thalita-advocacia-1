-- Fix for duplicate blog_categories
-- This script handles existing categories and adds missing ones safely

-- First, let's see what categories already exist
-- (You can run this separately to check)
-- SELECT name, slug, icon FROM blog_categories;

-- Update existing categories to add icon if missing
UPDATE blog_categories 
SET icon = 'scale' 
WHERE name = 'Direito Civil' AND icon IS NULL;

UPDATE blog_categories 
SET icon = 'briefcase' 
WHERE name = 'Direito Trabalhista' AND icon IS NULL;

UPDATE blog_categories 
SET icon = 'building' 
WHERE name = 'Direito Empresarial' AND icon IS NULL;

UPDATE blog_categories 
SET icon = 'users' 
WHERE name = 'Direito de Família' AND icon IS NULL;

UPDATE blog_categories 
SET icon = 'calculator' 
WHERE name = 'Direito Tributário' AND icon IS NULL;

UPDATE blog_categories 
SET icon = 'shield' 
WHERE name = 'Direito Previdenciário' AND icon IS NULL;

-- Insert only categories that don't exist
INSERT INTO blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Civil', 'direito-civil', 'Artigos sobre direito civil, contratos, obrigações e responsabilidade civil', '#2563eb', 'scale'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'direito-civil');

INSERT INTO blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Trabalhista', 'direito-trabalhista', 'Conteúdo sobre direito do trabalho, CLT, processos trabalhistas', '#dc2626', 'briefcase'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'direito-trabalhista');

INSERT INTO blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Empresarial', 'direito-empresarial', 'Artigos sobre direito empresarial, sociedades, contratos comerciais', '#059669', 'building'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'direito-empresarial');

INSERT INTO blog_categories (name, slug, description, color, icon) 
SELECT 'Direito de Família', 'direito-familia', 'Conteúdo sobre direito de família, divórcio, guarda, pensão alimentícia', '#7c3aed', 'users'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'direito-familia');

INSERT INTO blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Tributário', 'direito-tributario', 'Artigos sobre tributos, fiscalização, planejamento tributário', '#ea580c', 'calculator'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'direito-tributario');

INSERT INTO blog_categories (name, slug, description, color, icon) 
SELECT 'Direito Previdenciário', 'direito-previdenciario', 'Conteúdo sobre INSS, aposentadorias, benefícios previdenciários', '#0891b2', 'shield'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'direito-previdenciario');

-- Show final result
SELECT name, slug, icon, color FROM blog_categories ORDER BY name;
