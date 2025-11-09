/**
 * Test Configuration
 * 
 * Central configuration for integration tests including:
 * - API endpoints and authentication
 * - Test environment variables
 * - Axios instance with default settings
 */

import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Load environment variables
const API_SECRET = process.env.API_SECRET || '';
const TEST_EMAIL = process.env.RESEND_FROM_EMAIL || 'test@example.com';
const TEST_SLACK_CHANNEL = process.env.SLACK_TEST_CHANNEL || '#test';
const TEST_CONFLUENCE_SPACE = process.env.CONFLUENCE_DEFAULT_SPACE || '';

// API Configuration
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Authentication header
export const AUTH_HEADER = {
  Authorization: `Bearer ${API_SECRET}`,
};

// Test environment configuration
export const testConfig = {
  apiBaseUrl: API_BASE_URL,
  authHeader: AUTH_HEADER,
  testEmail: TEST_EMAIL,
  testSlackChannel: TEST_SLACK_CHANNEL,
  testConfluenceSpace: TEST_CONFLUENCE_SPACE,
  
  // Timeouts and delays
  requestTimeout: 30000, // 30 seconds
  retryDelay: 1000, // 1 second
  maxRetries: 3,
  
  // Rate limiting
  delayBetweenTests: 100, // 100ms
  delayBetweenCategories: 500, // 500ms
};

// Validate configuration
export function validateTestConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!API_SECRET) {
    errors.push('API_SECRET environment variable is not set');
  }

  if (!TEST_EMAIL || TEST_EMAIL === 'test@example.com') {
    errors.push('RESEND_FROM_EMAIL environment variable is not properly configured');
  }

  if (!TEST_SLACK_CHANNEL || TEST_SLACK_CHANNEL === '#test') {
    errors.push('SLACK_TEST_CHANNEL environment variable is not properly configured');
  }

  if (!TEST_CONFLUENCE_SPACE) {
    errors.push('CONFLUENCE_DEFAULT_SPACE environment variable is not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Create configured axios instance
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: testConfig.requestTimeout,
    headers: {
      'Content-Type': 'application/json',
      ...AUTH_HEADER,
    },
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('[REQUEST DATA]', JSON.stringify(config.data, null, 2));
      }
      return config;
    },
    (error) => {
      console.error('[REQUEST ERROR]', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  client.interceptors.response.use(
    (response) => {
      console.log(`[RESPONSE] ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(
          `[RESPONSE ERROR] ${error.response.status} ${error.config.url}`,
          error.response.data
        );
      } else {
        console.error('[RESPONSE ERROR]', error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// API client instance
export const apiClient = createApiClient();

// Test endpoints
export const endpoints = {
  health: '/api/integrations/health',
  testEmail: '/api/integrations/test-email',
  testSlack: '/api/integrations/test-slack',
  testConfluenceGTM: '/api/integrations/test-confluence-gtm',
  testConfluenceMeeting: '/api/integrations/test-confluence-meeting',
};

// Export all configuration
export default {
  ...testConfig,
  endpoints,
  apiClient,
  validateTestConfig,
};
