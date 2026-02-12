-- Seed segments table with all available segments
-- This includes original segments and new strategic segments

INSERT INTO public.segments (name, slug, is_predefined, usage_count)
VALUES
  -- Original segments
  ('Consultoria Empresarial', 'consultoria', true, 0),
  ('Advocacia', 'advocacia', true, 0),
  ('Contabilidade', 'contabilidade', true, 0),
  ('Academia/Fitness', 'fitness', true, 0),
  ('Saúde e Bem-estar', 'saude', true, 0),
  ('Educação/Cursos', 'educacao', true, 0),
  ('Tecnologia', 'tecnologia', true, 0),
  ('Marketing Digital', 'marketing', true, 0),
  ('Design', 'design', true, 0),
  -- New strategic segments
  ('Petshop e Veterinária', 'petshop_veterinaria', true, 0),
  ('Setor Automotivo', 'automotivo', true, 0),
  ('Clínica', 'clinica', true, 0),
  ('Barbearia', 'barbearia', true, 0),
  ('Estúdio de Beleza', 'estudio_beleza', true, 0)
ON CONFLICT (slug) DO NOTHING;

