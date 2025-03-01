# Database Management Scripts

This directory contains scripts for managing the database for the CCC Landing Page application.

## Environment Variables

These scripts require the following environment variables:

- `DATABASE_URL`: The connection string for the database (used by most scripts)
- `PROD_DATABASE_URL`: The connection string for the production database (used by copy scripts)
- `PREVIEW_DATABASE_URL`: The connection string for the preview database (used by copy scripts)

If these environment variables are not set, the scripts will use the hardcoded values in the scripts.

## Available Scripts

### Check Database Schema

Checks the database schema and verifies that all required tables exist.

```bash
npm run db:check
```

### Initialize Preview Database

Initializes the database schema for the Preview environment.

```bash
npm run db:init:preview
```

### Initialize Production Database

Initializes the database schema for the Production environment.

```bash
npm run db:init:prod
```

### Copy Production Data to Preview

Copies data from the Production database to the Preview database.

```bash
npm run db:copy:prod-to-preview
```

### Fix Preview Database

Runs all the necessary steps to fix the Preview database:
1. Checks the current database state
2. Initializes the database schema
3. Copies data from Production to Preview
4. Performs a final check

```bash
npm run db:fix:preview
```

### Fix Production Database

Runs all the necessary steps to fix the Production database:
1. Checks the current database state
2. Initializes the database schema
3. Performs a final check

```bash
npm run db:fix:prod
```

## Troubleshooting

If you encounter issues with the database:

1. Check that your environment variables are set correctly
2. Run `npm run db:check` to verify the database schema
3. Run `npm run db:fix:preview` to fix the Preview database
4. Run `npm run db:fix:prod` to fix the Production database
5. Check the Vercel logs for more details on any errors

## Database Structure

The CCC Landing Page application uses the following database structure:

### Schema: `api`

#### Table: `sponsor_levels`
- `id`: UUID primary key
- `name`: Sponsor level name (e.g., Platinum, Gold)
- `amount`: Decimal amount for the sponsor level
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

#### Table: `sponsors`
- `id`: UUID primary key
- `name`: Sponsor name
- `level`: UUID foreign key to sponsor_levels.id
- `year`: Integer representing the year
- `cloudinary_public_id`: Cloudinary public ID for the sponsor logo
- `image_url`: URL to the sponsor logo
- `website_url`: URL to the sponsor website
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone 