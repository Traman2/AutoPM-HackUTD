/**
 * Integrations Health Check Route (Enhanced)
 * 
 * Endpoint for checking the health and configuration status of all integrations.
 * 
 * GET /api/integrations/health - Basic health check
 * POST /api/integrations/health - Detailed health check (requires auth)
 * 
 * @module app/api/integrations/health/route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateResendConfig,
  validateSlackConfig,
  validateConfluenceConfig,
  resendConfig,
  slackConfig,
  confluenceConfig,
} from '@/lib/integrations/config';

// ============================================================================
// Types
// ============================================================================

interface ServiceHealth {
  configured: boolean;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: {
    missingVars?: string[];
    errors?: string[];
  };
}

interface HealthCheckResponse {
  overall: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: {
    resend: ServiceHealth;
    slack: ServiceHealth;
    confluence: ServiceHealth;
  };
  environment: {
    nodeEnv: string;
    hasApiSecret: boolean;
  };
}

// ============================================================================
// Health Check Logic
// ============================================================================

function checkResendHealth(): ServiceHealth {
  const validation = validateResendConfig();

  if (validation.valid) {
    return {
      configured: true,
      status: 'healthy',
      message: 'Resend email service is properly configured',
    };
  }

  if (validation.missing.length > 0) {
    return {
      configured: false,
      status: 'error',
      message: 'Resend email service is not configured',
      details: {
        missingVars: validation.missing,
        errors: validation.errors,
      },
    };
  }

  return {
    configured: false,
    status: 'warning',
    message: 'Resend email service has configuration issues',
    details: {
      errors: validation.errors,
    },
  };
}

function checkSlackHealth(): ServiceHealth {
  const validation = validateSlackConfig();

  if (validation.valid) {
    return {
      configured: true,
      status: 'healthy',
      message: 'Slack integration is properly configured',
    };
  }

  if (validation.missing.length > 0) {
    return {
      configured: false,
      status: 'error',
      message: 'Slack integration is not configured',
      details: {
        missingVars: validation.missing,
        errors: validation.errors,
      },
    };
  }

  return {
    configured: false,
    status: 'warning',
    message: 'Slack integration has configuration issues',
    details: {
      errors: validation.errors,
    },
  };
}

function checkConfluenceHealth(): ServiceHealth {
  const validation = validateConfluenceConfig();

  if (validation.valid) {
    return {
      configured: true,
      status: 'healthy',
      message: 'Confluence integration is properly configured',
    };
  }

  if (validation.missing.length > 0) {
    return {
      configured: false,
      status: 'error',
      message: 'Confluence integration is not configured',
      details: {
        missingVars: validation.missing,
        errors: validation.errors,
      },
    };
  }

  return {
    configured: false,
    status: 'warning',
    message: 'Confluence integration has configuration issues',
    details: {
      errors: validation.errors,
    },
  };
}

function determineOverallHealth(
  resend: ServiceHealth,
  slack: ServiceHealth,
  confluence: ServiceHealth
): 'healthy' | 'degraded' | 'down' {
  const services = [resend, slack, confluence];
  
  const errorCount = services.filter(s => s.status === 'error').length;
  const warningCount = services.filter(s => s.status === 'warning').length;
  const healthyCount = services.filter(s => s.status === 'healthy').length;

  if (errorCount === services.length) {
    return 'down';
  }

  if (healthyCount === services.length) {
    return 'healthy';
  }

  return 'degraded';
}

// ============================================================================
// GET Handler - Health Check
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check each service
    const resendHealth = checkResendHealth();
    const slackHealth = checkSlackHealth();
    const confluenceHealth = checkConfluenceHealth();

    // Determine overall health
    const overallHealth = determineOverallHealth(
      resendHealth,
      slackHealth,
      confluenceHealth
    );

    const response: HealthCheckResponse = {
      overall: overallHealth,
      timestamp: new Date().toISOString(),
      services: {
        resend: resendHealth,
        slack: slackHealth,
        confluence: confluenceHealth,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasApiSecret: !!process.env.API_SECRET,
      },
    };

    // Set appropriate HTTP status code
    let statusCode = 200;
    if (overallHealth === 'degraded') {
      statusCode = 207; // Multi-Status
    } else if (overallHealth === 'down') {
      statusCode = 503; // Service Unavailable
    }

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': overallHealth,
      },
    });
  } catch (error) {
    console.error('[Health Check] Error:', error);

    return NextResponse.json(
      {
        overall: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST Handler - Detailed Health Check (with Auth)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check authentication for detailed info
    const apiSecret = process.env.API_SECRET;
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    const isAuthenticated = apiSecret ? providedSecret === apiSecret : true;

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid API_SECRET',
        },
        { status: 401 }
      );
    }

    // Get basic health check
    const resendHealth = checkResendHealth();
    const slackHealth = checkSlackHealth();
    const confluenceHealth = checkConfluenceHealth();
    const overallHealth = determineOverallHealth(
      resendHealth,
      slackHealth,
      confluenceHealth
    );

    // Include detailed configuration info (with auth)
    const detailedResponse = {
      overall: overallHealth,
      timestamp: new Date().toISOString(),
      services: {
        resend: {
          ...resendHealth,
          config: {
            hasApiKey: !!resendConfig.apiKey,
            fromEmail: resendConfig.fromEmail,
            fromName: resendConfig.fromName,
            baseUrl: resendConfig.baseUrl,
          },
        },
        slack: {
          ...slackHealth,
          config: {
            hasBotToken: !!slackConfig.botToken,
            botTokenFormat: slackConfig.botToken ? 
              slackConfig.botToken.startsWith('xoxb-') ? 'valid' : 'invalid' : 
              'missing',
            defaultChannel: slackConfig.defaultChannel,
            botName: slackConfig.botName,
          },
        },
        confluence: {
          ...confluenceHealth,
          config: {
            domain: confluenceConfig.domain,
            hasEmail: !!confluenceConfig.email,
            hasApiToken: !!confluenceConfig.apiToken,
            defaultSpaceKey: confluenceConfig.defaultSpaceKey || 'not set',
          },
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasApiSecret: !!process.env.API_SECRET,
      },
      recommendations: generateRecommendations(resendHealth, slackHealth, confluenceHealth),
    };

    let statusCode = 200;
    if (overallHealth === 'degraded') {
      statusCode = 207;
    } else if (overallHealth === 'down') {
      statusCode = 503;
    }

    return NextResponse.json(detailedResponse, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': overallHealth,
      },
    });
  } catch (error) {
    console.error('[Health Check] Error:', error);

    return NextResponse.json(
      {
        overall: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Detailed health check failed',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateRecommendations(
  resend: ServiceHealth,
  slack: ServiceHealth,
  confluence: ServiceHealth
): string[] {
  const recommendations: string[] = [];

  if (resend.status !== 'healthy') {
    recommendations.push(
      'Configure Resend: Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local'
    );
  }

  if (slack.status !== 'healthy') {
    recommendations.push(
      'Configure Slack: Set SLACK_BOT_TOKEN (must start with xoxb-) in .env.local'
    );
  }

  if (confluence.status !== 'healthy') {
    recommendations.push(
      'Configure Confluence: Set CONFLUENCE_DOMAIN, CONFLUENCE_EMAIL, and CONFLUENCE_API_TOKEN in .env.local'
    );
  }

  if (!process.env.API_SECRET) {
    recommendations.push(
      'Set API_SECRET in .env.local to enable authentication for test endpoints'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('All services are healthy! 🎉');
  }

  return recommendations;
}
