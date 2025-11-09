# Quick Start Guide - Integration Tests

## 🚀 Quick Start (3 Steps)

### 1. Ensure Server is Running

```bash
pnpm dev
```

Server should be running on http://localhost:3000

### 2. Run All Tests

```bash
pnpm test:integration
```

### 3. View Results

Tests will run automatically and show results in terminal:

- ✅ Green checkmarks = Passed
- ❌ Red X = Failed
- 📊 Summary statistics at the end

## 🎯 Run Specific Tests

### Health Check Only

```bash
pnpm test:health
```

### Email Tests

```bash
pnpm test:email
```

### Slack Tests

```bash
pnpm test:slack
```

### Confluence Tests

```bash
pnpm test:confluence
```

### Custom Test

```bash
npx tsx tests/integration-tests.ts --test=testSprintPlanningNotes
```

## 🗑️ Keep Test Pages for Inspection

By default, Confluence pages are deleted after tests. To keep them:

```bash
pnpm test:integration:skip-cleanup
```

Then visit Confluence to inspect the created pages.

## ⚙️ Configuration Check

Before running tests, verify your `.env.local` file has all required variables:

```bash
# Required variables
API_SECRET=hackutd2025_test_secret_key_xyz789
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=your@email.com
SLACK_BOT_TOKEN=xoxb-...
SLACK_TEST_CHANNEL=#test or C09...
CONFLUENCE_DOMAIN=yourorg.atlassian.net
CONFLUENCE_EMAIL=your@email.com
CONFLUENCE_API_TOKEN=ATATT...
CONFLUENCE_DEFAULT_SPACE=~712020...
```

## 📋 All Available Tests

### Email (6 tests)

- testHealthCheck
- testStakeholderEmail
- testSprintSummaryEmail
- testFeatureLaunchEmail
- testInvalidEmailType
- testMissingRecipient

### Slack (6 tests)

- testTaskCompletedNotification
- testAnalysisReadyNotification
- testApprovalNeededNotification
- testErrorAlertNotification
- testInvalidChannel
- testPriorityLevels

### Confluence GTM (4 tests)

- testCreateGTMPage
- testMinimalGTMPage
- testInvalidSpaceKey
- testMissingRequiredFields

### Confluence Meetings (4 tests)

- testSprintPlanningNotes
- testStakeholderReviewNotes
- testWithActionItems
- testMissingMeetingType

## 🔍 Understanding Results

### Success Output

```
✅ PASS | Test Name (234ms)
```

### Failure Output

```
❌ FAIL | Test Name (156ms)

❌ Error in Test Name:
HTTP Error: {
  status: 400,
  statusText: 'Bad Request',
  data: { error: 'Invalid parameters' }
}
```

### Summary

```
📊 Test Statistics:
   Total Tests: 20
   ✅ Passed: 18
   ❌ Failed: 2
   ⏭️ Skipped: 0
   📈 Pass Rate: 90.0%
   ⏱️ Total Duration: 45.67s
```

## 🐛 Common Issues

### "All services unconfigured"

1. Check `.env.local` exists (not just `.env.local.example`)
2. Restart dev server after creating/updating `.env.local`

### "Connection refused"

- Ensure dev server is running on localhost:3000
- Check no firewall blocking connections

### "Confluence space not found"

- Verify `CONFLUENCE_DEFAULT_SPACE` is correct
- Personal spaces start with `~` (e.g., `~712020e75...`)

### "Slack channel not found"

- Ensure bot is added to the channel
- Use channel ID (C09...) instead of name for private channels

## 📚 More Information

See [tests/README.md](./README.md) for comprehensive documentation including:

- Detailed test descriptions
- Configuration options
- Troubleshooting guide
- CI/CD integration examples
- How to extend the test suite

## 💡 Tips

1. **Run health check first** to verify configuration:

   ```bash
   pnpm test:health
   ```

2. **Check actual outputs**:

   - Emails: Check your inbox
   - Slack: Check the test channel
   - Confluence: Visit your space (with --skip-cleanup)

3. **Develop new features**:

   ```bash
   # Keep pages for inspection during development
   pnpm test:integration:skip-cleanup
   ```

4. **Debug failures**:
   - Test output includes full request/response data
   - Look for status codes and error messages
   - Verify API credentials are valid

## 🎉 Expected Result

All tests passing:

```
📊 Test Statistics:
   Total Tests: 20
   ✅ Passed: 20
   ❌ Failed: 0
   ⏭️ Skipped: 0
   📈 Pass Rate: 100.0%
   ⏱️ Total Duration: ~45s
```

You're all set! 🚀
