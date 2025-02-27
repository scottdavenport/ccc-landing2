#!/bin/bash
# Script to copy production data to a branch database
# Usage: ./copy-prod-data-to-branch.sh <branch_name>

set -e

# Check if branch name is provided
if [ -z "$1" ]; then
  echo "Error: Branch name is required"
  echo "Usage: ./copy-prod-data-to-branch.sh <branch_name>"
  exit 1
fi

BRANCH_NAME=$1
TIMESTAMP=$(date +%Y%m%d%H%M%S)
DUMP_FILE="supabase_prod_dump_${TIMESTAMP}.sql"

# Load environment variables from .env files
if [ -f .env.production ]; then
  source .env.production
fi

# Check if Supabase credentials are available
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN is not set"
  echo "Please set it in your environment or .env.production file"
  exit 1
fi

# Get production project reference
PROD_PROJECT_REF=$(supabase projects list --access-token $SUPABASE_ACCESS_TOKEN | grep "main" | awk '{print $1}')

if [ -z "$PROD_PROJECT_REF" ]; then
  echo "Error: Could not find production project reference"
  exit 1
fi

# Get branch project reference
BRANCH_PROJECT_REF=$(supabase projects list --access-token $SUPABASE_ACCESS_TOKEN | grep "$BRANCH_NAME" | awk '{print $1}')

if [ -z "$BRANCH_PROJECT_REF" ]; then
  echo "Error: Could not find branch project reference for $BRANCH_NAME"
  exit 1
fi

echo "Copying data from production ($PROD_PROJECT_REF) to branch $BRANCH_NAME ($BRANCH_PROJECT_REF)"

# Dump production database
echo "Dumping production database..."
supabase db dump -p $PROD_PROJECT_REF --db-url $PROD_DB_URL -f $DUMP_FILE --access-token $SUPABASE_ACCESS_TOKEN

# Modify dump file to only include data (no schema changes)
echo "Modifying dump file to only include data..."
sed -i '' '/CREATE TABLE/d' $DUMP_FILE
sed -i '' '/CREATE SCHEMA/d' $DUMP_FILE
sed -i '' '/ALTER TABLE/d' $DUMP_FILE
sed -i '' '/CREATE INDEX/d' $DUMP_FILE
sed -i '' '/CREATE TRIGGER/d' $DUMP_FILE
sed -i '' '/CREATE FUNCTION/d' $DUMP_FILE

# Restore to branch database
echo "Restoring data to branch database..."
supabase db restore -p $BRANCH_PROJECT_REF --db-url $BRANCH_DB_URL -f $DUMP_FILE --access-token $SUPABASE_ACCESS_TOKEN

# Clean up
echo "Cleaning up..."
rm $DUMP_FILE

echo "Data copy completed successfully!"
