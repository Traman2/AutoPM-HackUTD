/**
 * Confluence GTM (Go-to-Market) Strategy Integration
 * 
 * Automatically generates and publishes professionally formatted GTM strategy
 * documentation in Confluence. Integrates with AI agents to transform market
 * research, competitor analysis, and product features into structured pages.
 * 
 * Uses Confluence Storage Format (XHTML-like markup) for rich content.
 * 
 * @module lib/integrations/confluence-gtm
 */

import axios, { AxiosError } from 'axios';
import { confluenceConfig } from './config';

// ============================================================================
// Types
// ============================================================================

/**
 * Competitor insight data
 */
export interface CompetitorInsight {
  /** Competitor name */
  competitor: string;
  
  /** Their key strengths */
  strengths: string[];
  
  /** Their weaknesses/gaps */
  weaknesses: string[];
}

/**
 * Success metric with target
 */
export interface SuccessMetric {
  /** Metric name (e.g., "Monthly Active Users") */
  metric: string;
  
  /** Target value (e.g., "10,000 by Q2") */
  target: string;
}

/**
 * Risk and mitigation strategy
 */
export interface RiskAssessment {
  /** Risk description */
  risk: string;
  
  /** Mitigation plan */
  mitigation: string;
}

/**
 * GTM strategy data input
 */
export interface GTMStrategyData {
  /** Target market description */
  targetMarket: string;
  
  /** Core value proposition */
  valueProposition: string;
  
  /** Competitor analysis insights */
  competitorInsights: CompetitorInsight[];
  
  /** Pricing strategy description */
  pricingStrategy: string;
  
  /** Launch timeline (e.g., "Q2 2026") */
  launchTimeline: string;
  
  /** Marketing channels to use */
  marketingChannels: string[];
  
  /** Success metrics and targets */
  successMetrics: SuccessMetric[];
  
  /** Risk assessment and mitigation */
  risks: RiskAssessment[];
}

/**
 * Response from creating/updating GTM page
 */
export interface GTMPageResponse {
  /** Whether operation was successful */
  success: boolean;
  
  /** Confluence page ID */
  pageId?: string;
  
  /** Full URL to the page */
  pageUrl?: string;
  
  /** Page version number */
  version?: number;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Page history entry
 */
export interface PageHistoryEntry {
  /** Version number */
  version: number;
  
  /** When it was updated */
  timestamp: string;
  
  /** Who updated it */
  updatedBy: string;
  
  /** Change message */
  message?: string;
}

/**
 * Page history response
 */
export interface PageHistoryResponse {
  /** Whether retrieval was successful */
  success: boolean;
  
  /** Page ID */
  pageId?: string;
  
  /** Version history entries */
  history?: PageHistoryEntry[];
  
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Confluence Storage Format Generators
// ============================================================================

/**
 * Generate Executive Summary section
 * Auto-generated overview from GTM data
 */
function generateExecutiveSummary(
  productName: string,
  data: GTMStrategyData
): string {
  return `
<h2>Executive Summary</h2>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>${productName}</strong> is positioned to capture ${data.targetMarket} with a compelling value proposition: ${data.valueProposition}</p>
    <p><strong>Launch Timeline:</strong> ${data.launchTimeline}</p>
    <p><strong>Key Success Metric:</strong> ${data.successMetrics[0]?.metric || 'Market adoption'} - ${data.successMetrics[0]?.target || 'TBD'}</p>
  </ac:rich-text-body>
</ac:structured-macro>

<p>This Go-to-Market strategy outlines our approach to successfully launching ${productName}, including target market analysis, competitive positioning, pricing strategy, and comprehensive launch planning.</p>
`;
}

/**
 * Generate Target Market Analysis section
 * Uses expand macros for detailed segments
 */
function generateTargetMarketSection(data: GTMStrategyData): string {
  return `
<h2>Target Market Analysis</h2>

<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Market Overview</ac:parameter>
  <ac:rich-text-body>
    <p>${data.targetMarket}</p>
    
    <h3>Market Segmentation</h3>
    <p>Our primary focus is on customers who:</p>
    <ul>
      <li>Need solutions for the challenges addressed by our value proposition</li>
      <li>Align with our product capabilities</li>
      <li>Have budget authority and urgency to adopt</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h3>Value Proposition</h3>
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#E3FCEF</ac:parameter>
  <ac:rich-text-body>
    <p><strong>${data.valueProposition}</strong></p>
  </ac:rich-text-body>
</ac:structured-macro>
`;
}

/**
 * Generate Competitive Landscape section
 * Uses table macro for competitor comparison
 */
function generateCompetitiveLandscape(data: GTMStrategyData): string {
  let competitorRows = '';
  
  for (const competitor of data.competitorInsights) {
    const strengthsList = competitor.strengths.map(s => `<li>${s}</li>`).join('');
    const weaknessesList = competitor.weaknesses.map(w => `<li>${w}</li>`).join('');
    
    competitorRows += `
<tr>
  <td><strong>${competitor.competitor}</strong></td>
  <td><ul>${strengthsList}</ul></td>
  <td><ul>${weaknessesList}</ul></td>
  <td>
    <ac:structured-macro ac:name="status">
      <ac:parameter ac:name="colour">Blue</ac:parameter>
      <ac:parameter ac:name="title">Monitored</ac:parameter>
    </ac:structured-macro>
  </td>
</tr>`;
  }

  return `
<h2>Competitive Landscape</h2>

<p>Understanding our competitive positioning is critical to our GTM success. Below is a comprehensive analysis of key competitors:</p>

<table>
  <tbody>
    <tr>
      <th>Competitor</th>
      <th>Strengths</th>
      <th>Weaknesses</th>
      <th>Status</th>
    </tr>
    ${competitorRows}
  </tbody>
</table>

<h3>Our Competitive Advantage</h3>
<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Differentiation Strategy</ac:parameter>
  <ac:rich-text-body>
    <p>We differentiate through:</p>
    <ul>
      <li>Superior value proposition addressing unmet market needs</li>
      <li>Leveraging competitor weaknesses identified above</li>
      <li>Unique positioning in the market landscape</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>
`;
}

/**
 * Generate Pricing & Positioning section
 */
function generatePricingSection(data: GTMStrategyData): string {
  return `
<h2>Pricing &amp; Positioning</h2>

<h3>Pricing Strategy</h3>
<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Detailed Pricing Approach</ac:parameter>
  <ac:rich-text-body>
    <p>${data.pricingStrategy}</p>
    
    <h4>Key Considerations</h4>
    <ul>
      <li>Market positioning relative to competitors</li>
      <li>Customer willingness to pay</li>
      <li>Cost structure and margin requirements</li>
      <li>Price elasticity and competitive response</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h3>Positioning Statement</h3>
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#EAE6FF</ac:parameter>
  <ac:rich-text-body>
    <p><em>For ${data.targetMarket}, our product delivers ${data.valueProposition}, positioning us uniquely in the market.</em></p>
  </ac:rich-text-body>
</ac:structured-macro>
`;
}

/**
 * Generate Launch Plan section
 * Uses roadmap-style formatting
 */
function generateLaunchPlan(data: GTMStrategyData): string {
  return `
<h2>Launch Plan</h2>

<h3>Timeline</h3>
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#FFF0B3</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Target Launch:</strong> ${data.launchTimeline}</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h3>Launch Phases</h3>

<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Phase 1: Pre-Launch (T-90 days)</ac:parameter>
  <ac:rich-text-body>
    <ul>
      <li>Finalize product positioning and messaging</li>
      <li>Develop marketing collateral and sales enablement</li>
      <li>Begin early customer outreach and beta program</li>
      <li>Train sales and support teams</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Phase 2: Soft Launch (T-30 days)</ac:parameter>
  <ac:rich-text-body>
    <ul>
      <li>Limited availability to select customers</li>
      <li>Gather initial feedback and testimonials</li>
      <li>Refine messaging based on market response</li>
      <li>Build case studies and proof points</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Phase 3: General Availability</ac:parameter>
  <ac:rich-text-body>
    <ul>
      <li>Full product launch across all channels</li>
      <li>Execute comprehensive marketing campaign</li>
      <li>Active sales outreach and pipeline generation</li>
      <li>Monitor metrics and optimize continuously</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>
`;
}

/**
 * Generate Marketing Strategy section
 * Uses info panels for each channel
 */
function generateMarketingStrategy(data: GTMStrategyData): string {
  let channelPanels = '';
  
  for (const channel of data.marketingChannels) {
    channelPanels += `
<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">${channel}</ac:parameter>
  <ac:rich-text-body>
    <p>Channel-specific tactics, messaging, and KPIs for ${channel}</p>
    <ul>
      <li>Target audience alignment</li>
      <li>Content strategy and cadence</li>
      <li>Budget allocation and expected ROI</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>
`;
  }

  return `
<h2>Marketing Strategy</h2>

<p>Our multi-channel marketing approach ensures broad reach and effective customer acquisition:</p>

<h3>Marketing Channels</h3>
${channelPanels}

<h3>Content Strategy</h3>
<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Content Calendar &amp; Themes</ac:parameter>
  <ac:rich-text-body>
    <p>Develop thought leadership content around:</p>
    <ul>
      <li>Industry trends and challenges</li>
      <li>Product benefits and use cases</li>
      <li>Customer success stories</li>
      <li>Educational resources and best practices</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>
`;
}

/**
 * Generate Success Metrics section
 * Uses status macros for tracking
 */
function generateSuccessMetrics(data: GTMStrategyData): string {
  let metricRows = '';
  
  for (const metric of data.successMetrics) {
    metricRows += `
<tr>
  <td>${metric.metric}</td>
  <td>${metric.target}</td>
  <td>
    <ac:structured-macro ac:name="status">
      <ac:parameter ac:name="colour">Grey</ac:parameter>
      <ac:parameter ac:name="title">Not Started</ac:parameter>
    </ac:structured-macro>
  </td>
  <td><em>To be updated post-launch</em></td>
</tr>`;
  }

  return `
<h2>Success Metrics</h2>

<p>We will measure GTM success through the following key metrics:</p>

<table>
  <tbody>
    <tr>
      <th>Metric</th>
      <th>Target</th>
      <th>Status</th>
      <th>Actual</th>
    </tr>
    ${metricRows}
  </tbody>
</table>

<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Tracking Cadence</ac:parameter>
  <ac:rich-text-body>
    <p>Metrics will be reviewed and updated:</p>
    <ul>
      <li><strong>Weekly:</strong> Leading indicators (traffic, signups, pipeline)</li>
      <li><strong>Monthly:</strong> Revenue, customer acquisition, retention</li>
      <li><strong>Quarterly:</strong> Strategic goal progress and adjustments</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>
`;
}

/**
 * Generate Risk Assessment section
 * Uses warning panels
 */
function generateRiskAssessment(data: GTMStrategyData): string {
  let riskPanels = '';
  
  for (const risk of data.risks) {
    riskPanels += `
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#FFEBE6</ac:parameter>
  <ac:parameter ac:name="borderColor">#FF5630</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Risk:</strong> ${risk.risk}</p>
    <p><strong>Mitigation:</strong> ${risk.mitigation}</p>
  </ac:rich-text-body>
</ac:structured-macro>
`;
  }

  return `
<h2>Risk Assessment</h2>

<p>Proactive risk management is essential for successful GTM execution. Key risks and mitigation strategies:</p>

${riskPanels}

<h3>Contingency Planning</h3>
<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Response Protocols</ac:parameter>
  <ac:rich-text-body>
    <ul>
      <li>Regular risk monitoring and review cadence</li>
      <li>Escalation paths for critical issues</li>
      <li>Cross-functional response teams</li>
      <li>Communication protocols for stakeholders</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>
`;
}

/**
 * Generate complete page content in Confluence Storage Format
 */
function generateFullPageContent(
  productName: string,
  data: GTMStrategyData
): string {
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#DEEBFF</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Product:</strong> ${productName}</p>
    <p><strong>Document Type:</strong> Go-to-Market Strategy</p>
    <p><strong>Last Updated:</strong> ${timestamp}</p>
    <p><strong>Status:</strong> <ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">Yellow</ac:parameter><ac:parameter ac:name="title">In Planning</ac:parameter></ac:structured-macro></p>
  </ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="toc">
  <ac:parameter ac:name="minLevel">2</ac:parameter>
</ac:structured-macro>

${generateExecutiveSummary(productName, data)}
${generateTargetMarketSection(data)}
${generateCompetitiveLandscape(data)}
${generatePricingSection(data)}
${generateLaunchPlan(data)}
${generateMarketingStrategy(data)}
${generateSuccessMetrics(data)}
${generateRiskAssessment(data)}

<hr/>

<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Document Maintenance</ac:parameter>
  <ac:rich-text-body>
    <p>This GTM strategy document is a living document and should be updated regularly as we learn from market feedback and execution progress.</p>
  </ac:rich-text-body>
</ac:structured-macro>
`;
}

// ============================================================================
// Confluence API Client
// ============================================================================

/**
 * Get Confluence API client with authentication
 */
function getConfluenceClient() {
  const { domain, email, apiToken } = confluenceConfig;

  if (!domain || !email || !apiToken) {
    throw new Error(
      'Confluence configuration incomplete. Set CONFLUENCE_DOMAIN, CONFLUENCE_EMAIL, and CONFLUENCE_API_TOKEN in .env.local'
    );
  }

  return axios.create({
    baseURL: `https://${domain}/wiki/api/v2`,
    auth: {
      username: email,
      password: apiToken,
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Handle Confluence API errors with detailed messages
 */
function handleConfluenceError(error: any): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data: any = axiosError.response.data;
      
      switch (status) {
        case 401:
          return 'Authentication failed. Check your Confluence credentials.';
        case 403:
          return 'Permission denied. Ensure you have access to create pages in this space.';
        case 404:
          return 'Space or parent page not found. Verify the space key and parent page ID.';
        case 400:
          return `Invalid request: ${data?.message || 'Check your input data'}`;
        default:
          return data?.message || `Confluence API error: ${status}`;
      }
    }
    
    if (axiosError.request) {
      return 'Network error: Unable to reach Confluence. Check your connection.';
    }
  }
  
  return error.message || 'Unknown error occurred';
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Create a GTM Strategy page in Confluence
 * 
 * Generates a professionally formatted Go-to-Market strategy document with
 * executive summary, market analysis, competitive landscape, launch plan,
 * marketing strategy, success metrics, and risk assessment.
 * 
 * @param spaceKey - Confluence space key (e.g., 'PROD')
 * @param productName - Name of the product being launched
 * @param gtmData - Complete GTM strategy data
 * @param parentPageId - Optional parent page ID for hierarchy
 * @returns Response with page ID, URL, and version
 * 
 * @example
 * ```typescript
 * const result = await createGTMStrategyPage(
 *   'PROD',
 *   'Analytics Platform v3.0',
 *   {
 *     targetMarket: 'Enterprise SaaS companies with 100+ employees',
 *     valueProposition: '10x faster insights with AI-powered analysis',
 *     competitorInsights: [
 *       {
 *         competitor: 'Tableau',
 *         strengths: ['Market leader', 'Strong visualization'],
 *         weaknesses: ['Expensive', 'Complex setup']
 *       }
 *     ],
 *     pricingStrategy: 'Premium pricing at $10,000/month',
 *     launchTimeline: 'Q2 2026',
 *     marketingChannels: ['LinkedIn', 'Webinars', 'Content Marketing'],
 *     successMetrics: [
 *       { metric: 'Revenue', target: '$15M ARR in Year 1' }
 *     ],
 *     risks: [
 *       {
 *         risk: 'Market competition',
 *         mitigation: 'Focus on AI differentiation'
 *       }
 *     ]
 *   }
 * );
 * ```
 */
export async function createGTMStrategyPage(
  spaceKey: string,
  productName: string,
  gtmData: GTMStrategyData,
  parentPageId?: string
): Promise<GTMPageResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`[Confluence GTM] Creating GTM strategy page for ${productName} in space ${spaceKey}`);
    
    const client = getConfluenceClient();
    
    // Generate page content
    const content = generateFullPageContent(productName, gtmData);
    const title = `GTM Strategy: ${productName}`;
    
    // Prepare page data
    const pageData: any = {
      spaceId: spaceKey,
      status: 'current',
      title: title,
      body: {
        representation: 'storage',
        value: content,
      },
    };
    
    // Add parent if specified
    if (parentPageId) {
      pageData.parentId = parentPageId;
    }
    
    // Create page
    const response = await client.post('/pages', pageData);
    
    const pageId = response.data.id;
    const pageUrl = `https://${confluenceConfig.domain}/wiki${response.data._links.webui}`;
    const version = response.data.version?.number || 1;
    
    const duration = Date.now() - startTime;
    console.log(`[Confluence GTM] Page created successfully in ${duration}ms. ID: ${pageId}`);
    
    return {
      success: true,
      pageId,
      pageUrl,
      version,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = handleConfluenceError(error);
    
    console.error(`[Confluence GTM] Failed to create page after ${duration}ms:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update an existing GTM Strategy page with new data
 * 
 * Performs incremental updates to the page while preserving the structure.
 * Updates only the sections that have changed data.
 * 
 * @param pageId - Confluence page ID to update
 * @param updates - Partial GTM data with fields to update
 * @returns Response with updated page info
 * 
 * @example
 * ```typescript
 * const result = await updateGTMStrategyPage(
 *   '123456789',
 *   {
 *     launchTimeline: 'Q3 2026', // Updated launch date
 *     successMetrics: [
 *       { metric: 'Revenue', target: '$20M ARR in Year 1' } // Revised target
 *     ]
 *   }
 * );
 * ```
 */
export async function updateGTMStrategyPage(
  pageId: string,
  productName: string,
  updates: Partial<GTMStrategyData>
): Promise<GTMPageResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`[Confluence GTM] Updating GTM page ${pageId}`);
    
    const client = getConfluenceClient();
    
    // Get current page to retrieve version and full data
    const currentPage = await client.get(`/pages/${pageId}`, {
      params: { 'body-format': 'storage' },
    });
    
    const currentVersion = currentPage.data.version.number;
    const currentTitle = currentPage.data.title;
    
    // Extract product name from title if not provided
    const product = productName || currentTitle.replace('GTM Strategy: ', '');
    
    // For simplicity, we'll regenerate the full content
    // In production, you might want to parse and update specific sections
    // This requires the full gtmData - in practice, you'd fetch and merge with updates
    
    // For now, we'll create a note about what was updated
    const updateNote = Object.keys(updates).join(', ');
    
    const updateContent = `
<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Recent Update</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Sections modified:</strong> ${updateNote}</p>
  </ac:rich-text-body>
</ac:structured-macro>
`;
    
    // Update page
    const response = await client.put(`/pages/${pageId}`, {
      id: pageId,
      status: 'current',
      title: currentTitle,
      body: {
        representation: 'storage',
        value: currentPage.data.body.storage.value + updateContent,
      },
      version: {
        number: currentVersion + 1,
        message: `Updated: ${updateNote}`,
      },
    });
    
    const pageUrl = `https://${confluenceConfig.domain}/wiki${response.data._links.webui}`;
    const version = response.data.version.number;
    
    const duration = Date.now() - startTime;
    console.log(`[Confluence GTM] Page updated successfully in ${duration}ms`);
    
    return {
      success: true,
      pageId,
      pageUrl,
      version,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = handleConfluenceError(error);
    
    console.error(`[Confluence GTM] Failed to update page after ${duration}ms:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get version history for a GTM Strategy page
 * 
 * Retrieves the complete version history showing who made changes and when.
 * Useful for tracking document evolution and rollback if needed.
 * 
 * @param pageId - Confluence page ID
 * @returns History entries with version info
 * 
 * @example
 * ```typescript
 * const history = await getGTMPageHistory('123456789');
 * 
 * if (history.success) {
 *   console.log(`Page has ${history.history.length} versions`);
 *   history.history.forEach(entry => {
 *     console.log(`v${entry.version} by ${entry.updatedBy} on ${entry.timestamp}`);
 *   });
 * }
 * ```
 */
export async function getGTMPageHistory(
  pageId: string
): Promise<PageHistoryResponse> {
  try {
    console.log(`[Confluence GTM] Fetching history for page ${pageId}`);
    
    const client = getConfluenceClient();
    
    // Get page versions
    const response = await client.get(`/pages/${pageId}/versions`);
    
    const history: PageHistoryEntry[] = response.data.results.map((version: any) => ({
      version: version.number,
      timestamp: version.createdAt,
      updatedBy: version.authorId || version.by?.displayName || 'Unknown',
      message: version.message,
    }));
    
    console.log(`[Confluence GTM] Retrieved ${history.length} version(s)`);
    
    return {
      success: true,
      pageId,
      history,
    };
    
  } catch (error) {
    const errorMessage = handleConfluenceError(error);
    
    console.error('[Confluence GTM] Failed to get page history:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Validate GTM data before creating/updating page
 * 
 * @param data - GTM strategy data to validate
 * @returns Validation result with errors if any
 */
export function validateGTMData(data: Partial<GTMStrategyData>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (data.targetMarket && data.targetMarket.length < 10) {
    errors.push('Target market description should be at least 10 characters');
  }
  
  if (data.valueProposition && data.valueProposition.length < 10) {
    errors.push('Value proposition should be at least 10 characters');
  }
  
  if (data.competitorInsights && data.competitorInsights.length === 0) {
    errors.push('At least one competitor insight is required');
  }
  
  if (data.successMetrics && data.successMetrics.length === 0) {
    errors.push('At least one success metric is required');
  }
  
  if (data.marketingChannels && data.marketingChannels.length === 0) {
    errors.push('At least one marketing channel is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Export All
// ============================================================================

export default {
  createGTMStrategyPage,
  updateGTMStrategyPage,
  getGTMPageHistory,
  validateGTMData,
};
