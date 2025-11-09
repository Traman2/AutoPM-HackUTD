/**
 * Test actual GTM content generation
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CONFLUENCE_DOMAIN = process.env.CONFLUENCE_DOMAIN!;
const CONFLUENCE_EMAIL = process.env.CONFLUENCE_EMAIL!;
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN!;
const SPACE_KEY = '~712020e75140f0942d4bc58fc2c46cb1d66d43';

// Import the actual function (we'll simulate it here)
const testGTMData = {
  targetMarket: "Test target market",
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

// Simulate the generateFullPageContent function with the issue
const timestamp = new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const testContent = `
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#DEEBFF</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Product:</strong> Test Product</p>
    <p><strong>Document Type:</strong> Go-to-Market Strategy</p>
    <p><strong>Last Updated:</strong> ${timestamp}</p>
    <p><strong>Status:</strong> <ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">Yellow</ac:parameter><ac:parameter ac:name="title">In Planning</ac:parameter></ac:structured-macro></p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Target Market</h2>
<p>${testGTMData.targetMarket}</p>
`;

async function testGTMContent() {
  try {
    console.log('🔍 Testing GTM content generation...\n');
    
    // Step 1: Get space ID
    console.log(`1️⃣ Looking up space ID...`);
    const spaceResponse = await axios.get(
      `https://${CONFLUENCE_DOMAIN}/wiki/api/v2/spaces`,
      {
        params: { keys: SPACE_KEY },
        headers: {
          'Authorization': `Basic ${Buffer.from(`${CONFLUENCE_EMAIL}:${CONFLUENCE_API_TOKEN}`).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );
    
    const spaceId = spaceResponse.data.results[0].id;
    console.log(`✅ Space ID: ${spaceId}\n`);
    
    // Step 2: Create page with GTM content
    console.log(`2️⃣ Creating page with GTM content...`);
    console.log(`Content length: ${testContent.length} characters\n`);
    
    const pagePayload = {
      spaceId: spaceId,
      status: 'current',
      title: 'Test GTM Content - Delete Me',
      body: {
        representation: 'storage',
        value: testContent,
      },
    };
    
    const pageResponse = await axios.post(
      `https://${CONFLUENCE_DOMAIN}/wiki/api/v2/pages`,
      pagePayload,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${CONFLUENCE_EMAIL}:${CONFLUENCE_API_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    
    console.log(`✅ Page created successfully!`);
    console.log(`   Page ID: ${pageResponse.data.id}`);
    console.log(`   Page URL: https://${CONFLUENCE_DOMAIN}/wiki${pageResponse.data._links.webui}`);
    
  } catch (error) {
    console.error('❌ Error occurred:\n');
    
    if (axios.isAxiosError(error)) {
      console.error(`Status: ${error.response?.status}`);
      console.error(`Status Text: ${error.response?.statusText}`);
      console.error(`\nFull Response Data:`);
      console.error(JSON.stringify(error.response?.data, null, 2));
    } else {
      console.error(error);
    }
  }
}

testGTMContent();
