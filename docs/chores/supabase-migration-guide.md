# Supabase Migration Guide

## Overview

This guide outlines best practices for managing database migrations with Supabase in our project. Following these guidelines will help prevent migration conflicts and ensure smooth deployments.

## Migration File Naming

- **Use Current Date**: Always use the current year for migration file names (e.g., `20250227_add_website_to_sponsors.sql` for a migration created on February 27, 2025)
- **Descriptive Names**: Use descriptive names that clearly indicate what the migration does
- **One Change Per Migration**: Each migration should make a single logical change to the database
- **Include Timestamp**: For more granular tracking, include a timestamp in the filename (e.g., `20250227_134225_sponsor_website_field.sql`)

## Creating New Migrations

Use our migration script to create new migrations:

```bash
./scripts/db-migrate.sh new migration_name
```

This will:
1. Create a properly formatted migration file with the current timestamp
2. Include placeholders for both "up" and "down" migrations
3. Follow our naming conventions automatically

## Testing Migrations

Before committing a new migration:

1. Test it locally using `supabase db push`
2. Verify that the changes are applied correctly
3. Test the rollback process if applicable

## GitHub Actions Workflow

Our project uses GitHub Actions to automatically deploy migrations in different scenarios:

1. **Pull Requests**: Migrations are validated for basic SQL syntax but not applied to any database
2. **Feature Branch Pushes**: Migrations are applied to the preview environment
3. **Main Branch Pushes**: Migrations are applied to the production environment

This ensures that migrations are thoroughly tested before being applied to production.

## Handling Migration Failures

If a migration fails to apply in the deployment pipeline:

1. **DO NOT** create a new migration file with the same SQL
2. Use the `scripts/apply-website-migration.sh` as a template to create a direct application script
3. Document the issue and solution in the PR

## Troubleshooting Common Issues

### Migration Already Applied

If Supabase reports that a migration has already been applied:

```
Error: Migration has already been applied
```

This means the migration is in Supabase's migration history but not in your local branch. Solutions:

1. Pull the latest changes from the main branch
2. Check if the migration exists with a different name
3. If needed, create a new migration that is idempotent (safe to run multiple times)

### Schema Conflicts

If your migration conflicts with the current schema:

```
Error: Relation already exists
```

Make your migrations idempotent by using conditional statements:

```sql
-- Add column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'api' 
    AND table_name = 'sponsors' 
    AND column_name = 'website'
  ) THEN
    ALTER TABLE api.sponsors ADD COLUMN website TEXT;
  END IF;
END $$;
```

## Best Practices

1. **Always Use the Migration Script**: Don't create migration files manually
2. **Include UNDO Sections**: Always include commented-out rollback SQL
3. **Make Migrations Idempotent**: When possible, make migrations safe to run multiple times
4. **Test Before Committing**: Always test migrations locally before pushing
5. **One Change Per Migration**: Keep migrations focused on a single change
6. **Current Dates**: Always use the current date in migration filenames
7. **Use Timestamps**: Include timestamps in migration filenames for more granular tracking
8. **Use Simple SQL**: Prefer simple SQL commands over complex PL/pgSQL blocks when possible

By following these guidelines, we can maintain a clean migration history and avoid deployment issues.
