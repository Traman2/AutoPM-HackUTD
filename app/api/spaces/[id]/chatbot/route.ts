import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import Space from '@/models/Space';
import mongoose from 'mongoose';
import { runChatbot, SpaceContext } from '@/app/api/agents/chatbotAgent/tools';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      console.log('[POST /api/spaces/[id]/chatbot] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[POST /api/spaces/${id}/chatbot] Invalid space ID format`);
      return NextResponse.json(
        { error: 'Invalid space ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const space = await Space.findOne({
      _id: id,
      userId: session.user.sub,
    });

    if (!space) {
      console.log(`[POST /api/spaces/${id}/chatbot] Space not found or unauthorized`);
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    console.log(`[POST /api/spaces/${id}/chatbot] Processing chatbot query: "${question}"`);

    // Build space context from all agent results
    const spaceContext: SpaceContext = {
      spaceName: space.spaceName,
      description: space.description,
      currentStep: space.currentStep,
      completed: space.completed,
    };

    // Add all agent results to context
    if (space.ideaAgent) {
      spaceContext.ideaAgent = {
        title: space.ideaAgent.title,
        summary: space.ideaAgent.summary,
        solutions: space.ideaAgent.solutions,
        selectedSolution: space.ideaAgent.selectedSolution,
      };
    }

    if (space.storyAgent) {
      spaceContext.storyAgent = {
        userStories: space.storyAgent.userStories,
        summary: space.storyAgent.summary,
      };
    }

    if (space.emailAgent) {
      spaceContext.emailAgent = {
        results: space.emailAgent.results,
        summary: space.emailAgent.summary,
      };
    }

    if (space.riceAgent) {
      spaceContext.riceAgent = {
        scores: space.riceAgent.scores,
        summary: space.riceAgent.summary,
      };
    }

    if (space.okrAgent) {
      spaceContext.okrAgent = {
        objectives: space.okrAgent.objectives,
        summary: space.okrAgent.summary,
      };
    }

    if (space.wireframeAgent) {
      spaceContext.wireframeAgent = {
        pages: space.wireframeAgent.pages?.map((page: any) => ({
          name: page.name,
          description: page.description,
        })),
        summary: space.wireframeAgent.summary,
      };
    }

    if (space.jiraAgent) {
      spaceContext.jiraAgent = {
        projectKey: space.jiraAgent.projectKey,
        projectName: space.jiraAgent.projectName,
        tickets: space.jiraAgent.tickets,
        summary: space.jiraAgent.summary,
      };
    }

    console.log('[POST /api/spaces/[id]/chatbot] Running chatbot agent...');

    // Run chatbot agent
    const result = await runChatbot(question, spaceContext);

    console.log(`[POST /api/spaces/${id}/chatbot] Chatbot response generated successfully`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[POST /api/spaces/[id]/chatbot] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chatbot query',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
