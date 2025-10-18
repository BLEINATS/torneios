/*
# [Schema Upgrade] Implement Groups + Knockout Format
This migration adds the necessary database structures to support a new tournament format: "Groups + Knockout". It introduces a new table to track group standings and adds columns to existing tables to manage formats, settings, and stages.

## Query Description: This operation is structural and safe. It adds new tables and columns without altering or deleting existing data. It is designed to be backwards-compatible with existing "Mata-Mata Simples" tournaments.

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true] (by dropping the new columns and table)

## Structure Details:
- **New Types:** `tournament_format`, `match_stage`.
- **Table `tournaments`:** Adds `format`, `group_settings`, `knockout_settings` columns.
- **Table `teams`:** Adds `group_name` column.
- **Table `matches`:** Adds `stage` column.
- **New Table `group_standings`:** Created to store classification data for the group stage.

## Security Implications:
- RLS Status: Enabled on the new `group_standings` table.
- Policy Changes: A new permissive policy is created for `group_standings` to allow all operations, consistent with the rest of the application.
- Auth Requirements: None.

## Performance Impact:
- Indexes: Primary key and foreign key indexes are created on `group_standings`.
- Triggers: None.
- Estimated Impact: Minimal. The changes are additive and will not impact performance of existing queries.
*/

-- Create custom types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournament_format') THEN
        CREATE TYPE public.tournament_format AS ENUM ('single_elimination', 'groups_then_knockout');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_stage') THEN
        CREATE TYPE public.match_stage AS ENUM ('group', 'knockout');
    END IF;
END$$;

-- Add columns to tournaments table to support new format
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS format public.tournament_format NOT NULL DEFAULT 'single_elimination',
ADD COLUMN IF NOT EXISTS group_settings jsonb,
ADD COLUMN IF NOT EXISTS knockout_settings jsonb;

-- Add column to teams table to assign them to a group
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS group_name text;

-- Add column to matches table to differentiate between group and knockout stages
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS stage public.match_stage NOT NULL DEFAULT 'knockout';

-- Create the table to store group stage standings
CREATE TABLE IF NOT EXISTS public.group_standings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    group_name text NOT NULL,
    played integer NOT NULL DEFAULT 0,
    wins integer NOT NULL DEFAULT 0,
    losses integer NOT NULL DEFAULT 0,
    points_for integer NOT NULL DEFAULT 0,
    points_against integer NOT NULL DEFAULT 0,
    points_difference integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT group_standings_pkey PRIMARY KEY (id),
    CONSTRAINT group_standings_unique_team_per_category UNIQUE (category_id, team_id)
);

-- Enable Row Level Security on the new table
ALTER TABLE IF EXISTS public.group_standings ENABLE ROW LEVEL SECURITY;

-- Create policies for the new table to allow access
DROP POLICY IF EXISTS "Enable all access for all users" ON public.group_standings;
CREATE POLICY "Enable all access for all users"
ON public.group_standings
FOR ALL
USING (true)
WITH CHECK (true);
