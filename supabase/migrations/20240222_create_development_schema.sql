-- Initial migration: Create development schema and set up permissions
-- This creates a separate schema for development and preview environments
CREATE SCHEMA IF NOT EXISTS development;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA development TO authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA development GRANT ALL ON TABLES TO authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA development GRANT ALL ON FUNCTIONS TO authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA development GRANT ALL ON SEQUENCES TO authenticated, anon, service_role;

-- Migrate existing tables from public to development (if any)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Copy all tables from public to development
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'CREATE TABLE IF NOT EXISTS development.' || quote_ident(r.tablename) || 
                ' (LIKE public.' || quote_ident(r.tablename) || ' INCLUDING ALL)';
        EXECUTE 'INSERT INTO development.' || quote_ident(r.tablename) || 
                ' SELECT * FROM public.' || quote_ident(r.tablename);
    END LOOP;
END $$;
