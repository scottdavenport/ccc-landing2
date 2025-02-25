# Sponsor Delete Feature

## Overview
This feature adds the ability to delete sponsors individually or in bulk from the admin interface. It includes a confirmation dialog to prevent accidental deletions and handles cleanup of associated resources.

## Changes

### New Components
1. `DeleteConfirmDialog.tsx`
   - Reusable confirmation dialog for delete operations
   - Shows custom title and description
   - Displays loading state during deletion
   - Has Cancel and Delete buttons

### Modified Components
1. `SponsorsTable.tsx`
   - Added checkbox column for row selection
   - Added bulk delete button that appears when rows are selected
   - Added delete functionality with Supabase and Cloudinary cleanup
   - Improved table layout with justified header actions

## Technical Details

### DeleteConfirmDialog Props
```typescript
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting?: boolean;
}
```

### Delete Process
1. User selects one or more sponsors using checkboxes
2. Clicks "Delete Selected" button
3. Confirmation dialog appears with count of selected items
4. On confirm:
   - Delete records from Supabase
   - Delete associated logos from Cloudinary
   - Update local state to remove deleted items
   - Reset selection state

### Error Handling
- Handles Supabase deletion errors
- Handles Cloudinary cleanup errors
- Shows error messages in the UI
- Maintains consistent state even if deletion fails

## Testing
1. Single sponsor deletion:
   - Select a single sponsor
   - Confirm delete dialog shows singular text
   - Verify sponsor and logo are removed
   - Check table updates correctly

2. Bulk sponsor deletion:
   - Select multiple sponsors
   - Confirm delete dialog shows plural text
   - Verify all sponsors and logos are removed
   - Check table updates correctly

3. Error cases:
   - Test network failure handling
   - Verify error messages are shown
   - Confirm state remains consistent

## Design Decisions
1. Used checkbox column for explicit selection
2. Added bulk delete button that only appears when needed
3. Implemented loading state in delete button
4. Created reusable confirmation dialog component
5. Added proper cleanup of Cloudinary resources
