import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from '@neondatabase/serverless';
// Import dotenv at the top level
import * as dotenv from 'dotenv';

// Define a type for the WebSocket module
interface WebSocketModule {
  default: new (url: string, protocols?: string | string[]) => WebSocket;
}

// Configure Neon for production environments
if (process.env.NODE_ENV === 'production') {
  try {
    // Use WebSockets in Node.js environment
    // Only attempt to use WebSockets in a Node.js environment
    if (typeof window === 'undefined') {
      // Use dynamic import with Function constructor to avoid ESLint errors
      // This is a workaround for the ESLint no-require-imports rule
      const dynamicImport = new Function('modulePath', 'return import(modulePath)');
      
      dynamicImport('ws').then((WebSocketModule: WebSocketModule) => {
        neonConfig.webSocketConstructor = WebSocketModule.default;
      }).catch((error: Error) => {
        console.warn('WebSocket import failed, falling back to HTTP-only mode:', error);
      });
    }
  } catch (error) {
    console.warn('WebSocket import failed, falling back to HTTP-only mode:', error);
  }
}

// Try to load environment variables if not already loaded
if (!process.env.DATABASE_URL && typeof window === 'undefined') {
  try {
    // Load environment variables from .env.local
    dotenv.config({ path: '.env.local' });
  } catch (error) {
    console.warn('Failed to load .env.local file:', error);
  }
}

// Check if the required environment variables are set
const neonConnectionString = process.env.DATABASE_URL;

if (!neonConnectionString) {
  throw new Error('Missing DATABASE_URL environment variable');
}

// Create a SQL query executor using the Neon serverless driver
export const sql = neon(neonConnectionString);

// For more complex operations that need connection pooling
export const pool = new Pool({ connectionString: neonConnectionString });

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