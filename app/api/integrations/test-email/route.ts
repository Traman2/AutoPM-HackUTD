/**
 * Email Integration Test Route
 * 
 * Endpoint for testing email automation integration during development.
 * 
 * POST /api/integrations/test-email - Send test email
 * 
 * @module app/api/integrations/test-email/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendProductEmail } from '@/lib/integrations/email/email';
import type { EmailType } from '@/lib/integrations/email/types';

// ============================================================================
// Authentication Middleware
// ============================================================================

function checkAuth(request: NextRequest): boolean {
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.warn('[Test Email] API_SECRET not configured - skipping auth check');
    return true; // Allow in development
  }

  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');

  return providedSecret === apiSecret;
}

// ============================================================================
// POST Handler - Send Test Email
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
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.to || !body.emailType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: to, emailType',
        },
        { status: 400 }
      );
    }

    // Validate email type
    const validTypes: EmailType[] = [
      'stakeholder_update',
      'sprint_summary',
      'feature_launch',
      'gtm_announcement',
    ];

    if (!validTypes.includes(body.emailType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid emailType. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    console.log('[Test Email] Sending test email to:', body.to);

    // Send email  
    const result = await sendProductEmail(
      body.to,
      body.emailType,
      body.data || {}
    );

    const executionTime = Date.now() - startTime;

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          messageId: result.messageId,
          type: body.emailType,
          recipient: body.to,
          executionTime: `${executionTime}ms`,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '9',
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
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '9',
            'X-Execution-Time': `${executionTime}ms`,
          },
        }
      );
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Test Email] Error:', error);

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
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '9',
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
    endpoint: 'POST /api/integrations/test-email',
    description: 'Send test email using Resend integration',
    authentication: 'Bearer token in Authorization header (API_SECRET env var)',
    rateLimit: '10 requests per minute',
    emailTypes: [
      'stakeholder_update',
      'sprint_summary',
      'feature_launch',
      'gtm_announcement',
    ],
    exampleRequests: {
      stakeholder_update: {
        to: 'stakeholder@example.com',
        emailType: 'stakeholder_update',
        data: {
          stakeholderName: 'John Executive',
          updateTitle: 'Q4 Product Progress Update',
          summary: 'Made significant progress on AI features this quarter',
          keyHighlights: [
            'Launched AI-powered analytics beta',
            '500+ beta users signed up',
            'NPS score increased to 72',
          ],
          upcomingMilestones: [
            'Q1: General availability launch',
            'Q2: Enterprise features',
          ],
        },
      },
      sprint_summary: {
        to: 'team@example.com',
        emailType: 'sprint_summary',
        data: {
          sprintNumber: 42,
          sprintDates: 'April 1-14, 2026',
          completedStories: 12,
          totalPoints: 45,
          achievements: [
            'Completed user authentication flow',
            'Deployed payment integration',
            'Fixed 23 bugs',
          ],
          upcomingWork: [
            'Mobile app redesign',
            'API v2 development',
          ],
        },
      },
      feature_launch: {
        to: 'users@example.com',
        emailType: 'feature_launch',
        data: {
          featureName: 'PDF Export',
          launchDate: 'April 15, 2026',
          description: 'Export your reports as beautifully formatted PDFs',
          benefits: [
            'Share reports offline',
            'Professional formatting',
            'Custom branding options',
          ],
          howToAccess: 'Click the Export button in any report',
        },
      },
      gtm_announcement: {
        to: 'partners@example.com',
        emailType: 'gtm_announcement',
        data: {
          productName: 'Analytics Platform v3.0',
          launchDate: 'Q2 2026',
          targetMarket: 'Enterprise SaaS companies',
          keyFeatures: [
            'AI-powered insights',
            'Real-time dashboards',
            'Advanced integrations',
          ],
          pricing: 'Starting at $10,000/month',
        },
      },
    },
    requiredFields: ['to', 'emailType'],
    optionalFields: ['data'],
    headers: {
      'Authorization': 'Bearer YOUR_API_SECRET',
      'Content-Type': 'application/json',
    },
  });
}
