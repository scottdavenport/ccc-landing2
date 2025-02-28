-- Create users table for authentication
CREATE TABLE IF NOT EXISTS api.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a function to create a new admin user
CREATE OR REPLACE FUNCTION api.create_admin_user(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if the user already exists
    SELECT id INTO v_user_id FROM api.users WHERE email = p_email;
    
    -- If the user doesn't exist, create a new one
    IF v_user_id IS NULL THEN
        INSERT INTO api.users (email, password, name)
        VALUES (p_email, p_password, p_name)
        RETURNING id INTO v_user_id;
    END IF;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql; 