/**
 * Test Utilities
 * 
 * Helper functions for integration tests including:
 * - Sleep/delay functions for rate limiting
 * - Test result logging
 * - Response validation
 * - Confluence page cleanup
 * - Retry logic with exponential backoff
 */

import axios from 'axios';
import { testConfig } from './test-config';

// ============================================
// DELAY AND TIMING UTILITIES
// ============================================

/**
 * Sleep for specified milliseconds
 * Used for rate limiting between API calls
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Calculate duration between two timestamps
 */
export function calculateDuration(startTime: number, endTime: number): string {
  const durationMs = endTime - startTime;
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1000).toFixed(2)}s`;
}

// ============================================
// LOGGING UTILITIES
// ============================================

/**
 * Log test result with formatting
 */
export function logTestResult(
  testName: string,
  success: boolean,
  data?: any,
  duration?: string
): void {
  const timestamp = getCurrentTimestamp();
  const status = success ? '✅ PASS' : '❌ FAIL';
  const durationStr = duration ? ` (${duration})` : '';

  console.log('\n' + '='.repeat(80));
  console.log(`${status} | ${testName}${durationStr}`);
  console.log(`Timestamp: ${timestamp}`);

  if (data) {
    console.log('\nResult Data:');
    console.log(JSON.stringify(data, null, 2));
  }

  console.log('='.repeat(80) + '\n');
}

/**
 * Log section header
 */
export function logSection(title: string): void {
  console.log('\n' + '█'.repeat(80));
  console.log(`  ${title.toUpperCase()}`);
  console.log('█'.repeat(80) + '\n');
}

/**
 * Log test start
 */
export function logTestStart(testName: string): void {
  console.log(`\n🧪 Starting test: ${testName}`);
  console.log(`⏰ ${getCurrentTimestamp()}`);
}

/**
 * Log error with context
 */
export function logError(testName: string, error: any): void {
  console.error(`\n❌ Error in ${testName}:`);
  
  if (axios.isAxiosError(error)) {
    console.error('HTTP Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
  } else if (error instanceof Error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } else {
    console.error('Unknown error:', error);
  }
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate response has expected fields
 */
export function validateResponse(
  response: any,
  expectedFields: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const field of expectedFields) {
    // Support nested field checking with dot notation
    const fieldParts = field.split('.');
    let current = response;

    for (const part of fieldParts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        missing.push(field);
        break;
      }
      current = current[part];
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate HTTP status code
 */
export function validateStatusCode(
  actual: number,
  expected: number | number[]
): boolean {
  if (Array.isArray(expected)) {
    return expected.includes(actual);
  }
  return actual === expected;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// CONFLUENCE UTILITIES
// ============================================

/**
 * Clean up Confluence page by ID
 * Used to delete test pages after test completion
 */
export async function cleanupConfluencePage(pageId: string): Promise<boolean> {
  try {
    const confluenceDomain = process.env.CONFLUENCE_DOMAIN;
    const confluenceEmail = process.env.CONFLUENCE_EMAIL;
    const confluenceApiToken = process.env.CONFLUENCE_API_TOKEN;

    if (!confluenceDomain || !confluenceEmail || !confluenceApiToken) {
      console.warn('⚠️ Confluence credentials not configured, skipping cleanup');
      return false;
    }

    const auth = Buffer.from(`${confluenceEmail}:${confluenceApiToken}`).toString('base64');
    const url = `https://${confluenceDomain}/wiki/api/v2/pages/${pageId}`;

    console.log(`🗑️ Deleting Confluence page: ${pageId}`);

    const response = await axios.delete(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    console.log(`✅ Successfully deleted page ${pageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete Confluence page ${pageId}:`, error);
    return false;
  }
}

/**
 * Clean up multiple Confluence pages
 */
export async function cleanupConfluencePages(pageIds: string[]): Promise<void> {
  console.log(`\n🗑️ Cleaning up ${pageIds.length} Confluence pages...`);

  for (const pageId of pageIds) {
    await cleanupConfluencePage(pageId);
    await sleep(500); // Rate limiting
  }

  console.log('✅ Cleanup complete\n');
}

// ============================================
// RETRY UTILITIES
// ============================================

/**
 * Retry a request with exponential backoff
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = testConfig.maxRetries,
  baseDelay: number = testConfig.retryDelay
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: baseDelay * 2^(attempt-1)
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw new Error(
    `Request failed after ${maxRetries} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

/**
 * Retry with custom retry logic
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: any) => boolean,
  maxRetries: number = testConfig.maxRetries,
  baseDelay: number = testConfig.retryDelay
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⚠️ Retryable error, attempting again in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

// ============================================
// DATA GENERATION UTILITIES
// ============================================

/**
 * Generate random string for unique test data
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate unique test identifier
 */
export function generateTestId(): string {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  return `test_${timestamp}_${random}`;
}

// ============================================
// TEST STATISTICS UTILITIES
// ============================================

export interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

/**
 * Calculate test statistics
 */
export function calculateTestStats(
  results: Array<{ name: string; success: boolean; duration: number; skipped?: boolean }>
): TestStats {
  const stats: TestStats = {
    total: results.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
  };

  for (const result of results) {
    if (result.skipped) {
      stats.skipped++;
    } else if (result.success) {
      stats.passed++;
    } else {
      stats.failed++;
    }
    stats.duration += result.duration;
  }

  return stats;
}

/**
 * Format test statistics for display
 */
export function formatTestStats(stats: TestStats): string {
  const passRate = ((stats.passed / (stats.total - stats.skipped)) * 100).toFixed(1);
  const durationStr = calculateDuration(0, stats.duration);

  return `
📊 Test Statistics:
   Total Tests: ${stats.total}
   ✅ Passed: ${stats.passed}
   ❌ Failed: ${stats.failed}
   ⏭️ Skipped: ${stats.skipped}
   📈 Pass Rate: ${passRate}%
   ⏱️ Total Duration: ${durationStr}
  `.trim();
}

// ============================================
// ASSERTION UTILITIES
// ============================================

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * Assert that a condition is true
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new AssertionError(message);
  }
}

/**
 * Assert that two values are equal
 */
export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    const msg = message || `Expected ${expected}, but got ${actual}`;
    throw new AssertionError(msg);
  }
}

/**
 * Assert that value is defined (not null or undefined)
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    const msg = message || 'Expected value to be defined';
    throw new AssertionError(msg);
  }
}

/**
 * Assert that array contains item
 */
export function assertContains<T>(array: T[], item: T, message?: string): void {
  if (!array.includes(item)) {
    const msg = message || `Expected array to contain ${item}`;
    throw new AssertionError(msg);
  }
}

// Export all utilities
export default {
  // Timing
  sleep,
  getCurrentTimestamp,
  calculateDuration,

  // Logging
  logTestResult,
  logSection,
  logTestStart,
  logError,

  // Validation
  validateResponse,
  validateStatusCode,
  validateEmail,
  validateUrl,

  // Confluence
  cleanupConfluencePage,
  cleanupConfluencePages,

  // Retry
  retryRequest,
  retryWithCondition,

  // Data generation
  generateRandomString,
  generateTestId,

  // Statistics
  calculateTestStats,
  formatTestStats,

  // Assertions
  assert,
  assertEqual,
  assertDefined,
  assertContains,
  AssertionError,
};
