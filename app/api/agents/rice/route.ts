import { NextRequest, NextResponse } from 'next/server';
import { analyzeRicePrioritization, Feature } from './tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { features } = body;

    // Check if API key is set
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    // Validate features array
    if (!features || !Array.isArray(features) || features.length === 0) {
      return NextResponse.json(
        { error: 'Features array is required and cannot be empty' },
        { status: 400 }
      );
    }

    console.log('Analyzing RICE prioritization for features:', features);

    const result = await analyzeRicePrioritization(features as Feature[]);

    return NextResponse.json({
      success: true,
      sortedFeatures: result.sortedFeatures,
      analysis: result.analysis,
      message: 'RICE analysis completed successfully'
    });
  } catch (error) {
    console.error('Error analyzing RICE:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze features'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RICE Prioritization API',
    description: 'Calculates RICE scores and provides AI-powered prioritization analysis',
    usage: {
      method: 'POST',
      endpoint: '/api/agents/rice',
      contentType: 'application/json',
      body: {
        features: [
          {
            name: 'Feature name',
            reach: 10000,
            impact: 2.0,
            confidence: 0.8,
            effort: 15
          }
        ]
      },
      note: 'Features array is required and must contain at least one feature'
    },
    fields: {
      reach: 'Number of users affected per time period',
      impact: '3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal',
      confidence: 'Confidence level from 0.0 to 1.0 (e.g., 0.8 = 80%)',
      effort: 'Effort in person-months or story points'
    }
  });
}