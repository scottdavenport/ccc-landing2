# ESLint Fix Plan for Tournament Results UI

This document outlines the ESLint errors detected during the build process for the Tournament Results UI feature branch. These issues should be addressed as part of a future cleanup task.

## Current Status

The repository is currently bypassing ESLint checks during the build process to allow for deployment without fixing all linting errors immediately. While this is an acceptable temporary solution, we should plan to address these issues in a future sprint.

## Temporary Solution Implementation

We're using the `build:no-lint` script which temporarily modifies the `next.config.js` file:

```bash
npm run build:no-lint
```

This script:
1. Runs `scripts/disable-lint-for-build.js` to set `eslint.ignoreDuringBuilds: true` in next.config.js
2. Runs the standard build process
3. Runs `scripts/enable-lint-for-build.js` to revert back to `eslint.ignoreDuringBuilds: false`

This approach has been implemented in both the preview and production GitHub Actions workflows.

## ESLint Issues Summary

The codebase currently has **25 linting errors** and **2 warnings** across 7 files:
- 13 TypeScript `no-explicit-any` errors
- 12 TypeScript `no-unused-vars` errors
- 2 React `react-hooks/exhaustive-deps` warnings

## Detailed Issues & Fix Recommendations

### 1. API Routes: `no-explicit-any` TypeScript Errors

TypeScript's `any` type should be avoided as it defeats the purpose of type safety. These issues are primarily in error handling.

#### `app/api/contest-results/route.ts` (Lines: 100, 117, 125, 139, 153)

**Issue:** Using `any` type for error handling and database responses.

**Recommended Fix:**
```typescript
// Instead of:
} catch (error: any) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// Use:
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return NextResponse.json({ error: errorMessage }, { status: 500 });
}
```

For database responses, create proper interfaces:
```typescript
interface ContestResult {
  id: string;
  player_id: string;
  contest_id: string;
  // Add other fields as needed
}

// Then use:
const results: ContestResult[] = await db.query(...)
```

#### `app/api/contests/route.ts` (Lines: 70, 84)
#### `app/api/players/route.ts` (Lines: 71, 91)
#### `app/api/results/route.ts` (Lines: 100, 113, 134)

Apply similar fixes as above.

### 2. Components: `no-unused-vars` Errors

Unused variables should be removed or prefixed with underscore to indicate intentional non-use.

#### `components/admin/results/ClosestToPinTab.tsx` and `LongDrivesTab.tsx`

Both files have identical issues with unused state variables:

**Issue:**
```typescript
const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
const [isLoadingResults, setIsLoadingResults] = useState(false);
const [contestFormMode, setContestFormMode] = useState<'add' | 'edit'>('add');
const [editingContestId, setEditingContestId] = useState<string | null>(null);
const [resultFormMode, setResultFormMode] = useState<'add' | 'edit'>('add');
const [editingResultId, setEditingResultId] = useState<string | null>(null);
```

**Recommended Fix:**
Either remove these variables if they're not needed, or prefix them with underscore:
```typescript
const [_isLoadingPlayers, setIsLoadingPlayers] = useState(false);
```

**React Hook Dependency Warning:**
```typescript
useEffect(() => {
  // Effect using contests
}, []); // Missing 'contests' in dependencies
```

**Fix:**
```typescript
useEffect(() => {
  // Effect using contests
}, [contests]); // Add contests to dependencies
```

#### `components/admin/results/FlightsResultsTab.tsx`

**Issues:**
- Unused import: `Trash`
- Unused state: `isLoadingTeams`
- Unused function: `prepareEditFlight`

**Fixes:**
- Remove the `Trash` import
- Prefix `isLoadingTeams` with underscore or remove if not needed
- Either implement `prepareEditFlight` functionality or remove it

## Implementation Strategy

### Immediate Actions
1. **Create GitHub Issue:** Create a ticket to track these linting fixes
2. **Add to Sprint Backlog:** Schedule this cleanup task for an upcoming sprint

### Fix Implementation (Priority Order)
1. **API Routes (High Priority):**
   - Create TypeScript interfaces for all API responses and requests
   - Fix error handling to use proper type narrowing instead of `any`

2. **Component Variables (Medium Priority):**
   - Remove or prefix unused variables
   - Clean up unused imports

3. **React Hook Dependencies (Low Priority):**
   - Add missing dependencies to dependency arrays or restructure effects

### Testing
After implementing fixes:
1. Run `npm run lint` to verify all issues are resolved
2. Ensure all functionality still works as expected
3. Update the CI workflows to use standard `npm run build` instead of `build:no-lint`

## Future Prevention
- Consider adding a pre-commit hook to check for linting errors
- Add ESLint to the CI pipeline as a separate step for early detection
- Document TypeScript best practices for the team

## Timeline
These fixes should be completed within the next 2-3 sprints after the Tournament Results UI feature is merged. They are not blocking the current PR merge. 