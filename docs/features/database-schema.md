# Database Schema

This document outlines the database schema for the CCC Landing Page application.

## Schema: `api`

### Tables

#### `sponsor_levels`

Stores information about different sponsorship levels.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| name | TEXT | Name of the sponsorship level |
| created_at | TIMESTAMPTZ | Creation timestamp, auto-generated |
| updated_at | TIMESTAMPTZ | Last update timestamp, auto-updated |
| amount | INTEGER | Sponsorship amount in dollars |

#### `sponsors`

Stores information about sponsors.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| name | TEXT | Name of the sponsor |
| level | UUID | Foreign key to sponsor_levels.id |
| year | INTEGER | Year of sponsorship |
| cloudinary_public_id | TEXT | Cloudinary public ID for the sponsor's logo |
| image_url | TEXT | URL to the sponsor's logo |
| created_at | TIMESTAMPTZ | Creation timestamp, auto-generated |
| updated_at | TIMESTAMPTZ | Last update timestamp, auto-updated |
| website | TEXT | Sponsor's website URL |

### Functions

#### `set_updated_at()`

Automatically updates the `updated_at` timestamp when a record is updated.

### Triggers

- `set_api_sponsor_levels_updated_at`: Updates the `updated_at` timestamp on the `sponsor_levels` table.
- `set_api_sponsors_updated_at`: Updates the `updated_at` timestamp on the `sponsors` table.

## Migration Files

The database schema is defined in migration files located in the `supabase/migrations` directory:

- `20250227000000_initial_schema.sql`: Creates the initial schema, tables, and relationships.
- `20250227000001_functions_and_policies.sql`: Creates functions, triggers, and policies.
- `20250227000002_rls_policies.sql`: Sets up Row Level Security policies for tables.

These migrations are automatically applied when deploying to Supabase.

## Row Level Security (RLS) Policies

The following RLS policies are configured:

### Anonymous Users (anon role)
- Read-only access to `sponsors` and `sponsor_levels` tables

### Authenticated Users (authenticated role)
- Full access (select, insert, update, delete) to `sponsors` and `sponsor_levels` tables
