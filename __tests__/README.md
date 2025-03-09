# Testing Approach

## Overview

This project uses Jest for testing the API endpoints. The tests are written in JavaScript to avoid TypeScript type issues with mocking.

## Test Structure

All tests are located in the `__tests__` directory with the following structure:

- `__tests__/api/js/` - JavaScript tests for API endpoints

## Testing Strategy

Each API endpoint has its own test file that tests both the GET and POST methods. The tests include:

1. **Happy Path Tests**:
   - Fetching data with and without filters
   - Creating new resources with valid data

2. **Error Handling Tests**:
   - Authentication failures (401)
   - Missing required fields (400)
   - Not found resources (404)
   - Conflict errors (409)
   - Server errors (500)

## Mock Strategy

The tests use Jest mocks to:

1. Mock the Prisma client (`$queryRaw` method)
2. Mock the Clerk authentication (`auth` function)
3. Create mock implementations of NextRequest and NextResponse

## Running Tests

To run all tests:

```bash
npm test
```

To run tests for a specific API endpoint:

```bash
npm test __tests__/api/js/tournament-years.test.js
```

## API Coverage

The following API endpoints are covered by tests:

- `/api/tournament-years` - Managing tournament years
- `/api/flights` - Managing flights within tournament years
- `/api/teams` - Managing teams within flights
- `/api/results` - Managing tournament results
- `/api/players` - Managing players
- `/api/contests` - Managing contests
- `/api/contest-results` - Managing contest results

## Future Improvements

If needed, TypeScript tests can be developed by properly typing the mock functions and classes. However, the current JavaScript tests provide adequate coverage without the complexity of TypeScript typing for mocks. 