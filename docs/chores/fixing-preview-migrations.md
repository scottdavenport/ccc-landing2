# Fixing Preview Environment Migration Issues

This document provides guidance on resolving Supabase migration issues specifically in the preview environment.

## Common Preview Environment Issues

The preview environment can sometimes encounter migration issues that don't appear in local development or production. This is often due to:

1. **Different Migration History**: The preview environment may have a different migration history than your local environment.
2. **Partial Deployments**: Previous deployments might have partially succeeded, leaving the database in an inconsistent state.
3. **Timing Issues**: Concurrent deployments can sometimes interfere with each other.

## Using the Fix Preview Migrations Script

We've created a dedicated script to fix migration issues in the preview environment:

```bash
# Set your Supabase credentials as environment variables
export SUPABASE_PROJECT_ID=your-project-id
export SUPABASE_DB_PASSWORD=your-db-password

# Run the fix script
./scripts/fix-preview-migrations.sh
```

This script will:
1. Link to your Supabase project
2. Show the current migration status
3. Repair any problematic migrations
4. Push your migrations to the preview environment

## Manual Repair Steps

If the script doesn't resolve your issues, you can manually fix the preview environment:

1. **Check Migration Status**:
   ```bash
   supabase migration list
   ```

2. **Identify Problematic Migrations**:
   Look for mismatches between LOCAL and REMOTE columns.

3. **Repair Specific Migrations**:
   ```bash
   supabase migration repair --status reverted <problematic_timestamp>
   ```

4. **Push Migrations with Include-All Flag**:
   ```bash
   supabase db push --include-all
   ```

5. **Apply Repair Migration Directly**:
   ```bash
   PGPASSWORD="$SUPABASE_DB_PASSWORD" psql "$(supabase db remote get-connection-string)" -f supabase/migrations/20250227184420_repair_migration_history.sql
   ```

## Preventing Future Issues

To prevent migration issues in the preview environment:

1. **Always Use Idempotent Migrations**: Ensure migrations can be run multiple times without errors.
2. **Include Repair Mechanisms**: Add conditional logic to fix inconsistencies.
3. **Test Preview Deployments**: Regularly test deployments to the preview environment.
4. **Monitor Migration History**: Keep track of migration history across environments.
5. **Use the Latest Supabase CLI**: Keep your Supabase CLI updated to the latest version.

## Troubleshooting

If you encounter the "Remote migration versions not found in local migrations directory" error:

1. This typically means there's a migration in the remote database that doesn't exist in your local migrations directory.
2. The most reliable fix is to mark the problematic migration as reverted using `supabase migration repair`.
3. If that doesn't work, you may need to directly manipulate the migration history using the repair migration file.

Remember that the GitHub Actions workflow now includes enhanced error handling for preview deployments, which should automatically resolve most common issues.
