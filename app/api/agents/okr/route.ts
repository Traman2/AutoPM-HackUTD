import { NextRequest, NextResponse } from 'next/server';
import { analyzeOKR, getOKRSummary } from './tools';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const question = formData.get('question') as string | null;
    const action = formData.get('action') as string | null;

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    // Validate file is provided
    if (!file) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }

    // Validate file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Handle different actions
    if (action === 'summary') {
      console.log('Generating OKR summary...');
      const summary = await getOKRSummary(buffer);
      return NextResponse.json({
        success: true,
        answer: summary,
        message: 'OKR summary generated successfully'
      });
    }

    // Default action: answer question
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('Analyzing OKR question:', question);

    const answer = await analyzeOKR(question, buffer);

    return NextResponse.json({
      success: true,
      answer,
      message: 'Question answered successfully'
    });
  } catch (error) {
    console.error('Error analyzing OKR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze OKR document'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OKR Analysis API (RAG-powered)',
    description: 'Upload an OKR PDF document and ask questions about it',
    usage: {
      method: 'POST',
      endpoint: '/api/agents/okr',
      contentType: 'multipart/form-data',
      formData: {
        file: 'PDF file (required)',
        question: 'Your question about the OKR document (required unless action is "summary")',
        action: 'Optional: "summary" to get full document summary'
      }
    },
    examples: [
      'What are the main objectives for Q1 2025?',
      'What are the key results for the Sales team?',
      'What is the target revenue growth?',
      'Which departments are mentioned in the document?'
    ]
  });
}