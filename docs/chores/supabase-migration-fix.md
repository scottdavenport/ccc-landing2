# Supabase Migration Fix Guide

This document provides step-by-step instructions to fix the Supabase migration issues we're experiencing.

## Prerequisites

1. Ensure you have the Supabase CLI installed:
   ```bash
   which supabase
   ```

2. Log in to the Supabase CLI:
   ```bash
   supabase login
   ```
   This will open a browser window to generate a token. Copy the token and paste it in your terminal.

3. Set environment variables (if needed):
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_access_token
   export SUPABASE_PROJECT_ID=your_project_id
   ```

## Step 1: Link to your Supabase project

```bash
cd "/Users/scott/Library/Mobile Documents/com~apple~CloudDocs/github/ccc-landing2"
supabase link --project-ref your_project_id
```

## Step 2: Pull the current state of the remote database

This will update your local state to match the remote database:

```bash
supabase db pull
```

## Step 3: Repair the migration history

Run the repair command with the migration IDs mentioned in the error message:

```bash
supabase migration repair --status reverted 20250227_140535 20250227200000 20250228000000
```

## Step 4: Reset your local database

This will apply all migrations to your local database:

```bash
supabase db reset
```

## Step 5: Update your migration naming convention

For future migrations, use the Supabase CLI to create them:

```bash
supabase migration new add_new_feature
```

## Step 6: Update documentation

Update the migration README to reflect the new workflow.

## Step 7: Commit changes

```bash
git add .
git commit -m "Fix Supabase migration issues"
git push
```

## Best Practices Going Forward

1. Always use `supabase migration new` to create migrations
2. Test migrations locally with `supabase db reset` before pushing
3. Use `supabase db push` to deploy migrations to remote
4. Regularly check migration status with `supabase migration list`
5. Use the Supabase Preview feature for PR deployments instead of GitHub Actions
