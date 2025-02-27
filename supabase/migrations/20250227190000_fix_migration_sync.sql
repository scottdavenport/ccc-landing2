-- Migration: fix_migration_sync
-- Created at: 2025-02-27 19:00:00

-- This migration is designed to fix the migration synchronization issues
-- by ensuring the schema_migrations table is properly aligned with our local migrations.

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

-- Ensure all our local migrations are in the history
-- This is the key fix - we're making sure all our local migrations are registered

-- 20250227_140535_fix_sponsor_permissions.sql
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20250227_140535', 
  'fix_sponsor_permissions',
  ARRAY['-- Migration that fixes sponsor permissions']
)
ON CONFLICT (version) DO NOTHING;

-- Create a backup of the schema_migrations table for recovery if needed
CREATE SCHEMA IF NOT EXISTS supabase_migrations_backup;
CREATE TABLE IF NOT EXISTS supabase_migrations_backup.schema_migrations_backup_20250227190000 AS 
SELECT * FROM supabase_migrations.schema_migrations;

-- Add a log message to confirm execution
SELECT 'Migration synchronization fix completed successfully' AS sync_status;
