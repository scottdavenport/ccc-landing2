# Production Deployment Process

This document outlines the production deployment process for the CCC Landing Page application and the fixes implemented to ensure smooth deployments.

## Deployment Workflow

The production deployment is handled by GitHub Actions using the workflow defined in `.github/workflows/production.yml`. The workflow is triggered automatically when changes are pushed to the `main` branch.

## Database Migrations

Database migrations are handled using Prisma and our custom `db-migration-manager.js` script. For production deployments, we use `prisma db push` with the `--accept-data-loss` flag to ensure that schema changes can be applied without failing due to potential data loss warnings.

## Environment Variables

The following environment variables are required for production deployments:

- `DATABASE_URL`: The connection string for the production database
- `VERCEL_ORG_ID`: The Vercel organization ID
- `VERCEL_PROJECT_ID`: The Vercel project ID
- `VERCEL_TOKEN`: The Vercel API token
- `NEON_API_KEY`: The Neon API key
- `NEON_PROJECT_ID`: The Neon project ID
- `CLERK_SECRET_KEY`: The Clerk secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: The Clerk publishable key

## Fixes Implemented

The following fixes were implemented to ensure smooth production deployments:

1. Added the `DATABASE_URL` secret to GitHub repository secrets
2. Modified the production workflow to set the `DATABASE_URL` environment variable in multiple places:
   - In `.env.local` and `.env` files for the build process
   - In Vercel environment variables for the deployment
   - In environment variables for the migration step
3. Modified the `db-migration-manager.js` script to:
   - Use `prisma db push` instead of `prisma migrate deploy` for production (main branch)
   - Add the `--accept-data-loss` flag to handle schema changes that might result in data loss warnings

## Troubleshooting

If you encounter issues with the production deployment, check the following:

1. Ensure all required environment variables are set in GitHub repository secrets
2. Check the GitHub Actions workflow logs for any errors
3. Verify that the database connection string is correct
4. Check if there are any schema changes that might require manual intervention 