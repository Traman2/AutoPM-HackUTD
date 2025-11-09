/**
 * Confluence Meeting Notes Integration Test Route
 * 
 * Endpoint for testing Confluence meeting notes publishing during development.
 * 
 * POST /api/integrations/test-confluence-meeting - Create test meeting notes page
 * 
 * @module app/api/integrations/test-confluence-meeting/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createMeetingNotesPage,
  type MeetingData,
} from '@/lib/integrations/confluence-meetings';

// ============================================================================
// Authentication Middleware
// ============================================================================

function checkAuth(request: NextRequest): boolean {
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.warn('[Test Confluence Meeting] API_SECRET not configured - skipping auth check');
    return true; // Allow in development
  }

  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');

  return providedSecret === apiSecret;
}

// ============================================================================
// POST Handler - Create Test Meeting Notes Page
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
    if (!body.spaceKey || !body.meetingData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: spaceKey, meetingData',
        },
        { status: 400 }
      );
    }

    // Convert date string to Date object if needed
    const meetingData: MeetingData = {
      ...body.meetingData,
      date: new Date(body.meetingData.date),
    };

    // Validate meeting data structure
    const requiredFields = [
      'title',
      'date',
      'attendees',
      'meetingType',
      'agenda',
      'discussionPoints',
      'nextSteps',
    ];

    const missingFields = requiredFields.filter(
      field => !meetingData[field as keyof MeetingData]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required meeting data fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate meeting type
    const validTypes = ['sprint_planning', 'stakeholder_review', 'product_sync', 'retrospective'];
    if (!validTypes.includes(meetingData.meetingType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid meetingType. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    console.log('[Test Confluence Meeting] Creating meeting notes:', meetingData.title);

    // Create meeting notes page
    const result = await createMeetingNotesPage(
      body.spaceKey,
      meetingData,
      body.parentPageId
    );

    const executionTime = Date.now() - startTime;

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: {
            pageId: result.pageId,
            pageUrl: result.pageUrl,
            meetingTitle: meetingData.title,
            meetingType: meetingData.meetingType,
            actionItems: result.actionItems,
            spaceKey: body.spaceKey,
          },
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
    console.error('[Test Confluence Meeting] Error:', error);

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
    endpoint: 'POST /api/integrations/test-confluence-meeting',
    description: 'Create test meeting notes page in Confluence',
    authentication: 'Bearer token in Authorization header (API_SECRET env var)',
    rateLimit: '10 requests per minute',
    meetingTypes: [
      'sprint_planning',
      'stakeholder_review',
      'product_sync',
      'retrospective',
    ],
    exampleRequest: {
      spaceKey: 'PROD',
      meetingData: {
        title: 'Q2 Planning',
        date: '2026-04-15T09:00:00Z',
        attendees: ['Alice Johnson', 'Bob Smith', 'Charlie Davis'],
        meetingType: 'sprint_planning',
        agenda: [
          'Review Q1 performance',
          'Plan Q2 roadmap priorities',
          'Resource allocation discussion',
        ],
        discussionPoints: [
          {
            topic: 'Q2 Product Roadmap',
            summary: 'Discussed priority features for Q2 launch. Team agreed to focus on AI-powered analytics.',
            decisions: [
              'Focus all Q2 resources on AI features',
              'Delay mobile app to Q3',
            ],
            actionItems: [
              {
                task: 'Create feature specifications',
                owner: 'Alice',
                dueDate: '2026-04-20',
                status: 'pending',
              },
              {
                task: 'Update roadmap document',
                owner: 'Bob',
                dueDate: '2026-04-18',
                status: 'in-progress',
              },
            ],
          },
        ],
        nextSteps: [
          'Schedule follow-up meeting for April 22',
          'Send summary to stakeholders',
          'Update Jira with new priorities',
        ],
      },
      parentPageId: '123456789',
    },
    requiredFields: ['spaceKey', 'meetingData'],
    optionalFields: ['parentPageId'],
    meetingDataFields: {
      required: [
        'title',
        'date',
        'attendees',
        'meetingType',
        'agenda',
        'discussionPoints',
        'nextSteps',
      ],
    },
    headers: {
      'Authorization': 'Bearer YOUR_API_SECRET',
      'Content-Type': 'application/json',
    },
    note: 'This will create an actual page in Confluence. Use test space for development.',
  });
}
