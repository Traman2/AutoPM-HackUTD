/**
 * PM Automation Demo - How to Use Integrations in Your Code
 * 
 * This shows how to trigger automated emails, Slack notifications,
 * and Confluence pages from your application code.
 */

import { sendProductEmail } from '@/lib/integrations/email/email';
import { sendSlackNotification } from '@/lib/integrations/slack';
import { createGTMStrategyPage } from '@/lib/integrations/confluence-gtm';

// ============================================================================
// EXAMPLE 1: Direct Function Calls (Simplest)
// ============================================================================

/**
 * When a sprint completes, automatically send summary email
 */
async function onSprintComplete(sprintData: any) {
  console.log('🎯 Sprint completed! Sending notifications...');
  
  // 1. Send Email
  const emailResult = await sendProductEmail(
    'team@company.com',
    'sprint_summary',
    {
      sprintNumber: sprintData.number,
      startDate: sprintData.startDate,
      endDate: sprintData.endDate,
      storiesCompleted: sprintData.completed,
      storiesPlanned: sprintData.planned,
      accomplishments: sprintData.accomplishments,
      teamName: 'Product Team',
    }
  );
  
  if (emailResult.success) {
    console.log('✅ Email sent:', emailResult.messageId);
  }
  
  // 2. Send Slack Notification
  const slackResult = await sendSlackNotification(
    '#product-team',
    'task_completed',
    {
      title: `Sprint ${sprintData.number} Completed!`,
      description: `The team completed ${sprintData.completed} out of ${sprintData.planned} stories`,
      metadata: {
        'Sprint': `#${sprintData.number}`,
        'Velocity': `${sprintData.completed} points`,
        'Team': 'Product Team',
      },
      priority: 'high',
    }
  );
  
  if (slackResult.success) {
    console.log('✅ Slack notification sent');
  }
}

// ============================================================================
// EXAMPLE 2: Using Agents (For Complex Workflows)
// ============================================================================

/**
 * Use the Email Agent for event-driven automation
 */
async function onFeatureLaunch(featureData: any) {
  console.log('🚀 Feature launching! Triggering agent workflow...');
  
  // Call the agent endpoint (simulates what your frontend would do)
  const response = await fetch('http://localhost:3000/api/agents/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'feature_launch',
      data: {
        recipientEmail: 'stakeholders@company.com',
        featureName: featureData.name,
        launchDate: featureData.launchDate,
        benefits: featureData.benefits,
        accessInstructions: 'Check your dashboard',
      },
    }),
  });
  
  const result = await response.json();
  console.log('✅ Agent processed:', result);
}

// ============================================================================
// EXAMPLE 3: Scheduled Automation (Cron Job)
// ============================================================================

/**
 * Send weekly status update every Friday
 * You'd call this from a cron job or scheduled task
 */
async function sendWeeklyUpdate() {
  console.log('📅 Running weekly automation...');
  
  // Get project data from your database
  const projects = await getActiveProjects(); // Your database query
  
  for (const project of projects) {
    // Send update email to project stakeholders
    await sendProductEmail(
      project.stakeholderEmail,
      'stakeholder_update',
      {
        stakeholderName: project.stakeholderName,
        projectName: project.name,
        updateTitle: 'Weekly Status Update',
        summary: project.summary,
        keyHighlights: project.highlights,
        upcomingMilestones: project.milestones,
        progressPercentage: project.progress,
      }
    );
    
    // Also post to Slack
    await sendSlackNotification(
      project.slackChannel,
      'analysis_ready',
      {
        title: `${project.name} - Weekly Update Ready`,
        description: `Progress: ${project.progress}%`,
        metadata: {
          'Project': project.name,
          'Status': project.status,
        },
      }
    );
  }
  
  console.log(`✅ Sent updates for ${projects.length} projects`);
}

// ============================================================================
// EXAMPLE 4: API Webhook (External Trigger)
// ============================================================================

/**
 * Respond to Jira webhook when issue is updated
 * This would be in an API route like /api/webhooks/jira
 */
async function handleJiraWebhook(issueData: any) {
  console.log('📬 Jira webhook received...');
  
  if (issueData.transition === 'Done') {
    // Task completed - notify team
    await sendSlackNotification(
      '#engineering',
      'task_completed',
      {
        title: `Task Completed: ${issueData.summary}`,
        description: `${issueData.assignee} finished ${issueData.key}`,
        metadata: {
          'Issue': issueData.key,
          'Type': issueData.type,
          'Points': issueData.points.toString(),
        },
        actionUrl: issueData.url,
        priority: 'medium',
      }
    );
    
    // Create Confluence documentation
    if (issueData.type === 'Epic') {
      await createGTMStrategyPage(
        'TEAM',
        issueData.summary,
        generateGTMData(issueData) // Your logic to convert issue to GTM
      );
    }
  }
}

// ============================================================================
// EXAMPLE 5: React Component (Frontend Trigger)
// ============================================================================

/**
 * Send email when user clicks "Request Approval" button
 * This would be in your React component
 */
async function requestApproval(requestData: any) {
  console.log('📝 Approval requested by user...');
  
  // Call your API endpoint
  const response = await fetch('/api/integrations/test-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_SECRET',
    },
    body: JSON.stringify({
      to: 'manager@company.com',
      emailType: 'stakeholder_update',
      data: {
        stakeholderName: 'Manager Name',
        updateTitle: 'Approval Request',
        summary: requestData.description,
        keyHighlights: requestData.highlights,
      },
    }),
  });
  
  if (response.ok) {
    // Show success message to user
    alert('✅ Approval request sent!');
  }
}

// ============================================================================
// EXAMPLE 6: LangGraph Integration (AI Agent)
// ============================================================================

/**
 * Use in LangGraph workflow for AI-powered automation
 */
import { EmailAgent, createEmailNode } from '@/app/api/agents/email/tools';

async function createAIWorkflow() {
  const emailAgent = new EmailAgent();
  
  // Create nodes
  const emailNode = createEmailNode(emailAgent);
  
  // In your LangGraph setup:
  // graph.addNode('send_email', emailNode);
  // graph.addEdge('analysis_complete', 'send_email');
  
  console.log('🤖 AI workflow created with email automation');
}

// ============================================================================
// Helper Functions (Your Business Logic)
// ============================================================================

async function getActiveProjects() {
  // This would query your database
  return [
    {
      name: 'Mobile App v2',
      stakeholderEmail: 'cto@company.com',
      stakeholderName: 'CTO',
      summary: 'Making great progress on the new mobile app',
      highlights: ['UI redesign complete', 'API integration in progress'],
      milestones: ['Beta launch next month'],
      progress: 75,
      status: 'On Track',
      slackChannel: '#mobile-team',
    },
  ];
}

function generateGTMData(issueData: any) {
  // Convert Jira issue to GTM strategy data
  return {
    targetMarket: issueData.targetMarket || 'TBD',
    valueProposition: issueData.description,
    competitorInsights: [],
    pricingStrategy: 'TBD',
    launchTimeline: issueData.dueDate,
    marketingChannels: ['Email', 'Social Media'],
    successMetrics: [],
    risks: [],
  };
}

// ============================================================================
// HOW TO USE IN YOUR PROJECT
// ============================================================================

/*

OPTION 1 - Direct Function Calls (Recommended for simple use cases):
  
  import { sendProductEmail } from '@/lib/integrations/email/email';
  import { sendSlackNotification } from '@/lib/integrations/slack';
  
  // Somewhere in your code when something happens:
  await sendProductEmail('user@example.com', 'sprint_summary', data);
  await sendSlackNotification('#team', 'task_completed', payload);


OPTION 2 - API Routes (For frontend or external services):
  
  // From your React component:
  fetch('/api/integrations/test-email', {
    method: 'POST',
    body: JSON.stringify({ to: 'user@example.com', emailType: 'sprint_summary', data }),
  });


OPTION 3 - Agents (For complex AI workflows):
  
  import { EmailAgent } from '@/app/api/agents/email/tools';
  
  const agent = new EmailAgent();
  const state = await agent.processEvent(event);
  await agent.sendEmail(state);


OPTION 4 - Scheduled Tasks (Cron jobs):
  
  // In your cron job file:
  import { sendWeeklyUpdate } from './automation-demo';
  
  // Run every Friday at 5 PM
  cron.schedule('0 17 * * 5', sendWeeklyUpdate);

*/

export {
  onSprintComplete,
  onFeatureLaunch,
  sendWeeklyUpdate,
  handleJiraWebhook,
  requestApproval,
};
