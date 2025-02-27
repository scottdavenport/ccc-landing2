#!/bin/bash
# Comprehensive script to fix Supabase migration synchronization issues
# This script combines multiple approaches to ensure migration synchronization
# Usage: ./scripts/comprehensive-migration-fix.sh

set -e

echo "🔄 Starting comprehensive migration fix..."

# Step 1: Check current migration status
echo "📊 Current migration status:"
supabase migration list

# Step 2: Try to push migrations normally first
echo "🔄 Attempting standard migration push..."
if supabase db push; then
  echo "✅ Standard migration push successful!"
  exit 0
fi

echo "⚠️ Standard migration push failed. Trying more aggressive approaches..."

# Step 3: Try to repair specific problematic migrations
echo "🔧 Attempting to repair specific migrations..."
supabase migration repair --status reverted 20250227 || true

# Step 4: Try pushing again with include-all flag
echo "🔄 Attempting migration push with --include-all flag..."
if supabase db push --include-all; then
  echo "✅ Migration push with --include-all successful!"
  exit 0
fi

echo "⚠️ Migration push with --include-all failed. Trying direct SQL approach..."

# Step 5: Apply the fix_migration_sync.sql directly
echo "💉 Applying fix_migration_sync.sql directly..."
DB_URL=$(supabase db remote get-connection-string)
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql "$DB_URL" -f supabase/migrations/20250227190000_fix_migration_sync.sql

# Step 6: Try pushing migrations again
echo "🔄 Attempting migration push after direct SQL fix..."
if supabase db push; then
  echo "✅ Migration push after direct SQL fix successful!"
  exit 0
fi

echo "⚠️ All standard approaches failed. Proceeding with nuclear option..."

# Step 7: Nuclear option - Reset the entire migration history
echo "☢️ Resetting entire migration history..."
source ./scripts/reset-migration-history.sh

echo "🎉 Comprehensive migration fix complete!"
echo "📊 Final migration status:"
supabase migration list
