/*
# [ADD_CREATED_AT_TO_MATCHES]
Adds the 'created_at' column to the 'matches' table. This is required for sorting matches to determine bracket progression.

## Query Description: [This operation adds a new column to the 'matches' table to track when a match was created. It is a non-destructive operation and is required for the automatic bracket progression feature to work correctly.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Table: public.matches
- Column Added: created_at (TIMESTAMPTZ)

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Low. Adding a column with a default value may take a moment on very large tables, but this table is likely small.]
*/
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
