import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import Space from '@/models/Space';
import { generateWireframes } from '@/app/api/agents/wireframe/tools';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Starting request');
    
    // Get authenticated user
    const session = await auth0.getSession();
    if (!session?.user) {
      console.log('[POST /api/spaces/[id]/run-wireframe-agent] No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] User ID:', userId);

    // Handle async params for Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Space ID:', id);

    // Check for Google API key
    if (!process.env.GOOGLE_API_KEY) {
      console.error('[POST /api/spaces/[id]/run-wireframe-agent] GOOGLE_API_KEY not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Connect to database
    await connectDB();
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Connected to database');

    // Find space and verify ownership
    const space = await Space.findOne({ _id: id, userId });
    if (!space) {
      console.log('[POST /api/spaces/[id]/run-wireframe-agent] Space not found');
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Found space:', space.name);
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Current step:', space.currentStep);

    // Check if wireframes already exist
    if (space.wireframeAgent?.pages && space.wireframeAgent.pages.length > 0) {
      console.log('[POST /api/spaces/[id]/run-wireframe-agent] Wireframes already exist, advancing to step 7');

      // If wireframes exist but we're still on step 6, advance to step 7
      if (space.currentStep === 6) {
        space.currentStep = 7;
        await space.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Wireframes already generated',
        data: {
          pages: space.wireframeAgent.pages.map((p: any) => ({
            name: p.name,
            description: p.description,
            htmlLength: p.html?.length || 0,
          })),
        },
      });
    }

    // Verify user is on step 6
    if (space.currentStep !== 6) {
      console.log('[POST /api/spaces/[id]/run-wireframe-agent] Wrong step:', space.currentStep);
      return NextResponse.json(
        { error: 'Must complete previous steps first' },
        { status: 400 }
      );
    }

    // Ensure a solution was selected in Step 1
    const selectedSolution = space.ideaAgent?.selectedSolution;
    if (!selectedSolution) {
      console.log('[POST /api/spaces/[id]/run-wireframe-agent] No solution selected');
      return NextResponse.json(
        { error: 'Please select a solution in Step 1 first' },
        { status: 400 }
      );
    }

    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Selected solution:', selectedSolution.substring(0, 100) + '...');

    // Generate wireframes using the selected solution
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Calling generateWireframes...');
    const pages = await generateWireframes(selectedSolution);
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Generated', pages.length, 'wireframe pages');

    // Log the structure of the pages being saved
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Pages structure:');
    pages.forEach((page, index) => {
      console.log(`  Page ${index + 1}: ${page.name} (${page.html.length} characters of HTML)`);
    });

    // Save HTML strings to MongoDB
    // Each page contains: name (string), description (string), html (string)
    space.wireframeAgent = {
      pages, // Array of {name, description, html} - HTML is stored as string in MongoDB
      generatedAt: new Date(),
    };

    // Move to next step (Step 7 - Jira)
    space.currentStep = 7;
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Moving to step 7 (Jira)');

    // Mark the field as modified to ensure Mongoose saves it
    space.markModified('wireframeAgent');
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Marked wireframeAgent as modified');

    const savedSpace = await space.save();
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Successfully saved', pages.length, 'HTML pages to MongoDB');
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Saved wireframeAgent pages:', savedSpace.wireframeAgent?.pages?.length || 0);
    console.log('[POST /api/spaces/[id]/run-wireframe-agent] Workflow status - currentStep:', savedSpace.currentStep, 'completed:', savedSpace.completed);

    return NextResponse.json({
      success: true,
      message: 'Wireframes generated successfully',
      data: {
        pages: pages.map(p => ({
          name: p.name,
          description: p.description,
          // Don't send full HTML in initial response (too large)
          htmlLength: p.html.length,
        })),
      },
    });
  } catch (error) {
    console.error('[POST /api/spaces/[id]/run-wireframe-agent] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate wireframes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

