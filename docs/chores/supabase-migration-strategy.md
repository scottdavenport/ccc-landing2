# Supabase Migration Strategy

This document outlines our approach to managing database migrations in our Supabase project.

### Migration Principles

1. **Idempotent Migrations**: All migrations should be designed to be idempotent, meaning they can be run multiple times without causing errors or changing the result beyond the first application.

2. **Timestamp-based Naming**: Migration files follow the format `<timestamp>_<descriptive_name>.sql` to ensure proper ordering and tracking.

3. **Version Control**: All migrations are stored in the `supabase/migrations` directory and tracked in Git.

4. **Automated Deployment**: Migrations are automatically deployed via GitHub Actions when changes are pushed to feature branches or main.

### Creating New Migrations

To create a new migration:

1. Use the Supabase CLI to generate a migration file:
   ```bash
   supabase migration new <descriptive_name>
   ```

2. Edit the generated file in `supabase/migrations` to include your SQL changes.

3. Make your migration idempotent by using conditional logic:
   ```sql
   -- For creating tables
   CREATE TABLE IF NOT EXISTS api.my_table (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at timestamptz NOT NULL DEFAULT now()
   );

   -- For adding columns
   DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'api' 
       AND table_name = 'my_table' 
       AND column_name = 'new_column'
     ) THEN
       ALTER TABLE api.my_table ADD COLUMN new_column text;
     END IF;
   END
   $$;
   ```

4. Test your migration locally:
   ```bash
   supabase db reset
   ```

### Handling Migration Errors

#### Duplicate Key Errors

If you encounter a "duplicate key value violates unique constraint" error when running migrations, it typically means the migration has already been applied but isn't properly recorded in the migration history table.

To resolve this:

1. **Verify Schema State**: First, verify that the expected schema changes are actually present in the database:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_schema = 'api' 
   AND table_name = 'your_table' 
   AND column_name = 'your_column';
   ```

2. **Repair Migration History**: If the schema is correct but the migration history is out of sync, use the repair command:
   ```bash
   supabase migration repair --status applied <timestamp>
   ```

3. **Our CI/CD Pipeline**: Our GitHub Actions workflow includes automated handling for duplicate key errors by:
   - Detecting duplicate key violations
   - Verifying that expected schema changes exist
   - Marking migrations as applied in the migration history

#### Migration History Mismatches

If local and remote migration histories diverge:

1. **List Migrations**: Compare local and remote migrations:
   ```bash
   supabase migration list        # Local migrations
   supabase migration list --db-only  # Remote migrations
   ```

2. **Find Common Point**: Identify the latest common migration between local and remote.

3. **Repair from Common Point**: Use the repair command to synchronize from the common point:
   ```bash
   supabase migration repair --status applied <common_timestamp>
   ```

### Best Practices

1. **Small, Focused Migrations**: Keep migrations small and focused on a single logical change.

2. **Always Include Permissions**: When creating new tables or columns, include appropriate permissions and RLS policies in the same migration.

3. **Test Locally First**: Always test migrations locally before pushing to remote environments.

4. **Document Schema Changes**: Update relevant documentation when making schema changes.

5. **Handle Errors Gracefully**: Our CI/CD pipeline includes error handling for common migration issues, but be prepared to manually intervene when necessary.

### Troubleshooting

#### Common Issues and Solutions

1. **Migration Already Applied**: If you get an error that a migration is already applied but it's not in your history:
   ```bash
   supabase migration repair --status applied <timestamp>
   ```

2. **Schema Drift**: If the actual database schema doesn't match what your migrations would create:
   ```bash
   # Generate a diff
   supabase db diff > schema_diff.sql
   
   # Review the diff and create a new migration if needed
   supabase migration new fix_schema_drift
   ```

3. **Reset Local Database**: If your local database is in a bad state:
   ```bash
   supabase db reset
   ```

4. **Manually Verify Schema**: Sometimes it's necessary to directly check the database schema:
   ```bash
   supabase db remote psql
   
   # Then in the psql console
   \dt api.*
   \d api.table_name
   ```

### Migration Deployment Flow

Our GitHub Actions workflow (`supabase-deploy.yml`) handles migration deployment with the following flow:

1. **Pull Requests**: Validates migrations without applying them.
2. **Feature Branches**: Deploys to the preview environment.
3. **Main Branch**: Deploys to the production environment.

The workflow includes robust error handling for common migration issues, including duplicate key errors and migration history mismatches.
