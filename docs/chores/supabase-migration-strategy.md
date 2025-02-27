# Supabase Migration Strategy

This document outlines our approach to managing Supabase database migrations across different environments.

## Migration Files

All migration files are stored in the `supabase/migrations` directory. Each migration follows the naming convention:

```
YYYYMMDD_HHMMSS_descriptive_name.sql
```

## Migration Workflow

### Local Development

1. Create a new migration using the script:
   ```bash
   ./scripts/db-migrate.sh new migration_name
   ```

2. Apply migrations locally:
   ```bash
   ./scripts/db-migrate.sh up
   ```

3. Check migration status:
   ```bash
   ./scripts/db-migrate.sh status
   ```

### Automated Deployment

Migrations are automatically deployed via GitHub Actions when:

1. Changes are pushed to the `main` branch (deploys to production schema)
2. Changes are pushed to `feature/*` branches (deploys to development schema)
3. Pull requests are created that include migration changes (validation only)

## Handling Migration Issues

### Migration History Mismatches

If there's a mismatch between local and remote migration histories, the GitHub Actions workflow will:

1. Display the current migration status for debugging
2. Attempt a standard migration push first
3. If that fails, find the latest common migration between local and remote
4. Repair the migration history from that common point
5. Retry the migration push

This approach ensures that we maintain proper synchronization between the migration history and the actual database state.

### Idempotent Migrations

To ensure migrations can be applied multiple times without errors, we use idempotent SQL patterns:

```sql
-- Example of an idempotent column addition
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'api' 
    AND table_name = 'table_name' 
    AND column_name = 'column_name'
  ) THEN
    ALTER TABLE api.table_name ADD COLUMN column_name TEXT;
  END IF;
END $$;
```

### Manual Intervention

In some cases, manual intervention may be required:

1. When there are conflicts that can't be automatically resolved
2. When there are no common migrations between local and remote
3. When permissions issues prevent automatic migration

For these cases, follow these steps:

1. Run `supabase migration list` locally to see local migrations
2. Run `supabase migration list --db-only` to see remote migrations
3. Identify the discrepancies between the two lists
4. Use `supabase migration repair --status applied <timestamp>` to mark migrations as applied
5. Run `supabase db push` to apply any remaining migrations

## Best Practices

1. Always make migrations idempotent when possible
2. Include both "up" and "down" migrations (using the `@UNDO` comment)
3. Test migrations locally before pushing
4. Keep migration files small and focused on a single change
5. Include permission grants in the migration file
6. Use Row Level Security (RLS) policies for data access control
7. Never manually apply migrations directly to the database outside of the Supabase migration system
