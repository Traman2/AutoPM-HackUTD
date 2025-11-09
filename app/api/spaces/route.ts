import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import Space from '@/models/Space';

// Create a new space
export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      console.log('[POST /api/spaces] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, problemStatement } = body;

    console.log(`[POST /api/spaces] Creating space for user: ${session.user.sub}`);
    console.log(`[POST /api/spaces] Name: ${name}, Problem: ${problemStatement?.substring(0, 50)}...`);

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('[POST /api/spaces] Validation error: Space name is required');
      return NextResponse.json(
        { error: 'Space name is required' },
        { status: 400 }
      );
    }

    if (!problemStatement || typeof problemStatement !== 'string' || problemStatement.trim().length < 10) {
      console.log('[POST /api/spaces] Validation error: Problem statement too short');
      return NextResponse.json(
        { error: 'Problem statement must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Create new space
    const newSpace = await Space.create({
      userId: session.user.sub,
      name: name.trim(),
      problemStatement: problemStatement.trim(),
      currentStep: 1,
      completed: false,
    });

    console.log(`[POST /api/spaces] Successfully created space: ${newSpace._id}`);

    return NextResponse.json(newSpace, { status: 201 });
  } catch (error) {
    console.error('[POST /api/spaces] Error creating space:', error);
    return NextResponse.json(
      { error: 'Failed to create space', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get all spaces for the current user
export async function GET() {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      console.log('[GET /api/spaces] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[GET /api/spaces] Fetching spaces for user: ${session.user.sub}`);

    // Connect to MongoDB
    await connectDB();

    // Fetch all spaces for this user
    const spaces = await Space.find({ userId: session.user.sub })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[GET /api/spaces] Found ${spaces.length} spaces`);

    return NextResponse.json(spaces);
  } catch (error) {
    console.error('[GET /api/spaces] Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
