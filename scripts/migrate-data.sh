#!/bin/bash

# Script to migrate data from Supabase to Neon
# Usage: ./migrate-data.sh <supabase_connection_string> <neon_connection_string>

# Check if the required arguments are provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <supabase_connection_string> <neon_connection_string>"
  exit 1
fi

SUPABASE_CONNECTION_STRING=$1
NEON_CONNECTION_STRING=$2
DUMP_FILE="supabase_dump.sql"

echo "Starting migration from Supabase to Neon..."

# Step 1: Export data from Supabase
echo "Exporting data from Supabase..."
pg_dump -Fc -v -d "$SUPABASE_CONNECTION_STRING" -f "$DUMP_FILE"

if [ $? -ne 0 ]; then
  echo "Error: Failed to export data from Supabase."
  exit 1
fi

echo "Data exported successfully to $DUMP_FILE"

# Step 2: Import data into Neon
echo "Importing data into Neon..."
pg_restore -v -d "$NEON_CONNECTION_STRING" "$DUMP_FILE"

if [ $? -ne 0 ]; then
  echo "Warning: pg_restore completed with some errors. Check the output above."
else
  echo "Data imported successfully into Neon."
fi

# Step 3: Clean up
echo "Cleaning up..."
rm -f "$DUMP_FILE"

echo "Migration completed." 