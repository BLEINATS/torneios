/*
          # [RLS Policy Update]
          This migration updates the Row-Level Security (RLS) policies to allow full public access (create, read, update, delete) to all tables. This is necessary for the application to function without user authentication.

          ## Query Description:
          - This operation removes the previous read-only policies and replaces them with policies that grant full permissions (SELECT, INSERT, UPDATE, DELETE) to all users, including anonymous ones.
          - This is a standard security measure for public-facing applications without user login. For applications requiring user-specific data, more restrictive policies tied to authentication would be recommended.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: true
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes. Grants full public write access.
          - Auth Requirements: None. This policy applies to the public `anon` role.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Low. RLS policy checks have a minor overhead on queries.
          */

-- Drop existing read-only policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON "public"."tournaments";
DROP POLICY IF EXISTS "Allow public read access" ON "public"."categories";
DROP POLICY IF EXISTS "Allow public read access" ON "public"."teams";
DROP POLICY IF EXISTS "Allow public read access" ON "public"."players";
DROP POLICY IF EXISTS "Allow public read access" ON "public"."matches";
DROP POLICY IF EXISTS "public read access" ON "public"."sponsors";

-- Create new policies allowing full public access
CREATE POLICY "Allow public full access" ON "public"."tournaments" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access" ON "public"."categories" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access" ON "public"."teams" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access" ON "public"."players" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access" ON "public"."matches" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access" ON "public"."sponsors" FOR ALL USING (true) WITH CHECK (true);
