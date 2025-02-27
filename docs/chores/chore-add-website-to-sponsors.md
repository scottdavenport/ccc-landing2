# Add Website Field to Sponsors

## Overview
This change adds a new `website` column to the sponsors table in the database. This allows us to store and display website URLs for each sponsor, enhancing the information available to users and providing direct links to sponsor websites.

## Implementation Details

### Database Changes
- Added a new `website` TEXT column to the `api.sponsors` table
- The column is nullable to maintain backward compatibility with existing data
- Added a descriptive comment to the column for better documentation

### Migration Strategy
- Created a simple ALTER TABLE migration that can be applied safely to all environments
- The migration is backward compatible and doesn't require any data migration
- Existing Row Level Security (RLS) policies automatically apply to the new column

## Testing
To verify this change:
1. Check that the column exists in the database schema
2. Verify that existing records are unaffected
3. Test adding a new sponsor with a website URL
4. Test updating an existing sponsor to add a website URL

## Future Work
- Update the admin interface to include a field for entering website URLs
- Add validation for website URLs to ensure they are properly formatted
- Display website links on the public-facing sponsor showcase
- Consider adding tracking for sponsor website click-throughs
