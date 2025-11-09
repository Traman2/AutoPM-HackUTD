# Remaining Test Fixes

## Current Status: 11/20 Tests Passing (55%)

### ✅ What's Working

- Health check
- Email: stakeholder update, sprint summary (2 tests)
- Email validation: invalid type, missing recipient (2 tests)
- Slack: All 6 tests now passing! ✨
- Confluence GTM: missing fields validation
- Confluence Meeting: missing meeting type validation

### ❌ What Needs Fixing

#### 1. Email - Feature Launch Test

**Issue**: API expects `to` and `emailType`, test data sends `recipient` and `type`

**Fix**: In `tests/test-data.ts`, change all email test data objects:

```typescript
// Change from:
{
  type: 'feature-launch',
  recipient: '...',
  // ...
}

// To:
{
  to: '...',          // rename recipient → to
  emailType: 'feature-launch',  // rename type → emailType
  // ...
}
```

**Files to update**: Lines 18, 49, 95 in `tests/test-data.ts`

---

#### 2. Confluence GTM Tests (2 failures)

**Issue**: API returns 200 but `response.data.data.pageId` is undefined

**Root Cause**: The space lookup is working (returns 200 now!), but the Confluence API call is failing silently or the response structure is wrong.

**Debug Steps**:

1. Check what `response.data` contains when status is 200
2. The route should return:
   ```json
   {
     "success": true,
     "data": {
       "pageId": "...",
       "pageUrl": "...",
       "version": 1
     }
   }
   ```
3. If `data.pageId` is missing, check lib/integrations/confluence-gtm.ts createGTMStrategyPage function
4. Add console.log to see the actual Confluence API response

**Test Expectations**: Tests check `response.data.data.pageId` - make sure the route returns this structure

---

#### 3. Confluence Meeting Tests (3 failures)

**Issue**: `Cannot read properties of undefined (reading 'length')`

**Root Cause**: MAJOR DATA STRUCTURE MISMATCH

- **Library expects**: `DiscussionPoint[]` where each point is an object with:
  ```typescript
  {
    topic: string;
    summary: string;
    decisions: string[];
    actionItems: ActionItem[];
  }
  ```
- **Test data has**: `discussionPoints: string[]` (flat strings)
- **Test data also has**: Top-level `decisions` and `actionItems` arrays (not inside discussionPoints)

**The Fix Required**: Restructure ALL meeting test data to match the DiscussionPoint[] structure:

```typescript
// WRONG (current):
meetingData: {
  // ...
  discussionPoints: [
    'Sprint 5 Review: Completed all 12 planned stories...',
    'Sprint 6 Goals: Integrate all four agents...',
  ],
  decisions: ['Decision 1', 'Decision 2'],
  actionItems: [{ task: '...', owner: '...', dueDate: '...' }]
}

// CORRECT (what lib expects):
meetingData: {
  // ...
  discussionPoints: [
    {
      topic: 'Sprint 5 Review',
      summary: 'Completed all 12 planned stories with velocity of 34 story points...',
      decisions: ['Velocity target met', 'Zero critical bugs'],
      actionItems: []
    },
    {
      topic: 'Sprint 6 Goals',
      summary: 'Integrate all four agents with LangGraph, deploy to production...',
      decisions: ['Commit to 29 story points', 'Deploy to staging by mid-sprint'],
      actionItems: [
        { task: 'Set up staging environment', owner: 'DevOps Team', dueDate: '2025-11-10' },
        { task: 'Create LangGraph integration spec', owner: 'Tech Lead', dueDate: '2025-11-09' }
      ]
    }
  ],
  nextSteps: ['Prioritize LangGraph integration']
}
```

**Note**: The MeetingData interface does NOT have top-level `decisions` or `actionItems` - they must be inside each discussionPoint!

**Files to update**:

- `sprintPlanningNotesData` (~line 340-400)
- `stakeholderReviewNotesData` (~line 400-460)
- `actionItemsTestData` (~line 460-510)

---

## Quick Wins (Do These First)

1. **Fix email field names** (1 test) - Simple find/replace
2. **Debug Confluence GTM response** (2 tests) - Add logging to see actual response
3. **Restructure meeting test data** (3 tests) - Most complex, needs careful work

---

## Testing After Fixes

```powershell
# Run all tests
pnpm test:integration

# Run specific category
pnpm test:email       # After fixing email field names
pnpm test:confluence  # After fixing Confluence issues

# Expected final result: 20/20 tests passing! 🎉
```

---

## Notes on Changes Made So Far

### Session 1 Fixes ✅

- Installed dotenv and configured env loading
- Fixed Slack notificationType format (hyphen → underscore)
- Fixed Slack priority location (top-level → data.priority)
- Fixed Confluence GTM data structure (nested → flat with arrays)
- Fixed meeting type format (hyphen → underscore)
- Added space ID lookup functions to both Confluence libs
- Fixed Slack test assertions (messageTimestamp → data.messageTs)

### Backup Files Created

- `tests/test-data.ts.backup` - Original test data
- `tests/TEST-DATA-FIXES.md` - Documentation of issues

### Key Learnings

- Confluence v2 API requires spaceId (numeric), not spaceKey (string) - fixed with getSpaceId() helper
- MeetingData structure is complex with nested DiscussionPoint objects - test data doesn't match yet
- Always verify API contracts by reading actual endpoint code and type definitions
