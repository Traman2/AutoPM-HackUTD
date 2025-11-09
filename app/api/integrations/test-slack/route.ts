/**
 * Slack Integration Test Route
 * 
 * Endpoint for testing Slack notification integration during development.
 * 
 * POST /api/integrations/test-slack - Send test Slack notification
 * 
 * @module app/api/integrations/test-slack/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendSlackNotification,
  type NotificationType,
} from '@/lib/integrations/slack';

// ============================================================================
// Authentication Middleware
// ============================================================================

function checkAuth(request: NextRequest): boolean {
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.warn('[Test Slack] API_SECRET not configured - skipping auth check');
    return true; // Allow in development
  }

  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');

  return providedSecret === apiSecret;
}

// ============================================================================
// POST Handler - Send Test Slack Notification
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
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.channel || !body.notificationType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: channel, notificationType',
        },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
      'task_completed',
      'analysis_ready',
      'approval_needed',
      'error_alert',
    ];

    if (!validTypes.includes(body.notificationType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid notificationType. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    console.log('[Test Slack] Sending notification to:', body.channel);

    // Send notification
    const result = await sendSlackNotification(
      body.channel,
      body.notificationType,
      body.data || {}
    );

    const executionTime = Date.now() - startTime;

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: {
            messageTs: result.messageTs,
            channel: result.channel || body.channel,
            notificationType: body.notificationType,
          },
          executionTime: `${executionTime}ms`,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '19',
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
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '19',
            'X-Execution-Time': `${executionTime}ms`,
          },
        }
      );
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Test Slack] Error:', error);

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
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '19',
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
    endpoint: 'POST /api/integrations/test-slack',
    description: 'Send test Slack notification using Slack Web API',
    authentication: 'Bearer token in Authorization header (API_SECRET env var)',
    rateLimit: '20 requests per minute',
    notificationTypes: [
      'task_completed',
      'analysis_ready',
      'approval_needed',
      'error_alert',
    ],
    exampleRequests: {
      task_completed: {
        channel: '#product-team',
        notificationType: 'task_completed',
        data: {
          title: 'User Story Created',
          description: 'Generated user story for PDF export feature',
          metadata: {
            'Story Points': '5',
            'Priority': 'High',
          },
          actionUrl: 'https://jira.company.com/browse/PROD-123',
          priority: 'medium',
        },
      },
      analysis_ready: {
        channel: '#analytics',
        notificationType: 'analysis_ready',
        data: {
          title: 'Q4 User Engagement Report',
          description: 'Quarterly analysis complete with insights',
          metadata: {
            'Total Users': '50,000',
            'Engagement Rate': '+25%',
          },
          actionUrl: 'https://confluence.company.com/reports/q4',
          priority: 'high',
        },
      },
      approval_needed: {
        channel: '#pm-leadership',
        notificationType: 'approval_needed',
        data: {
          title: 'Feature Request Approval Required',
          description: 'Mobile app redesign needs executive approval',
          metadata: {
            'Estimated Cost': '$50,000',
            'Timeline': '3 months',
          },
          priority: 'high',
        },
      },
      error_alert: {
        channel: '#engineering',
        notificationType: 'error_alert',
        data: {
          title: 'Confluence API Error',
          description: 'Failed to publish GTM strategy page',
          metadata: {
            'Error Code': '401',
            'Service': 'Confluence',
          },
          priority: 'critical',
        },
      },
    },
    requiredFields: ['channel', 'notificationType'],
    optionalFields: ['data'],
    headers: {
      'Authorization': 'Bearer YOUR_API_SECRET',
      'Content-Type': 'application/json',
    },
  });
}
