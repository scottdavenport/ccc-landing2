
-- Migration: consolidated_sponsor_website_fix
-- Created at: 2025-02-27 18:32:44

-- This is a consolidated migration that adds the website column to the sponsors table
-- and ensures all necessary permissions are set correctly.
-- The migration is designed to be idempotent and can be run multiple times safely.

-- Add the website column to the sponsors table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'api' 
    AND table_name = 'sponsors' 
    AND column_name = 'website'
  ) THEN
    ALTER TABLE api.sponsors ADD COLUMN website TEXT;
    RAISE NOTICE 'Added website column to sponsors table';
  ELSE
    RAISE NOTICE 'Website column already exists in sponsors table, skipping';
  END IF;
END $$;

-- Ensure RLS is enabled on the sponsors table
ALTER TABLE api.sponsors ENABLE ROW LEVEL SECURITY;

-- Update or create the RLS policies for the sponsors table
DO $$
BEGIN
  -- Drop existing policies if they exist to avoid conflicts
  DROP POLICY IF EXISTS "Allow anonymous read access to sponsors" ON api.sponsors;
  DROP POLICY IF EXISTS "Allow authenticated read access to sponsors" ON api.sponsors;
  
  -- Create the policies
  CREATE POLICY "Allow anonymous read access to sponsors" 
    ON api.sponsors FOR SELECT 
    TO anon 
    USING (true);
  
  CREATE POLICY "Allow authenticated read access to sponsors" 
    ON api.sponsors FOR SELECT 
    TO authenticated 
    USING (true);
    
  RAISE NOTICE 'Updated RLS policies for sponsors table';
END $$;

-- Grant appropriate permissions
GRANT SELECT ON api.sponsors TO anon;
GRANT SELECT ON api.sponsors TO authenticated;

-- Add a log message to confirm execution
SELECT 'Consolidated sponsor website fix completed successfully' AS migration_status;