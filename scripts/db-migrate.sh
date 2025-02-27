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
        
        # Create migration file using Supabase CLI
        echo "Creating new migration: $2"
        supabase migration new "$2"
        
        echo "Created migration file. Check supabase/migrations/ directory."
        ;;
    "status")
        echo "Checking migration status..."
        supabase migration list
        ;;
    "pull")
        echo "Pulling remote database state..."
        supabase db pull
        ;;
    "repair")
        # Check if migration ID is provided
        if [ -z "$2" ]; then
            echo "Error: Please provide a migration ID"
            echo "Usage: ./scripts/db-migrate.sh repair migration_id"
            exit 1
        fi
        
        echo "Repairing migration: $2"
        supabase migration repair --status reverted "$2"
        ;;
    *)
        echo "Unknown command: $COMMAND"
        echo "Usage: ./scripts/db-migrate.sh [up|down|new|status|pull|repair]"
        exit 1
        ;;
esac
