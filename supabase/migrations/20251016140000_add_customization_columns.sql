/*
# [Schema Upgrade] Add Customization Columns to Tournaments
Adds columns for storing custom background images, logos, and text colors to the `tournaments` table.

## Query Description: This operation safely adds new columns to the `tournaments` table without affecting existing data. It allows the application to save personalization settings for each tournament.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: tournaments
- Columns Added:
  - backgroundImage (TEXT)
  - logoImage (TEXT)
  - colors (JSONB)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Adding nullable columns is a fast metadata-only change.
*/

ALTER TABLE public.tournaments
ADD COLUMN "backgroundImage" TEXT,
ADD COLUMN "logoImage" TEXT,
ADD COLUMN "colors" JSONB;
