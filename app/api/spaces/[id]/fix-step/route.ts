import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import connectDB from '@/lib/mongodb';
import Space from '@/models/Space';
import mongoose from 'mongoose';

/**
 * Fix route to update currentStep based on actual agent data
 * Call this to fix step tracking if it gets out of sync
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid space ID' }, { status: 400 });
    }

    await connectDB();

    const space = await Space.findOne({
      _id: id,
      userId: session.user.sub,
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    console.log('[Fix Step] Current step:', space.currentStep);
    console.log('[Fix Step] Completed:', space.completed);

    // Determine correct currentStep based on agent data
    let correctStep = 1;

    if (space.wireframeAgent?.pages && space.wireframeAgent.pages.length > 0) {
      correctStep = 6; // Wireframe is the final step
      space.completed = true;
    } else if (space.okrAgent?.summary || space.okrAgent?.analysis) {
      correctStep = 6;
    } else if (space.riceAgent?.features && space.riceAgent.features.length > 0) {
      correctStep = 5;
    } else if (space.emailAgent?.results && space.emailAgent.results.length > 0) {
      correctStep = 4;
    } else if (space.storyAgent?.storyMarkdown) {
      correctStep = 3;
    } else if (space.ideaAgent?.solutions && space.ideaAgent.solutions.length > 0) {
      correctStep = 2;
    }

    const oldStep = space.currentStep;
    space.currentStep = correctStep;

    await space.save();

    console.log('[Fix Step] Updated from', oldStep, 'to', correctStep);

    return NextResponse.json({
      success: true,
      message: `Updated currentStep from ${oldStep} to ${correctStep}`,
      data: {
        oldStep,
        newStep: correctStep,
        completed: space.completed,
      },
    });
  } catch (error: any) {
    console.error('[Fix Step] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fix step',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
