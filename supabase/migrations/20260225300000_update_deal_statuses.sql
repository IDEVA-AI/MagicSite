-- Update pipeline stages: Lead→Contato, Proposta→Apresentação, Fechado→Fechamento, Entregue→Recebido
-- (negociacao stays the same)

-- Migrate existing deals to new status names
update public.deals set status = 'contato' where status = 'lead';
update public.deals set status = 'apresentacao' where status = 'proposta';
update public.deals set status = 'fechamento' where status = 'fechado';
update public.deals set status = 'recebido' where status = 'entregue';

-- Update default column value
alter table public.deals alter column status set default 'contato';
