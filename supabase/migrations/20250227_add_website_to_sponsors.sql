-- Migration: add_website_to_sponsors
-- Created at: 2025-02-27 13:11:22

-- This is an idempotent migration to ensure the website column exists in the sponsors table
-- It's designed to be applied safely even if the column already exists

-- Check if the column exists before trying to add it
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

-- Ensure permissions are properly set
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT SELECT ON api.sponsors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON api.sponsors TO authenticated;

-- @UNDO
-- Remove website field from sponsors table if needed
-- ALTER TABLE api.sponsors DROP COLUMN IF EXISTS website;
