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
psql "$SUPABASE_DB_URL" -c "ALTER TABLE api.sponsors ADD COLUMN IF NOT EXISTS website TEXT;"

if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
else
    echo "Error applying migration"
    exit 1
fi
