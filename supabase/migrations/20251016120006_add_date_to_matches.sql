/*
# [Schema Update] Add Date Column to Matches
Adds a 'date' column to the 'matches' table to store the scheduled date of a match.

## Query Description: This operation adds a new 'date' column of type DATE to the 'matches' table. It is a non-destructive change and will not affect existing data. Existing rows will have a NULL value for this new column.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the column)

## Structure Details:
- Table: matches
- Column Added: date (type: date)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None added
- Triggers: None added
- Estimated Impact: Negligible. Adding a column with a default NULL value is a fast metadata change.
*/
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS date DATE;
