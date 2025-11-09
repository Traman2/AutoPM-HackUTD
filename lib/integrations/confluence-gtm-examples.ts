/**
 * Confluence GTM Integration - Usage Examples
 * 
 * Comprehensive examples showing how to use the Confluence GTM module
 * to automatically generate Go-to-Market strategy documentation.
 * 
 * @module lib/integrations/confluence-gtm-examples
 */

import {
  createGTMStrategyPage,
  updateGTMStrategyPage,
  getGTMPageHistory,
  validateGTMData,
  type GTMStrategyData,
} from './confluence-gtm';

// ============================================================================
// Example 1: Create Complete GTM Strategy Page
// ============================================================================

/**
 * Create a comprehensive GTM strategy page for a new product launch
 */
export async function exampleCreateFullGTMStrategy() {
  const gtmData: GTMStrategyData = {
    targetMarket: 'Enterprise SaaS companies with 100-1000 employees in North America and Europe, particularly in the financial services, healthcare, and technology sectors. These companies need advanced analytics but struggle with existing complex solutions.',
    
    valueProposition: '10x faster insights with AI-powered analysis that requires zero technical expertise. Deploy in days, not months, with built-in compliance and enterprise security.',
    
    competitorInsights: [
      {
        competitor: 'Tableau',
        strengths: [
          'Market leader with strong brand recognition',
          'Comprehensive visualization capabilities',
          'Large ecosystem of integrations'
        ],
        weaknesses: [
          'Complex setup requiring technical expertise',
          'High total cost of ownership ($70k+/year)',
          'Steep learning curve for business users',
          'Limited AI/ML capabilities'
        ]
      },
      {
        competitor: 'Power BI',
        strengths: [
          'Native Microsoft integration',
          'Competitive pricing',
          'Growing adoption'
        ],
        weaknesses: [
          'Limited advanced analytics features',
          'Performance issues with large datasets',
          'Requires Microsoft ecosystem lock-in'
        ]
      },
      {
        competitor: 'Looker',
        strengths: [
          'Strong data modeling layer',
          'Good for technical teams',
          'Google Cloud integration'
        ],
        weaknesses: [
          'Requires SQL knowledge',
          'Expensive licensing',
          'Limited self-service for business users'
        ]
      }
    ],
    
    pricingStrategy: 'Premium value-based pricing starting at $10,000/month for up to 50 users, with tiered plans at $25,000/month (up to 150 users) and enterprise pricing above that. Focus on ROI messaging: customers save 80% of analyst time, equivalent to $500k+ annually. Offer annual commitments with 15% discount.',
    
    launchTimeline: 'Q2 2026 (Target: April 15, 2026)',
    
    marketingChannels: [
      'LinkedIn Advertising (Sponsored Content & InMail)',
      'Content Marketing & SEO (Blog, Whitepapers, Case Studies)',
      'Industry Webinars & Virtual Events',
      'Partner Channel (System Integrators & Consultants)',
      'Trade Shows & Conferences (Gartner, Dreamforce)',
      'Email Marketing (Nurture Campaigns)',
      'Account-Based Marketing (Target Fortune 1000)'
    ],
    
    successMetrics: [
      {
        metric: 'Annual Recurring Revenue (ARR)',
        target: '$15M by end of Year 1'
      },
      {
        metric: 'Customer Acquisition',
        target: '50 enterprise customers in Year 1'
      },
      {
        metric: 'Net Revenue Retention',
        target: '120% by Month 12'
      },
      {
        metric: 'Product Qualified Leads (PQLs)',
        target: '500 per month by Month 6'
      },
      {
        metric: 'Trial-to-Paid Conversion',
        target: '25% conversion rate'
      },
      {
        metric: 'Time to First Value',
        target: 'Under 7 days from signup'
      },
      {
        metric: 'Customer Satisfaction (CSAT)',
        target: '4.5/5.0 or higher'
      }
    ],
    
    risks: [
      {
        risk: 'Intense competition from established players with larger budgets and sales teams',
        mitigation: 'Focus on AI differentiation and faster time-to-value. Target customers frustrated with existing solutions. Build strong product-led growth motion.'
      },
      {
        risk: 'Longer enterprise sales cycles (6-9 months) impacting revenue ramp',
        mitigation: 'Implement freemium tier for faster adoption. Focus on mid-market (100-500 employees) initially for shorter sales cycles. Build strong champion network.'
      },
      {
        risk: 'Market education required for AI-powered analytics category',
        mitigation: 'Invest heavily in content marketing, thought leadership, and analyst relations. Create compelling ROI calculator and demo environment.'
      },
      {
        risk: 'Integration complexity with legacy data infrastructure',
        mitigation: 'Develop pre-built connectors for top 20 data sources. Offer professional services and partner ecosystem for complex integrations.'
      },
      {
        risk: 'Pricing resistance in competitive market',
        mitigation: 'Lead with ROI/value messaging. Offer flexible payment terms and proof-of-value pilots. Build strong case study library showing customer savings.'
      }
    ]
  };

  const result = await createGTMStrategyPage(
    'PROD',
    'Analytics Platform v3.0',
    gtmData,
    // Optional: specify parent page for organization
    '123456789'
  );

  if (result.success) {
    console.log('✅ GTM Strategy page created successfully!');
    console.log(`   Page ID: ${result.pageId}`);
    console.log(`   Page URL: ${result.pageUrl}`);
    console.log(`   Version: ${result.version}`);
  } else {
    console.error('❌ Failed to create GTM page:', result.error);
  }

  return result;
}

// ============================================================================
// Example 2: SaaS Product GTM
// ============================================================================

/**
 * Create GTM strategy for a SaaS collaboration tool
 */
export async function exampleSaaSProductGTM() {
  const gtmData: GTMStrategyData = {
    targetMarket: 'Remote-first companies with 50-500 employees, primarily in technology, marketing, and creative industries. Teams struggling with fragmented communication tools and information silos.',
    
    valueProposition: 'All-in-one workspace that eliminates tool sprawl. Replace 8+ tools with one platform, saving $15k/year per team while improving productivity by 40%.',
    
    competitorInsights: [
      {
        competitor: 'Slack',
        strengths: ['Market leader', 'Strong integrations', 'Brand recognition'],
        weaknesses: ['Chat-centric (not comprehensive)', 'Information gets lost', 'Expensive at scale']
      },
      {
        competitor: 'Microsoft Teams',
        strengths: ['Office 365 integration', 'Video conferencing', 'Enterprise features'],
        weaknesses: ['Cluttered UI', 'Microsoft lock-in', 'Poor for async work']
      },
      {
        competitor: 'Notion',
        strengths: ['Flexible workspace', 'Great for docs', 'Affordable'],
        weaknesses: ['No real-time chat', 'Limited project management', 'Performance issues']
      }
    ],
    
    pricingStrategy: 'Freemium model with $10/user/month Pro tier and $20/user/month Enterprise tier. Free tier supports up to 10 users with basic features. Focus on viral growth through free tier, convert to paid as teams grow.',
    
    launchTimeline: 'Q3 2026 (July 1, 2026)',
    
    marketingChannels: [
      'Product Hunt Launch',
      'Reddit & HackerNews Community',
      'YouTube Tutorials & Demos',
      'Twitter/X Engagement',
      'Partnership with Remote Work Communities',
      'Affiliate Program'
    ],
    
    successMetrics: [
      { metric: 'Monthly Active Teams', target: '10,000 by Month 12' },
      { metric: 'Paid Conversion Rate', target: '8% from free to paid' },
      { metric: 'Monthly Recurring Revenue', target: '$500k MRR by Year 1' },
      { metric: 'User Retention (D30)', target: '60% 30-day retention' }
    ],
    
    risks: [
      {
        risk: 'High customer acquisition cost in competitive market',
        mitigation: 'Leverage product-led growth and viral loops. Invest in SEO and organic content.'
      },
      {
        risk: 'Customer churn due to change management challenges',
        mitigation: 'Exceptional onboarding, migration tools, and customer success team.'
      }
    ]
  };

  return await createGTMStrategyPage('PROD', 'Collaboration Hub', gtmData);
}

// ============================================================================
// Example 3: Update Existing GTM Strategy
// ============================================================================

/**
 * Update GTM strategy with revised timeline and metrics
 */
export async function exampleUpdateGTMStrategy() {
  // After initial launch, we learned and need to update our strategy
  const updates: Partial<GTMStrategyData> = {
    // Delayed launch timeline
    launchTimeline: 'Q3 2026 (September 1, 2026) - Extended for beta feedback',
    
    // Revised success metrics based on beta results
    successMetrics: [
      {
        metric: 'Annual Recurring Revenue (ARR)',
        target: '$20M by end of Year 1 (revised up based on beta demand)'
      },
      {
        metric: 'Customer Acquisition',
        target: '75 enterprise customers in Year 1 (increased from 50)'
      },
      {
        metric: 'Net Revenue Retention',
        target: '130% by Month 12 (increased from 120%)'
      }
    ],
    
    // Added new marketing channel
    marketingChannels: [
      'LinkedIn Advertising',
      'Content Marketing & SEO',
      'Industry Webinars',
      'Partner Channel',
      'Trade Shows',
      'Email Marketing',
      'Account-Based Marketing',
      'YouTube Video Content (NEW)',
      'Podcast Sponsorships (NEW)'
    ]
  };

  const result = await updateGTMStrategyPage(
    '987654321', // Existing page ID
    'Analytics Platform v3.0',
    updates
  );

  if (result.success) {
    console.log('✅ GTM Strategy updated successfully!');
    console.log(`   New version: ${result.version}`);
  }

  return result;
}

// ============================================================================
// Example 4: Get Page History
// ============================================================================

/**
 * View version history of GTM strategy page
 */
export async function exampleGetPageHistory() {
  const history = await getGTMPageHistory('987654321');

  if (history.success && history.history) {
    console.log(`\n📜 GTM Strategy Version History (${history.history.length} versions)\n`);
    
    history.history.forEach((entry, index) => {
      console.log(`Version ${entry.version}:`);
      console.log(`  Updated: ${entry.timestamp}`);
      console.log(`  By: ${entry.updatedBy}`);
      if (entry.message) {
        console.log(`  Message: ${entry.message}`);
      }
      console.log('');
    });
  } else {
    console.error('❌ Failed to get history:', history.error);
  }

  return history;
}

// ============================================================================
// Example 5: Validate GTM Data Before Creating
// ============================================================================

/**
 * Validate GTM data before creating page
 */
export async function exampleValidateBeforeCreate() {
  const incompleteData: Partial<GTMStrategyData> = {
    targetMarket: 'SMBs', // Too short
    valueProposition: 'Fast', // Too short
    competitorInsights: [], // Empty
    successMetrics: [], // Empty
    marketingChannels: [], // Empty
  };

  const validation = validateGTMData(incompleteData);

  if (!validation.valid) {
    console.log('❌ Validation failed:');
    validation.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
    return;
  }

  console.log('✅ Data is valid, creating page...');
  // Proceed with page creation
}

// ============================================================================
// Example 6: B2B Enterprise Product Launch
// ============================================================================

/**
 * Complete GTM for enterprise security product
 */
export async function exampleEnterpriseSecurityGTM() {
  const gtmData: GTMStrategyData = {
    targetMarket: 'Fortune 500 companies and mid-market enterprises (1000+ employees) with complex security requirements. Primary focus on financial services, healthcare, and government sectors with stringent compliance needs.',
    
    valueProposition: 'Enterprise-grade security platform that reduces breach risk by 90% while cutting security operations costs by 60%. Automated compliance reporting for SOC 2, ISO 27001, HIPAA, and PCI-DSS.',
    
    competitorInsights: [
      {
        competitor: 'CrowdStrike',
        strengths: ['Market leader in endpoint security', 'Strong threat intelligence', 'Proven at scale'],
        weaknesses: ['Expensive ($50+ per endpoint/year)', 'Complex deployment', 'Limited SIEM capabilities']
      },
      {
        competitor: 'Palo Alto Networks',
        strengths: ['Comprehensive platform', 'Strong firewall heritage', 'Enterprise relationships'],
        weaknesses: ['Legacy architecture', 'Slow to innovate', 'High vendor lock-in']
      }
    ],
    
    pricingStrategy: 'Enterprise pricing starting at $100,000/year for 1000 endpoints, scaling to $500k+ for large deployments. Pricing based on number of endpoints, users, and data volume. Include professional services ($50k-200k) for implementation. Annual contracts only with multi-year discounts (10-20%).',
    
    launchTimeline: 'Q1 2027 (January 15, 2027)',
    
    marketingChannels: [
      'Gartner/Forrester Analyst Relations',
      'RSA Conference & Black Hat Trade Shows',
      'CISO Executive Dinners & Roundtables',
      'Industry Publication Thought Leadership',
      'Security Podcast Sponsorships',
      'LinkedIn ABM to Fortune 1000',
      'Cybersecurity Partner Ecosystem'
    ],
    
    successMetrics: [
      { metric: 'Annual Contract Value (ACV)', target: '$50M in Year 1' },
      { metric: 'Enterprise Customers', target: '25 Fortune 500 customers' },
      { metric: 'Logo Retention', target: '95% annual retention' },
      { metric: 'Average Deal Size', target: '$500k ACV' },
      { metric: 'Sales Cycle Length', target: '6 months average' }
    ],
    
    risks: [
      {
        risk: 'Long enterprise sales cycles (9-18 months) delaying revenue',
        mitigation: 'Build strong POC/pilot program. Offer risk-free pilots. Leverage existing customer references. Invest in sales engineering team.'
      },
      {
        risk: 'Security breach or vulnerability discovery damaging brand',
        mitigation: 'Maintain SOC 2 Type II, ISO 27001 certifications. Regular third-party security audits. Comprehensive bug bounty program. Incident response plan.'
      },
      {
        risk: 'Procurement delays and budget cycles',
        mitigation: 'Align sales efforts with Q1/Q4 budget cycles. Offer flexible payment terms. Build relationships with procurement teams early.'
      }
    ]
  };

  return await createGTMStrategyPage(
    'SEC',
    'Enterprise Security Platform',
    gtmData
  );
}

// ============================================================================
// Example 7: Mobile App Consumer Product
// ============================================================================

/**
 * GTM for consumer mobile app
 */
export async function exampleConsumerMobileAppGTM() {
  const gtmData: GTMStrategyData = {
    targetMarket: 'Health-conscious millennials and Gen Z (ages 25-40) in urban areas, primarily in US and Europe. 60% female audience. Income $50k+. Active on social media and interested in wellness trends.',
    
    valueProposition: 'Personalized fitness and nutrition app that adapts to your lifestyle. Get results 3x faster with AI-powered meal plans and workouts that fit your schedule. No gym required.',
    
    competitorInsights: [
      {
        competitor: 'MyFitnessPal',
        strengths: ['Large user base', 'Comprehensive food database', 'Free tier'],
        weaknesses: ['Outdated UI', 'Generic meal plans', 'Limited personalization', 'Ad-heavy']
      },
      {
        competitor: 'Noom',
        strengths: ['Behavioral psychology approach', 'Human coaching', 'Proven results'],
        weaknesses: ['Very expensive ($200+/year)', 'Overwhelming for some users', 'High churn']
      }
    ],
    
    pricingStrategy: 'Freemium with $9.99/month or $59.99/year subscription. Free tier limited to basic tracking. Premium includes AI meal plans, personalized workouts, and progress analytics. 7-day free trial.',
    
    launchTimeline: 'Q1 2026 (January 1, 2026 - New Year fitness resolution timing)',
    
    marketingChannels: [
      'Instagram & TikTok Influencer Marketing',
      'Facebook & Instagram Ads',
      'App Store Optimization (ASO)',
      'YouTube Fitness Channel Partnerships',
      'Content Marketing (Blog & Success Stories)',
      'Referral Program (Give $10, Get $10)'
    ],
    
    successMetrics: [
      { metric: 'App Downloads', target: '1M downloads in Year 1' },
      { metric: 'Paid Subscribers', target: '100k paying subscribers (10% conversion)' },
      { metric: 'Monthly Recurring Revenue', target: '$1M MRR by Month 12' },
      { metric: 'D7 Retention', target: '40% 7-day retention' },
      { metric: 'D30 Retention', target: '25% 30-day retention' },
      { metric: 'App Store Rating', target: '4.7+ stars' }
    ],
    
    risks: [
      {
        risk: 'High user acquisition cost ($20-30 per install) eating into margins',
        mitigation: 'Focus on organic growth through ASO and referral program. Build viral loops into product. User-generated content strategy.'
      },
      {
        risk: 'User churn after initial motivation wanes',
        mitigation: 'Gamification, streaks, and social features. Push notifications for engagement. Personalized content recommendations.'
      },
      {
        risk: 'Platform dependency on iOS/Android app stores',
        mitigation: 'Build web app alternative. Diversify acquisition channels. Strong ASO and organic discovery.'
      }
    ]
  };

  return await createGTMStrategyPage(
    'MOB',
    'FitLife Pro',
    gtmData
  );
}

// ============================================================================
// Example 8: Integration with AI Agents
// ============================================================================

/**
 * Use Confluence GTM with AI agent workflow
 * 
 * Shows how AI agents can automatically generate GTM strategies
 * from research data and publish to Confluence
 */
export async function exampleAIAgentIntegration() {
  // Simulated AI agent output after market research
  const aiGeneratedGTM: GTMStrategyData = {
    targetMarket: 'Generated from AI market analysis agent...',
    valueProposition: 'Generated from AI value prop agent...',
    competitorInsights: [
      {
        competitor: 'Competitor A',
        strengths: ['From AI competitor analysis'],
        weaknesses: ['From AI competitive intelligence']
      }
    ],
    pricingStrategy: 'Generated from AI pricing optimization agent...',
    launchTimeline: 'Calculated from AI timeline agent...',
    marketingChannels: ['Generated from AI channel selection agent...'],
    successMetrics: [
      {
        metric: 'Generated from AI metrics agent',
        target: 'Calculated by AI forecasting agent'
      }
    ],
    risks: [
      {
        risk: 'Identified by AI risk analysis agent',
        mitigation: 'Generated by AI mitigation strategy agent'
      }
    ]
  };

  // Validate before creating
  const validation = validateGTMData(aiGeneratedGTM);
  
  if (!validation.valid) {
    console.error('AI-generated data failed validation:', validation.errors);
    return;
  }

  // Create page
  const result = await createGTMStrategyPage(
    'PROD',
    'AI-Generated Product Launch',
    aiGeneratedGTM
  );

  // If successful, track in workflow
  if (result.success) {
    console.log('✅ AI Agent successfully created GTM strategy page');
    console.log(`   Confluence Page: ${result.pageUrl}`);
    
    // Could trigger Slack notification here
    // await sendSlackNotification('#product-team', 'analysis_ready', {
    //   title: 'GTM Strategy Published',
    //   description: 'AI agents completed GTM analysis',
    //   actionUrl: result.pageUrl
    // });
  }

  return result;
}

// ============================================================================
// Export All Examples
// ============================================================================

export default {
  exampleCreateFullGTMStrategy,
  exampleSaaSProductGTM,
  exampleUpdateGTMStrategy,
  exampleGetPageHistory,
  exampleValidateBeforeCreate,
  exampleEnterpriseSecurityGTM,
  exampleConsumerMobileAppGTM,
  exampleAIAgentIntegration,
};
