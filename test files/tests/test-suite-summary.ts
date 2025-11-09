/**
 * Test Suite Summary
 * 
 * Overview of the PM Automation Platform Integration Test Suite.
 * This file provides a quick reference for all available tests and their purposes.
 */

export interface TestCase {
  name: string;
  category: string;
  description: string;
  endpoint: string;
  expectedDuration: string;
  createsData: boolean;
  requiresCleanup: boolean;
}

export const TEST_SUITE: TestCase[] = [
  // ============================================
  // EMAIL TESTS
  // ============================================
  {
    name: 'testHealthCheck',
    category: 'Email',
    description: 'Verifies all integration services (Resend, Slack, Confluence) are properly configured and healthy',
    endpoint: '/api/integrations/health',
    expectedDuration: '< 500ms',
    createsData: false,
    requiresCleanup: false,
  },
  {
    name: 'testStakeholderEmail',
    category: 'Email',
    description: 'Sends a weekly stakeholder update email with project highlights, metrics, and next steps',
    endpoint: '/api/integrations/test-email',
    expectedDuration: '1-3s',
    createsData: true,
    requiresCleanup: false,
  },
  {
    name: 'testSprintSummaryEmail',
    category: 'Email',
    description: 'Sends a sprint summary email with completed stories, velocity metrics, and retrospective highlights',
    endpoint: '/api/integrations/test-email',
    expectedDuration: '1-3s',
    createsData: true,
    requiresCleanup: false,
  },
  {
    name: 'testFeatureLaunchEmail',
    category: 'Email',
    description: 'Sends a feature launch announcement email with key features, benefits, and call to action',
    endpoint: '/api/integrations/test-email',
    expectedDuration: '1-3s',
    createsData: true,
    requiresCleanup: false,
  },
  {
    name: 'testInvalidEmailType',
    category: 'Email',
    description: 'Validates error handling when an invalid email type is provided (expects 400/422 error)',
    endpoint: '/api/integrations/test-email',
    expectedDuration: '< 500ms',
    createsData: false,
    requiresCleanup: false,
  },
  {
    name: 'testMissingRecipient',
    category: 'Email',
    description: 'Validates error handling when recipient email is missing (expects 400/422 error)',
    endpoint: '/api/integrations/test-email',
    expectedDuration: '< 500ms',
    createsData: false,
    requiresCleanup: false,
  },

  // ============================================
  // SLACK TESTS
  // ============================================
  {
    name: 'testTaskCompletedNotification',
    category: 'Slack',
    description: 'Sends a task completion notification to Slack with task details and completion summary',
    endpoint: '/api/integrations/test-slack',
    expectedDuration: '1-2s',
    createsData: true,
    requiresCleanup: false,
  },
  {
    name: 'testAnalysisReadyNotification',
    category: 'Slack',
    description: 'Sends an analysis ready notification with key findings and dashboard link',
    endpoint: '/api/integrations/test-slack',
    expectedDuration: '1-2s',
    createsData: true,
    requiresCleanup: false,
  },
  {
    name: 'testApprovalNeededNotification',
    category: 'Slack',
    description: 'Sends an approval request notification with item details, approvers, and deadline',
    endpoint: '/api/integrations/test-slack',
    expectedDuration: '1-2s',
    createsData: true,
    requiresCleanup: false,
  },
  {
    name: 'testErrorAlertNotification',
    category: 'Slack',
    description: 'Sends a critical error alert with error details, stack trace, and required actions',
    endpoint: '/api/integrations/test-slack',
    expectedDuration: '1-2s',
    createsData: true,
    requiresCleanup: false,
  },
  {
    name: 'testInvalidChannel',
    category: 'Slack',
    description: 'Validates error handling when posting to a non-existent Slack channel',
    endpoint: '/api/integrations/test-slack',
    expectedDuration: '1-2s',
    createsData: false,
    requiresCleanup: false,
  },
  {
    name: 'testPriorityLevels',
    category: 'Slack',
    description: 'Tests all priority levels (low, medium, high, critical) with appropriate formatting and icons',
    endpoint: '/api/integrations/test-slack',
    expectedDuration: '4-8s',
    createsData: true,
    requiresCleanup: false,
  },

  // ============================================
  // CONFLUENCE GTM TESTS
  // ============================================
  {
    name: 'testCreateGTMPage',
    category: 'Confluence GTM',
    description: 'Creates a complete Go-to-Market strategy page with all 8 sections (executive summary, market analysis, customer segments, value proposition, pricing, distribution, launch plan, metrics)',
    endpoint: '/api/integrations/test-confluence-gtm',
    expectedDuration: '3-5s',
    createsData: true,
    requiresCleanup: true,
  },
  {
    name: 'testMinimalGTMPage',
    category: 'Confluence GTM',
    description: 'Creates a minimal GTM strategy page with only required fields to test validation boundaries',
    endpoint: '/api/integrations/test-confluence-gtm',
    expectedDuration: '2-4s',
    createsData: true,
    requiresCleanup: true,
  },
  {
    name: 'testInvalidSpaceKey',
    category: 'Confluence GTM',
    description: 'Validates error handling when attempting to create a page in a non-existent Confluence space',
    endpoint: '/api/integrations/test-confluence-gtm',
    expectedDuration: '1-2s',
    createsData: false,
    requiresCleanup: false,
  },
  {
    name: 'testMissingRequiredFields',
    category: 'Confluence GTM',
    description: 'Validates error handling when required fields (productName, targetMarket, gtmStrategy) are missing',
    endpoint: '/api/integrations/test-confluence-gtm',
    expectedDuration: '< 500ms',
    createsData: false,
    requiresCleanup: false,
  },

  // ============================================
  // CONFLUENCE MEETING NOTES TESTS
  // ============================================
  {
    name: 'testSprintPlanningNotes',
    category: 'Confluence Meetings',
    description: 'Creates sprint planning meeting notes with agenda, discussion points, decisions, and action items',
    endpoint: '/api/integrations/test-confluence-meeting',
    expectedDuration: '3-5s',
    createsData: true,
    requiresCleanup: true,
  },
  {
    name: 'testStakeholderReviewNotes',
    category: 'Confluence Meetings',
    description: 'Creates stakeholder review meeting notes with progress updates, demo notes, and executive decisions',
    endpoint: '/api/integrations/test-confluence-meeting',
    expectedDuration: '3-5s',
    createsData: true,
    requiresCleanup: true,
  },
  {
    name: 'testWithActionItems',
    category: 'Confluence Meetings',
    description: 'Creates meeting notes with a formatted action items table including assignees, due dates, and priorities',
    endpoint: '/api/integrations/test-confluence-meeting',
    expectedDuration: '3-5s',
    createsData: true,
    requiresCleanup: true,
  },
  {
    name: 'testMissingMeetingType',
    category: 'Confluence Meetings',
    description: 'Validates error handling when meetingType field is missing from the request',
    endpoint: '/api/integrations/test-confluence-meeting',
    expectedDuration: '< 500ms',
    createsData: false,
    requiresCleanup: false,
  },
];

/**
 * Get summary statistics for the test suite
 */
export function getTestSuiteStats() {
  const stats = {
    total: TEST_SUITE.length,
    byCategory: {} as Record<string, number>,
    requiresCleanup: TEST_SUITE.filter((t) => t.requiresCleanup).length,
    createsData: TEST_SUITE.filter((t) => t.createsData).length,
    validationTests: TEST_SUITE.filter((t) => !t.createsData).length,
  };

  TEST_SUITE.forEach((test) => {
    stats.byCategory[test.category] = (stats.byCategory[test.category] || 0) + 1;
  });

  return stats;
}

/**
 * Get tests by category
 */
export function getTestsByCategory(category: string): TestCase[] {
  return TEST_SUITE.filter((test) => test.category === category);
}

/**
 * Get test by name
 */
export function getTestByName(name: string): TestCase | undefined {
  return TEST_SUITE.find((test) => test.name === name);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(TEST_SUITE.map((test) => test.category)));
}

/**
 * Print test suite summary to console
 */
export function printTestSuiteSummary(): void {
  const stats = getTestSuiteStats();

  console.log('\n' + '='.repeat(80));
  console.log('PM AUTOMATION PLATFORM - TEST SUITE SUMMARY');
  console.log('='.repeat(80) + '\n');

  console.log(`Total Tests: ${stats.total}\n`);

  console.log('Tests by Category:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count} tests`);
  });

  console.log(`\nTests that Create Data: ${stats.createsData}`);
  console.log(`Tests that Require Cleanup: ${stats.requiresCleanup}`);
  console.log(`Validation/Error Tests: ${stats.validationTests}\n`);

  getCategories().forEach((category) => {
    console.log(`\n${category} Tests:`);
    console.log('-'.repeat(80));
    getTestsByCategory(category).forEach((test) => {
      console.log(`\n  ${test.name}`);
      console.log(`    Description: ${test.description}`);
      console.log(`    Endpoint: ${test.endpoint}`);
      console.log(`    Expected Duration: ${test.expectedDuration}`);
      console.log(`    Creates Data: ${test.createsData ? 'Yes' : 'No'}`);
      console.log(`    Requires Cleanup: ${test.requiresCleanup ? 'Yes' : 'No'}`);
    });
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

// Run if executed directly
if (require.main === module) {
  printTestSuiteSummary();
}

export default TEST_SUITE;
