/**
 * Configuration for the Customer & Market Research Subgraph
 * 
 * This file contains all constants, weights, and configuration values
 * used throughout the research module.
 */

// ============================================================================
// Source Weights (must sum to 1.0)
// ============================================================================

export const SOURCE_WEIGHTS = {
  reddit: 0.4,
  competitors: 0.35,
  industry_trends: 0.25,
} as const;

// ============================================================================
// Intensity Mapping
// ============================================================================

export const INTENSITY_WEIGHTS = {
  low: 0.3,
  medium: 0.6,
  high: 1.0,
} as const;

// ============================================================================
// Data Fetching Limits
// ============================================================================

export const FETCH_LIMITS = {
  // Reddit
  redditPostsPerQuery: 20,
  redditMaxQueries: 7,
  redditMinQueries: 3,
  
  // Competitors
  competitorSearchResults: 10,
  minCompetitors: 2,
  maxCompetitors: 5,
  
  // Industry Trends
  trendSearchResults: 10,
  minTrends: 3,
  maxTrends: 7,
} as const;

// ============================================================================
// Insight Generation
// ============================================================================

export const INSIGHT_CONFIG = {
  minInsights: 3,
  maxInsights: 7,
  minScoreThreshold: 0.15, // Insights below this score may be filtered out
  topInsightsForViability: 5, // Number of top insights to consider for overall viability
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  retryDelayMs: 1000,
  retryBackoffMultiplier: 2,
} as const;

// ============================================================================
// Reddit Configuration
// ============================================================================

export const REDDIT_CONFIG = {
  clientId: process.env.REDDIT_CLIENT_ID || '',
  clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
  userAgent: process.env.REDDIT_USER_AGENT || 'ProductManagerCopilot/1.0',
  tokenUrl: 'https://www.reddit.com/api/v1/access_token',
  searchUrl: 'https://oauth.reddit.com/search',
  // Default subreddits to search if not specified
  defaultSubreddits: [
    'fintech',
    'banking',
    'personalfinance',
    'Entrepreneur',
    'smallbusiness',
    'technology',
  ],
} as const;

// ============================================================================
// Web Search Configuration
// ============================================================================

export const WEB_SEARCH_CONFIG = {
  // Tavily configuration
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  tavilyApiUrl: 'https://api.tavily.com/search',
  
  // Serper configuration (alternative)
  serperApiKey: process.env.SERPER_API_KEY || '',
  serperApiUrl: 'https://google.serper.dev/search',
  
  // Prefer Tavily if both are available
  preferredProvider: process.env.WEB_SEARCH_PROVIDER || 'tavily',
} as const;

// ============================================================================
// Google GenAI Configuration
// ============================================================================

export const GENAI_CONFIG = {
  apiKey: process.env.GOOGLE_API_KEY || '',
  model: 'gemini-1.5-flash', // Fast model for classification tasks
  temperature: 0.3, // Lower temperature for more consistent classification
  maxOutputTokens: 2048,
} as const;

// ============================================================================
// LLM Prompt Templates
// ============================================================================

export const PROMPTS = {
  // Reddit post classification
  classifyRedditPost: `Analyze the following Reddit post and classify it according to these categories.

Post Title: {title}
Post Body: {body}

Extract:
1. Topic (one of: pricing, onboarding, reliability, UX, support, regulation, security, integration, performance, other)
2. Direction (one of: pain_point, demand_signal, neutral_observation)
   - pain_point: user is frustrated, blocked, or complaining
   - demand_signal: user is requesting a feature or showing a need
   - neutral_observation: descriptive or neutral discussion
3. Intensity (one of: low, medium, high) based on the language strength and urgency

Return your response in JSON format:
{
  "topic": "string",
  "direction": "pain_point" | "demand_signal" | "neutral_observation",
  "intensity": "low" | "medium" | "high",
  "reasoning": "brief explanation"
}`,

  // Competitor analysis
  analyzeCompetitor: `Analyze the following information about a competitor in the context of this solution:

Solution Context: {solutionContext}
Competitor Information: {competitorInfo}

Extract:
1. Relevant features: List features/capabilities related to the solution area
2. Unique edges: What they do especially well or differently
3. Weaknesses: Pain points, missing features, or complexity issues

Return your response in JSON format:
{
  "relevant_features": ["feature1", "feature2", ...],
  "unique_edges": ["edge1", "edge2", ...],
  "weaknesses": ["weakness1", "weakness2", ...]
}`,

  // Industry trend analysis
  analyzeTrend: `Analyze the following trend/news snippet in the context of this solution:

Solution Context: {solutionContext}
Trend/News: {trendInfo}

Determine:
1. Direction (one of: growing, stable, declining)
2. Stance relative to the solution (one of: supportive, neutral, risky)
   - supportive: makes the solution more attractive/necessary
   - neutral: neither helps nor hinders
   - risky: creates risk, friction, or regulatory concerns
3. Implication for the solution (one sentence)

Return your response in JSON format:
{
  "name": "short trend name",
  "direction": "growing" | "stable" | "declining",
  "stance": "supportive" | "neutral" | "risky",
  "implication": "one sentence implication",
  "reasoning": "brief explanation"
}`,
} as const;

// ============================================================================
// Validation
// ============================================================================

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!GENAI_CONFIG.apiKey) {
    errors.push('GOOGLE_API_KEY is required but not set');
  }
  
  if (!REDDIT_CONFIG.clientId || !REDDIT_CONFIG.clientSecret) {
    errors.push('REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required but not set');
  }
  
  if (!WEB_SEARCH_CONFIG.tavilyApiKey && !WEB_SEARCH_CONFIG.serperApiKey) {
    errors.push('Either TAVILY_API_KEY or SERPER_API_KEY is required but neither is set');
  }
  
  // Validate source weights sum to 1.0
  const weightSum = Object.values(SOURCE_WEIGHTS).reduce((sum, w) => sum + w, 0);
  if (Math.abs(weightSum - 1.0) > 0.001) {
    errors.push(`Source weights must sum to 1.0, but sum to ${weightSum}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getWebSearchProvider(): 'tavily' | 'serper' {
  if (WEB_SEARCH_CONFIG.preferredProvider === 'serper' && WEB_SEARCH_CONFIG.serperApiKey) {
    return 'serper';
  }
  return 'tavily';
}

export function isConfigValid(): boolean {
  return validateConfig().valid;
}

