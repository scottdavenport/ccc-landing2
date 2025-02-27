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
TEMP_DIR=$(mktemp -d)
DUMP_PATH="${TEMP_DIR}/${DUMP_FILE}"

echo "Using temporary directory: ${TEMP_DIR}"

# Function to clean up temporary files
cleanup() {
  echo "Cleaning up..."
  rm -rf "${TEMP_DIR}"
}

# Register the cleanup function to be called on exit
trap cleanup EXIT

# Load environment variables from .env files if running locally
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
echo "Fetching project references..."
PROJECTS_LIST=$(supabase projects list --access-token $SUPABASE_ACCESS_TOKEN)
PROD_PROJECT_REF=$(echo "$PROJECTS_LIST" | grep "main" | awk '{print $1}')

if [ -z "$PROD_PROJECT_REF" ]; then
  echo "Error: Could not find production project reference"
  echo "Available projects:"
  echo "$PROJECTS_LIST"
  exit 1
fi

# Get branch project reference
BRANCH_PROJECT_REF=$(echo "$PROJECTS_LIST" | grep -E "\b${BRANCH_NAME}\b" | awk '{print $1}')

if [ -z "$BRANCH_PROJECT_REF" ]; then
  echo "Error: Could not find branch project reference for $BRANCH_NAME"
  echo "Available projects:"
  echo "$PROJECTS_LIST"
  exit 1
fi

echo "Copying data from production ($PROD_PROJECT_REF) to branch $BRANCH_NAME ($BRANCH_PROJECT_REF)"

# Get database connection strings if not provided
if [ -z "$PROD_DB_URL" ]; then
  echo "PROD_DB_URL not provided, fetching from Supabase..."
  PROD_DB_URL=$(supabase db get-connection-string -p $PROD_PROJECT_REF --access-token $SUPABASE_ACCESS_TOKEN)
fi

if [ -z "$BRANCH_DB_URL" ]; then
  echo "BRANCH_DB_URL not provided, fetching from Supabase..."
  BRANCH_DB_URL=$(supabase db get-connection-string -p $BRANCH_PROJECT_REF --access-token $SUPABASE_ACCESS_TOKEN)
fi

# Dump production database
echo "Dumping production database..."
PGPASSWORD=$(echo $PROD_DB_URL | sed -E 's/.*:([^@]*)@.*/\1/') \
pg_dump -h $(echo $PROD_DB_URL | sed -E 's/.*@([^:]*).*/\1/') \
        -p $(echo $PROD_DB_URL | sed -E 's/.*:([0-9]+)\/.*/\1/') \
        -U $(echo $PROD_DB_URL | sed -E 's/.*:\/\/([^:]*).*/\1/') \
        -d $(echo $PROD_DB_URL | sed -E 's/.*\/([^?]*).*/\1/') \
        -n api \
        --data-only \
        --no-owner \
        --no-privileges \
        -f "$DUMP_PATH"

echo "Dump completed: $DUMP_PATH"

# Modify dump file to handle conflicts
echo "Modifying dump file to handle conflicts..."
sed -i.bak 's/^INSERT INTO/INSERT INTO/' "$DUMP_PATH"
sed -i.bak 's/^COPY/-- COPY/' "$DUMP_PATH"
sed -i.bak 's/^SELECT pg_catalog.setval/-- SELECT pg_catalog.setval/' "$DUMP_PATH"

# Add ON CONFLICT DO NOTHING to all INSERT statements
sed -i.bak 's/INSERT INTO \([^(]*\)(\([^)]*\)) VALUES/INSERT INTO \1(\2) VALUES/' "$DUMP_PATH"
sed -i.bak 's/VALUES \(.*\);/VALUES \1 ON CONFLICT DO NOTHING;/' "$DUMP_PATH"

# Restore to branch database
echo "Restoring data to branch database..."
PGPASSWORD=$(echo $BRANCH_DB_URL | sed -E 's/.*:([^@]*)@.*/\1/') \
psql -h $(echo $BRANCH_DB_URL | sed -E 's/.*@([^:]*).*/\1/') \
     -p $(echo $BRANCH_DB_URL | sed -E 's/.*:([0-9]+)\/.*/\1/') \
     -U $(echo $BRANCH_DB_URL | sed -E 's/.*:\/\/([^:]*).*/\1/') \
     -d $(echo $BRANCH_DB_URL | sed -E 's/.*\/([^?]*).*/\1/') \
     -f "$DUMP_PATH"

echo "Data copy completed successfully!"
