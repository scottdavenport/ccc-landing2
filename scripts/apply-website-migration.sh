#!/bin/bash

# This script applies the website field migration directly to the database
# It's a workaround for when the standard migration process isn't working

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "Error: SUPABASE_DB_URL is not set"
    echo "Please set it by running: export SUPABASE_DB_URL=your_db_connection_string"
    echo "You can find your database connection string in your Supabase project settings"
    exit 1
fi

echo "Applying website field migration..."
psql "$SUPABASE_DB_URL" << EOF
-- Add column if it doesn't exist (idempotent migration)
DO \$\$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'api' 
    AND table_name = 'sponsors' 
    AND column_name = 'website'
  ) THEN
    ALTER TABLE api.sponsors ADD COLUMN website TEXT;
    RAISE NOTICE 'Added website column to api.sponsors table';
  ELSE
    RAISE NOTICE 'website column already exists in api.sponsors table';
  END IF;
END \$\$;
EOF

if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
else
    echo "Error applying migration"
    exit 1
fi
