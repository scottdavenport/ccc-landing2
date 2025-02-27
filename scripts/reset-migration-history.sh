#!/bin/bash
# Script to completely reset and resynchronize the migration history
# This is a more aggressive approach to fixing the "Remote migration versions not found in local migrations directory" error
# Usage: SUPABASE_PROJECT_ID=your-project-id SUPABASE_DB_PASSWORD=your-db-password ./scripts/reset-migration-history.sh

set -e

echo "🔄 Starting complete migration history reset and resynchronization..."

# Ensure we have the required environment variables
if [ -z "$SUPABASE_PROJECT_ID" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "❌ Error: SUPABASE_PROJECT_ID and SUPABASE_DB_PASSWORD environment variables must be set."
  echo "Usage: SUPABASE_PROJECT_ID=your-project-id SUPABASE_DB_PASSWORD=your-db-password $0"
  exit 1
fi

# Link to the project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$SUPABASE_PROJECT_ID" -p "$SUPABASE_DB_PASSWORD"

# Get database connection string
DB_URL=$(supabase db remote get-connection-string)

# Show current migration status
echo "📊 Current migration status:"
supabase migration list

# Step 1: Backup the current schema_migrations table
echo "💾 Backing up current schema_migrations table..."
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql "$DB_URL" -c "
CREATE SCHEMA IF NOT EXISTS supabase_migrations_backup;
DROP TABLE IF EXISTS supabase_migrations_backup.schema_migrations;
CREATE TABLE supabase_migrations_backup.schema_migrations AS 
SELECT * FROM supabase_migrations.schema_migrations;
"

# Step 2: Drop and recreate the schema_migrations table
echo "🗑️ Dropping and recreating schema_migrations table..."
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql "$DB_URL" -c "
DROP TABLE IF EXISTS supabase_migrations.schema_migrations;
CREATE TABLE supabase_migrations.schema_migrations (
  version text PRIMARY KEY,
  name text,
  statements text[]
);
"

# Step 3: Get a list of all local migration files
echo "📋 Processing local migration files..."
MIGRATION_FILES=$(find supabase/migrations -name "*.sql" | sort)

# Step 4: Insert each migration into the schema_migrations table
for MIGRATION_FILE in $MIGRATION_FILES; do
  # Extract version and name from filename
  FILENAME=$(basename "$MIGRATION_FILE" .sql)
  VERSION=${FILENAME%%_*}
  NAME=${FILENAME#*_}
  
  echo "✅ Registering migration: $VERSION - $NAME"
  
  # Insert into schema_migrations table
  PGPASSWORD="$SUPABASE_DB_PASSWORD" psql "$DB_URL" -c "
  INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
  VALUES ('$VERSION', '$NAME', ARRAY['-- Migration from $FILENAME'])
  ON CONFLICT (version) DO UPDATE SET
    name = EXCLUDED.name,
    statements = EXCLUDED.statements;
  "
done

# Step 5: Show the new migration status
echo "📊 New migration status:"
supabase migration list

echo "🎉 Migration history reset and resynchronization complete!"
echo "⚠️ Note: This script has completely rebuilt the migration history table."
echo "   The database schema itself has NOT been modified, only the migration tracking."
