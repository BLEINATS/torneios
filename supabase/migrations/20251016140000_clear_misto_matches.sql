/*
# Limpar Confrontos da Categoria Mista
Este script remove permanentemente todas as partidas (ao vivo, próximas e finalizadas) que pertencem a qualquer categoria marcada como 'Mista'.

## Query Description: [Esta operação irá apagar dados de partidas de forma permanente. Recomenda-se fazer um backup antes de executar, pois os dados não poderão ser recuperados. A ação é focada em limpar o chaveamento de uma categoria específica para permitir um recomeço.]

## Metadata:
- Schema-Category: "Dangerous"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Tabela afetada: `public.matches`
- Ação: `DELETE`

## Security Implications:
- RLS Status: Não afetado
- Policy Changes: Não
- Auth Requirements: N/A

## Performance Impact:
- Indexes: Não afetado
- Triggers: Não afetado
- Estimated Impact: Baixo, a menos que a tabela de partidas seja extremamente grande.
*/

DELETE FROM public.matches
WHERE category_id IN (
  SELECT id FROM public.categories WHERE "group" = 'misto'
);
