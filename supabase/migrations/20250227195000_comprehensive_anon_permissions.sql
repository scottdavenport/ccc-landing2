-- Grant comprehensive permissions to anon role

-- Grant usage on api schema
GRANT USAGE ON SCHEMA api TO anon;
GRANT USAGE ON SCHEMA api TO authenticated;

-- Grant select permissions on all tables in api schema to anon role
GRANT SELECT ON ALL TABLES IN SCHEMA api TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA api TO authenticated;

-- Grant select permissions specifically on sponsors and sponsor_levels tables
GRANT SELECT ON api.sponsors TO anon;
GRANT SELECT ON api.sponsors TO authenticated;
GRANT SELECT ON api.sponsor_levels TO anon;
GRANT SELECT ON api.sponsor_levels TO authenticated;

-- Grant execute permissions on functions in api schema
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO authenticated;
