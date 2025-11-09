import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import Space from '@/models/Space';
import User from '@/models/User';
import { addTicketsToProject, listJiraProjects, TeamMemberResult } from '@/app/api/agents/jiraAgent/tools';
import mongoose from 'mongoose';

// GET endpoint to list all Jira projects
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      console.log('[GET /api/spaces/[id]/run-jira-agent] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch Jira tokens from MongoDB User model
    console.log(`[GET /api/spaces/[id]/run-jira-agent] Fetching Jira tokens for user: ${session.user.sub}`);

    const user = await User.findOne({ sub: session.user.sub })
      .select('+jiraAuth.accessToken +jiraAuth.refreshToken +jiraAuth.tokenExpiry');

    if (!user?.jiraAuth?.accessToken || !user?.jiraAuth?.refreshToken) {
      console.log(`[GET /api/spaces/[id]/run-jira-agent] No Jira tokens found for user`);
      return NextResponse.json(
        { error: 'Jira integration not configured. Please connect your Jira account in Settings.' },
        { status: 400 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = user.jiraAuth.accessToken;
    const tokenExpiry = user.jiraAuth.tokenExpiry;
    const isExpired = !tokenExpiry || new Date() >= new Date(tokenExpiry);

    if (isExpired) {
      console.log(`[GET /api/spaces/[id]/run-jira-agent] Token expired, refreshing...`);
      try {
        const refreshResponse = await fetch(`${request.nextUrl.origin}/api/auth/jira/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: user.jiraAuth.refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        const refreshData = await refreshResponse.json();
        accessToken = refreshData.accessToken;
      } catch (error) {
        console.error(`[GET /api/spaces/[id]/run-jira-agent] Token refresh failed:`, error);
        return NextResponse.json(
          { error: 'Jira token expired. Please reconnect your Jira account in Settings.' },
          { status: 401 }
        );
      }
    }

    console.log(`[GET /api/spaces/[id]/run-jira-agent] Fetching Jira projects...`);

    // List all Jira projects
    const projects = await listJiraProjects(accessToken);

    console.log(`[GET /api/spaces/[id]/run-jira-agent] Found ${projects.length} projects`);

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    console.error('[GET /api/spaces/[id]/run-jira-agent] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Jira projects',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint to add tickets to a selected Jira project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      console.log('[POST /api/spaces/[id]/run-jira-agent] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[POST /api/spaces/${id}/run-jira-agent] Invalid space ID format`);
      return NextResponse.json(
        { error: 'Invalid space ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { projectKey, projectName } = body;

    if (!projectKey || typeof projectKey !== 'string') {
      return NextResponse.json(
        { error: 'Project key is required' },
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

    const space = await Space.findOne({
      _id: id,
      userId: session.user.sub,
    });

    if (!space) {
      console.log(`[POST /api/spaces/${id}/run-jira-agent] Space not found or unauthorized`);
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    // Validate that we're on step 7 (after wireframe agent)
    if (space.currentStep !== 7) {
      console.log(`[POST /api/spaces/${id}/run-jira-agent] Agent can only run on step 7. Current step: ${space.currentStep}`);
      return NextResponse.json(
        { error: 'Jira agent can only be run on step 7 (after completing wireframe design)' },
        { status: 400 }
      );
    }

    // Validate that a solution was selected in Step 1
    const selectedSolution = (space.ideaAgent as any)?.selectedSolution;
    if (!selectedSolution) {
      console.log(`[POST /api/spaces/${id}/run-jira-agent] No selected solution found from Idea Agent`);
      return NextResponse.json(
        { error: 'Please select a solution in Step 1 before proceeding' },
        { status: 400 }
      );
    }

    // Get team members from email agent results
    const emailAgentResults = (space.emailAgent as any)?.results;
    if (!emailAgentResults || !Array.isArray(emailAgentResults) || emailAgentResults.length === 0) {
      console.log(`[POST /api/spaces/${id}/run-jira-agent] No email agent results found`);
      return NextResponse.json(
        { error: 'No team members found from email agent. Please run the email agent first.' },
        { status: 400 }
      );
    }

    // Filter only successful email results and map to TeamMemberResult
    const teamMembers: TeamMemberResult[] = emailAgentResults
      .filter((result: any) => result.success && result.email && result.name && result.role)
      .map((result: any) => ({
        email: result.email,
        name: result.name,
        role: result.role,
      }));

    if (teamMembers.length === 0) {
      console.log(`[POST /api/spaces/${id}/run-jira-agent] No successful email results to use for Jira`);
      return NextResponse.json(
        { error: 'No team members available from email agent results' },
        { status: 400 }
      );
    }

    console.log(`[POST /api/spaces/${id}/run-jira-agent] Processing Jira workflow with ${teamMembers.length} team members from email agent`);
    console.log(`[POST /api/spaces/${id}/run-jira-agent] Team members:`, teamMembers.map(m => m.name).join(', '));

    // Fetch Jira tokens from MongoDB User model
    console.log(`[POST /api/spaces/${id}/run-jira-agent] Fetching Jira tokens from MongoDB for user: ${session.user.sub}`);

    const user = await User.findOne({ sub: session.user.sub })
      .select('+jiraAuth.accessToken +jiraAuth.refreshToken');

    if (!user?.jiraAuth?.accessToken || !user?.jiraAuth?.refreshToken) {
      console.log(`[POST /api/spaces/${id}/run-jira-agent] No Jira tokens found for user`);
      return NextResponse.json(
        { error: 'Jira integration not configured. Please connect your Jira account in Settings.' },
        { status: 400 }
      );
    }

    console.log(`[POST /api/spaces/${id}/run-jira-agent] Jira tokens found, running Jira agent...`);
    console.log(`[POST /api/spaces/${id}/run-jira-agent] Adding tickets to project: ${projectKey} (${projectName})`);

    // Run the NEW Jira agent workflow that adds tickets to an existing project
    const result = await addTicketsToProject(
      selectedSolution,
      teamMembers,
      user.jiraAuth.accessToken,
      projectKey,
      projectName
    );

    const jiraAgentData = {
      ...result,
      generatedAt: new Date(),
    };

    console.log('[POST /api/spaces/[id]/run-jira-agent] Jira workflow completed');

    // Store the Jira results in the database
    space.set('jiraAgent', jiraAgentData);

    // Step 7 is the last step, so mark as completed
    if (space.currentStep === 7) {
      space.completed = true;
    }

    console.log('[POST /api/spaces/[id]/run-jira-agent] About to save space...');

    try {
      await space.save();
      console.log('[POST /api/spaces/[id]/run-jira-agent] Space saved successfully');
    } catch (saveError: any) {
      console.error('[POST /api/spaces/[id]/run-jira-agent] Save error:', saveError);
      console.error('[POST /api/spaces/[id]/run-jira-agent] Validation errors:', saveError.errors);
      throw saveError;
    }

    console.log(`[POST /api/spaces/${id}/run-jira-agent] Successfully completed Jira workflow`);

    return NextResponse.json({
      success: true,
      data: space.jiraAgent,
    });
  } catch (error: any) {
    console.error('[POST /api/spaces/[id]/run-jira-agent] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run Jira agent',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
