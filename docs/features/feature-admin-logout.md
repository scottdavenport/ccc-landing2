# Admin Logout Feature

## Overview
This feature adds a logout button to the admin dashboard header that allows administrators to securely log out of the system. When clicked, the button clears all client-side cache (localStorage, sessionStorage, and cookies) and redirects the user to the login page.

## Implementation Details

### Components
- **AdminHeader**: A client component that contains the logout button and handles the logout logic.

### Functionality
1. When the logout button is clicked, the following actions occur:
   - The `signOut()` function from the auth context is called to end the user's session
   - All client-side storage is cleared (localStorage, sessionStorage, cookies)
   - The user is redirected to the login page

### UI Elements
- A logout button in the admin header with a logout icon
- The button is styled to match the existing admin UI design

### Security Considerations
- Clearing client-side storage helps prevent unauthorized access to cached data
- The redirection to the login page ensures the user must re-authenticate to access admin features

## Future Enhancements
- Add confirmation dialog before logout to prevent accidental clicks
- Implement server-side session invalidation for additional security
- Add logging of logout events for audit purposes
