/**
 * Confluence GTM Agent API Route
 * 
 * HTTP endpoint for Confluence GTM strategy page generation
 * 
 * POST /api/agents/confluence - Execute Confluence GTM action
 * GET  /api/agents/confluence - Get agent status
 * 
 * @module app/api/agents/confluence/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  executeConfluenceGTMAgent,
  type ConfluenceAgentInput,
} from './tools';

// ============================================================================
// POST Handler - Execute Confluence GTM Action
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ConfluenceAgentInput = await request.json();

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
    const result = await executeConfluenceGTMAgent(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('Confluence GTM Agent Error:', error);
    
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
    agent: 'ConfluenceGTMAgent',
    status: 'active',
    version: '1.0.0',
    actions: [
      {
        name: 'create',
        description: 'Create new GTM strategy page',
        requiredFields: ['spaceKey', 'productName', 'gtmData'],
        optionalFields: ['parentPageId'],
      },
      {
        name: 'update',
        description: 'Update existing GTM strategy page',
        requiredFields: ['pageId', 'productName', 'gtmData'],
      },
      {
        name: 'history',
        description: 'Get page version history',
        requiredFields: ['pageId'],
      },
      {
        name: 'validate',
        description: 'Validate GTM data before page creation',
        requiredFields: ['gtmData'],
      },
    ],
    endpoints: {
      execute: 'POST /api/agents/confluence',
      status: 'GET /api/agents/confluence',
    },
    examples: {
      create: {
        action: 'create',
        spaceKey: 'PROD',
        productName: 'Analytics Platform',
        gtmData: {
          targetMarket: 'Enterprise companies...',
          valueProposition: 'AI-powered analytics...',
          competitorInsights: [
            {
              competitor: 'Tableau',
              strengths: ['Market leader'],
              weaknesses: ['Complex setup'],
            },
          ],
          pricingStrategy: 'Premium pricing...',
          launchTimeline: 'Q2 2026',
          marketingChannels: ['LinkedIn', 'Content Marketing'],
          successMetrics: [
            { metric: 'ARR', target: '$15M' },
          ],
          risks: [
            {
              risk: 'Competition',
              mitigation: 'Focus on differentiation',
            },
          ],
        },
      },
      update: {
        action: 'update',
        pageId: '123456789',
        productName: 'Analytics Platform',
        gtmData: {
          launchTimeline: 'Q3 2026 (revised)',
        },
      },
      history: {
        action: 'history',
        pageId: '123456789',
      },
      validate: {
        action: 'validate',
        gtmData: {
          targetMarket: 'Enterprise companies...',
          // ... other fields
        },
      },
    },
  });
}
