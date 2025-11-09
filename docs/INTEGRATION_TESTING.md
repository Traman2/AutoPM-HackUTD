# Integration Test Endpoints

Test routes for manually triggering and validating integration modules before connecting to LangGraph workflows.

## 🔐 Authentication

All test endpoints require authentication via the `Authorization` header:

```bash
Authorization: Bearer YOUR_API_SECRET
```

Set `API_SECRET` in your `.env.local` file. If not set, endpoints will work without auth in development.

## 📋 Available Endpoints

### 1. Health Check

**GET** `/api/integrations/health`

Check configuration status of all integrations.

```bash
curl http://localhost:3000/api/integrations/health
```

**Response:**

```json
{
  "overall": "healthy",
  "timestamp": "2026-04-15T09:00:00.000Z",
  "services": {
    "resend": {
      "configured": true,
      "status": "healthy",
      "message": "Resend email service is properly configured"
    },
    "slack": {
      "configured": true,
      "status": "healthy",
      "message": "Slack integration is properly configured"
    },
    "confluence": {
      "configured": true,
      "status": "healthy",
      "message": "Confluence integration is properly configured"
    }
  },
  "environment": {
    "nodeEnv": "development",
    "hasApiSecret": true
  }
}
```

**POST** `/api/integrations/health` - Detailed health check (requires auth)

### 2. Test Email

**POST** `/api/integrations/test-email`

Send test email using Resend integration.

**Supported Email Types:**

- `stakeholder_update` - Progress updates for stakeholders
- `sprint_summary` - Sprint completion summaries
- `feature_launch` - New feature announcements
- `gtm_announcement` - Go-to-market announcements

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/integrations/test-email \
  -H "Authorization: Bearer YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "stakeholder@example.com",
    "emailType": "stakeholder_update",
    "data": {
      "stakeholderName": "John Executive",
      "updateTitle": "Q4 Product Progress Update",
      "summary": "Made significant progress on AI features",
      "keyHighlights": [
        "Launched AI-powered analytics beta",
        "500+ beta users signed up"
      ],
      "upcomingMilestones": [
        "Q1: General availability launch"
      ]
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "messageId": "abc123-xyz789",
    "to": "stakeholder@example.com",
    "subject": "Q4 Product Progress Update"
  },
  "executionTime": "234ms",
  "timestamp": "2026-04-15T09:00:00.000Z"
}
```

**Rate Limit:** 10 requests/minute

### 3. Test Slack

**POST** `/api/integrations/test-slack`

Send test Slack notification using Slack Web API.

**Supported Notification Types:**

- `task_completed` - Agent completed a task
- `analysis_ready` - Analysis results ready for review
- `approval_needed` - PM approval required
- `error_alert` - Error or issue alert

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/integrations/test-slack \
  -H "Authorization: Bearer YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "#product-team",
    "notificationType": "task_completed",
    "data": {
      "title": "User Story Created",
      "description": "Generated user story for PDF export feature",
      "metadata": {
        "Story Points": "5",
        "Priority": "High"
      },
      "actionUrl": "https://jira.company.com/browse/PROD-123",
      "priority": "medium"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "messageTs": "1713178800.123456",
    "channel": "#product-team",
    "notificationType": "task_completed"
  },
  "executionTime": "456ms",
  "timestamp": "2026-04-15T09:00:00.000Z"
}
```

**Rate Limit:** 20 requests/minute

### 4. Test Confluence GTM

**POST** `/api/integrations/test-confluence-gtm`

Create test GTM strategy page in Confluence.

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/integrations/test-confluence-gtm \
  -H "Authorization: Bearer YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "spaceKey": "PROD",
    "productName": "Test Analytics Platform",
    "gtmData": {
      "targetMarket": "Enterprise SaaS companies with 100-1000 employees",
      "valueProposition": "10x faster insights with AI-powered analysis",
      "competitorInsights": [
        {
          "competitor": "Tableau",
          "strengths": ["Market leader", "Comprehensive features"],
          "weaknesses": ["Complex setup", "High cost"]
        }
      ],
      "pricingStrategy": "Premium pricing starting at $10k/month",
      "launchTimeline": "Q2 2026",
      "marketingChannels": ["LinkedIn", "Content Marketing"],
      "successMetrics": [
        { "metric": "ARR", "target": "$15M by Year 1" }
      ],
      "risks": [
        {
          "risk": "Intense competition",
          "mitigation": "Focus on AI differentiation"
        }
      ]
    },
    "parentPageId": "123456789"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pageId": "987654321",
    "pageUrl": "https://yourcompany.atlassian.net/wiki/spaces/PROD/pages/987654321",
    "productName": "Test Analytics Platform",
    "spaceKey": "PROD",
    "version": 1
  },
  "executionTime": "1234ms",
  "timestamp": "2026-04-15T09:00:00.000Z"
}
```

**Rate Limit:** 5 requests/minute ⚠️ Creates actual Confluence pages

### 5. Test Confluence Meeting

**POST** `/api/integrations/test-confluence-meeting`

Create test meeting notes page in Confluence.

**Supported Meeting Types:**

- `sprint_planning`
- `stakeholder_review`
- `product_sync`
- `retrospective`

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/integrations/test-confluence-meeting \
  -H "Authorization: Bearer YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "spaceKey": "PROD",
    "meetingData": {
      "title": "Q2 Planning",
      "date": "2026-04-15T09:00:00Z",
      "attendees": ["Alice Johnson", "Bob Smith", "Charlie Davis"],
      "meetingType": "sprint_planning",
      "agenda": [
        "Review Q1 performance",
        "Plan Q2 roadmap priorities"
      ],
      "discussionPoints": [
        {
          "topic": "Q2 Product Roadmap",
          "summary": "Discussed priority features for Q2 launch",
          "decisions": [
            "Focus all Q2 resources on AI features"
          ],
          "actionItems": [
            {
              "task": "Create feature specifications",
              "owner": "Alice",
              "dueDate": "2026-04-20",
              "status": "pending"
            }
          ]
        }
      ],
      "nextSteps": [
        "Schedule follow-up meeting for April 22"
      ]
    },
    "parentPageId": "123456789"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pageId": "987654321",
    "pageUrl": "https://yourcompany.atlassian.net/wiki/spaces/PROD/pages/987654321",
    "meetingTitle": "Q2 Planning",
    "meetingType": "sprint_planning",
    "actionItems": [
      {
        "id": "action-0-0",
        "task": "Create feature specifications",
        "owner": "Alice"
      }
    ],
    "spaceKey": "PROD"
  },
  "executionTime": "1567ms",
  "timestamp": "2026-04-15T09:00:00.000Z"
}
```

**Rate Limit:** 10 requests/minute ⚠️ Creates actual Confluence pages

## 📊 Response Headers

All endpoints include these headers:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-Execution-Time` - Time taken to process request
- `X-Health-Status` - Overall system health (health endpoint only)

## 🔧 Setup

1. Create `.env.local` file with required environment variables:

```env
# Resend Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=PM Automation

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_DEFAULT_CHANNEL=#general

# Confluence
CONFLUENCE_DOMAIN=yourcompany.atlassian.net
CONFLUENCE_EMAIL=your-email@company.com
CONFLUENCE_API_TOKEN=your-api-token
CONFLUENCE_DEFAULT_SPACE=PROD

# API Authentication
API_SECRET=your-secret-key-here
```

2. Start the development server:

```bash
pnpm dev
```

3. Test the health endpoint:

```bash
curl http://localhost:3000/api/integrations/health
```

## 🚨 Important Notes

- **Confluence endpoints create actual pages** - Use a test space during development
- Rate limits are enforced to prevent API abuse
- All timestamps are in ISO 8601 format (UTC)
- Set `API_SECRET` for production environments
- Check health endpoint before running tests

## 📚 Next Steps

After validating integrations with these test endpoints:

1. Connect agents to LangGraph workflows
2. Add webhooks for external triggers
3. Implement proper rate limiting in production
4. Set up monitoring and logging
5. Add integration with CI/CD pipeline
