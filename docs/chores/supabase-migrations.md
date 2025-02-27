# Supabase Migrations

## Overview

This project uses Supabase for database management. We've moved away from using GitHub Actions for deploying migrations and now rely solely on the Supabase Preview environment for testing and deploying database changes.

## Migration Process

1. **Development**:
   - Create or modify migration files in the `supabase/migrations` directory
   - Migration files should be named with a timestamp prefix (e.g., `20250227_initial_schema.sql`)
   - Run migrations locally using the Supabase CLI

2. **Testing**:
   - When a PR is created, the Supabase Preview environment automatically applies migrations
   - Test your changes in the Preview environment before merging

3. **Deployment**:
   - Once a PR is merged to main, changes will be deployed to the production environment through the Supabase dashboard

## Best Practices

- Always test migrations in the Preview environment before merging to main
- Keep migration files focused and atomic
- Document schema changes in the `docs/features/database-schema.md` file
- Use the Supabase CLI for local development and testing

## Local Development

To run migrations locally:

```bash
# Link to your Supabase project
supabase link --project-ref <project-id>

# Push migrations to your local Supabase instance
supabase db push

# Or to reset and apply all migrations
supabase db reset
```

## Troubleshooting

If you encounter issues with migrations:

1. Check the Supabase dashboard for error messages
2. Verify that your migration SQL is compatible with PostgreSQL
3. Consider breaking complex migrations into smaller, more manageable parts
