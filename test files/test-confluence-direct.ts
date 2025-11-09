/**
 * Direct Confluence API Test
 * 
 * This script tests the Confluence API directly to see the exact error response
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CONFLUENCE_DOMAIN = process.env.CONFLUENCE_DOMAIN!;
const CONFLUENCE_EMAIL = process.env.CONFLUENCE_EMAIL!;
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN!;
const SPACE_KEY = '~712020e75140f0942d4bc58fc2c46cb1d66d43';

async function testConfluenceAPI() {
  try {
    console.log('🔍 Testing Confluence API...\n');
    
    // Step 1: Get space ID
    console.log(`1️⃣ Looking up space ID for key: ${SPACE_KEY}`);
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
    
    // Step 2: Try to create a page with complex HTML
    console.log(`2️⃣ Creating test page with complex HTML...`);
    
    const complexContent = `
<h2>Executive Summary</h2>
<p>This is a test page with complex content.</p>

<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Test Info</ac:parameter>
  <ac:rich-text-body>
    <p>This is an info panel.</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Bullet List</h2>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

<h2>Table</h2>
<table>
  <tbody>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
`;
    
    const pagePayload = {
      spaceId: spaceId,
      status: 'current',
      title: 'Test Page - Complex HTML - Delete Me',
      body: {
        representation: 'storage',
        value: complexContent,
      },
    };
    
    console.log('📦 Page payload:', JSON.stringify(pagePayload, null, 2));
    console.log('');
    
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
      console.error(`\nRequest URL: ${error.config?.url}`);
      console.error(`Request Method: ${error.config?.method?.toUpperCase()}`);
      
      if (error.config?.data) {
        console.error(`\nRequest Body:`);
        try {
          console.error(JSON.stringify(JSON.parse(error.config.data), null, 2));
        } catch {
          console.error(error.config.data);
        }
      }
    } else {
      console.error(error);
    }
  }
}

testConfluenceAPI();
