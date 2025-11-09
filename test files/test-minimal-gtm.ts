/**
 * Save the exact Confluence API request payload for inspection
 */

import { createGTMStrategyPage } from '../lib/integrations/confluence-gtm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const testGTMData = {
  targetMarket: "Test target market - minimal data",
  valueProposition: "Test value proposition",
  competitorInsights: [
    {
      competitor: "Test Competitor",
      strengths: ["Test strength"],
      weaknesses: ["Test weakness"]
    }
  ],
  pricingStrategy: "TBD - test pricing",
  launchTimeline: "TBD - test timeline",
  marketingChannels: ["Test Channel"],
  successMetrics: [{ metric: "Test Metric", target: "TBD" }],
  risks: [{ risk: "Test risk", mitigation: "Test mitigation" }]
};

async function testMinimalGTM() {
  console.log('🔍 Testing minimal GTM page creation...\n');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const result = await createGTMStrategyPage(
      '~712020e75140f0942d4bc58fc2c46cb1d66d43',
      `Test Product ${timestamp}`,
      testGTMData
    );
    
    console.log('\n✅ Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`\n🎉 SUCCESS! Page created: ${result.pageUrl}`);
    } else {
      console.log(`\n❌ FAILED: ${result.error}`);
    }
  } catch (error) {
    console.error('\n❌ Exception:', error);
  }
  
  // Check if debug file was created
  if (fs.existsSync('debug-gtm-content.html')) {
    const content = fs.readFileSync('debug-gtm-content.html', 'utf-8');
    console.log(`\n📄 Generated content size: ${content.length} characters`);
    console.log(`📄 Content saved to: debug-gtm-content.html`);
  }
}

testMinimalGTM();
