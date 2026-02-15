import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

/**
 * Health check endpoint
 * GET /api/health
 * 
 * Returns the health status of the backend services
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbHealthy = await checkDatabaseConnection();
    const dbLatency = Date.now() - startTime;
    
    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          latency: dbLatency,
        },
      },
    };
    
    const statusCode = dbHealthy ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
