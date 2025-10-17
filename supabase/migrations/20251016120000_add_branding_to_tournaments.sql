/*
  # [Schema Upgrade] Add Branding and Color Columns to Tournaments
  Adds columns for storing custom background images, logos, and text colors to the `tournaments` table.

  ## Query Description: This operation modifies the `tournaments` table by adding three new columns: `backgroundImage`, `logoImage`, and `colors`. It sets default values for these columns on all existing tournament records to ensure consistency. This change is non-destructive to existing data.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: `tournaments`
  - Columns Added:
    - `backgroundImage` (text)
    - `logoImage` (text)
    - `colors` (jsonb)
  
  ## Security Implications:
  - RLS Status: Unchanged
  - Policy Changes: No
  - Auth Requirements: None
  
  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Negligible. A small amount of disk space will be used for the new columns.
*/
ALTER TABLE public.tournaments
ADD COLUMN "backgroundImage" text DEFAULT 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2807&auto=format&fit=crop',
ADD COLUMN "logoImage" text DEFAULT 'https://i.ibb.co/L8yT7gM/match-point-sports-logo.png',
ADD COLUMN "colors" jsonb DEFAULT '{"primary": "#FFFFFF", "secondary": "#FFD700"}';
