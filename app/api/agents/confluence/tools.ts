/**
 * Confluence GTM Agent Tools
 * 
 * Agent implementation for automatically generating and publishing
 * Go-to-Market strategy documentation to Confluence.
 * 
 * @module app/api/agents/confluence/tools
 */

import {
  createGTMStrategyPage,
  updateGTMStrategyPage,
  getGTMPageHistory,
  validateGTMData,
  type GTMStrategyData,
  type GTMPageResponse,
  type PageHistoryResponse,
} from '@/lib/integrations/confluence-gtm';

// ============================================================================
// Confluence GTM Agent Class
// ============================================================================

export interface ConfluenceAgentInput {
  action: 'create' | 'update' | 'history' | 'validate';
  spaceKey?: string;
  productName?: string;
  gtmData?: GTMStrategyData | Partial<GTMStrategyData>;
  pageId?: string;
  parentPageId?: string;
}

export interface ConfluenceAgentOutput {
  success: boolean;
  action: string;
  result?: GTMPageResponse | PageHistoryResponse | { valid: boolean; errors: string[] };
  error?: string;
}

export class ConfluenceGTMAgent {
  private name = 'ConfluenceGTMAgent';

  /**
   * Execute Confluence GTM action
   */
  async execute(input: ConfluenceAgentInput): Promise<ConfluenceAgentOutput> {
    try {
      switch (input.action) {
        case 'create':
          return await this.createGTMPage(input);
        
        case 'update':
          return await this.updateGTMPage(input);
        
        case 'history':
          return await this.getPageHistory(input);
        
        case 'validate':
          return await this.validateData(input);
        
        default:
          return {
            success: false,
            action: input.action,
            error: `Unknown action: ${input.action}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Create new GTM strategy page
   */
  private async createGTMPage(input: ConfluenceAgentInput): Promise<ConfluenceAgentOutput> {
    if (!input.spaceKey || !input.productName || !input.gtmData) {
      return {
        success: false,
        action: 'create',
        error: 'Missing required fields: spaceKey, productName, and gtmData are required',
      };
    }

    // Validate data first
    const validation = validateGTMData(input.gtmData);
    if (!validation.valid) {
      return {
        success: false,
        action: 'create',
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    const result = await createGTMStrategyPage(
      input.spaceKey,
      input.productName,
      input.gtmData as GTMStrategyData,
      input.parentPageId
    );

    return {
      success: result.success,
      action: 'create',
      result,
      error: result.error,
    };
  }

  /**
   * Update existing GTM strategy page
   */
  private async updateGTMPage(input: ConfluenceAgentInput): Promise<ConfluenceAgentOutput> {
    if (!input.pageId || !input.productName || !input.gtmData) {
      return {
        success: false,
        action: 'update',
        error: 'Missing required fields: pageId, productName, and gtmData are required',
      };
    }

    const result = await updateGTMStrategyPage(
      input.pageId,
      input.productName,
      input.gtmData
    );

    return {
      success: result.success,
      action: 'update',
      result,
      error: result.error,
    };
  }

  /**
   * Get page version history
   */
  private async getPageHistory(input: ConfluenceAgentInput): Promise<ConfluenceAgentOutput> {
    if (!input.pageId) {
      return {
        success: false,
        action: 'history',
        error: 'Missing required field: pageId',
      };
    }

    const result = await getGTMPageHistory(input.pageId);

    return {
      success: result.success,
      action: 'history',
      result,
      error: result.error,
    };
  }

  /**
   * Validate GTM data
   */
  private async validateData(input: ConfluenceAgentInput): Promise<ConfluenceAgentOutput> {
    if (!input.gtmData) {
      return {
        success: false,
        action: 'validate',
        error: 'Missing required field: gtmData',
      };
    }

    const validation = validateGTMData(input.gtmData);

    return {
      success: validation.valid,
      action: 'validate',
      result: validation,
    };
  }
}

// ============================================================================
// LangGraph Node Creator
// ============================================================================

/**
 * Create a LangGraph node for the Confluence GTM agent
 * 
 * @example
 * ```typescript
 * import { StateGraph } from "@langchain/langgraph";
 * import { createConfluenceGTMNode } from "@/app/api/agents/confluence/tools";
 * 
 * const workflow = new StateGraph({
 *   channels: {
 *     confluenceAction: { value: null },
 *     confluenceResult: { value: null },
 *   }
 * });
 * 
 * workflow.addNode("confluence_gtm", createConfluenceGTMNode());
 * ```
 */
export function createConfluenceGTMNode() {
  const agent = new ConfluenceGTMAgent();

  return async (state: any) => {
    const input: ConfluenceAgentInput = state.confluenceAction || {
      action: 'validate',
      gtmData: state.gtmData,
    };

    const result = await agent.execute(input);

    return {
      ...state,
      confluenceResult: result,
    };
  };
}

// ============================================================================
// Standalone Agent Execution
// ============================================================================

/**
 * Execute Confluence GTM agent directly
 * 
 * @example
 * ```typescript
 * const result = await executeConfluenceGTMAgent({
 *   action: 'create',
 *   spaceKey: 'PROD',
 *   productName: 'Analytics Platform',
 *   gtmData: { ... }
 * });
 * ```
 */
export async function executeConfluenceGTMAgent(
  input: ConfluenceAgentInput
): Promise<ConfluenceAgentOutput> {
  const agent = new ConfluenceGTMAgent();
  return agent.execute(input);
}
