# PM Automation Platform - Integration Test Suite

Comprehensive automated test suite for all integration modules.

## Overview

This test suite validates the functionality of all four integration modules:

- **Email** (Resend) - 6 tests
- **Slack** (Web API) - 6 tests
- **Confluence GTM** - 4 tests
- **Confluence Meetings** - 4 tests

**Total: 20+ test scenarios**

## Test Files

- `integration-tests.ts` - Main test runner with TestRunner class
- `test-config.ts` - Configuration, API client, authentication
- `test-data.ts` - Sample data for all test scenarios
- `test-utils.ts` - Helper functions and utilities

## Prerequisites

1. **Environment Variables** - Ensure `.env.local` has all required variables:

   ```
   API_SECRET=your_secret_key
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=your@email.com
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_TEST_CHANNEL=#test-channel or C09...
   CONFLUENCE_DOMAIN=yourorg.atlassian.net
   CONFLUENCE_EMAIL=your@email.com
   CONFLUENCE_API_TOKEN=ATATT...
   CONFLUENCE_DEFAULT_SPACE=~712020...
   ```

2. **Development Server** - Must be running on localhost:3000:

   ```bash
   pnpm dev
   ```

3. **Dependencies** - Install if not already:
   ```bash
   pnpm install
   ```

## Running Tests

### Run All Tests

```bash
npx tsx tests/integration-tests.ts
```

Or using npm script:

```bash
pnpm test:integration
```

### Run Specific Test

```bash
npx tsx tests/integration-tests.ts --test=testHealthCheck
npx tsx tests/integration-tests.ts --test=testStakeholderEmail
npx tsx tests/integration-tests.ts --test=testCreateGTMPage
```

### Skip Cleanup (Keep Confluence Pages)

```bash
npx tsx tests/integration-tests.ts --skip-cleanup
```

Useful for inspecting created Confluence pages after tests complete.

## Available Tests

### Email Tests

- `testHealthCheck` - Verify all services configured
- `testStakeholderEmail` - Send stakeholder update
- `testSprintSummaryEmail` - Send sprint summary
- `testFeatureLaunchEmail` - Send feature launch announcement
- `testInvalidEmailType` - Error handling for invalid type
- `testMissingRecipient` - Validation for missing recipient

### Slack Tests

- `testTaskCompletedNotification` - Task completed notification
- `testAnalysisReadyNotification` - Analysis results ready
- `testApprovalNeededNotification` - Approval request notification
- `testErrorAlertNotification` - Critical error alert
- `testInvalidChannel` - Error handling for invalid channel
- `testPriorityLevels` - All priority levels (low, medium, high, critical)

### Confluence GTM Tests

- `testCreateGTMPage` - Complete GTM strategy with all sections
- `testMinimalGTMPage` - Minimal required data
- `testInvalidSpaceKey` - Error handling for invalid space
- `testMissingRequiredFields` - Field validation

### Confluence Meeting Tests

- `testSprintPlanningNotes` - Sprint planning meeting
- `testStakeholderReviewNotes` - Stakeholder review meeting
- `testWithActionItems` - Meeting with action items table
- `testMissingMeetingType` - Validation for missing type

## Test Output

Tests provide detailed output including:

- ✅ **Pass/Fail status** for each test
- ⏱️ **Execution time** per test
- 📊 **Request/response data** for debugging
- 📈 **Summary statistics** (total, passed, failed, pass rate)
- 🗑️ **Automatic cleanup** of test Confluence pages

### Example Output

```
================================================================================
  PM AUTOMATION PLATFORM - INTEGRATION TEST SUITE
================================================================================
Start Time: 2025-11-08T12:34:56.789Z
================================================================================

✅ Test configuration validated

████████████████████████████████████████████████████████████████████████████████
  EMAIL INTEGRATION TESTS
████████████████████████████████████████████████████████████████████████████████

🧪 Starting test: Health Check - All Services
⏰ 2025-11-08T12:34:57.123Z
[REQUEST] GET /api/integrations/health
[RESPONSE] 200 /api/integrations/health
✅ All services are healthy and configured

================================================================================
✅ PASS | Health Check - All Services (234ms)
Timestamp: 2025-11-08T12:34:57.357Z
================================================================================

...

📊 Test Statistics:
   Total Tests: 20
   ✅ Passed: 20
   ❌ Failed: 0
   ⏭️ Skipped: 0
   📈 Pass Rate: 100.0%
   ⏱️ Total Duration: 45.67s
```

## Configuration

### API Base URL

Default: `http://localhost:3000`

Override with environment variable:

```bash
API_BASE_URL=http://localhost:4000 npx tsx tests/integration-tests.ts
```

### Timeouts

- Request timeout: 30 seconds
- Delay between tests: 100ms
- Delay between categories: 500ms
- Retry delay: 1 second (exponential backoff)

Configure in `test-config.ts`:

```typescript
export const testConfig = {
  requestTimeout: 30000,
  delayBetweenTests: 100,
  delayBetweenCategories: 500,
  retryDelay: 1000,
  maxRetries: 3,
};
```

## Rate Limiting

The test suite implements rate limiting to avoid overwhelming APIs:

- **100ms** between tests in same category
- **500ms** between different categories
- **Exponential backoff** for retries (1s, 2s, 4s)

## Cleanup

### Automatic Cleanup

By default, all created Confluence pages are automatically deleted after tests complete.

### Manual Cleanup

If tests fail or cleanup is skipped, you can delete pages manually:

```typescript
import { cleanupConfluencePage } from "./test-utils";

await cleanupConfluencePage("page-id-here");
```

### Skip Cleanup

Keep test pages for inspection:

```bash
npx tsx tests/integration-tests.ts --skip-cleanup
```

Page IDs will be printed at the end for manual cleanup.

## Troubleshooting

### All Services Show as Unconfigured

1. Check `.env.local` exists (not just `.env.local.example`)
2. Verify all environment variables are set correctly
3. Restart development server to pick up changes:
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

### Confluence API Errors

1. Verify `CONFLUENCE_DOMAIN` has no `https://` prefix
2. Check API token has not expired
3. Verify space key is correct (should start with `~` for personal spaces)
4. Ensure user has permission to create pages in the space

### Slack API Errors

1. Verify bot token starts with `xoxb-`
2. Check bot has been added to the test channel
3. Verify bot has `chat:write` permission
4. For private channels, ensure bot is invited

### Email Errors

1. Verify Resend API key is valid
2. Check `RESEND_FROM_EMAIL` is verified in Resend dashboard
3. Ensure email format is valid

### Connection Errors

1. Ensure development server is running on localhost:3000
2. Check firewall is not blocking connections
3. Verify no other process is using port 3000

## Test Data

All test data is defined in `test-data.ts`:

- **Realistic scenarios** based on actual PM workflows
- **Complete data structures** with all required fields
- **Edge cases** for validation testing
- **Reusable data objects** across multiple tests

Modify test data to match your environment:

```typescript
export const stakeholderUpdateEmailData = {
  type: "stakeholder-update",
  recipient: "your-email@example.com", // Change this
  subject: "Your Subject",
  data: {
    projectName: "Your Project",
    // ... rest of data
  },
};
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm run build
      - run: npm start & # Start server in background
      - run: sleep 10 # Wait for server to start
      - run: npx tsx tests/integration-tests.ts
        env:
          API_SECRET: ${{ secrets.API_SECRET }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
          # ... other secrets
```

## Best Practices

1. **Always run health check first** to verify configuration
2. **Use --skip-cleanup** when developing new tests
3. **Check Slack and Confluence** for actual messages/pages created
4. **Run specific tests** during development to save time
5. **Review test output** for debugging information
6. **Keep test data realistic** to catch edge cases
7. **Update tests** when API contracts change

## Extending Tests

### Add New Test

1. Create test method in `TestRunner` class:

   ```typescript
   async testNewFeature(): Promise<void> {
     await this.runTest('New Feature Test', async () => {
       const response = await apiClient.post('/endpoint', data);
       assertEqual(response.status, 200, 'Expected 200');
       // ... assertions
     });
   }
   ```

2. Add to `runAllTests()` method
3. Add to `testMethods` object in `runSpecificTest()`
4. Add test data to `test-data.ts` if needed

### Add New Utility

Add helper functions to `test-utils.ts`:

```typescript
export function myCustomValidator(data: any): boolean {
  // validation logic
  return true;
}
```

## Support

For issues or questions:

1. Check this README for common solutions
2. Review test output for detailed error messages
3. Verify environment configuration
4. Check API endpoint documentation

## License

Part of the PM Automation Platform project.
