import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import Space from '@/models/Space';
import User from '@/models/User';
import { sendTaskEmails, TeamMember } from '@/app/api/agents/gmailAgent/tools';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      console.log('[POST /api/spaces/[id]/run-email-agent] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[POST /api/spaces/${id}/run-email-agent] Invalid space ID format`);
      return NextResponse.json(
        { error: 'Invalid space ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { teamMembers, skipEmail } = body;

    await connectDB();

    const space = await Space.findOne({
      _id: id,
      userId: session.user.sub,
    });

    if (!space) {
      console.log(`[POST /api/spaces/${id}/run-email-agent] Space not found or unauthorized`);
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    // Validate that we're on step 3
    if (space.currentStep !== 3) {
      console.log(`[POST /api/spaces/${id}/run-email-agent] Agent can only run on step 3. Current step: ${space.currentStep}`);
      return NextResponse.json(
        { error: 'Email agent can only be run on step 3' },
        { status: 400 }
      );
    }

    // Validate that a solution was selected in Step 1
    const selectedSolution = (space.ideaAgent as any)?.selectedSolution;
    if (!selectedSolution) {
      console.log(`[POST /api/spaces/${id}/run-email-agent] No selected solution found from Idea Agent`);
      return NextResponse.json(
        { error: 'Please select a solution in Step 1 before proceeding' },
        { status: 400 }
      );
    }

    console.log(`[POST /api/spaces/${id}/run-email-agent] Processing email campaign with solution: ${selectedSolution.substring(0, 50)}...`);

    let emailAgentData;

    if (skipEmail) {
      // Skip email sending (for demo or when Google isn't connected)
      console.log(`[POST /api/spaces/${id}/run-email-agent] Skipping email sending (demo mode)`);
      
      emailAgentData = {
        totalUsers: 0,
        relevantUsers: 0,
        emailsSent: 0,
        results: [],
        summary: 'Email campaign skipped. Connect Google integration to send emails to team members.',
        generatedAt: new Date(),
      };
    } else {
      // Validate team members
      if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
        return NextResponse.json(
          { error: 'Please provide at least one team member' },
          { status: 400 }
        );
      }

      // Fetch Google tokens from MongoDB User model
      console.log(`[POST /api/spaces/${id}/run-email-agent] Fetching Google tokens from MongoDB for user: ${session.user.sub}`);
      
      const user = await User.findOne({ sub: session.user.sub })
        .select('+googleAuth.accessToken +googleAuth.refreshToken');

      if (!user?.googleAuth?.accessToken || !user?.googleAuth?.refreshToken) {
        console.log(`[POST /api/spaces/${id}/run-email-agent] No Google tokens found for user`);
        return NextResponse.json(
          { error: 'Google integration not configured. Please connect your Google account in Settings.' },
          { status: 400 }
        );
      }

      console.log(`[POST /api/spaces/${id}/run-email-agent] Google tokens found, running email agent...`);

      // Run the email agent with the selected solution as the plan
      const result = await sendTaskEmails(
        teamMembers as TeamMember[],
        selectedSolution,
        user.googleAuth.accessToken,
        user.googleAuth.refreshToken,
        session.user.name || 'Product Manager'
      );

      emailAgentData = {
        ...result,
        generatedAt: new Date(),
      };
    }

    console.log('[POST /api/spaces/[id]/run-email-agent] Email campaign completed');

    // Store the email results in the database
    space.set('emailAgent', emailAgentData);
    
    // Move to next step only if not already moved
    if (space.currentStep === 3) {
      space.currentStep = 4;
    }

    console.log('[POST /api/spaces/[id]/run-email-agent] About to save space...');
    
    try {
      await space.save();
      console.log('[POST /api/spaces/[id]/run-email-agent] Space saved successfully');
    } catch (saveError: any) {
      console.error('[POST /api/spaces/[id]/run-email-agent] Save error:', saveError);
      console.error('[POST /api/spaces/[id]/run-email-agent] Validation errors:', saveError.errors);
      throw saveError;
    }

    console.log(`[POST /api/spaces/${id}/run-email-agent] Successfully completed email campaign`);

    return NextResponse.json({
      success: true,
      data: space.emailAgent,
    });
  } catch (error: any) {
    console.error('[POST /api/spaces/[id]/run-email-agent] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run email agent', 
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

