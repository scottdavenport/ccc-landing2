# Clerk Authentication Setup

This document provides instructions for setting up Clerk authentication in the CCC Landing Page application.

## Environment Variables

Ensure your environment files (`.env.local` and `.env.development.local`) have the following Clerk-related variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
```

## Important Notes

1. **No Quotes**: Do not use quotes around the environment variable values. This can cause issues with how the variables are processed.

2. **Consistent Keys**: Make sure the publishable key and secret key are from the same Clerk application and environment.

3. **Allowed Domains**: Ensure that your development domain (e.g., `localhost:3000`) is added to the list of allowed domains in your Clerk dashboard.

## Troubleshooting

If you encounter an "Invalid host" error when accessing your application, check:

1. That your Clerk publishable key is correct and doesn't have quotes around it
2. That the domain you're accessing from is allowed in your Clerk dashboard
3. Try clearing your browser cookies for both localhost and the Clerk domain
4. Try accessing your application in an incognito/private browser window

## Clerk Dashboard

You can access your Clerk dashboard at [https://dashboard.clerk.com](https://dashboard.clerk.com) to manage your application settings, users, and domains. 