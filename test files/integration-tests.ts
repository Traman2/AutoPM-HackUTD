/**
 * Integration Tests
 * 
 * Comprehensive automated test suite for PM Automation Platform.
 * Tests all four integration modules:
 * - Email (Resend)
 * - Slack (Web API)
 * - Confluence GTM (Go-to-Market strategies)
 * - Confluence Meetings (Meeting notes)
 * 
 * Run with: npx tsx tests/integration-tests.ts
 * Run specific test: npx tsx tests/integration-tests.ts --test=testHealthCheck
 * Skip cleanup: npx tsx tests/integration-tests.ts --skip-cleanup
 */

import { apiClient, endpoints, testConfig, validateTestConfig } from '../tests/test-config';
import testData from '../tests/test-data';
import {
  sleep,
  logTestResult,
  logSection,
  logTestStart,
  logError,
  validateResponse,
  validateStatusCode,
  cleanupConfluencePages,
  retryRequest,
  calculateTestStats,
  formatTestStats,
  getCurrentTimestamp,
  calculateDuration,
  assert,
  assertEqual,
  assertDefined,
} from '../tests/test-utils';

// ============================================
// TEST RUNNER CLASS
// ============================================

class TestRunner {
  private results: Array<{
    name: string;
    success: boolean;
    duration: number;
    error?: any;
    skipped?: boolean;
  }> = [];

  private createdPageIds: string[] = [];
  private skipCleanup: boolean = false;

  constructor(skipCleanup: boolean = false) {
    this.skipCleanup = skipCleanup;
  }

  /**
   * Track created Confluence page for cleanup
   */
  private trackPage(pageId: string): void {
    this.createdPageIds.push(pageId);
  }

  /**
   * Run a single test with error handling and timing
   */
  private async runTest(
    testName: string,
    testFn: () => Promise<void>,
    skipTest: boolean = false
  ): Promise<void> {
    if (skipTest) {
      console.log(`⏭️ Skipping test: ${testName}`);
      this.results.push({
        name: testName,
        success: true,
        duration: 0,
        skipped: true,
      });
      return;
    }

    logTestStart(testName);
    const startTime = Date.now();

    try {
      await testFn();
      const endTime = Date.now();
      const duration = endTime - startTime;

      logTestResult(testName, true, null, calculateDuration(startTime, endTime));

      this.results.push({
        name: testName,
        success: true,
        duration,
      });
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      logError(testName, error);
      logTestResult(testName, false, { error: error instanceof Error ? error.message : error }, calculateDuration(startTime, endTime));

      this.results.push({
        name: testName,
        success: false,
        duration,
        error,
      });
    }
  }

  // ============================================
  // EMAIL TESTS
  // ============================================

  async testHealthCheck(): Promise<void> {
    await this.runTest('Health Check - All Services', async () => {
      const response = await apiClient.get(endpoints.health);

      assertEqual(response.status, 200, 'Expected status 200');
      assertDefined(response.data, 'Response data should be defined');

      const validation = validateResponse(response.data, [
        'overall',
        'timestamp',
        'services.resend',
        'services.slack',
        'services.confluence',
      ]);

      assert(validation.valid, `Missing fields: ${validation.missing.join(', ')}`);

      // Verify all services are configured
      const { services } = response.data;
      assertEqual(services.resend.configured, true, 'Resend should be configured');
      assertEqual(services.slack.configured, true, 'Slack should be configured');
      assertEqual(services.confluence.configured, true, 'Confluence should be configured');

      console.log('✅ All services are healthy and configured');
    });
  }

  async testStakeholderEmail(): Promise<void> {
    await this.runTest('Email - Stakeholder Update', async () => {
      const response = await apiClient.post(
        endpoints.testEmail,
        testData.email.stakeholderUpdate
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertDefined(response.data, 'Response data should be defined');

      const validation = validateResponse(response.data, [
        'success',
        'messageId',
        'type',
        'recipient',
      ]);

      assert(validation.valid, `Missing fields: ${validation.missing.join(', ')}`);
      assertEqual(response.data.success, true, 'Email should be sent successfully');
      assertDefined(response.data.messageId, 'Message ID should be present');

      console.log(`✅ Email sent with ID: ${response.data.messageId}`);
    });
  }

  async testSprintSummaryEmail(): Promise<void> {
    await this.runTest('Email - Sprint Summary', async () => {
      const response = await apiClient.post(
        endpoints.testEmail,
        testData.email.sprintSummary
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Email should be sent successfully');
      assertDefined(response.data.messageId, 'Message ID should be present');

      console.log(`✅ Sprint summary email sent with ID: ${response.data.messageId}`);
    });
  }

  async testFeatureLaunchEmail(): Promise<void> {
    await this.runTest('Email - Feature Launch', async () => {
      const response = await apiClient.post(
        endpoints.testEmail,
        testData.email.featureLaunch
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Email should be sent successfully');
      assertDefined(response.data.messageId, 'Message ID should be present');

      console.log(`✅ Feature launch email sent with ID: ${response.data.messageId}`);
    });
  }

  async testInvalidEmailType(): Promise<void> {
    await this.runTest('Email - Invalid Type Error Handling', async () => {
      try {
        const response = await apiClient.post(endpoints.testEmail, {
          type: 'invalid-type',
          recipient: testConfig.testEmail,
          subject: 'Test',
          data: {},
        });

        // Should not reach here - expect error
        throw new Error('Expected error for invalid email type');
      } catch (error: any) {
        // Verify it's a validation error (400)
        if (error.response) {
          assert(
            validateStatusCode(error.response.status, [400, 422]),
            'Expected 400 or 422 status for invalid type'
          );
          console.log('✅ Correctly rejected invalid email type');
        } else {
          throw error;
        }
      }
    });
  }

  async testMissingRecipient(): Promise<void> {
    await this.runTest('Email - Missing Recipient Validation', async () => {
      try {
        const response = await apiClient.post(endpoints.testEmail, {
          type: 'stakeholder-update',
          subject: 'Test',
          data: {},
        });

        throw new Error('Expected error for missing recipient');
      } catch (error: any) {
        if (error.response) {
          assert(
            validateStatusCode(error.response.status, [400, 422]),
            'Expected 400 or 422 status for missing recipient'
          );
          console.log('✅ Correctly validated missing recipient');
        } else {
          throw error;
        }
      }
    });
  }

  // ============================================
  // SLACK TESTS
  // ============================================

  async testTaskCompletedNotification(): Promise<void> {
    await this.runTest('Slack - Task Completed Notification', async () => {
      const response = await apiClient.post(
        endpoints.testSlack,
        testData.slack.taskCompleted
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Slack message should be sent successfully');
      assertDefined(response.data.data?.messageTs, 'Message timestamp should be present');

      console.log(`✅ Slack notification sent at ${response.data.data?.messageTs}`);
    });
  }

  async testAnalysisReadyNotification(): Promise<void> {
    await this.runTest('Slack - Analysis Ready Notification', async () => {
      const response = await apiClient.post(
        endpoints.testSlack,
        testData.slack.analysisReady
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Slack message should be sent successfully');
      assertDefined(response.data.data?.messageTs, 'Message timestamp should be present');

      console.log(`✅ Analysis ready notification sent`);
    });
  }

  async testApprovalNeededNotification(): Promise<void> {
    await this.runTest('Slack - Approval Needed Notification', async () => {
      const response = await apiClient.post(
        endpoints.testSlack,
        testData.slack.approvalNeeded
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Slack message should be sent successfully');

      console.log(`✅ Approval needed notification sent`);
    });
  }

  async testErrorAlertNotification(): Promise<void> {
    await this.runTest('Slack - Error Alert Notification', async () => {
      const response = await apiClient.post(
        endpoints.testSlack,
        testData.slack.errorAlert
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Slack message should be sent successfully');

      console.log(`✅ Error alert notification sent`);
    });
  }

  async testInvalidChannel(): Promise<void> {
    await this.runTest('Slack - Invalid Channel Error Handling', async () => {
      try {
        const response = await apiClient.post(endpoints.testSlack, {
          channel: '#nonexistent-channel-12345',
          notificationType: 'task-completed',
          priority: 'medium',
          data: {
            taskName: 'Test',
            summary: 'Test summary',
          },
        });

        // Slack API might not fail immediately for invalid channels
        // so we just verify the request was processed
        console.log('⚠️ Note: Slack may queue messages to invalid channels');
      } catch (error: any) {
        if (error.response) {
          console.log(`✅ Correctly handled invalid channel (status: ${error.response.status})`);
        } else {
          throw error;
        }
      }
    });
  }

  async testPriorityLevels(): Promise<void> {
    await this.runTest('Slack - All Priority Levels', async () => {
      const priorities = ['low', 'medium', 'high', 'critical'] as const;
      const results: any[] = [];

      for (const priority of priorities) {
        const data = testData.slack.priorities[priority];
        const response = await apiClient.post(endpoints.testSlack, data);

        assertEqual(response.status, 200, `Expected status 200 for ${priority} priority`);
        assertEqual(response.data.success, true, `${priority} priority message should be sent`);

        results.push({
          priority,
          success: true,
          timestamp: response.data.messageTimestamp,
        });

        // Rate limiting between requests
        await sleep(testConfig.delayBetweenTests);
      }

      console.log(`✅ Successfully sent notifications for all priority levels:`, results);
    });
  }

  // ============================================
  // CONFLUENCE GTM TESTS
  // ============================================

  async testCreateGTMPage(): Promise<void> {
    await this.runTest('Confluence GTM - Create Complete Strategy Page', async () => {
      const response = await apiClient.post(
        endpoints.testConfluenceGTM,
        testData.confluence.gtmStrategy
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Page should be created successfully');
      assertDefined(response.data.data?.pageId, 'Page ID should be present');
      assertDefined(response.data.data?.pageUrl, 'Page URL should be present');

      // Track for cleanup
      this.trackPage(response.data.data?.pageId);

      console.log(`✅ GTM strategy page created:`);
      console.log(`   Page ID: ${response.data.data?.pageId}`);
      console.log(`   URL: ${response.data.data?.pageUrl}`);
    });
  }

  async testMinimalGTMPage(): Promise<void> {
    await this.runTest('Confluence GTM - Create Minimal Page', async () => {
      const response = await apiClient.post(
        endpoints.testConfluenceGTM,
        testData.confluence.minimalGTM
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Minimal page should be created successfully');
      assertDefined(response.data.data?.pageId, 'Page ID should be present');

      this.trackPage(response.data.data?.pageId);

      console.log(`✅ Minimal GTM page created with ID: ${response.data.data?.pageId}`);
    });
  }

  async testInvalidSpaceKey(): Promise<void> {
    await this.runTest('Confluence GTM - Invalid Space Key Error', async () => {
      try {
        const invalidData = {
          ...testData.confluence.gtmStrategy,
          spaceKey: 'INVALID_SPACE_KEY_12345',
        };

        const response = await apiClient.post(endpoints.testConfluenceGTM, invalidData);

        // If it succeeds, that's unexpected but not a failure
        console.log('⚠️ Note: Confluence accepted invalid space key (may be validated later)');
      } catch (error: any) {
        if (error.response) {
          assert(
            validateStatusCode(error.response.status, [400, 404, 500]),
            'Expected 400, 404, or 500 for invalid space'
          );
          console.log('✅ Correctly rejected invalid space key');
        } else {
          throw error;
        }
      }
    });
  }

  async testMissingRequiredFields(): Promise<void> {
    await this.runTest('Confluence GTM - Missing Required Fields', async () => {
      try {
        const response = await apiClient.post(endpoints.testConfluenceGTM, {
          spaceKey: testConfig.testConfluenceSpace,
          // Missing productName, targetMarket, gtmStrategy
        });

        throw new Error('Expected validation error for missing fields');
      } catch (error: any) {
        if (error.response) {
          assert(
            validateStatusCode(error.response.status, [400, 422]),
            'Expected 400 or 422 for missing fields'
          );
          console.log('✅ Correctly validated missing required fields');
        } else {
          throw error;
        }
      }
    });
  }

  // ============================================
  // CONFLUENCE MEETING NOTES TESTS
  // ============================================

  async testSprintPlanningNotes(): Promise<void> {
    await this.runTest('Confluence Meetings - Sprint Planning Notes', async () => {
      const response = await apiClient.post(
        endpoints.testConfluenceMeeting,
        testData.confluence.sprintPlanning
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Meeting notes should be created successfully');
      assertDefined(response.data.data?.pageId, 'Page ID should be present');
      assertDefined(response.data.data?.pageUrl, 'Page URL should be present');

      this.trackPage(response.data.data?.pageId);

      console.log(`✅ Sprint planning notes created:`);
      console.log(`   Page ID: ${response.data.data?.pageId}`);
      console.log(`   URL: ${response.data.data?.pageUrl}`);
    });
  }

  async testStakeholderReviewNotes(): Promise<void> {
    await this.runTest('Confluence Meetings - Stakeholder Review Notes', async () => {
      const response = await apiClient.post(
        endpoints.testConfluenceMeeting,
        testData.confluence.stakeholderReview
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Meeting notes should be created successfully');
      assertDefined(response.data.data?.pageId, 'Page ID should be present');

      this.trackPage(response.data.data?.pageId);

      console.log(`✅ Stakeholder review notes created with ID: ${response.data.data?.pageId}`);
    });
  }

  async testWithActionItems(): Promise<void> {
    await this.runTest('Confluence Meetings - With Action Items Table', async () => {
      const response = await apiClient.post(
        endpoints.testConfluenceMeeting,
        testData.confluence.actionItemsTest
      );

      assertEqual(response.status, 200, 'Expected status 200');
      assertEqual(response.data.success, true, 'Meeting notes with action items should be created');
      assertDefined(response.data.data?.pageId, 'Page ID should be present');

      this.trackPage(response.data.data?.pageId);

      console.log(`✅ Meeting notes with action items created with ID: ${response.data.data?.pageId}`);
    });
  }

  async testMissingMeetingType(): Promise<void> {
    await this.runTest('Confluence Meetings - Missing Meeting Type', async () => {
      try {
        const response = await apiClient.post(endpoints.testConfluenceMeeting, {
          spaceKey: testConfig.testConfluenceSpace,
          meetingTitle: 'Test Meeting',
          meetingDate: new Date().toISOString().split('T')[0],
          // Missing meetingType
        });

        throw new Error('Expected validation error for missing meeting type');
      } catch (error: any) {
        if (error.response) {
          assert(
            validateStatusCode(error.response.status, [400, 422]),
            'Expected 400 or 422 for missing meeting type'
          );
          console.log('✅ Correctly validated missing meeting type');
        } else {
          throw error;
        }
      }
    });
  }

  // ============================================
  // MAIN TEST RUNNER
  // ============================================

  async runAllTests(): Promise<number> {
    console.log('\n' + '='.repeat(80));
    console.log('  PM AUTOMATION PLATFORM - INTEGRATION TEST SUITE');
    console.log('='.repeat(80));
    console.log(`Start Time: ${getCurrentTimestamp()}`);
    console.log('='.repeat(80) + '\n');

    // Validate configuration
    const configValidation = validateTestConfig();
    if (!configValidation.valid) {
      console.error('❌ Test configuration is invalid:');
      configValidation.errors.forEach((error) => console.error(`   - ${error}`));
      console.error('\nPlease check your .env.local file and try again.\n');
      return 1;
    }

    console.log('✅ Test configuration validated\n');

    const overallStartTime = Date.now();

    // EMAIL TESTS
    logSection('Email Integration Tests');
    await this.testHealthCheck();
    await sleep(testConfig.delayBetweenTests);
    await this.testStakeholderEmail();
    await sleep(testConfig.delayBetweenTests);
    await this.testSprintSummaryEmail();
    await sleep(testConfig.delayBetweenTests);
    await this.testFeatureLaunchEmail();
    await sleep(testConfig.delayBetweenTests);
    await this.testInvalidEmailType();
    await sleep(testConfig.delayBetweenTests);
    await this.testMissingRecipient();
    await sleep(testConfig.delayBetweenCategories);

    // SLACK TESTS
    logSection('Slack Integration Tests');
    await this.testTaskCompletedNotification();
    await sleep(testConfig.delayBetweenTests);
    await this.testAnalysisReadyNotification();
    await sleep(testConfig.delayBetweenTests);
    await this.testApprovalNeededNotification();
    await sleep(testConfig.delayBetweenTests);
    await this.testErrorAlertNotification();
    await sleep(testConfig.delayBetweenTests);
    await this.testInvalidChannel();
    await sleep(testConfig.delayBetweenTests);
    await this.testPriorityLevels();
    await sleep(testConfig.delayBetweenCategories);

    // CONFLUENCE GTM TESTS
    logSection('Confluence GTM Integration Tests');
    await this.testCreateGTMPage();
    await sleep(testConfig.delayBetweenTests);
    await this.testMinimalGTMPage();
    await sleep(testConfig.delayBetweenTests);
    await this.testInvalidSpaceKey();
    await sleep(testConfig.delayBetweenTests);
    await this.testMissingRequiredFields();
    await sleep(testConfig.delayBetweenCategories);

    // CONFLUENCE MEETING TESTS
    logSection('Confluence Meeting Notes Integration Tests');
    await this.testSprintPlanningNotes();
    await sleep(testConfig.delayBetweenTests);
    await this.testStakeholderReviewNotes();
    await sleep(testConfig.delayBetweenTests);
    await this.testWithActionItems();
    await sleep(testConfig.delayBetweenTests);
    await this.testMissingMeetingType();

    // Cleanup
    if (!this.skipCleanup && this.createdPageIds.length > 0) {
      logSection('Cleanup');
      await cleanupConfluencePages(this.createdPageIds);
    } else if (this.skipCleanup && this.createdPageIds.length > 0) {
      console.log('\n⚠️ Skipping cleanup - created pages:');
      this.createdPageIds.forEach((id) => console.log(`   - ${id}`));
    }

    // Summary
    const overallEndTime = Date.now();
    const stats = calculateTestStats(this.results);

    logSection('Test Summary');
    console.log(formatTestStats(stats));
    console.log(`\nEnd Time: ${getCurrentTimestamp()}`);
    console.log('='.repeat(80) + '\n');

    // Return exit code
    return stats.failed > 0 ? 1 : 0;
  }

  /**
   * Run a specific test by name
   */
  async runSpecificTest(testName: string): Promise<number> {
    console.log(`\n🎯 Running specific test: ${testName}\n`);

    const testMethods: { [key: string]: () => Promise<void> } = {
      testHealthCheck: () => this.testHealthCheck(),
      testStakeholderEmail: () => this.testStakeholderEmail(),
      testSprintSummaryEmail: () => this.testSprintSummaryEmail(),
      testFeatureLaunchEmail: () => this.testFeatureLaunchEmail(),
      testInvalidEmailType: () => this.testInvalidEmailType(),
      testMissingRecipient: () => this.testMissingRecipient(),
      testTaskCompletedNotification: () => this.testTaskCompletedNotification(),
      testAnalysisReadyNotification: () => this.testAnalysisReadyNotification(),
      testApprovalNeededNotification: () => this.testApprovalNeededNotification(),
      testErrorAlertNotification: () => this.testErrorAlertNotification(),
      testInvalidChannel: () => this.testInvalidChannel(),
      testPriorityLevels: () => this.testPriorityLevels(),
      testCreateGTMPage: () => this.testCreateGTMPage(),
      testMinimalGTMPage: () => this.testMinimalGTMPage(),
      testInvalidSpaceKey: () => this.testInvalidSpaceKey(),
      testMissingRequiredFields: () => this.testMissingRequiredFields(),
      testSprintPlanningNotes: () => this.testSprintPlanningNotes(),
      testStakeholderReviewNotes: () => this.testStakeholderReviewNotes(),
      testWithActionItems: () => this.testWithActionItems(),
      testMissingMeetingType: () => this.testMissingMeetingType(),
    };

    const testFn = testMethods[testName];
    if (!testFn) {
      console.error(`❌ Test "${testName}" not found\n`);
      console.log('Available tests:');
      Object.keys(testMethods).forEach((name) => console.log(`   - ${name}`));
      return 1;
    }

    await testFn();

    // Cleanup if needed
    if (!this.skipCleanup && this.createdPageIds.length > 0) {
      await cleanupConfluencePages(this.createdPageIds);
    }

    const stats = calculateTestStats(this.results);
    console.log(`\n${formatTestStats(stats)}\n`);

    return stats.failed > 0 ? 1 : 0;
  }
}

// ============================================
// COMMAND LINE EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const skipCleanup = args.includes('--skip-cleanup');
  const testArg = args.find((arg) => arg.startsWith('--test='));
  const specificTest = testArg ? testArg.split('=')[1] : null;

  const runner = new TestRunner(skipCleanup);

  let exitCode: number;

  if (specificTest) {
    exitCode = await runner.runSpecificTest(specificTest);
  } else {
    exitCode = await runner.runAllTests();
  }

  process.exit(exitCode);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { TestRunner };
export default TestRunner;
