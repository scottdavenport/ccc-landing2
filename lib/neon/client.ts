// Client-side version of the Neon database client
// This version uses API routes instead of direct database access

// Helper function to get the base URL
function getBaseUrl() {
  // For server-side requests, use a default URL
  if (typeof window === 'undefined') {
    // Use VERCEL_URL for Vercel deployments
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  // For client-side requests, use the current origin
  return window.location.origin;
}

// Mock SQL template literal function for client-side
export const sql = async (strings: TemplateStringsArray, ...values: unknown[]) => {
  // Convert the template literal to a SQL string and parameters
  const sqlString = strings.raw.join('?');
  const baseUrl = getBaseUrl();
  
  try {
    // Call the API route with the SQL query
    const response = await fetch(`${baseUrl}/api/db/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: sqlString,
        params: values,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Database query failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to execute a query and return the results
export async function query<T = Record<string, unknown>>(queryString: string, params: unknown[] = []): Promise<T[]> {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/db/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: queryString,
        params,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Database query failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Add a function to check the database connection
export async function checkConnection() {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/db/connection`, {
      method: 'GET',
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.connected;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
} 