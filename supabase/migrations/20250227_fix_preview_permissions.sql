-- Migration: fix_preview_permissions
-- Created at: 2025-02-27

-- Grant permissions to the anon role for the api schema
DO $$
BEGIN
    -- Create the api schema if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = 'api'
    ) THEN
        CREATE SCHEMA api;
    END IF;

    -- Grant usage on the api schema to anon role
    GRANT USAGE ON SCHEMA api TO anon;
    GRANT USAGE ON SCHEMA api TO authenticated;
    GRANT USAGE ON SCHEMA api TO service_role;

    -- Grant select permissions on all tables in the api schema
    GRANT SELECT ON ALL TABLES IN SCHEMA api TO anon;
    GRANT SELECT ON ALL TABLES IN SCHEMA api TO authenticated;
    
    -- Grant all permissions to service_role
    GRANT ALL ON ALL TABLES IN SCHEMA api TO service_role;
    
    -- Set default privileges for future tables
    ALTER DEFAULT PRIVILEGES IN SCHEMA api
    GRANT SELECT ON TABLES TO anon;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA api
    GRANT SELECT ON TABLES TO authenticated;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA api
    GRANT ALL ON TABLES TO service_role;
END $$;
