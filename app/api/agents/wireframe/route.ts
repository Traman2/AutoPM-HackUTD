import { NextRequest, NextResponse } from 'next/server';
import { generateWireframes, generateWireframe } from './tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { solution, prompt, multiple } = body;

    // Support both new (solution/multiple) and legacy (prompt/single) modes
    const inputText = solution || prompt;

    if (!inputText) {
      return NextResponse.json(
        { error: 'Solution or prompt is required' },
        { status: 400 }
      );
    }

    // Check if API key is set
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    // Generate multiple pages by default, or single page if explicitly requested
    if (multiple === false || prompt) {
      console.log('[Wireframe API] Generating single wireframe for:', inputText.substring(0, 50) + '...');
      const html = await generateWireframe(inputText);
      return NextResponse.json({
        success: true,
        html,
        message: 'Wireframe generated successfully'
      });
    } else {
      console.log('[Wireframe API] Generating multiple wireframes for solution:', inputText.substring(0, 50) + '...');
      const pages = await generateWireframes(inputText);
      return NextResponse.json({
        success: true,
        pages,
        message: `${pages.length} wireframe pages generated successfully`
      });
    }
  } catch (error) {
    console.error('[Wireframe API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to generate wireframe'
      },
      { status: 500 }
    );
  }
}