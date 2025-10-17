/*
          # [Operation Name]
          Add Customization Columns to Tournaments

          ## Query Description: This operation adds new columns to the 'tournaments' table to store customization data (background image, logo, and text colors). It is a non-destructive change that adds functionality without affecting existing data.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Table: tournaments
          - Columns Added: backgroundImage (TEXT), logoImage (TEXT), colors (JSONB)

          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: None

          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible.
          */
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS "backgroundImage" TEXT,
ADD COLUMN IF NOT EXISTS "logoImage" TEXT,
ADD COLUMN IF NOT EXISTS "colors" JSONB;
