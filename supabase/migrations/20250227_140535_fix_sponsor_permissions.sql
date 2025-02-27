-- Migration: fix_sponsor_permissions
-- Created at: 2025-02-27 14:05:35

-- Ensure permissions are properly set for the sponsors table
-- This is idempotent and can be run multiple times safely

-- Grant permissions to access all columns in the sponsors table
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT SELECT ON api.sponsors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON api.sponsors TO authenticated;

-- Ensure RLS policies are correctly set
ALTER TABLE api.sponsors ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies to ensure they're properly configured
DROP POLICY IF EXISTS "Enable read access for all users" ON api.sponsors;
CREATE POLICY "Enable read access for all users" 
ON api.sponsors
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON api.sponsors;
CREATE POLICY "Enable insert for authenticated users only" 
ON api.sponsors
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON api.sponsors;
CREATE POLICY "Enable update for authenticated users only" 
ON api.sponsors
FOR UPDATE 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON api.sponsors;
CREATE POLICY "Enable delete for authenticated users only" 
ON api.sponsors
FOR DELETE 
USING (auth.role() = 'authenticated');

-- No @UNDO section needed as this migration is idempotent
