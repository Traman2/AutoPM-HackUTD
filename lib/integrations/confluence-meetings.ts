/**
 * Confluence Meeting Notes Integration
 * 
 * Automated meeting notes publisher for Confluence to capture
 * product discussions and decisions after stakeholder meetings.
 * 
 * @module lib/integrations/confluence-meetings
 */

import axios, { AxiosError } from 'axios';
import { confluenceConfig } from './config';

// ============================================================================
// Types
// ============================================================================

export type MeetingType = 'sprint_planning' | 'stakeholder_review' | 'product_sync' | 'retrospective';

export interface ActionItem {
  task: string;
  owner: string;
  dueDate?: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface DiscussionPoint {
  topic: string;
  summary: string;
  decisions: string[];
  actionItems: ActionItem[];
}

export interface MeetingData {
  title: string;
  date: Date;
  attendees: string[];
  meetingType: MeetingType;
  agenda: string[];
  discussionPoints: DiscussionPoint[];
  nextSteps: string[];
}

export interface MeetingNotesResponse {
  success: boolean;
  pageId?: string;
  pageUrl?: string;
  actionItems?: Array<{ id: string; task: string; owner: string }>;
  error?: string;
}

export interface TemplateResponse {
  success: boolean;
  templatePageId?: string;
  templatePageUrl?: string;
  error?: string;
}

// ============================================================================
// Confluence Storage Format Generators
// ============================================================================

/**
 * Generate meeting header with metadata
 * 
 * Creates an info panel with meeting details
 */
function generateMeetingHeader(data: MeetingData): string {
  const formattedDate = data.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = data.date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const meetingTypeDisplay = data.meetingType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `
    <ac:structured-macro ac:name="info">
      <ac:rich-text-body>
        <p><strong>📅 Date:</strong> ${formattedDate} at ${formattedTime}</p>
        <p><strong>🎯 Meeting Type:</strong> ${meetingTypeDisplay}</p>
        <p><strong>👥 Attendees:</strong> ${data.attendees.join(', ')}</p>
      </ac:rich-text-body>
    </ac:structured-macro>
  `;
}

/**
 * Generate agenda section
 */
function generateAgendaSection(agenda: string[]): string {
  if (agenda.length === 0) return '';

  const agendaItems = agenda
    .map((item, index) => `<li>${item}</li>`)
    .join('');

  return `
    <h2>📋 Agenda</h2>
    <ol>
      ${agendaItems}
    </ol>
  `;
}

/**
 * Generate discussion points with expand macros and decision panels
 */
function generateDiscussionPoints(points: DiscussionPoint[]): string {
  if (points.length === 0) return '';

  const discussionSections = points.map((point, index) => {
    // Decision panels
    const decisionPanels = point.decisions.length > 0
      ? point.decisions.map(decision => `
          <ac:structured-macro ac:name="panel">
            <ac:parameter ac:name="panelStyle">success</ac:parameter>
            <ac:parameter ac:name="title">✅ Decision</ac:parameter>
            <ac:rich-text-body>
              <p>${decision}</p>
            </ac:rich-text-body>
          </ac:structured-macro>
        `).join('')
      : '';

    // Action items table
    const actionItemsTable = point.actionItems.length > 0
      ? generateActionItemsTable(point.actionItems)
      : '<p><em>No action items</em></p>';

    return `
      <h3>${index + 1}. ${point.topic}</h3>
      <ac:structured-macro ac:name="expand">
        <ac:parameter ac:name="title">Discussion Summary</ac:parameter>
        <ac:rich-text-body>
          <p>${point.summary}</p>
        </ac:rich-text-body>
      </ac:structured-macro>
      
      ${decisionPanels}
      
      ${point.actionItems.length > 0 ? '<h4>📌 Action Items</h4>' : ''}
      ${actionItemsTable}
    `;
  }).join('');

  return `
    <h2>💬 Discussion Points</h2>
    ${discussionSections}
  `;
}

/**
 * Generate action items table
 */
function generateActionItemsTable(actionItems: ActionItem[]): string {
  const rows = actionItems.map(item => {
    const status = item.status || 'pending';
    const statusBadge = 
      status === 'completed' ? '✅ Completed' :
      status === 'in-progress' ? '🔄 In Progress' :
      '⏳ Pending';
    
    const dueDate = item.dueDate || 'Not set';
    
    return `
      <tr>
        <td>${item.task}</td>
        <td><strong>${item.owner}</strong></td>
        <td>${dueDate}</td>
        <td>
          <ac:structured-macro ac:name="status">
            <ac:parameter ac:name="title">${statusBadge}</ac:parameter>
            <ac:parameter ac:name="color">${
              status === 'completed' ? 'Green' :
              status === 'in-progress' ? 'Yellow' :
              'Grey'
            }</ac:parameter>
          </ac:structured-macro>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table>
      <thead>
        <tr>
          <th>Task</th>
          <th>Owner</th>
          <th>Due Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Generate next steps section
 */
function generateNextStepsSection(nextSteps: string[]): string {
  if (nextSteps.length === 0) return '';

  const steps = nextSteps
    .map(step => `<li>${step}</li>`)
    .join('');

  return `
    <h2>🚀 Next Steps</h2>
    <ul>
      ${steps}
    </ul>
  `;
}

/**
 * Generate complete meeting notes page content
 */
function generateMeetingNotesContent(data: MeetingData): string {
  return `
    ${generateMeetingHeader(data)}
    ${generateAgendaSection(data.agenda)}
    ${generateDiscussionPoints(data.discussionPoints)}
    ${generateNextStepsSection(data.nextSteps)}
    
    <hr />
    <p><em>This page was automatically generated from meeting notes.</em></p>
  `;
}

/**
 * Generate auto-formatted meeting title
 * 
 * Format: "[Meeting Type] - [Date] - [Short Title]"
 * Example: "Sprint Planning - 2026-04-15 - Q2 Planning"
 */
function generateMeetingTitle(data: MeetingData): string {
  const meetingTypeDisplay = data.meetingType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const dateStr = data.date.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Add timestamp to make title unique for testing
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  return `${meetingTypeDisplay} - ${dateStr} - ${data.title} [${timestamp}]`;
}

/**
 * Generate meeting labels for categorization
 */
function generateMeetingLabels(meetingType: MeetingType, date: Date): string[] {
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  return [
    'meeting-notes',
    meetingType,
    yearMonth,
  ];
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Get space ID from space key
 */
async function getSpaceId(spaceKey: string): Promise<string> {
  try {
    console.log(`[Confluence Meetings] Looking up space ID for key: ${spaceKey}`);
    
    // If already a numeric ID, return it
    if (/^\d+$/.test(spaceKey)) {
      console.log(`[Confluence Meetings] Space key is already numeric ID: ${spaceKey}`);
      return spaceKey;
    }
    
    const response = await axios.get(
      `https://${confluenceConfig.domain}/wiki/api/v2/spaces`,
      {
        params: { keys: spaceKey },
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${confluenceConfig.email}:${confluenceConfig.apiToken}`
          ).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );
    
    console.log(`[Confluence Meetings] Space lookup response:`, JSON.stringify(response.data, null, 2));
    
    if (response.data.results && response.data.results.length > 0) {
      const spaceId = response.data.results[0].id;
      console.log(`[Confluence Meetings] ✅ Resolved space key ${spaceKey} → space ID ${spaceId}`);
      return spaceId;
    }
    
    throw new Error(`Space not found: ${spaceKey}`);
  } catch (error) {
    console.error(`[Confluence Meetings] ❌ Failed to get space ID for ${spaceKey}:`, error);
    throw error;
  }
}

function handleConfluenceError(error: unknown, context: string): string {
  console.error(`[Confluence Meetings] ${context}:`, error);

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      switch (status) {
        case 401:
          return 'Authentication failed. Please check your Confluence API token.';
        case 403:
          return 'Permission denied. Ensure you have write access to this space.';
        case 404:
          return 'Space or parent page not found. Please verify the IDs.';
        case 400:
          return `Bad request: ${data?.message || 'Invalid data provided'}`;
        default:
          return `Confluence API error (${status}): ${data?.message || 'Unknown error'}`;
      }
    }
    
    if (axiosError.request) {
      return 'No response from Confluence. Check your network connection and CONFLUENCE_DOMAIN.';
    }
  }

  return error instanceof Error ? error.message : 'Unknown error occurred';
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Create Meeting Notes Page in Confluence
 * 
 * Generates a structured meeting notes page with discussion points,
 * decisions, and action items.
 * 
 * @example
 * ```typescript
 * const result = await createMeetingNotesPage('PROD', {
 *   title: 'Q2 Planning',
 *   date: new Date('2026-04-15'),
 *   attendees: ['Alice', 'Bob', 'Charlie'],
 *   meetingType: 'sprint_planning',
 *   agenda: ['Review Q1', 'Plan Q2 roadmap', 'Resource allocation'],
 *   discussionPoints: [{
 *     topic: 'Q2 Product Roadmap',
 *     summary: 'Discussed priority features for Q2...',
 *     decisions: ['Focus on AI features', 'Delay mobile app'],
 *     actionItems: [
 *       { task: 'Create feature specs', owner: 'Alice', dueDate: '2026-04-20' }
 *     ]
 *   }],
 *   nextSteps: ['Schedule follow-up', 'Send summary to stakeholders']
 * });
 * ```
 */
export async function createMeetingNotesPage(
  spaceKey: string,
  meetingData: MeetingData,
  parentPageId?: string
): Promise<MeetingNotesResponse> {
  try {
    // Get space ID from space key
    const spaceId = await getSpaceId(spaceKey);
    console.log(`[Confluence Meetings] Resolved space key ${spaceKey} to space ID ${spaceId}`);
    
    const title = generateMeetingTitle(meetingData);
    const content = generateMeetingNotesContent(meetingData);
    const labels = generateMeetingLabels(meetingData.meetingType, meetingData.date);

    // Create page
    const pagePayload: any = {
      spaceId: spaceId,
      status: 'current',
      title,
      body: {
        representation: 'storage',
        value: content,
      },
    };

    if (parentPageId) {
      pagePayload.parentId = parentPageId;
    }

    console.log('[Confluence Meetings] Creating meeting notes page:', title);
    console.log('[Confluence Meetings] Page payload:', JSON.stringify({
      spaceId: pagePayload.spaceId,
      title: pagePayload.title,
      status: pagePayload.status,
      parentId: pagePayload.parentId || 'none',
      contentLength: content.length
    }, null, 2));

    // Use native fetch instead of axios (resolves axios serialization issues)
    const authHeader = `Basic ${Buffer.from(
      `${confluenceConfig.email}:${confluenceConfig.apiToken}`
    ).toString('base64')}`;
    
    const fetchResponse = await fetch(
      `https://${confluenceConfig.domain}/wiki/api/v2/pages`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(pagePayload),
      }
    );

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      throw new Error(`Confluence API error: ${fetchResponse.status} - ${errorText}`);
    }

    const pageResponse = await fetchResponse.json();
    const pageId = pageResponse.id;
    const pageUrl = `https://${confluenceConfig.domain}/wiki${pageResponse._links.webui}`;

    console.log('[Confluence Meetings] ✅ Page created successfully:', pageUrl);
    console.log('[Confluence Meetings] Page ID:', pageId);

    // Add labels
    try {
      for (const label of labels) {
        const labelResponse = await fetch(
          `https://${confluenceConfig.domain}/wiki/api/v2/pages/${pageId}/labels`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: label }),
          }
        );
        if (!labelResponse.ok) {
          throw new Error(`Failed to add label: ${label}`);
        }
      }
      console.log('[Confluence Meetings] ✅ Labels added:', labels.join(', '));
    } catch (labelError) {
      console.warn('[Confluence Meetings] ⚠️ Failed to add labels:', labelError);
      // Non-critical error, continue
    }

    // Extract all action items with generated IDs
    const allActionItems: Array<{ id: string; task: string; owner: string }> = [];
    meetingData.discussionPoints.forEach((point, pointIndex) => {
      point.actionItems.forEach((item, itemIndex) => {
        allActionItems.push({
          id: `action-${pointIndex}-${itemIndex}`,
          task: item.task,
          owner: item.owner,
        });
      });
    });

    return {
      success: true,
      pageId,
      pageUrl,
      actionItems: allActionItems,
    };
  } catch (error) {
    // Log full error details for debugging
    console.error(`[Confluence Meetings] ❌ Failed to create meeting notes page`);
    console.error(`[Confluence Meetings] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
    
    if (axios.isAxiosError(error)) {
      console.error(`[Confluence Meetings] Axios error details:`);
      console.error(`  - Status: ${error.response?.status}`);
      console.error(`  - Status Text: ${error.response?.statusText}`);
      console.error(`  - Response data:`, JSON.stringify(error.response?.data, null, 2));
      console.error(`  - Request URL: ${error.config?.url}`);
      console.error(`  - Request method: ${error.config?.method}`);
    } else {
      console.error(`[Confluence Meetings] Full error:`, error);
    }
    
    const errorMessage = handleConfluenceError(error, 'Failed to create meeting notes');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Add Action Items to Existing Meeting Notes Page
 * 
 * Appends new action items to an existing meeting notes page.
 * 
 * @example
 * ```typescript
 * const result = await addActionItemsToPage('123456789', [
 *   { task: 'Follow up with design team', owner: 'Bob', dueDate: '2026-04-25' },
 *   { task: 'Update roadmap document', owner: 'Alice', dueDate: '2026-04-22' }
 * ]);
 * ```
 */
export async function addActionItemsToPage(
  pageId: string,
  actionItems: ActionItem[]
): Promise<MeetingNotesResponse> {
  try {
    // Get current page content
    console.log('[Confluence Meetings] Fetching current page content...');
    
    const pageResponse = await axios.get(
      `https://${confluenceConfig.domain}/wiki/api/v2/pages/${pageId}?body-format=storage`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${confluenceConfig.email}:${confluenceConfig.apiToken}`
          ).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );

    const currentContent = pageResponse.data.body.storage.value;
    const currentVersion = pageResponse.data.version.number;

    // Generate new action items section
    const newActionItemsSection = `
      <h4>🆕 Additional Action Items (Added ${new Date().toLocaleDateString()})</h4>
      ${generateActionItemsTable(actionItems)}
    `;

    // Append to content (before the footer)
    const updatedContent = currentContent.replace(
      '<hr />',
      `${newActionItemsSection}<hr />`
    );

    // Update page
    console.log('[Confluence Meetings] Updating page with new action items...');

    await axios.put(
      `https://${confluenceConfig.domain}/wiki/api/v2/pages/${pageId}`,
      {
        id: pageId,
        status: 'current',
        title: pageResponse.data.title,
        body: {
          representation: 'storage',
          value: updatedContent,
        },
        version: {
          number: currentVersion + 1,
          message: 'Added new action items',
        },
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${confluenceConfig.email}:${confluenceConfig.apiToken}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('[Confluence Meetings] ✅ Action items added successfully');

    return {
      success: true,
      pageId,
      actionItems: actionItems.map((item, index) => ({
        id: `action-new-${index}`,
        task: item.task,
        owner: item.owner,
      })),
    };
  } catch (error) {
    const errorMessage = handleConfluenceError(error, 'Failed to add action items');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Mark Action Item as Complete
 * 
 * Updates the status of a specific action item to "completed".
 * 
 * Note: This is a simplified implementation that updates based on task text.
 * For production use, consider storing action items in a separate database
 * with unique IDs for more reliable updates.
 * 
 * @example
 * ```typescript
 * const result = await markActionItemComplete('123456789', 0);
 * ```
 */
export async function markActionItemComplete(
  pageId: string,
  actionItemIndex: number
): Promise<MeetingNotesResponse> {
  try {
    // Get current page content
    console.log('[Confluence Meetings] Fetching current page content...');
    
    const pageResponse = await axios.get(
      `https://${confluenceConfig.domain}/wiki/api/v2/pages/${pageId}?body-format=storage`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${confluenceConfig.email}:${confluenceConfig.apiToken}`
          ).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );

    let currentContent = pageResponse.data.body.storage.value;
    const currentVersion = pageResponse.data.version.number;

    // Find and update the Nth status badge to "Completed"
    // This regex matches status macros
    const statusRegex = /<ac:structured-macro ac:name="status">[\s\S]*?<\/ac:structured-macro>/g;
    const statusMatches = currentContent.match(statusRegex);

    if (!statusMatches || actionItemIndex >= statusMatches.length) {
      return {
        success: false,
        error: `Action item index ${actionItemIndex} not found`,
      };
    }

    // Replace the specific status macro with completed status
    const completedStatus = `
      <ac:structured-macro ac:name="status">
        <ac:parameter ac:name="title">✅ Completed</ac:parameter>
        <ac:parameter ac:name="color">Green</ac:parameter>
      </ac:structured-macro>
    `;

    let matchCount = 0;
    currentContent = currentContent.replace(statusRegex, (match: string) => {
      if (matchCount === actionItemIndex) {
        matchCount++;
        return completedStatus;
      }
      matchCount++;
      return match;
    });

    // Update page
    console.log('[Confluence Meetings] Marking action item as complete...');

    await axios.put(
      `https://${confluenceConfig.domain}/wiki/api/v2/pages/${pageId}`,
      {
        id: pageId,
        status: 'current',
        title: pageResponse.data.title,
        body: {
          representation: 'storage',
          value: currentContent,
        },
        version: {
          number: currentVersion + 1,
          message: `Marked action item ${actionItemIndex} as complete`,
        },
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${confluenceConfig.email}:${confluenceConfig.apiToken}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('[Confluence Meetings] ✅ Action item marked as complete');

    return {
      success: true,
      pageId,
    };
  } catch (error) {
    const errorMessage = handleConfluenceError(error, 'Failed to mark action item complete');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create Meeting Notes Template
 * 
 * Sets up a reusable template page structure for consistent meeting notes.
 * This template can be used as a parent page or reference for future meetings.
 * 
 * @example
 * ```typescript
 * const result = await createMeetingNotesTemplate('PROD', '987654321');
 * // Creates a template page that can be used as a parent for all meeting notes
 * ```
 */
export async function createMeetingNotesTemplate(
  spaceKey: string,
  parentPageId?: string
): Promise<TemplateResponse> {
  try {
    const templateContent = `
      <ac:structured-macro ac:name="info">
        <ac:rich-text-body>
          <p>This is a template for meeting notes. Use this structure for consistent documentation.</p>
        </ac:rich-text-body>
      </ac:structured-macro>
      
      <h2>📋 Meeting Information</h2>
      <ul>
        <li><strong>Date:</strong> [Date]</li>
        <li><strong>Meeting Type:</strong> [Type]</li>
        <li><strong>Attendees:</strong> [Names]</li>
      </ul>
      
      <h2>📋 Agenda</h2>
      <ol>
        <li>[Agenda item 1]</li>
        <li>[Agenda item 2]</li>
        <li>[Agenda item 3]</li>
      </ol>
      
      <h2>💬 Discussion Points</h2>
      
      <h3>1. [Topic Name]</h3>
      <ac:structured-macro ac:name="expand">
        <ac:parameter ac:name="title">Discussion Summary</ac:parameter>
        <ac:rich-text-body>
          <p>[Summary of discussion]</p>
        </ac:rich-text-body>
      </ac:structured-macro>
      
      <ac:structured-macro ac:name="panel">
        <ac:parameter ac:name="panelStyle">success</ac:parameter>
        <ac:parameter ac:name="title">✅ Decision</ac:parameter>
        <ac:rich-text-body>
          <p>[Decision made]</p>
        </ac:rich-text-body>
      </ac:structured-macro>
      
      <h4>📌 Action Items</h4>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Owner</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>[Task description]</td>
            <td><strong>[Owner name]</strong></td>
            <td>[Date]</td>
            <td>
              <ac:structured-macro ac:name="status">
                <ac:parameter ac:name="title">⏳ Pending</ac:parameter>
                <ac:parameter ac:name="color">Grey</ac:parameter>
              </ac:structured-macro>
            </td>
          </tr>
        </tbody>
      </table>
      
      <h2>🚀 Next Steps</h2>
      <ul>
        <li>[Next step 1]</li>
        <li>[Next step 2]</li>
      </ul>
      
      <hr />
      <p><em>Use this template for consistent meeting documentation.</em></p>
    `;

    const pagePayload: any = {
      spaceId: spaceKey,
      status: 'current',
      title: '📝 Meeting Notes Template',
      body: {
        representation: 'storage',
        value: templateContent,
      },
    };

    if (parentPageId) {
      pagePayload.parentId = parentPageId;
    }

    console.log('[Confluence Meetings] Creating meeting notes template...');

    // Use native fetch instead of axios (resolves axios serialization issues)
    const authHeader = `Basic ${Buffer.from(
      `${confluenceConfig.email}:${confluenceConfig.apiToken}`
    ).toString('base64')}`;
    
    const fetchResponse = await fetch(
      `https://${confluenceConfig.domain}/wiki/api/v2/pages`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(pagePayload),
      }
    );

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      throw new Error(`Confluence API error: ${fetchResponse.status} - ${errorText}`);
    }

    const responseData = await fetchResponse.json();
    const templatePageId = responseData.id;
    const templatePageUrl = `https://${confluenceConfig.domain}/wiki${responseData._links.webui}`;

    console.log('[Confluence Meetings] ✅ Template created successfully:', templatePageUrl);

    // Add template label
    try {
      const labelResponse = await fetch(
        `https://${confluenceConfig.domain}/wiki/api/v2/pages/${templatePageId}/labels`,
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'template' }),
        }
      );
      if (!labelResponse.ok) {
        console.warn('[Confluence Meetings] ⚠️ Failed to add template label');
      }
    } catch (labelError) {
      console.warn('[Confluence Meetings] ⚠️ Failed to add template label');
    }

    return {
      success: true,
      templatePageId,
      templatePageUrl,
    };
  } catch (error) {
    const errorMessage = handleConfluenceError(error, 'Failed to create template');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================================================
// Example Generated Page Structure
// ============================================================================

/*
 * EXAMPLE GENERATED MEETING NOTES PAGE:
 * 
 * Title: "Sprint Planning - 2026-04-15 - Q2 Planning"
 * Labels: meeting-notes, sprint_planning, 2026-04
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ℹ️ INFO PANEL                                               │
 * │ 📅 Date: Monday, April 15, 2026 at 09:00 AM                │
 * │ 🎯 Meeting Type: Sprint Planning                           │
 * │ 👥 Attendees: Alice Johnson, Bob Smith, Charlie Davis      │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * 📋 Agenda
 * 1. Review Q1 performance
 * 2. Plan Q2 roadmap priorities
 * 3. Resource allocation discussion
 * 
 * 💬 Discussion Points
 * 
 * 1. Q2 Product Roadmap
 * ▼ Discussion Summary [expandable]
 *   Discussed priority features for Q2 launch. Team agreed
 *   to focus on AI-powered analytics and defer mobile app...
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ✅ Decision                                                 │
 * │ Focus all Q2 resources on AI features                       │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ✅ Decision                                                 │
 * │ Delay mobile app to Q3 for proper planning                  │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * 📌 Action Items
 * ┌──────────────────────┬───────────┬──────────┬──────────────┐
 * │ Task                 │ Owner     │ Due Date │ Status       │
 * ├──────────────────────┼───────────┼──────────┼──────────────┤
 * │ Create feature specs │ Alice     │ 04/20/26 │ ⏳ Pending   │
 * │ Update roadmap doc   │ Bob       │ 04/18/26 │ 🔄 In Prog.  │
 * │ Schedule design sync │ Charlie   │ 04/17/26 │ ✅ Completed │
 * └──────────────────────┴───────────┴──────────┴──────────────┘
 * 
 * 🚀 Next Steps
 * • Schedule follow-up meeting for April 22
 * • Send summary to all stakeholders
 * • Update Jira with new priorities
 * 
 * ─────────────────────────────────────────────────────────────
 * This page was automatically generated from meeting notes.
 */
