/**
 * Confluence GTM Integration Test Route
 * 
 * Endpoint for testing Confluence GTM strategy page generation during development.
 * 
 * POST /api/integrations/test-confluence-gtm - Create test GTM strategy page
 * 
 * @module app/api/integrations/test-confluence-gtm/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createGTMStrategyPage,
  type GTMStrategyData,
} from '@/lib/integrations/confluence-gtm';

// ============================================================================
// Route Configuration - Increase limits for large Confluence payloads
// ============================================================================

// Use Node.js runtime for better body parsing control
export const runtime = 'nodejs';

// Increase timeout for Confluence API calls
export const maxDuration = 30;

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic';

// Disable fetch caching
export const fetchCache = 'force-no-store';

// ============================================================================
// Authentication Middleware
// ============================================================================

function checkAuth(request: NextRequest): boolean {
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.warn('[Test Confluence GTM] API_SECRET not configured - skipping auth check');
    return true; // Allow in development
  }

  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');

  return providedSecret === apiSecret;
}

// ============================================================================
// POST Handler - Create Test GTM Strategy Page
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Check authentication
  if (!checkAuth(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - Invalid API_SECRET',
      },
      {
        status: 401,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    // Get raw body text first to avoid Next.js body parser size limits
    const rawBody = await request.text();
    
    // Log body size for debugging
    console.log(`[Confluence GTM Test] Received request body size: ${rawBody.length} characters`);
    
    // Parse JSON manually
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('[Confluence GTM Test] JSON parsing error:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Log what we received
    console.log('[Confluence GTM Test] Parsed request:', {
      spaceKey: body.spaceKey,
      productName: body.productName,
      gtmDataSize: body.gtmData ? JSON.stringify(body.gtmData).length : 0,
      hasParentPageId: !!body.parentPageId
    });

    // Validate required fields
    if (!body.spaceKey || !body.productName || !body.gtmData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: spaceKey, productName, gtmData',
        },
        { status: 400 }
      );
    }

    const gtmData: GTMStrategyData = body.gtmData;

    // Validate GTM data structure
    const requiredFields = [
      'targetMarket',
      'valueProposition',
      'competitorInsights',
      'pricingStrategy',
      'launchTimeline',
      'marketingChannels',
      'successMetrics',
      'risks',
    ];

    const missingFields = requiredFields.filter(field => !gtmData[field as keyof GTMStrategyData]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required GTM data fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    console.log('[Confluence GTM Test] Creating GTM strategy page:', body.productName);
    console.log('[Confluence GTM Test] Calling integration function...');

    // Create GTM page
    const result = await createGTMStrategyPage(
      body.spaceKey,
      body.productName,
      gtmData,
      body.parentPageId
    );

    console.log('[Confluence GTM Test] Integration function returned:', {
      success: result.success,
      hasPageId: !!result.pageId,
      hasError: !!result.error
    });

    const executionTime = Date.now() - startTime;

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: {
            pageId: result.pageId,
            pageUrl: result.pageUrl,
            productName: body.productName,
            spaceKey: body.spaceKey,
            version: result.version,
          },
          executionTime: `${executionTime}ms`,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '4',
            'X-Execution-Time': `${executionTime}ms`,
          },
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          executionTime: `${executionTime}ms`,
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '4',
            'X-Execution-Time': `${executionTime}ms`,
          },
        }
      );
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Test Confluence GTM] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '4',
          'X-Execution-Time': `${executionTime}ms`,
        },
      }
    );
  }
}

// ============================================================================
// GET Handler - Test Info
// ============================================================================

export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/integrations/test-confluence-gtm',
    description: 'Create test GTM strategy page in Confluence',
    authentication: 'Bearer token in Authorization header (API_SECRET env var)',
    rateLimit: '5 requests per minute (Confluence pages are heavy)',
    exampleRequest: {
      spaceKey: 'PROD',
      productName: 'Test Analytics Platform',
      gtmData: {
        targetMarket: 'Enterprise SaaS companies with 100-1000 employees',
        valueProposition: '10x faster insights with AI-powered analysis',
        competitorInsights: [
          {
            competitor: 'Tableau',
            strengths: ['Market leader', 'Comprehensive features'],
            weaknesses: ['Complex setup', 'High cost'],
          },
        ],
        pricingStrategy: 'Premium value-based pricing starting at $10k/month',
        launchTimeline: 'Q2 2026',
        marketingChannels: ['LinkedIn', 'Content Marketing', 'Webinars'],
        successMetrics: [
          { metric: 'ARR', target: '$15M by Year 1' },
          { metric: 'Customer Acquisition', target: '50 customers' },
        ],
        risks: [
          {
            risk: 'Intense competition',
            mitigation: 'Focus on AI differentiation',
          },
        ],
      },
      parentPageId: '123456789',
    },
    requiredFields: ['spaceKey', 'productName', 'gtmData'],
    optionalFields: ['parentPageId'],
    gtmDataFields: {
      required: [
        'targetMarket',
        'valueProposition',
        'competitorInsights',
        'pricingStrategy',
        'launchTimeline',
        'marketingChannels',
        'successMetrics',
        'risks',
      ],
    },
    headers: {
      'Authorization': 'Bearer YOUR_API_SECRET',
      'Content-Type': 'application/json',
    },
    note: 'This will create an actual page in Confluence. Use test space for development.',
  });
}
