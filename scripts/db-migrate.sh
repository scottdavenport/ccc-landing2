#!/bin/bash

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "Error: SUPABASE_ACCESS_TOKEN is not set"
    echo "Please set it by running: export SUPABASE_ACCESS_TOKEN=your_access_token"
    echo "You can get your access token from: https://app.supabase.com/account/tokens"
    exit 1
fi

# Check if SUPABASE_PROJECT_ID is set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "Error: SUPABASE_PROJECT_ID is not set"
    echo "Please set it by running: export SUPABASE_PROJECT_ID=your_project_id"
    echo "You can find your project ID in your Supabase project settings"
    exit 1
fi

# Default command is up
COMMAND=${1:-up}

case $COMMAND in
    "up")
        echo "Running migrations up..."
        supabase db push
        ;;
    "down")
        echo "Running migrations down..."
        supabase db reset
        ;;
    "new")
        # Check if migration name is provided
        if [ -z "$2" ]; then
            echo "Error: Please provide a migration name"
            echo "Usage: ./scripts/db-migrate.sh new migration_name"
            exit 1
        fi
        
        # Create migration file
        TIMESTAMP=$(date +%Y%m%d%H%M%S)
        MIGRATION_NAME="${TIMESTAMP}_${2}.sql"
        
        echo "Creating new migration: $MIGRATION_NAME"
        cat > "supabase/migrations/$MIGRATION_NAME" << EOL
-- Migration: ${2}
-- Created at: $(date)

-- Write your "up" migration SQL here

---- Create "down" migration by adding @UNDO comment
-- @UNDO

-- Write your "down" migration SQL here

EOL
        
        echo "Created migration file: supabase/migrations/$MIGRATION_NAME"
        ;;
    "status")
        echo "Checking migration status..."
        supabase db remote changes
        ;;
    *)
        echo "Unknown command: $COMMAND"
        echo "Usage: ./scripts/db-migrate.sh [up|down|new|status]"
        exit 1
        ;;
esac
