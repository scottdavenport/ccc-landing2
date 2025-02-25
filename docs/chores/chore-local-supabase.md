# Local Supabase Development Guide

This guide outlines our approach to managing Supabase database migrations across local, preview, and production environments.

## Environment Setup

### Prerequisites

- Docker Desktop installed and running
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Node.js and npm/yarn
- Git

### Local Development Environment

1. Initialize Supabase locally:

```bash
supabase init
```

2. Start local Supabase instance:

```bash
supabase start
```

This will create a local Supabase instance with:

- PostgreSQL database
- GoTrue for auth
- PostgREST for REST API
- Realtime for changes subscription
- Storage API

## Database Migration Workflow

### 1. Local Development

1. Create a new feature branch:

```bash
git checkout -b feature/your-feature-name
```

2. Create a new migration:

```bash
supabase migration new your_migration_name
```

This creates a new timestamped SQL file in `supabase/migrations/`.

3. Edit the migration file in `supabase/migrations/[timestamp]_your_migration_name.sql`

4. Apply migration locally:

```bash
supabase db reset
```

5. Test your changes thoroughly in the local environment

### 2. Preview Environment

When you push your branch and create a PR:

1. Vercel will create a preview deployment
2. Supabase will create a preview branch (via branching feature)
3. Preview database will be automatically migrated

To verify:

- Check the Vercel deployment logs
- Test the preview deployment thoroughly
- Verify database changes in Supabase dashboard

### 3. Production Deployment

When merging to main:

1. Vercel will deploy to production
2. Supabase will apply migrations to production database

## Important Notes

### Migration Safety

- Always test migrations locally first
- Use transactions in migrations when possible
- Include rollback instructions in migrations
- Avoid destructive changes without proper backup

### Branching Strategy

- Feature branches for development
- Preview branches for PR review
- Main branch for production

### Environment Variables

- Local: `.env.local`
- Preview: Automatically set by Vercel/Supabase integration
- Production: Set in Vercel dashboard

## Migration Safety and Rollback Procedures

### Pre-Migration Checklist

- [ ] Backup production database using Supabase dashboard
- [ ] Document current schema version and state
- [ ] Test migration in local environment
- [ ] Test migration in preview environment
- [ ] Prepare rollback SQL script
- [ ] Schedule migration during low-traffic period

### Writing Safe Migrations

1. **Always Use Transactions**

```sql
-- Example safe migration
BEGIN;

-- Check if we're in a safe state to migrate
DO $$
BEGIN
  IF EXISTS (/* check for unsafe conditions */) THEN
    RAISE EXCEPTION 'Unsafe migration condition detected';
  END IF;
END $$;

-- Your migration code here
CREATE TABLE IF NOT EXISTS example (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

COMMIT;
```

2. **Include Rollback Instructions**

```sql
-- Up migration
CREATE TABLE IF NOT EXISTS example (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Down migration (in separate file or commented)
-- DROP TABLE IF EXISTS example;
```

### Testing Migrations

1. **Local Testing**

```bash
# Create a test database
supabase db reset

# Apply migration
supabase migration up

# Test functionality
# Run your application tests

# Test rollback
supabase migration down
```

2. **Preview Environment Testing**

- Create multiple PRs with different test scenarios
- Test concurrent migrations
- Verify foreign key constraints
- Test with production-like data volume

### Emergency Rollback Procedures

1. **Quick Rollback (Recent Migration)**

```bash
# Get current migration status
supabase migration status

# Rollback last migration
supabase migration down -n 1
```

2. **Point-in-Time Recovery**

- Access Supabase dashboard
- Navigate to Database > Backups
- Select point-in-time recovery option
- Choose timestamp before problematic migration

3. **Manual Intervention**
   If automated rollback fails:

- Connect to database using psql
- Execute prepared rollback SQL scripts
- Verify data integrity
- Update schema_migrations table

### Monitoring and Verification

1. **Pre-Release**

- Monitor migration duration in preview
- Check for table locks
- Verify index creation timing
- Test with production data volume

2. **Post-Release**

- Monitor application error rates
- Check database performance metrics
- Verify data integrity
- Monitor query performance

### Common Pitfalls to Avoid

1. **Data Loss Prevention**

- Never use `DROP` without `IF EXISTS`
- Backup data before destructive changes
- Use temporary tables for data migration
- Verify row counts before/after migration

2. **Performance Impact**

- Add indexes after bulk data insertion
- Use batched updates for large tables
- Consider table partitioning for huge datasets
- Monitor lock timeouts

3. **Concurrent Access**

- Use `CREATE IF NOT EXISTS`
- Implement retry logic in application
- Consider `CONCURRENTLY` for index creation
- Use advisory locks for long-running migrations

### Recovery Time Objectives

Document your recovery time objectives (RTO):

1. Critical tables: < 15 minutes
2. Non-critical tables: < 1 hour
3. Full database: < 4 hours

Keep these times in mind when planning migrations and ensure your rollback procedures can meet these objectives.

## Troubleshooting

### Local Development

If local database gets corrupted:

```bash
supabase db reset
```

### Preview Environments

If preview database needs reset:

- Use Supabase dashboard to reset the preview branch
- Re-run Vercel deployment

## Useful Commands

```bash
# Start local development
supabase start

# Stop local development
supabase stop

# Create new migration
supabase migration new

# Reset local database
supabase db reset

# Link to Supabase project
supabase link --project-ref your-project-ref

# Push migrations to remote
supabase db push

# Pull remote schema
supabase db pull
```

## References

- [Supabase Branching Documentation](https://supabase.com/docs/guides/deployment/branching)
- [Database Migrations Guide](https://supabase.com/docs/guides/deployment/database-migrations)
- [Managing Environments](https://supabase.com/docs/guides/deployment/managing-environments)
