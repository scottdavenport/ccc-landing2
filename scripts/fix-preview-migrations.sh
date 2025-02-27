#!/bin/bash
# Script to fix migration issues in the preview environment
# Usage: ./scripts/fix-preview-migrations.sh

set -e

echo "Fixing migration issues in the preview environment..."

# Ensure we have the latest Supabase CLI
echo "Checking Supabase CLI version..."
CURRENT_VERSION=$(supabase --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
echo "Current Supabase CLI version: $CURRENT_VERSION"
echo "Consider updating to the latest version if needed: npm install -g supabase@latest"

# Link to the project
echo "Linking to Supabase project..."
supabase link --project-ref "$SUPABASE_PROJECT_ID" -p "$SUPABASE_DB_PASSWORD"

# Show current migration status
echo "Current migration status:"
supabase migration list

# Repair the problematic migration
echo "Repairing problematic migration..."
supabase migration repair --status reverted 20250227

# Show updated migration status
echo "Updated migration status after repair:"
supabase migration list

# Push migrations
echo "Pushing migrations..."
supabase db push

echo "Migration fix completed successfully!"
echo "Preview environment should now be working correctly."
