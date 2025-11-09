import { NextRequest, NextResponse } from 'next/server';
import UserService from '@/lib/userService';

/**
 * Auth0 Post-Login Action Hook
 * This endpoint is called after successful Auth0 login
 * It syncs the user to MongoDB if they don't exist
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user } = body;

    if (!user || !user.sub) {
      return NextResponse.json(
        { error: 'Invalid user data' },
        { status: 400 }
      );
    }

    // Extract user data from Auth0
    const userData = {
      sub: user.sub,
      email: user.email,
      firstName: user.given_name || user.name?.split(' ')[0] || 'User',
      username: user.nickname || user.email.split('@')[0],
      // Note: dateOfBirth is not provided by Auth0 by default
      // You'll need to collect this separately or via custom claims
    };

    // Find or create user in MongoDB
    const { user: dbUser, isNewUser } = await UserService.findOrCreateUser(userData);

    return NextResponse.json({
      success: true,
      isNewUser,
      userId: dbUser._id,
    });
  } catch (error) {
    console.error('Error in auth hook:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}