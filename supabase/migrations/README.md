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

## Automated Deployments

Migrations are automatically deployed via GitHub Actions when:
1. Changes are pushed to the `main` branch (deploys to production schema)
2. Changes are pushed to `feature/*` branches (deploys to development schema)
3. Pull requests are created that include migration changes

The workflow is defined in `.github/workflows/supabase-deploy.yml`.

### Required Secrets

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
```
