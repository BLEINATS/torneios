/*
          # [Feature] Tournament Format: Groups + Knockout
          This migration updates the database schema to support a new, more complex tournament format that includes a group stage followed by a knockout stage.

          ## Query Description: This operation is structural and safe. It adds new columns to the `tournaments` and `matches` tables, and creates a new `group_standings` table. It will not affect any existing data. The default format for existing tournaments will be 'single_elimination'.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - `tournaments`: Adds `format`, `group_settings`, `knockout_settings` columns.
          - `teams`: Adds `group_name` column.
          - `matches`: Adds `stage` column.
          - `group_standings`: New table to track group stage performance.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (New policies for `group_standings`).
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None added in this migration.
          - Triggers: None added.
          - Estimated Impact: Negligible performance impact.
          */

-- Add format to tournaments table
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'single_elimination';

-- Add settings JSONB columns
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS group_settings JSONB,
ADD COLUMN IF NOT EXISTS knockout_settings JSONB;

-- Add group_name to teams table
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Add stage to matches table
-- First, create the type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_stage') THEN
        CREATE TYPE public.match_stage AS ENUM ('group', 'knockout');
    END IF;
END$$;
-- Then, add the column
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS stage public.match_stage NOT NULL DEFAULT 'knockout';

-- Create group_standings table
CREATE TABLE IF NOT EXISTS public.group_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    points_for INT NOT NULL DEFAULT 0,
    points_against INT NOT NULL DEFAULT 0,
    points_difference INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(category_id, team_id)
);

-- Enable RLS for the new table
ALTER TABLE public.group_standings ENABLE ROW LEVEL SECURITY;

-- Create policies for the new table
DROP POLICY IF EXISTS "Public can view group standings" ON public.group_standings;
CREATE POLICY "Public can view group standings" ON public.group_standings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage group standings" ON public.group_standings;
CREATE POLICY "Users can manage group standings" ON public.group_standings
FOR ALL USING (true) WITH CHECK (true);
