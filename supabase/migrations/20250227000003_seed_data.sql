-- Seed data for sponsor_levels
INSERT INTO api.sponsor_levels (id, name, amount, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Platinum', 10000, now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'Gold', 5000, now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Silver', 2500, now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'Bronze', 1000, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Seed data for sponsors
INSERT INTO api.sponsors (id, name, level, year, website, cloudinary_public_id, image_url, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Example Corp', '11111111-1111-1111-1111-111111111111', 2025, 'https://example.com', null, null, now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Company', '22222222-2222-2222-2222-222222222222', 2025, 'https://test.com', null, null, now(), now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sample Inc', '33333333-3333-3333-3333-333333333333', 2025, 'https://sample.com', null, null, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create a test user for development
-- Note: This will only create the user if it doesn't already exist
DO $$
BEGIN
  -- Check if the user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@example.com') THEN
    -- Insert the user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'test@example.com',
      -- This is a hashed password for 'password123'
      '$2a$10$RVE9WZvYnZvB2P/U0xQj8OkVROZvZM3o.j.PbCf8R.HCy1sVVEuZm',
      now(),
      null,
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test User"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;
END
$$;
