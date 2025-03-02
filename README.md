# Craven Cancer Classic Landing Page

This is the landing page for the Coastal Carolina Classic golf tournament.

## Development

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon serverless Postgres)
- Cloudinary account for image storage

### Environment Variables

The application uses different environment files for different environments:

- `.env.local` - Base environment variables
- `.env.development.local` - Development-specific variables (overrides `.env.local`)
- `.env.production.local` - Production-specific variables (used in production)

Create these files with the following variables:

```
# Neon Database
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-publishable-key"
CLERK_SECRET_KEY="your-secret-key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/admin/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/admin/login"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/admin"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/admin"

# Admin credentials (for development only)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="sponsor_logos"
```

### Installation

```bash
# Install dependencies
npm install

# Initialize all database environments at once
npm run db:init:all

# Or initialize a specific database environment
DATABASE_URL="your-development-db-url" npm run deploy:setup

# Start the development server
npm run dev
```

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Set up the environment variables in Vercel
4. Deploy the application

### Database Setup for Production

After deploying to Vercel, you need to initialize the database:

1. Set up the environment variables in Vercel
2. Run the database setup script:

```bash
# Option 1: Run locally with production DATABASE_URL
DATABASE_URL="your-production-db-url" npm run deploy:setup

# Option 2: Use Vercel CLI to run in production environment
vercel env pull .env.production.local
npm run deploy:setup
```

### Multiple Database Environments

This project supports multiple database environments:

1. **Development Database**: Used when running `npm run dev`
   - Configure in `.env.development.local`
   - Initialize with `DATABASE_URL="your-dev-db-url" npm run deploy:setup`

2. **Production Database**: Used when running `npm run build` and `npm run start`
   - Configure in `.env.production.local`
   - Initialize with `DATABASE_URL="your-prod-db-url" npm run deploy:setup`

3. **Test Database**: Used for testing
   - Configure in `.env.test.local`
   - Initialize with `DATABASE_URL="your-test-db-url" npm run deploy:setup`

You can initialize all database environments at once with:

```bash
npm run db:init:all
```

This script will read the DATABASE_URL from each environment file and initialize the corresponding database.

## Database Schema

The application uses two main tables:

1. `api.sponsor_levels` - Stores the different sponsorship levels
2. `api.sponsors` - Stores the sponsors information

The schema is defined in `lib/neon/schema.sql` and is automatically applied when running the `deploy:setup` script.

## Data Import

Sample data is stored in CSV files in the `migrations/data` directory:

- `sponsor_levels.csv` - Contains the sponsorship levels
- `sponsors.csv` - Contains the sponsors information

The data is automatically imported when running the `deploy:setup` script.

## Features

- Responsive landing page
- Admin dashboard for managing sponsors
- Authentication for admin users
- Image upload to Cloudinary
- Database integration with Neon Postgres

## Database Management

### Neon Database Environments

This project uses Neon for database hosting with two separate environments:

1. **Main Environment** - Used for production
   - Database URL: `ep-mute-tooth-a4mrn29b-pooler.us-east-1.aws.neon.tech`
   - Associated with the `main` branch

2. **Development Environment** - Used for development and feature branches
   - Database URL: `ep-hidden-paper-a4a7tmcd-pooler.us-east-1.aws.neon.tech`
   - Associated with the `development` branch and all feature branches

### Database Management Scripts

We've added several scripts to help manage the Neon database environments:

```bash
# Test connection to the database for the current branch
npm run db:test

# Initialize the database with schema and data
npm run db:init

# Update environment files with the correct DATABASE_URL
npm run db:update-env

# Switch to the main branch database
npm run db:switch:main

# Switch to the development branch database
npm run db:switch:dev
```

### Workflow for Branch-Based Database Management

1. When switching Git branches, use the corresponding database switch command:
   ```bash
   # If switching to main branch
   git checkout main
   npm run db:switch:main

   # If switching to development or a feature branch
   git checkout development
   npm run db:switch:dev
   ```

2. After switching, you can test the connection:
   ```bash
   npm run db:test
   ```

3. If needed, initialize the database with schema and data:
   ```bash
   npm run db:init
   ```

## Authentication

### Clerk Authentication

The application uses [Clerk](https://clerk.com/) for authentication. Clerk is a complete authentication and user management solution that provides:

- Email/password authentication
- Social login (Google, GitHub, etc.)
- Multi-factor authentication
- User management
- Session management

To set up Clerk:

1. Create a Clerk account at [clerk.com](https://clerk.com/)
2. Create a new application in the Clerk dashboard
3. Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
```

4. Configure your application in the Clerk dashboard:
   - Set up the authentication methods you want to use
   - Customize the appearance of the authentication UI
   - Configure email templates

For detailed setup instructions and troubleshooting, see [docs/clerk-setup.md](docs/clerk-setup.md).

### Admin Access

To restrict access to the admin dashboard:

1. Create a user in the Clerk dashboard
2. Assign the user the appropriate role/permissions
3. The middleware is configured to protect all routes under `/admin` except for `/admin/login`

## Cloudinary Image Management

### Sponsor Images

All sponsor images are stored in the `sponsors` folder in Cloudinary. This is enforced in several places:

1. The `SponsorForm` component adds a `folder` parameter to the form data when uploading a new sponsor logo.
2. The `/api/sponsors` route uses this parameter to upload the image to the correct folder.
3. The `/api/sponsors/logo` route also uploads images to the `sponsors` folder.

The database stores the full Cloudinary public ID including the folder path (e.g., `sponsors/image-id`), and the frontend components use this ID directly when displaying images.

To verify that all sponsor images are correctly stored in the `sponsors` folder, you can run:

```bash
node scripts/verify-sponsor-images.js
```

### Scripts

The project includes several scripts for managing Cloudinary images:

- `scripts/reupload-sponsor-images.js`: Re-uploads sponsor images to Cloudinary using the image URLs from the database.
- `scripts/verify-sponsor-images.js`: Verifies that all sponsor images are correctly stored in the `sponsors` folder.
- `scripts/list-all-cloudinary-assets.js`: Lists all assets in Cloudinary.
- `scripts/check-cloudinary-folders.js`: Checks the folder structure in Cloudinary.

## Database Migration Strategy

This project uses Neon database branching for isolated development and testing environments. The migration strategy ensures that database schema changes can be safely developed, tested, and deployed without affecting the production database.

### Setup Requirements

1. Create a Neon account and project at [neon.tech](https://neon.tech)
2. Set up the following environment variables in your `.env.local` file:
   ```
   DATABASE_URL="postgresql://user:password@host/database"
   MAIN_DATABASE_URL="postgresql://user:password@host/database"
   DEVELOPMENT_DATABASE_URL="postgresql://user:password@host/database"
   NEON_API_KEY="your-neon-api-key"
   NEON_PROJECT_ID="your-neon-project-id"
   ```
3. Add these same environment variables to your Vercel project and GitHub repository secrets

### Local Development

For local development, you can use the following npm scripts:

```bash
# Create a new branch from main
npm run db:branch:create main your-branch-name

# List all branches
npm run db:branch:list

# Run migrations on the current branch
npm run db:migrate

# Delete a branch
npm run db:branch:delete your-branch-name
```

### CI/CD Workflow

The project includes GitHub Actions workflows for automated database management:

1. **Preview Deployments** (PR opened/updated):
   - Creates a new Neon branch for the PR
   - Runs migrations on the branch
   - Deploys to Vercel preview environment
   - Comments on the PR with deployment details

2. **Production Deployments** (push to main):
   - Runs migrations on the main branch
   - Deploys to Vercel production environment

3. **Cleanup** (PR closed):
   - Deletes the Neon branch associated with the PR
   - Comments on the PR confirming cleanup

### Migration Management

Database migrations are managed using Prisma. To create a new migration:

```bash
# Create a new migration after updating your schema
npx prisma migrate dev --name your-migration-name

# Apply migrations to your current branch
npm run db:migrate
```

### Troubleshooting

If you encounter issues with database connections:

1. Verify your environment variables are correctly set
2. Check that your Neon project is active
3. Ensure you have the correct permissions for the API key
4. Run `npm run db:branch:list` to verify your branch exists

For more detailed information, refer to the [Neon documentation](https://neon.tech/docs) and [Prisma documentation](https://www.prisma.io/docs).
