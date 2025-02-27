-- Migration: repair_migration_history
-- Created at: 2025-02-27 18:44:20

-- This migration repairs the migration history by ensuring that
-- the consolidated migration is properly recorded in the migration history table
-- and removing any redundant migrations.

-- First, check if the consolidated migration is already in the history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM supabase_migrations.schema_migrations 
    WHERE version = '20250227183244'
  ) THEN
    -- Add the consolidated migration to the history
    INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
    VALUES (
      '20250227183244', 
      'consolidated_sponsor_website_fix',
      ARRAY['-- Consolidated fix migration that adds website column to sponsors table and fixes permissions']
    );
  END IF;
  
  -- Remove the redundant migration if it exists
  -- This is the migration that our consolidated migration replaces
  IF EXISTS (
    SELECT 1 FROM supabase_migrations.schema_migrations 
    WHERE version = '20250227'
  ) THEN
    DELETE FROM supabase_migrations.schema_migrations 
    WHERE version = '20250227';
  END IF;
END $$;

-- @UNDO
-- To undo this migration, you would need to restore the original migration history
-- DO $$
-- BEGIN
--   -- Remove the consolidated migration
--   DELETE FROM supabase_migrations.schema_migrations 
--   WHERE version = '20250227183244';
--   
--   -- Restore the original migration if needed
--   IF NOT EXISTS (
--     SELECT 1 FROM supabase_migrations.schema_migrations 
--     WHERE version = '20250227'
--   ) THEN
--     INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
--     VALUES (
--       '20250227', 
--       '134225_sponsor_website_field',
--       ARRAY['-- Original website field migration']
--     );
--   END IF;
-- END $$;
