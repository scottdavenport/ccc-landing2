# Testing Strategy and Setup

## Overview

This document outlines our testing approach for the CCC Landing Page, with a focus on E2E testing using Playwright and integration testing.

## Testing Framework: Playwright

### Why Playwright?

- Reliable testing for modern web apps
- Built-in support for file uploads (critical for Cloudinary integration)
- Cross-browser testing capabilities (Chrome, Firefox, Safari)
- Network request interception and mocking
- Built-in debugging tools
- Database state verification support

### Test Structure

```
tests/
├── e2e/
│   ├── cloudinary/
│   │   ├── upload.spec.ts
│   │   └── management.spec.ts
│   └── setup/
│       └── global-setup.ts
├── integration/
│   └── cloudinary/
│       ├── api.test.ts
│       └── ui.test.ts
└── fixtures/
    └── test-images/
        └── sample-logo.png
```

### Key Test Scenarios

#### E2E Tests (Priority 1)

1. Sponsor Logo Upload Flow

   - File selection and preview
   - Upload to Cloudinary
   - Database record creation
   - Error handling

2. Logo Management
   - View uploaded logos
   - Update/replace logos
   - Delete logos
   - Permissions validation

#### Integration Tests (Priority 2)

1. API Integration

   - Cloudinary API responses
   - Database operations
   - Error handling

2. UI Components
   - Upload component behavior
   - Preview functionality
   - Form validation
   - State management

## Setup Instructions

1. Install Playwright:

```bash
npm install -D @playwright/test
```

2. Initialize Playwright config:

```bash
npx playwright install
```

3. Required environment variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

## Running Tests

```bash
# Run all tests
npm run test

# Run only E2E tests
npm run test:e2e

# Run only integration tests
npm run test:integration

# Run tests with UI mode
npm run test:ui
```

## Best Practices

1. Use test isolation - each test should be independent
2. Clean up test data after each run
3. Use meaningful test descriptions
4. Follow AAA pattern (Arrange, Act, Assert)
5. Use fixtures for common setup
6. Mock external services when appropriate

7. Unit Tests (Jest):

   - Image validation functions
   - URL transformation utilities
   - Component rendering tests

8. Integration Tests (Jest + Testing Library):

   - Upload form submission
   - Error handling
   - State management
   - Database operations

9. E2E Tests (Playwright):
   - Complete upload flow
   - Image preview
   - Database verification
   - Error scenarios
   - Cross-browser compatibility
