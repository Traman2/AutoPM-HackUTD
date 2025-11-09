/**
 * Quick test to verify body size is being received
 */

import axios from 'axios';
import * as fs from 'fs';

async function testBodySize() {
  try {
    // Read the generated GTM content
    const content = fs.readFileSync('debug-gtm-content.html', 'utf-8');
    
    const testPayload = {
      spaceKey: '~712020e75140f0942d4bc58fc2c46cb1d66d43',
      productName: 'Test Product',
      gtmData: {
        targetMarket: 'Test market',
        valueProposition: 'Test value',
        competitorInsights: [{ competitor: 'Test', strengths: ['A'], weaknesses: ['B'] }],
        pricingStrategy: 'Test pricing',
        launchTimeline: 'Q1 2026',
        marketingChannels: ['Test'],
        successMetrics: [{ metric: 'Test', target: 'TBD' }],
        risks: [{ risk: 'Test', mitigation: 'Test' }]
      }
    };
    
    const payloadString = JSON.stringify(testPayload);
    
    console.log('🧪 Testing body size handling...\n');
    console.log(`Payload size: ${payloadString.length} characters`);
    console.log(`Payload size: ${(payloadString.length / 1024).toFixed(2)} KB\n`);
    
    const response = await axios.post(
      'http://localhost:3000/api/integrations/test-body-size',
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
  }
}

testBodySize();
