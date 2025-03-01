import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from '@neondatabase/serverless';

// Configure Neon for production environments
if (process.env.NODE_ENV === 'production') {
  try {
    // Use WebSockets in Node.js environment
    // Dynamic import to avoid issues with Edge runtime
    const WebSocket = require('ws');
    neonConfig.webSocketConstructor = WebSocket;
    // Enable fetch-based queries for better performance
    neonConfig.fetchConnectionCache = true;
  } catch (error) {
    console.warn('WebSocket import failed, falling back to HTTP-only mode:', error);
  }
}

// Try to load environment variables if not already loaded
if (!process.env.DATABASE_URL && typeof require !== 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
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