import { NextRequest, NextResponse } from 'next/server';
import { analyzeIdea } from './ideaAgent';
import { z } from 'zod';

// Request body schema
const RequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = RequestSchema.parse(body);
    const analysis = await analyzeIdea(query);

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in analyze-idea API:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
