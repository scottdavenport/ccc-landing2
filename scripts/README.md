# Scripts Directory

This directory contains utility scripts for managing the application.

## Essential Scripts

### Database Management

#### `neon-db-manager.js`
Manages Neon database connections and operations.

#### `test-db-connection.js`
Tests the connection to the database.

#### `init-db.js`
Initializes the database with the schema.

#### `init-all-dbs.js`
Initializes all databases (development, preview, and production).

#### `init-prod-db.js`
Initializes the production database.

#### `init-preview-db.js`
Initializes the preview database.

#### `check-db-schema.js`
Checks the database schema and verifies that all required tables exist.

#### `import-data.js`
Imports data from CSV files into the database.

#### `import-csv-data.js`
Helper script for importing CSV data.

### User Management

#### `create-admin-user.js`
Creates an admin user in the database.

### Deployment

#### `deploy-setup.js`
Sets up the environment for deployment.

### Cloudinary Image Management

#### `reupload-sponsor-images.js`
Re-uploads sponsor images to Cloudinary with the correct folder structure and updates the database records.

### Maintenance

#### `cleanup-scripts.js`
Utility script to clean up the scripts directory by moving non-essential scripts to an archive folder.

## Environment Variables

These scripts require the following environment variables:

- `DATABASE_URL`: The connection string for the database (used by most scripts)
- `PROD_DATABASE_URL`: The connection string for the production database (used by copy scripts)
- `PREVIEW_DATABASE_URL`: The connection string for the preview database (used by copy scripts)
- `CLOUDINARY_CLOUD_NAME`: The Cloudinary cloud name
- `CLOUDINARY_API_KEY`: The Cloudinary API key
- `CLOUDINARY_API_SECRET`: The Cloudinary API secret

## Available NPM Scripts

### Check Database Schema
```bash
npm run db:check
```

### Initialize Preview Database
```bash
npm run db:init:preview
```

### Initialize Production Database
```bash
npm run db:init:prod
```

### Fix Preview Database
```bash
npm run db:fix:preview
```

### Fix Production Database
```bash
npm run db:fix:prod
```

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
- `cloudinary_public_id`: Cloudinary public ID for the sponsor logo (format: "sponsors/[public_id]")
- `image_url`: URL to the sponsor logo
- `website_url`: URL to the sponsor website
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone 