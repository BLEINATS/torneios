/*
          # Adicionar Coluna de Horário
          Adiciona a coluna 'scheduled_time' à tabela 'matches' para armazenar o horário agendado de cada partida.

          ## Query Description: Esta operação é segura e apenas adiciona uma nova coluna à tabela de partidas. Não há risco de perda de dados existentes.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tabela afetada: public.matches
          - Coluna adicionada: scheduled_time (TIME)
          
          ## Security Implications:
          - RLS Status: Inalterado
          - Policy Changes: Não
          - Auth Requirements: Nenhum
          
          ## Performance Impact:
          - Indexes: Nenhum
          - Triggers: Nenhum
          - Estimated Impact: Mínimo. A adição de uma coluna pode causar um breve bloqueio na tabela, mas é uma operação rápida.
          */
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS scheduled_time TIME;
