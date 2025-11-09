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
