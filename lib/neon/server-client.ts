import { neon } from '@neondatabase/serverless';

// Check if the required environment variables are set
const neonConnectionString = process.env.DATABASE_URL;

if (!neonConnectionString) {
  throw new Error('Missing DATABASE_URL environment variable');
}

// Create a SQL query executor using the Neon serverless driver
export const sql = neon(neonConnectionString);

// Helper function to execute a query and return the results
export async function query<T = Record<string, unknown>>(queryString: string, params: unknown[] = []): Promise<T[]> {
  try {
    // Use template literals with the sql function to execute the query
    const result = await sql(queryString, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Add a function to check the database connection
export async function checkConnection() {
  try {
    const result = await sql`SELECT 1 as connected`;
    return result[0].connected === 1;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
} 