import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * GET /api/session
 * 
 * Returns the current user session if authenticated.
 * This endpoint is used by the frontend to check authentication status.
 * 
 * @returns {Object} Session object with user data or null if not authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        provider: session.provider,
      },
      accessToken: session.accessToken,
    }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}
