import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import Space from '@/models/Space';

export async function GET() {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Not authenticated',
        user: null,
      }, { status: 401 });
    }

    // Try to connect to MongoDB
    await connectDB();

    // Try to count spaces for this user
    const count = await Space.countDocuments({ userId: session.user.sub });

    return NextResponse.json({
      status: 'ok',
      message: 'Spaces API is healthy',
      user: {
        sub: session.user.sub,
        email: session.user.email,
        name: session.user.name,
      },
      mongodb: {
        connected: true,
        spaceCount: count,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      mongodb: {
        connected: false,
      },
    }, { status: 500 });
  }
}

