# Test Data Fixes Required

## Issues Found

The test data structure doesn't match the actual API contracts. Here are the fixes needed:

### 1. Slack Notifications - Fixed ✅

Changed `notificationType` from hyphen format to underscore format:

- ❌ `task-completed` → ✅ `task_completed`
- ❌ `analysis-ready` → ✅ `analysis_ready`
- ❌ `approval-needed` → ✅ `approval_needed`
- ❌ `error-alert` → ✅ `error_alert`

Also moved `priority` inside the `data` object.

### 2. Confluence GTM - Needs Fix

The API expects:

```typescript
{
  spaceKey: string,
  productName: string,
  gtmData: {
    targetMarket: string,
    valueProposition: string,
    competitorInsights: Array<{competitor: string, strengths: string[], weaknesses: string[]}>,
    pricingStrategy: string,
    launchTimeline: string,
    marketingChannels: string[],
    successMetrics: Array<{metric: string, target: string}>,
    risks: Array<{risk: string, mitigation: string}>
  },
  parentPageId?: string
}
```

But test data has complex nested structure with `gtmStrategy` (wrong field name) containing:

- marketAnalysis object (not expected)
- customerSegments array (not expected)
- valueProposition object (should be string)
- pricingStrategy object (should be string)
- etc.

### 3. Confluence Meeting Notes - Needs Fix

The API expects:

```typescript
{
  spaceKey: string,
  meetingData: {
    title: string,
    date: Date,
    attendees: string[],
    meetingType: string,
    agenda: string[],
    discussionPoints: string[],
    nextSteps: string[],
    decisions?: string[],
    actionItems?: Array<{task: string, owner: string, dueDate: string}>
  }
}
```

But test data has structure like:

```typescript
{
  spaceKey,
  meetingType,  // Should be inside meetingData
  meetingTitle, // Should be 'title' inside meetingData
  meetingDate,  // Should be 'date' inside meetingData
  attendees,    // Should be inside meetingData
  meetingNotes: { // Should be 'meetingData'
    agenda,
    discussion, // Should be 'discussionPoints' (flat array)
    decisions,
    actionItems
  }
}
```

## Quick Fix

Run these tests individually after fixing data:

```bash
pnpm test:health  # Should pass ✅
pnpm test:email   # Should pass ✅
pnpm test:slack   # Should pass after Slack fixes ✅
```

For Confluence tests, simplify the test data to match API contract exactly as shown in the endpoint GET responses.
