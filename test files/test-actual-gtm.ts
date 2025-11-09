/**
 * Test the actual generated GTM content
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CONFLUENCE_DOMAIN = process.env.CONFLUENCE_DOMAIN!;
const CONFLUENCE_EMAIL = process.env.CONFLUENCE_EMAIL!;
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN!;
const SPACE_KEY = '~712020e75140f0942d4bc58fc2c46cb1d66d43';

async function testActualGTMContent() {
  try {
    console.log('🔍 Testing actual generated GTM content...\n');
    
    // Read the generated content
    const content = fs.readFileSync('debug-gtm-content.html', 'utf-8');
    console.log(`📄 Content length: ${content.length} characters\n`);
    
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
    
    // Step 2: Create page with actual GTM content
    console.log(`2️⃣ Creating page with actual GTM content...`);
    
    const pagePayload = {
      spaceId: spaceId,
      status: 'current',
      title: 'Test Actual GTM Content - Delete Me',
      body: {
        representation: 'storage',
        value: content,
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
      
      // Try to find the specific issue
      if (error.response?.data?.message) {
        console.error(`\n🔍 Error Message: ${error.response.data.message}`);
      }
    } else {
      console.error(error);
    }
  }
}

testActualGTMContent();
