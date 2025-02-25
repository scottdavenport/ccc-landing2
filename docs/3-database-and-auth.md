# Database and Authentication Guide 🔐

Let's understand how we store data and handle admin access!

## Supabase Setup 📦

### What is Supabase?

- Think of it like a super-powered spreadsheet on the internet
- Stores all our data securely
- Handles user login/logout

### Our Database Tables

#### sponsors

```sql
table sponsors {
  id: number        -- Unique ID for each sponsor
  name: string      -- Sponsor's name
  logo_url: string  -- Link to sponsor's logo
  level: string     -- Sponsor level (Gold, Silver, etc.)
  created_at: date  -- When the sponsor was added
}
```

## How We Connect to Supabase 🔌

### client.ts

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

This file:

- Creates our connection to Supabase
- Uses environment variables for security
- Can be imported anywhere we need database access

## Using the Database 💾

### Adding a Sponsor

```typescript
// Example of adding a new sponsor
async function addSponsor(name: string) {
  const { data, error } = await supabase.from('sponsors').insert({ name });

  if (error) {
    console.error('Oops:', error.message);
    return false;
  }

  return true;
}
```

### Getting Sponsors

```typescript
// Example of getting all sponsors
async function getSponsors() {
  const { data, error } = await supabase.from('sponsors').select('*');

  if (error) {
    console.error('Oops:', error.message);
    return [];
  }

  return data;
}
```

## Authentication 🔑

### How Login Works

1. Admin goes to `/admin/login`
2. Enters email and password
3. Supabase checks if they're allowed
4. If yes, they can access admin pages
5. If no, they see an error message

### auth.tsx

```typescript
// lib/auth.tsx
export function AuthProvider({ children }) {
  // Keeps track of logged-in user
  const [user, setUser] = useState(null)

  // Check if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Connection Status 🚦

### How We Check Connection

```typescript
// components/admin/ConnectionStatus.tsx
async function checkConnection() {
  try {
    // Try to count sponsors
    const { error } = await supabase.from('sponsors').select('count');

    // If no error, we're connected!
    setStatus('connected');
  } catch {
    // If error, we're disconnected
    setStatus('disconnected');
  }
}
```

## Tips and Tricks 💡

1. **Always Handle Errors**

   ```typescript
   const { data, error } = await supabase.from('sponsors').select();
   if (error) {
     // Always check for errors!
     console.error(error);
     return;
   }
   ```

2. **Use TypeScript Types**

   ```typescript
   type Sponsor = {
     id: number;
     name: string;
     logo_url?: string; // ? means optional
   };
   ```

3. **Check Connection Status**

   - The green/red indicator shows database status
   - If it's red, check your .env file
   - Make sure you're connected to internet

4. **Security Best Practices**

   - Never share your Supabase keys
   - Always use environment variables
   - Test with fake data first

5. **Common Issues**
   - Red connection status? Check your .env file
   - Can't login? Check your email/password
   - Data not showing? Check the console for errors

## Need Help? 🤔

If you're stuck:

1. Check the browser console for errors
2. Make sure your .env file is set up
3. Try refreshing the page
4. Ask for help! We're here to help you learn
