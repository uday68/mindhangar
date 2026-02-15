import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL;

// For migrations, use a single connection
const migrationClient = postgres(connectionString, { max: 1 });

// For queries, use connection pooling
const queryClient = postgres(connectionString);

// Create Drizzle instances
export const db = drizzle(queryClient, { schema });
export const migrationDb = drizzle(migrationClient, { schema });

// Export schema for use in queries
export { schema };

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await queryClient.end();
  await migrationClient.end();
}
