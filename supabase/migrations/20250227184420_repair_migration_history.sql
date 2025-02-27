-- Migration: repair_migration_history
-- Created at: 2025-02-27 18:44:20

-- This migration repairs the migration history by ensuring that
-- the consolidated migration is properly recorded in the migration history table
-- and removing any redundant migrations.

-- Note: We're removing the direct manipulation of the schema_migrations table
-- as this should be handled by the Supabase CLI. Instead, we'll use the
-- migration repair command to fix the migration history.

-- This migration file now serves as a marker for the repair process
-- and doesn't contain any actual SQL statements that modify the schema_migrations table.

-- The actual repair process should be run with:
-- supabase migration repair --status applied 20250227183244
-- supabase migration repair --status reverted 20250227
