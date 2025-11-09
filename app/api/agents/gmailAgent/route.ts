import { NextRequest, NextResponse } from 'next/server';
import { sendTaskEmails, TeamMember } from './tools';
import { auth0 } from '@/lib/auth0';
import UserService from '@/lib/userService';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { users, solutionPlan } = body;

    // Validate input
    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Users array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!solutionPlan || typeof solutionPlan !== 'string') {
      return NextResponse.json(
        { error: 'Solution plan is required' },
        { status: 400 }
      );
    }

    // Validate user structure
    for (const user of users) {
      if (!user.email || !user.name || !user.role || !user.description) {
        return NextResponse.json(
          { error: 'Each user must have email, name, role, and description fields' },
          { status: 400 }
        );
      }
    }

    // Check API keys
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Google OAuth credentials are not configured' },
        { status: 500 }
      );
    }

    // Get user's Google OAuth tokens
    const user = await UserService.findBySub(session.user.sub);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get Google auth with tokens (explicitly select them)
    const userWithTokens = await UserService.findBySubWithGoogleTokens(session.user.sub);

    if (!userWithTokens?.googleAuth?.accessToken || !userWithTokens?.googleAuth?.refreshToken) {
      return NextResponse.json(
        { error: 'Google account not connected. Please connect your Google account first.' },
        { status: 403 }
      );
    }

    console.log('Sending task emails for solution plan:', solutionPlan.substring(0, 100) + '...');

    const result = await sendTaskEmails(
      users as TeamMember[],
      solutionPlan,
      userWithTokens.googleAuth.accessToken,
      userWithTokens.googleAuth.refreshToken,
      user.firstName || user.username || 'Team'
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Task emails processed successfully'
    });
  } catch (error) {
    console.error('Error in Gmail agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to send task emails'
      },
      { status: 500 }
    );
  }
}