# Branch Database Seeding

This document outlines the process for seeding branch databases with production data to ensure consistent testing environments.

## Overview

When working with Supabase branches, each branch gets its own isolated database. This is great for development and testing, but it means that branch databases start empty. To have realistic data for testing, we need to populate these databases.

## Options for Seeding Branch Databases

### 1. Automatic Seeding via Migrations

We've created a migration file that automatically seeds the database with test data:

- `20250227000003_seed_data.sql`: Contains seed data for sponsor levels, sponsors, and a test user

This migration will run automatically when the branch database is created or when migrations are applied.

### 2. Automated Production Data Sync

We've implemented an automated GitHub Actions workflow that syncs production data to branch databases:

- **Trigger Events**:
  - When a new branch is created
  - On a daily schedule (midnight UTC)
  - Manually via workflow dispatch

The workflow uses our `scripts/copy-prod-data-to-branch.sh` script to:
1. Dump data from the production database (api schema only)
2. Modify the dump to handle conflicts
3. Restore the data to the branch database

**GitHub Secrets Required**:
- `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
- `PROD_DB_URL`: Connection string for the production database

**Manual Triggering**:
You can manually trigger the workflow from the GitHub Actions tab by selecting the "Sync Branch Database with Production Data" workflow and clicking "Run workflow".

### 3. Manual Data Sync

If you need to manually sync data from production to a branch:

```bash
# Make the script executable (if not already)
chmod +x scripts/copy-prod-data-to-branch.sh

# Run the script with the branch name
./scripts/copy-prod-data-to-branch.sh <branch_name>
```

**Prerequisites**:
- Supabase CLI installed: `npm install -g supabase`
- Supabase access token set in `.env.production` or environment: `SUPABASE_ACCESS_TOKEN=your_token`
- Database connection strings will be automatically retrieved if not provided

### 4. Manual Data Entry via Supabase Dashboard

You can also manually add data through the Supabase Dashboard:

1. Navigate to the [Supabase Dashboard](https://app.supabase.com)
2. Select your branch project
3. Go to the Table Editor
4. Add data to the `api.sponsor_levels` and `api.sponsors` tables

## Test User Credentials

For testing authenticated functionality, use:

- Email: `test@example.com`
- Password: `password123`

## Best Practices

1. **Never copy sensitive data** from production to development environments
2. Use the seeding migration for basic testing data
3. Use the automated sync for more comprehensive testing with realistic data
4. Always test migrations on a branch before applying to production

## Troubleshooting

If you encounter issues with the seeding process:

1. Check that the schema exists: `api` schema should be created by earlier migrations
2. Verify that RLS policies are correctly set up to allow data access
3. Ensure you're authenticated when testing features that require authentication
4. Check GitHub Actions logs if the automated sync fails
5. Run the script manually with verbose output for debugging: `bash -x scripts/copy-prod-data-to-branch.sh <branch_name>`
