/**
 * Test if environment variables are loaded in Next.js
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    confluenceDomain: process.env.CONFLUENCE_DOMAIN?.substring(0, 30) || 'NOT SET',
    confluenceEmail: process.env.CONFLUENCE_EMAIL?.substring(0, 20) || 'NOT SET',
    confluenceToken: process.env.CONFLUENCE_API_TOKEN?.substring(0, 20) || 'NOT SET',
    hasAll: !!(process.env.CONFLUENCE_DOMAIN && process.env.CONFLUENCE_EMAIL && process.env.CONFLUENCE_API_TOKEN),
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(envCheck);
}
