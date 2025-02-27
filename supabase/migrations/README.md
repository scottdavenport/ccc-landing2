# Database Migrations

This directory contains database migrations for the CCC Landing Page project.

## Migration Files

- `20240222_create_development_schema.sql`: Creates the development schema and sets up permissions for different environments

## Schema Strategy

We use different schemas for different environments:

- `public`: Production environment (main branch)
- `development`: Development and preview environments (feature branches)

This allows us to:

- Keep development data separate from production
- Test schema changes safely in development
- Maintain different data sets for different environments

## Migration Workflow

### Creating Migrations

Always use the Supabase CLI to create new migrations:

```bash
# Create a new migration
supabase migration new migration_name
```

This ensures consistent naming and proper tracking in the migration history.

### Testing Migrations

Always test migrations locally before deploying:

```bash
# Apply migrations locally
supabase db reset
```

### Deploying Migrations

We use Supabase Preview for deploying migrations from pull requests. This happens automatically when you create a PR that includes migration changes.

**Note:** We previously used GitHub Actions for deployments, but this has been disabled to avoid conflicts with Supabase Preview.

## Troubleshooting

If you encounter migration conflicts:

1. Pull the current state of the remote database:
   ```bash
   supabase db pull
   ```

2. Repair the migration history if needed:
   ```bash
   supabase migration repair --status reverted <migration_id>
   ```

3. Reset your local database:
   ```bash
   supabase db reset
   ```

## Required Secrets

The following secrets must be set in your GitHub repository:

- `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
- `SUPABASE_PROJECT_ID`: Your Supabase project ID
- `SUPABASE_DB_PASSWORD`: Your Supabase database password

## Local Development

For local development, you can use the migration script:

```bash
# Create a new migration
./scripts/db-migrate.sh new migration_name

# Apply migrations locally
./scripts/db-migrate.sh up

# Check migration status
./scripts/db-migrate.sh status
```

Make sure to set your environment variables:

```bash
export SUPABASE_ACCESS_TOKEN=your_access_token
export SUPABASE_PROJECT_ID=your_project_id
