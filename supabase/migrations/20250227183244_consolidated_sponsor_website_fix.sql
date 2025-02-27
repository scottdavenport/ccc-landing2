
-- Migration: consolidated_sponsor_website_fix
-- Created at: 2025-02-27 18:32:44

-- This is a consolidated migration that ensures:
-- 1. The website column exists in the sponsors table
-- 2. All permissions are properly set
-- 3. The migration history is consistent

-- PART 1: Ensure website column exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'api' 
    AND table_name = 'sponsors' 
    AND column_name = 'website'
  ) THEN
    ALTER TABLE api.sponsors ADD COLUMN website TEXT;
    RAISE NOTICE 'Added website column to api.sponsors table';
  ELSE
    RAISE NOTICE 'website column already exists in api.sponsors table';
  END IF;
END $$;

-- PART 2: Ensure permissions are properly set
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

-- PART 3: Clean up migration history
-- This part ensures that all previous migrations related to the website column
-- are marked as applied in the migration history

-- Remove the problematic DO block that tries to insert into schema_migrations
-- Supabase CLI will handle the migration history automatically

-- We don't need an @UNDO section as this migration is idempotent