
-- Migration: fix_migration_history
-- Created at: 2025-02-27 18:28:17

-- This migration is a fix for the migration history table
-- It ensures that the previous migrations are properly recorded in the history

-- First, check if the previous migrations are already in the history table
DO $$
BEGIN
    -- Check if the fix_sponsor_permissions migration is already in the history
    IF NOT EXISTS (
        SELECT 1 FROM supabase_migrations.schema_migrations 
        WHERE version = '20250227140535'
    ) THEN
        -- Insert the migration record
        INSERT INTO supabase_migrations.schema_migrations (version, statements, name, checksum, executed_at, success)
        VALUES (
            '20250227140535',
            ARRAY['-- Migration: fix_sponsor_permissions
-- Created at: 2025-02-27 14:05:35

-- Ensure permissions are properly set for the sponsors table
-- This is idempotent and can be run multiple times safely

-- Grant permissions to access all columns in the sponsors table
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT SELECT ON api.sponsors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON api.sponsors TO authenticated;

-- Ensure RLS policies are correctly set
ALTER TABLE api.sponsors ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies to ensure they''re properly configured
DROP POLICY IF EXISTS "Enable read access for all users" ON api.sponsors;
CREATE POLICY "Enable read access for all users" 
ON api.sponsors
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON api.sponsors;
CREATE POLICY "Enable insert for authenticated users only" 
ON api.sponsors
FOR INSERT 
WITH CHECK (auth.role() = ''authenticated'');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON api.sponsors;
CREATE POLICY "Enable update for authenticated users only" 
ON api.sponsors
FOR UPDATE 
USING (auth.role() = ''authenticated'');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON api.sponsors;
CREATE POLICY "Enable delete for authenticated users only" 
ON api.sponsors
FOR DELETE 
USING (auth.role() = ''authenticated'');

-- No @UNDO section needed as this migration is idempotent'],
            'fix_sponsor_permissions',
            'c9a9c89f5d5c9a9c89f5d5c9a9c89f5',  -- Dummy checksum
            NOW(),
            TRUE
        );
    END IF;

    -- Check if the add_website_to_sponsors migration is already in the history
    IF NOT EXISTS (
        SELECT 1 FROM supabase_migrations.schema_migrations 
        WHERE version = '20250227'
        AND name = 'add_website_to_sponsors'
    ) THEN
        -- Insert the migration record
        INSERT INTO supabase_migrations.schema_migrations (version, statements, name, checksum, executed_at, success)
        VALUES (
            '20250227',
            ARRAY['-- Migration: add_website_to_sponsors
-- Created at: 2025-02-27

-- Add website column to sponsors table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = ''api'' 
        AND table_name = ''sponsors'' 
        AND column_name = ''website''
    ) THEN
        ALTER TABLE api.sponsors ADD COLUMN website TEXT;
    END IF;
END
$$;

-- Grant permissions to access the new column
GRANT SELECT(website) ON api.sponsors TO anon, authenticated;
GRANT UPDATE(website) ON api.sponsors TO authenticated;'],
            'add_website_to_sponsors',
            'd8a8d78e4c4d8a8d78e4c4d8a8d78e4',  -- Dummy checksum
            NOW(),
            TRUE
        );
    END IF;
END
$$;

-- @UNDO
-- This is a migration fix, so no undo is needed