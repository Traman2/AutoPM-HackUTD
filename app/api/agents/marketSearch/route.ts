import { NextRequest, NextResponse } from 'next/server';
import { orchestrateAnalysis } from './tools';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import Space from '@/models/Space';
import mongoose from 'mongoose';

// Space context interface (simplified from chatbot)
interface SpaceContext {
  spaceName: string;
  problemStatement: string;
  currentStep: number;
  completed: boolean;

  ideaAgent?: {
    title?: string;
    summary?: string;
    solutions?: string[];
    selectedSolution?: string;
  };

  storyAgent?: {
    storyMarkdown?: string;
  };

  emailAgent?: {
    results?: any[];
    summary?: string;
  };

  riceAgent?: {
    features?: any[];
    analysis?: string;
  };

  okrAgent?: {
    summary?: string;
    analysis?: string;
  };

  wireframeAgent?: {
    pages?: any[];
  };

  jiraAgent?: {
    tickets?: any[];
    summary?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const okrFile = formData.get('okrFile') as File;
    const spaceId = formData.get('spaceId') as string;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!okrFile) {
      return NextResponse.json(
        { error: 'OKR document (PDF) is required' },
        { status: 400 }
      );
    }

    if (!spaceId || !mongoose.Types.ObjectId.isValid(spaceId)) {
      return NextResponse.json(
        { error: 'Valid space ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!okrFile.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'OKR document must be a PDF file' },
        { status: 400 }
      );
    }

    // Check if API keys are set
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    console.log('Starting comprehensive analysis orchestration for:', prompt);
    console.log('OKR file:', okrFile.name, 'size:', okrFile.size, 'bytes');
    console.log('Space ID:', spaceId);

    // Connect to database and fetch space data
    await connectDB();

    const space = await Space.findOne({
      _id: spaceId,
      userId: session.user.sub,
    });

    if (!space) {
      return NextResponse.json(
        { error: 'Space not found or unauthorized' },
        { status: 404 }
      );
    }

    // Build space context from all agent results
    const spaceContext: SpaceContext = {
      spaceName: space.name,
      problemStatement: space.problemStatement,
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
        storyMarkdown: space.storyAgent.storyMarkdown,
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
        features: space.riceAgent.features,
        analysis: space.riceAgent.analysis,
      };
    }

    if (space.okrAgent) {
      spaceContext.okrAgent = {
        summary: space.okrAgent.summary,
        analysis: space.okrAgent.analysis,
      };
    }

    if (space.wireframeAgent) {
      spaceContext.wireframeAgent = {
        pages: space.wireframeAgent.pages?.map((page: any) => ({
          name: page.name,
          description: page.description,
        })),
      };
    }

    if (space.jiraAgent) {
      spaceContext.jiraAgent = {
        tickets: space.jiraAgent.tickets,
        summary: space.jiraAgent.summary,
      };
    }

    console.log('Space context built successfully. Space:', space.name);

    // Convert file to buffer
    const arrayBuffer = await okrFile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const analysis = await orchestrateAnalysis(prompt, pdfBuffer, spaceContext);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: 'Comprehensive analysis completed successfully'
    });
  } catch (error) {
    console.error('Error in orchestration:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to complete comprehensive analysis'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Comprehensive Analysis Orchestrator API',
    description: 'Orchestrates multiple agents (OKR, Search, Feedback, News, Competitors) and returns structured JSON data',
    usage: {
      method: 'POST',
      endpoint: '/api/agents/orchestrator',
      body: {
        prompt: 'Your product or idea to analyze (e.g., "AI-powered customer support chatbot")'
      }
    },
    data_structure: {
      metadata: 'Prompt, timestamp, sources',
      customer_feedback: 'Sentiment analysis, themes, pain points, quotes',
      okr: 'OKR alignment analysis',
      industry_news: 'Recent news and trends',
      competitor_insights: 'Competitor analysis and market position'
    },
    examples: [
      'AI-powered customer support chatbot',
      'Mobile app for fitness tracking',
      'SaaS platform for project management',
      'E-commerce marketplace for handmade goods'
    ]
  });
}