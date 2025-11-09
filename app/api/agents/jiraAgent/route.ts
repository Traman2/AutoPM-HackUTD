import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createJiraWorkflow, TeamMemberResult } from './tools';

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      console.log('[POST /api/agents/jiraAgent] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { solutionPlan, teamMembers, projectName } = body;

    // Validate inputs
    if (!solutionPlan || typeof solutionPlan !== 'string') {
      return NextResponse.json(
        { error: 'Solution plan is required' },
        { status: 400 }
      );
    }

    if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'At least one team member is required' },
        { status: 400 }
      );
    }

    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch Jira tokens from MongoDB User model
    console.log(`[POST /api/agents/jiraAgent] Fetching Jira tokens from MongoDB for user: ${session.user.sub}`);

    const user = await User.findOne({ sub: session.user.sub })
      .select('+jiraAuth.accessToken +jiraAuth.refreshToken');

    if (!user?.jiraAuth?.accessToken || !user?.jiraAuth?.refreshToken) {
      console.log(`[POST /api/agents/jiraAgent] No Jira tokens found for user`);
      return NextResponse.json(
        { error: 'Jira integration not configured. Please connect your Jira account in Settings.' },
        { status: 400 }
      );
    }

    console.log(`[POST /api/agents/jiraAgent] Jira tokens found, running Jira agent...`);

    // Run the Jira agent workflow
    const result = await createJiraWorkflow(
      solutionPlan,
      teamMembers as TeamMemberResult[],
      user.jiraAuth.accessToken,
      user.jiraAuth.refreshToken,
      projectName
    );

    console.log(`[POST /api/agents/jiraAgent] Successfully completed Jira workflow`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[POST /api/agents/jiraAgent] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run Jira agent',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
