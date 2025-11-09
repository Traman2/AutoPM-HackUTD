/**
 * Confluence Meetings Agent API Route
 * 
 * HTTP endpoint for publishing meeting notes to Confluence
 * 
 * POST /api/agents/meetings - Execute meeting notes action
 * GET  /api/agents/meetings - Get agent status
 * 
 * @module app/api/agents/meetings/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  executeConfluenceMeetingsAgent,
  type MeetingsAgentInput,
} from './tools';

// ============================================================================
// POST Handler - Execute Meetings Action
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: MeetingsAgentInput = await request.json();

    // Validate request
    if (!body.action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: action',
        },
        { status: 400 }
      );
    }

    // Execute agent
    const result = await executeConfluenceMeetingsAgent(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('Confluence Meetings Agent Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        action: 'unknown',
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler - Agent Status
// ============================================================================

export async function GET() {
  return NextResponse.json({
    agent: 'ConfluenceMeetingsAgent',
    status: 'active',
    version: '1.0.0',
    actions: [
      {
        name: 'create',
        description: 'Create new meeting notes page',
        requiredFields: ['spaceKey', 'meetingData'],
        optionalFields: ['parentPageId'],
      },
      {
        name: 'add_items',
        description: 'Add action items to existing meeting notes',
        requiredFields: ['pageId', 'actionItems'],
      },
      {
        name: 'complete_item',
        description: 'Mark action item as complete',
        requiredFields: ['pageId', 'actionItemIndex'],
      },
      {
        name: 'create_template',
        description: 'Create meeting notes template page',
        requiredFields: ['spaceKey'],
        optionalFields: ['parentPageId'],
      },
    ],
    meetingTypes: [
      'sprint_planning',
      'stakeholder_review',
      'product_sync',
      'retrospective',
    ],
    endpoints: {
      execute: 'POST /api/agents/meetings',
      status: 'GET /api/agents/meetings',
    },
    examples: {
      create: {
        action: 'create',
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
      },
      add_items: {
        action: 'add_items',
        pageId: '123456789',
        actionItems: [
          {
            task: 'Follow up with design team',
            owner: 'Bob',
            dueDate: '2026-04-25',
          },
          {
            task: 'Update roadmap document',
            owner: 'Alice',
            dueDate: '2026-04-22',
          },
        ],
      },
      complete_item: {
        action: 'complete_item',
        pageId: '123456789',
        actionItemIndex: 0,
      },
      create_template: {
        action: 'create_template',
        spaceKey: 'PROD',
        parentPageId: '987654321',
      },
    },
  });
}
