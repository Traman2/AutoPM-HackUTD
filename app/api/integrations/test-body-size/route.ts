/**
 * Body Size Test Endpoint
 * 
 * Tests if large request bodies are being received correctly by Next.js API routes.
 * This helps diagnose body parsing and size limit issues.
 */

import { NextResponse } from 'next/server';

// Use Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    // Get raw body text
    const rawBody = await request.text();
    
    // Try to parse as JSON
    let canParseJSON = false;
    let parsedData = null;
    try {
      parsedData = JSON.parse(rawBody);
      canParseJSON = true;
    } catch {
      canParseJSON = false;
    }

    return NextResponse.json({
      success: true,
      receivedBodySize: rawBody.length,
      bodyPreview: rawBody.substring(0, 200) + (rawBody.length > 200 ? '...' : ''),
      canParseJSON,
      hasData: !!parsedData,
      parsedDataKeys: parsedData ? Object.keys(parsedData) : [],
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        runtime: 'nodejs'
      },
      limits: {
        configuredLimit: '10mb',
        receivedSize: `${(rawBody.length / 1024 / 1024).toFixed(2)} MB`
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/integrations/test-body-size',
    description: 'Test endpoint to verify large request bodies are handled correctly',
    usage: 'Send a POST request with a large JSON body to test body parsing',
    configuration: {
      runtime: 'nodejs',
      maxDuration: '30 seconds',
      bodySizeLimit: '10mb'
    }
  });
}
