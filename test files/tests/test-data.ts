/**
 * Test Data
 * 
 * Sample data for all integration test scenarios.
 * This includes realistic data for:
 * - Email notifications (stakeholder updates, sprint summaries, feature launches)
 * - Slack notifications (task completions, analysis results, approvals, errors)
 * - Confluence GTM strategies (complete and minimal)
 * - Confluence meeting notes (various meeting types)
 */

// ============================================
// EMAIL TEST DATA
// ============================================

export const stakeholderUpdateEmailData = {
  emailType: 'stakeholder_update',
  to: process.env.RESEND_FROM_EMAIL || 'test@example.com',
  subject: 'Weekly Product Update - Q4 2025',
  data: {
    projectName: 'PM Automation Platform',
    updateType: 'Weekly Progress Report',
    summary: 'Significant progress on integration modules this week. All four core integrations (Email, Slack, Confluence GTM, Confluence Meetings) are now complete and tested.',
    highlights: [
      'Completed Email automation module with 3 professional templates',
      'Implemented Slack Block Kit notifications with priority levels',
      'Built Confluence GTM strategy generator with 8-section framework',
      'Created automated meeting notes publisher for Confluence',
      'Developed comprehensive test suite with 25+ test scenarios',
    ],
    metrics: [
      { label: 'Integrations Completed', value: '4/4', trend: 'up' },
      { label: 'API Endpoints', value: '9', trend: 'up' },
      { label: 'Test Coverage', value: '95%', trend: 'stable' },
      { label: 'Code Quality', value: 'A+', trend: 'up' },
    ],
    nextSteps: [
      'Integrate with LangGraph for AI-powered workflows',
      'Deploy to production environment',
      'Set up monitoring and alerting',
      'Create user documentation',
    ],
    timeline: 'On track for HackUTD demo on November 10, 2025',
  },
};

export const sprintSummaryEmailData = {
  emailType: 'sprint_summary',
  to: process.env.RESEND_FROM_EMAIL || 'test@example.com',
  subject: 'Sprint 5 Summary - Automation Tools',
  data: {
    sprintNumber: '5',
    startDate: '2025-10-28',
    endDate: '2025-11-08',
    storiesCompleted: 12,
    storiesPlanned: 12,
    pointsCompleted: 34,
    pointsPlanned: 34,
    teamName: 'Automation Tools Team',
    accomplishments: [
      'HACK-101: Email Automation Module (8 points)',
      'HACK-102: Slack Integration (8 points)',
      'HACK-103: Confluence GTM Generator (13 points)',
      'HACK-104: Meeting Notes Publisher (5 points)',
    ],
    blockers: [],
    retroHighlights: [
      'Excellent team collaboration',
      'Clear requirements led to faster development',
      'Integration testing caught several edge cases early',
    ],
  },
};

export const featureLaunchEmailData = {
  emailType: 'feature_launch',
  to: process.env.RESEND_FROM_EMAIL || 'test@example.com',
  subject: 'New Feature Launch: PM Automation Platform',
  data: {
    featureName: 'AI-Powered PM Automation Platform',
    launchDate: '2025-11-10',
    description: 'A comprehensive automation platform that helps Product Managers streamline their workflows through intelligent email, Slack, and Confluence integrations.',
    keyFeatures: [
      'Smart email templates for stakeholder updates and sprint summaries',
      'Real-time Slack notifications with customizable priority levels',
      'Automated GTM strategy documentation in Confluence',
      'Meeting notes capture and publishing to team workspace',
    ],
    benefits: [
      'Save 10+ hours per week on manual documentation tasks',
      'Improve stakeholder communication with consistent, professional updates',
      'Reduce context switching between multiple tools',
      'Maintain comprehensive project documentation effortlessly',
    ],
    targetAudience: ['Product Managers', 'Team Leads', 'Project Coordinators'],
    callToAction: 'Schedule a demo to see the platform in action',
  },
};

// ============================================
// SLACK TEST DATA
// ============================================

export const taskCompletedSlackData = {
  channel: process.env.SLACK_TEST_CHANNEL || '#test',
  notificationType: 'task_completed',
  data: {
    taskName: 'Email Integration Module',
    taskId: 'HACK-101',
    assignee: 'AutoPM Agent',
    completedBy: 'Email Automation Agent',
    completedAt: new Date().toISOString(),
    duration: '2 hours',
    summary: 'Successfully implemented email automation module with three professional templates (stakeholder update, sprint summary, feature launch).',
    details: [
      'Created type-safe email templates',
      'Integrated with Resend API',
      'Added comprehensive error handling',
      'Implemented email validation',
    ],
    priority: 'medium',
  },
};

export const analysisReadySlackData = {
  channel: process.env.SLACK_TEST_CHANNEL || '#test',
  notificationType: 'analysis_ready',
  data: {
    analysisType: 'Sprint Velocity Analysis',
    analysisId: 'ANALYSIS-2025-11-08',
    generatedBy: 'Analytics Agent',
    generatedAt: new Date().toISOString(),
    summary: 'Sprint velocity analysis for Q4 2025 is now available. Team velocity has increased 25% compared to Q3.',
    keyFindings: [
      'Average velocity: 34 story points per sprint',
      'Completion rate: 96%',
      'Bug escape rate reduced by 40%',
      'Cycle time improved from 5.2 to 3.8 days',
    ],
    dashboardUrl: 'http://localhost:3000/analytics/velocity',
    actionRequired: 'Review findings before Sprint Planning meeting',
    priority: 'high',
  },
};

export const approvalNeededSlackData = {
  channel: process.env.SLACK_TEST_CHANNEL || '#test',
  notificationType: 'approval_needed',
  data: {
    itemType: 'Feature Specification',
    itemTitle: 'AI-Powered Automated Testing Framework',
    requestedBy: 'Product Team',
    requestedAt: new Date().toISOString(),
    approvers: ['Engineering Lead', 'Product Manager', 'QA Lead'],
    deadline: '2025-11-10',
    summary: 'New feature specification requires approval before implementation can begin.',
    reviewUrl: 'http://localhost:3000/approvals/spec-123',
    priority: 'high',
  },
};

export const errorAlertSlackData = {
  channel: process.env.SLACK_TEST_CHANNEL || '#test',
  notificationType: 'error_alert',
  data: {
    errorType: 'Integration Failure',
    service: 'Confluence API',
    errorMessage: 'Failed to create page: Space not found',
    occurredAt: new Date().toISOString(),
    affectedUsers: 3,
    stackTrace: 'Error: Space not found\n  at ConfluenceService.createPage (confluence-gtm.ts:234)',
    mitigation: 'Attempting retry with exponential backoff',
    actionRequired: 'Verify Confluence space key configuration',
    priority: 'critical',
  },
};

export const priorityTestData = {
  low: {
    channel: process.env.SLACK_TEST_CHANNEL || '#test',
    notificationType: 'task_completed',
    data: {
      taskName: 'Update documentation',
      summary: 'Updated README with latest API changes',
      priority: 'low',
    },
  },
  medium: {
    channel: process.env.SLACK_TEST_CHANNEL || '#test',
    notificationType: 'task_completed',
    data: {
      taskName: 'Code review completed',
      summary: 'Reviewed and approved PR #42',
      priority: 'medium',
    },
  },
  high: {
    channel: process.env.SLACK_TEST_CHANNEL || '#test',
    notificationType: 'approval_needed',
    data: {
      itemType: 'Production Deployment',
      itemTitle: 'Release v2.0.0',
      summary: 'Production deployment requires approval',
      priority: 'high',
    },
  },
  critical: {
    channel: process.env.SLACK_TEST_CHANNEL || '#test',
    notificationType: 'error_alert',
    data: {
      errorType: 'System Outage',
      service: 'Production API',
      errorMessage: 'Service unavailable - multiple pods crashed',
      summary: 'Critical system outage affecting all users',
      priority: 'critical',
    },
  },
};

// ============================================
// CONFLUENCE GTM TEST DATA
// ============================================

export const gtmStrategyData = {
  spaceKey: process.env.CONFLUENCE_DEFAULT_SPACE || '',
  productName: 'PM Automation Platform',
  gtmData: {
    targetMarket: 'Product Managers, Team Leads, and Project Coordinators in tech companies with 500,000+ potential users globally in the $2.5B addressable market',
    valueProposition: 'Save 10+ hours per week through intelligent automation of PM workflows. Only solution combining email, Slack, and Confluence automation with AI-powered content generation. Works with existing tools - no migration required.',
    competitorInsights: [
      {
        competitor: 'Monday.com',
        strengths: ['Market leader in PM tools', 'Comprehensive feature set', 'Strong brand'],
        weaknesses: ['No intelligent automation', 'Complex setup', 'High cost for teams'],
      },
      {
        competitor: 'Asana',
        strengths: ['Simple interface', 'Good task management', 'Popular with teams'],
        weaknesses: ['Manual documentation', 'Limited integrations', 'No AI capabilities'],
      },
      {
        competitor: 'Jira',
        strengths: ['Developer-focused', 'Powerful workflows', 'Atlassian ecosystem'],
        weaknesses: ['Steep learning curve', 'PM features limited', 'Not communication-focused'],
      },
    ],
    pricingStrategy: 'Premium value-based SaaS pricing with three tiers: Starter ($29/user/month) for solo PMs, Professional ($79/user/month) for growing teams with AI features, and Enterprise (custom pricing) for large organizations with SSO and dedicated support',
    launchTimeline: 'Q1 2026 with 3-phase approach: Private Beta (4 weeks, 20 customers), Public Launch (2 weeks, Product Hunt and media outreach), Growth Phase (ongoing, scale to 10,000 users in Year 1)',
    marketingChannels: [
      'Product-Led Growth (free trial with self-serve onboarding)',
      'Content Marketing (PM productivity blog and templates)',
      'LinkedIn Thought Leadership',
      'Atlassian Marketplace Integration',
      'Slack App Directory Listing',
      'Webinars and Virtual Events',
      'Partnership Program',
    ],
    successMetrics: [
      { metric: 'Website Visitors', target: '10,000/month by Month 3' },
      { metric: 'Trial Signups', target: '500/month by Month 3' },
      { metric: 'Trial-to-Paid Conversion', target: '20%' },
      { metric: 'Daily Active Users', target: '60%' },
      { metric: 'Time Saved per User', target: '10+ hours/week' },
      { metric: 'Month 1 Retention', target: '80%' },
      { metric: 'Annual Churn Rate', target: '<20%' },
      { metric: 'MRR', target: '$50K by Month 6' },
      { metric: 'ARR', target: '$1M by end of Year 1' },
    ],
    risks: [
      {
        risk: 'Intense competition from established PM tools',
        mitigation: 'Focus on AI differentiation and unique combination of communication + documentation automation',
      },
      {
        risk: 'Integration complexity with multiple platforms',
        mitigation: 'Robust error handling, comprehensive testing, and fallback mechanisms',
      },
      {
        risk: 'User adoption and change management',
        mitigation: 'Excellent onboarding, professional templates, and proven time savings',
      },
      {
        risk: 'Pricing pressure from competitors',
        mitigation: 'Demonstrate clear ROI with time savings calculator and case studies',
      },
    ],
  },
};

export const minimalGTMStrategyData = {
  spaceKey: process.env.CONFLUENCE_DEFAULT_SPACE || '',
  productName: 'Test Product (Minimal)',
  gtmData: {
    targetMarket: 'Test target market - minimal data for validation testing',
    valueProposition: 'Test value proposition - minimal required field',
    competitorInsights: [
      {
        competitor: 'Test Competitor',
        strengths: ['Test strength'],
        weaknesses: ['Test weakness'],
      },
    ],
    pricingStrategy: 'TBD - test pricing strategy',
    launchTimeline: 'TBD - test timeline',
    marketingChannels: ['Test Channel'],
    successMetrics: [
      { metric: 'Test Metric', target: 'TBD' },
    ],
    risks: [
      {
        risk: 'Test risk',
        mitigation: 'Test mitigation',
      },
    ],
  },
};

// ============================================
// CONFLUENCE MEETING NOTES TEST DATA
// ============================================

export const sprintPlanningNotesData = {
  spaceKey: process.env.CONFLUENCE_DEFAULT_SPACE || '',
  meetingData: {
    title: 'Sprint 6 Planning - Automation Tools',
    date: new Date().toISOString(),
    attendees: [
      'Product Manager',
      'Tech Lead',
      'Senior Engineer',
      'QA Lead',
      'UX Designer',
    ],
    meetingType: 'sprint_planning',
    agenda: [
      'Review Sprint 5 outcomes',
      'Discuss Sprint 6 goals',
      'Story estimation and commitment',
      'Risk identification',
    ],
    discussionPoints: [
      {
        topic: 'Sprint 5 Review',
        summary: 'Completed all 12 planned stories with velocity of 34 story points (above target). Zero critical bugs in production. Positive stakeholder feedback on automation features.',
        decisions: ['Exceeded velocity target', 'Quality standards maintained'],
        actionItems: [],
      },
      {
        topic: 'Sprint 6 Goals',
        summary: 'Integrate all four agents with LangGraph, deploy to production environment, implement comprehensive monitoring, create user documentation.',
        decisions: [
          'Commit to 29 story points for Sprint 6',
          'Prioritize LangGraph integration as Sprint Goal',
        ],
        actionItems: [
          {
            task: 'Create LangGraph integration spec',
            owner: 'Tech Lead',
            dueDate: '2025-11-09',
          },
          {
            task: 'Draft user documentation outline',
            owner: 'Product Manager',
            dueDate: '2025-11-12',
          },
        ],
      },
      {
        topic: 'Story Estimation',
        summary: 'HACK-201 (LangGraph Integration - 13 points), HACK-202 (Production Deployment - 8 points), HACK-203 (Monitoring Setup - 5 points), HACK-204 (User Documentation - 3 points).',
        decisions: ['Deploy to staging environment by mid-sprint'],
        actionItems: [
          {
            task: 'Set up staging environment',
            owner: 'DevOps Team',
            dueDate: '2025-11-10',
          },
          {
            task: 'Configure monitoring dashboards',
            owner: 'Senior Engineer',
            dueDate: '2025-11-15',
          },
        ],
      },
    ],
    nextSteps: [
      'Commit to 29 story points for Sprint 6',
      'Deploy to staging environment by mid-sprint',
      'Schedule demo with stakeholders for end of sprint',
      'Prioritize LangGraph integration as Sprint Goal',
    ],
  },
};

export const stakeholderReviewNotesData = {
  spaceKey: process.env.CONFLUENCE_DEFAULT_SPACE || '',
  meetingData: {
    title: 'Q4 Product Review - Executive Stakeholders',
    date: new Date().toISOString(),
    attendees: [
      'CEO',
      'CTO',
      'VP Product',
      'VP Engineering',
      'Product Manager',
    ],
    meetingType: 'stakeholder_review',
    agenda: [
      'Q4 Progress Review',
      'Demo: PM Automation Platform',
      'Business Metrics',
      'Q1 2026 Roadmap',
    ],
    discussionPoints: [
      {
        topic: 'Q4 Progress Review',
        summary: 'Successfully launched PM Automation Platform. All four core integrations operational. Positive early user feedback. On schedule for full rollout.',
        decisions: ['Approve full rollout to all product teams'],
        actionItems: [
          {
            task: 'Create rollout plan for company-wide deployment',
            owner: 'VP Product',
            dueDate: '2025-11-20',
          },
        ],
      },
      {
        topic: 'Platform Demo',
        summary: 'Demonstrated email automation with live templates, showed real-time Slack notifications, walked through Confluence GTM generation, presented meeting notes automation.',
        decisions: ['Platform meets all requirements for enterprise deployment'],
        actionItems: [],
      },
      {
        topic: 'Business Impact & Q1 Planning',
        summary: 'Projected time savings of 10+ hours per PM per week. Potential cost savings of $500K annually across org. Improved stakeholder satisfaction scores. Reduced documentation debt.',
        decisions: [
          'Allocate budget for enterprise Slack and Confluence licenses',
          'Prioritize LangGraph AI integration for Q1 2026',
          'Schedule monthly executive reviews',
        ],
        actionItems: [
          {
            task: 'Finalize Q1 2026 roadmap',
            owner: 'Product Manager',
            dueDate: '2025-11-25',
          },
          {
            task: 'Procure enterprise licenses',
            owner: 'IT Department',
            dueDate: '2025-12-01',
          },
        ],
      },
    ],
    nextSteps: [
      'Approve full rollout to all product teams',
      'Allocate budget for enterprise Slack and Confluence licenses',
      'Prioritize LangGraph AI integration for Q1 2026',
      'Schedule monthly executive reviews',
    ],
  },
};

export const actionItemsTestData = {
  spaceKey: process.env.CONFLUENCE_DEFAULT_SPACE || '',
  meetingData: {
    title: 'Weekly Team Sync - Action Items Test',
    date: new Date().toISOString(),
    attendees: ['Team Lead', 'Developer 1', 'Developer 2', 'QA Engineer'],
    meetingType: 'product_sync',
    agenda: ['Quick updates', 'Blockers', 'Next steps'],
    discussionPoints: [
      {
        topic: 'Weekly Updates',
        summary: 'All team members on track with their assigned tasks. No major blockers identified. Code review process working smoothly.',
        decisions: ['Continue with current sprint plan'],
        actionItems: [
          {
            task: 'Fix critical bug in email module',
            owner: 'Developer 1',
            dueDate: '2025-11-09',
          },
          {
            task: 'Review PR #123',
            owner: 'Team Lead',
            dueDate: '2025-11-09',
          },
          {
            task: 'Update test documentation',
            owner: 'QA Engineer',
            dueDate: '2025-11-12',
          },
          {
            task: 'Refactor utility functions',
            owner: 'Developer 2',
            dueDate: '2025-11-15',
          },
        ],
      },
    ],
    nextSteps: ['Continue with current sprint plan'],
  },
};

// Export all test data
export default {
  email: {
    stakeholderUpdate: stakeholderUpdateEmailData,
    sprintSummary: sprintSummaryEmailData,
    featureLaunch: featureLaunchEmailData,
  },
  slack: {
    taskCompleted: taskCompletedSlackData,
    analysisReady: analysisReadySlackData,
    approvalNeeded: approvalNeededSlackData,
    errorAlert: errorAlertSlackData,
    priorities: priorityTestData,
  },
  confluence: {
    gtmStrategy: gtmStrategyData,
    minimalGTM: minimalGTMStrategyData,
    sprintPlanning: sprintPlanningNotesData,
    stakeholderReview: stakeholderReviewNotesData,
    actionItemsTest: actionItemsTestData,
  },
};
