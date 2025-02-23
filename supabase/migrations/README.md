# Database Migrations

This directory contains database migrations for the CCC Landing Page project.

## Migration Files

- `20240222_create_development_schema.sql`: Creates the development schema and sets up permissions for different environments

## Schema Strategy

We use different schemas for different environments:
- `public`: Production environment
- `development`: Development and preview environments

This allows us to:
- Keep development data separate from production
- Test schema changes safely in development
- Maintain different data sets for different environments

## Running Migrations

Migrations are automatically applied when deploying to Supabase. You can also apply them manually using the Supabase Dashboard or CLI.
