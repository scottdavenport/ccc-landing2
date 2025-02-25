# Add Sponsor Modal Feature

## Overview
This feature moves the "Add New Sponsor" form into a modal dialog, making the admin interface cleaner and more consistent with the logo upload functionality.

## Changes

### New Components
1. `AddSponsorDialog.tsx`
   - Modal dialog component that wraps the existing AddSponsorForm
   - Uses the same shadcn/ui Dialog component as the logo upload
   - Handles open/close state and sponsor added callback

### Modified Components
1. `SponsorsTable.tsx`
   - Removed inline AddSponsorForm
   - Added "Add New Sponsor" button with Plus icon
   - Added state management for dialog visibility
   - Added AddSponsorDialog component

## Technical Details

### AddSponsorDialog Props
```typescript
interface AddSponsorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSponsorAdded?: () => void;
}
```

### SponsorsTable Changes
```typescript
// New state for dialog visibility
const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);

// Button to open dialog
<Button onClick={() => setIsAddSponsorOpen(true)}>
  <Plus className="w-4 h-4" />
  Add New Sponsor
</Button>

// Dialog component
<AddSponsorDialog
  isOpen={isAddSponsorOpen}
  onClose={() => setIsAddSponsorOpen(false)}
  onSponsorAdded={fetchSponsors}
/>
```

## Testing
1. Click "Add New Sponsor" button - should open modal
2. Form in modal should work exactly as before
3. After successful submission:
   - Modal should close
   - Table should refresh with new sponsor
4. Clicking outside modal or close button should close modal
5. Verify all form validation still works in modal context

## Design Decisions
1. Used consistent modal pattern across features
2. Kept existing form component untouched
3. Added Plus icon to button for better UX
4. Positioned button above table for visibility
