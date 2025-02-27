# Sponsor Website Field

## Overview
This feature adds an optional website field to sponsors in the system. This allows administrators to store and display the website URL for each sponsor.

## Implementation Details

### Database Changes
- Added a `website` column to the `api.sponsors` table as a TEXT field
- Migration file: `20250227_add_website_to_sponsors.sql`

### UI Changes
- Added a website input field to the Add/Edit Sponsor form
- The field is optional (not required)
- When editing a sponsor, the website field will be pre-populated if available

### Type Changes
- Updated the `SponsorWithLevel` type to include the optional `website` property

## Usage
Administrators can now enter a website URL when adding or editing sponsors. This field is optional and can be left blank.

## Migration Script
For environments where the standard migration process isn't working, a helper script has been provided:
- `scripts/apply-website-migration.sh` - Directly applies the website column to the database
