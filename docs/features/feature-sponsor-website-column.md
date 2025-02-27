# Sponsor Website Column

## Overview
This feature adds a `website` column to the `sponsors` table in the database, allowing us to store and display website URLs for each sponsor.

## Implementation Details
- Added a new migration file (`20250227_add_website_to_sponsors.sql`) that safely adds the `website` column to the `api.sponsors` table
- The migration is designed to be idempotent (can be run multiple times without error) by checking if the column exists before attempting to add it
- This ensures compatibility across all environments (development, production)

## Technical Considerations
- The column is defined as `TEXT` type to accommodate URLs of any length
- The column is nullable to maintain compatibility with existing data
- The migration includes an undo section (commented out) that can be used to revert the change if needed

## Future Enhancements
- Add UI components to display sponsor websites
- Add form fields to allow editing of sponsor websites
- Consider adding URL validation
