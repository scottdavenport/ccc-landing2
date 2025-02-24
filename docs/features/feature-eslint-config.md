# ESLint Configuration

## Overview
This feature implements ESLint rules specifically tailored for our project, with special consideration for Supabase patterns.

## Implementation Details

### Supabase Destructuring Pattern
We've configured ESLint to handle Supabase's standard response pattern (`{ data, error }`) without triggering unused variable warnings. This is implemented in [eslint.config.mjs](cci:7://file:///Users/scott/Library/Mobile%20Documents/com~apple~CloudDocs/github/ccc-landing2/eslint.config.mjs:0:0-0:0):

```javascript
{
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {
      varsIgnorePattern: '^data$',
      destructuredArrayIgnorePattern: '^data$',
      argsIgnorePattern: '^_',
    }],
  },
}