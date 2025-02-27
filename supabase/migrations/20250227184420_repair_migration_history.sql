-- Migration: repair_migration_history
-- Created at: 2025-02-27 18:44:20

-- This migration repairs the migration history by ensuring that
-- the consolidated migration is properly recorded in the migration history table
-- and removing any redundant migrations.

-- First, ensure the schema_migrations table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'supabase_migrations' 
    AND tablename = 'schema_migrations'
  ) THEN
    -- Create the schema if it doesn't exist
    CREATE SCHEMA IF NOT EXISTS supabase_migrations;
    
    -- Create the schema_migrations table if it doesn't exist
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version text PRIMARY KEY,
      name text,
      statements text[]
    );
  END IF;
END $$;

-- Remove the problematic migration if it exists
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250227';

-- Ensure the consolidated migration is in the history
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20250227183244', 
  'consolidated_sponsor_website_fix',
  ARRAY['-- Consolidated migration that adds website column to sponsors table']
)
ON CONFLICT (version) DO NOTHING;

-- Add a log message to confirm execution
SELECT 'Migration history repair completed successfully' AS repair_status;
