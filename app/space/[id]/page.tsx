import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Space from "@/models/Space";
import Link from "next/link";
import SpacePageClient from "@/components/SpacePageClient";
import SpaceAgentContent from "@/components/SpaceAgentContent";
import SpaceStepLink from "@/components/SpaceStepLink";

export default async function SpacePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }> | { id: string };
  searchParams: Promise<{ step?: string }> | { step?: string };
}) {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
  
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const viewStep = resolvedSearchParams.step ? parseInt(resolvedSearchParams.step) : null;

  let space: any = null;
  try {
    await connectDB();
    const spaceData = await Space.findOne({
      _id: id,
      userId: user.sub,
    }).lean();

    if (!spaceData) {
      redirect("/dashboard");
    }

    // Serialize the space data
    space = {
      ...spaceData,
      _id: spaceData._id.toString(),
      createdAt: spaceData.createdAt.toISOString(),
      updatedAt: spaceData.updatedAt.toISOString(),
      // Ensure nested objects are properly serialized
      ideaAgent: spaceData.ideaAgent ? {
        title: spaceData.ideaAgent.title,
        summary: spaceData.ideaAgent.summary,
        solutions: spaceData.ideaAgent.solutions || [],
        sources: spaceData.ideaAgent.sources || [],
        selectedSolution: spaceData.ideaAgent.selectedSolution,
        generatedAt: spaceData.ideaAgent.generatedAt?.toISOString(),
      } : undefined,
      storyAgent: spaceData.storyAgent ? {
        ...spaceData.storyAgent,
        generatedAt: spaceData.storyAgent.generatedAt?.toISOString(),
      } : undefined,
      emailAgent: spaceData.emailAgent ? {
        ...spaceData.emailAgent,
        generatedAt: spaceData.emailAgent.generatedAt?.toISOString(),
      } : undefined,
      riceAgent: spaceData.riceAgent ? {
        ...spaceData.riceAgent,
        generatedAt: spaceData.riceAgent.generatedAt?.toISOString(),
      } : undefined,
      okrAgent: spaceData.okrAgent ? {
        ...spaceData.okrAgent,
        generatedAt: spaceData.okrAgent.generatedAt?.toISOString(),
      } : undefined,
      // Wireframe agent - retrieve HTML strings from MongoDB for iframe rendering
      wireframeAgent: spaceData.wireframeAgent ? {
        pages: spaceData.wireframeAgent.pages?.map((page: any) => ({
          name: page.name,
          description: page.description,
          html: page.html, // Ensure HTML string is passed
        })) || [],
        generatedAt: spaceData.wireframeAgent.generatedAt?.toISOString(),
      } : undefined,
      // Jira agent - retrieve project and ticket data
      jiraAgent: spaceData.jiraAgent ? {
        projectKey: spaceData.jiraAgent.projectKey,
        projectName: spaceData.jiraAgent.projectName,
        projectUrl: spaceData.jiraAgent.projectUrl,
        invitedUsers: spaceData.jiraAgent.invitedUsers,
        ticketsCreated: spaceData.jiraAgent.ticketsCreated,
        tickets: spaceData.jiraAgent.tickets || [],
        summary: spaceData.jiraAgent.summary,
        generatedAt: spaceData.jiraAgent.generatedAt?.toISOString(),
      } : undefined,
    };
    
    console.log('[Space Page] Loaded space from MongoDB:');
    console.log('[Space Page] - ideaAgent exists:', !!spaceData.ideaAgent);
    console.log('[Space Page] - selectedSolution:', spaceData.ideaAgent?.selectedSolution);
    console.log('[Space Page] - solutions count:', spaceData.ideaAgent?.solutions?.length);
    console.log('[Space Page] - wireframeAgent exists:', !!spaceData.wireframeAgent);
    console.log('[Space Page] - wireframeAgent pages count:', spaceData.wireframeAgent?.pages?.length || 0);
    if (spaceData.wireframeAgent?.pages && spaceData.wireframeAgent.pages.length > 0) {
      console.log('[Space Page] - Retrieved HTML pages from MongoDB for iframe rendering');
      spaceData.wireframeAgent.pages.forEach((page: any, index: number) => {
        console.log(`[Space Page]   Page ${index + 1}: ${page.name} (${page.html?.length || 0} chars)`);
      });
    } else {
      console.log('[Space Page] - NO wireframe pages found in MongoDB');
    }
  } catch (error) {
    console.error('Failed to fetch space:', error);
    redirect("/dashboard");
  }

  // Helper function to check if a step has actual data
  const hasStepData = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1: return !!(space.ideaAgent?.solutions && space.ideaAgent.solutions.length > 0);
      case 2: return !!(space.storyAgent?.storyMarkdown);
      case 3: return !!(space.emailAgent?.results && space.emailAgent.results.length > 0);
      case 4: return !!(space.riceAgent?.features && space.riceAgent.features.length > 0);
      case 5: return !!(space.okrAgent?.summary || space.okrAgent?.analysis);
      case 6: return !!(space.wireframeAgent?.pages && space.wireframeAgent.pages.length > 0);
      case 7: return !!(space.jiraAgent?.tickets && space.jiraAgent.tickets.length > 0);
      default: return false;
    }
  };

  const agentSteps = [
    {
      number: 1,
      name: 'Idea Generation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      number: 2,
      name: 'Story Creation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      number: 3,
      name: 'Email Campaign',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: 4,
      name: 'RICE Analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      number: 5,
      name: 'OKR Planning',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      number: 6,
      name: 'Wireframe Design',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      number: 7,
      name: 'Jira Tickets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <SpacePageClient
        user={{
          name: user.name,
          email: user.email,
          picture: user.picture,
          nickname: user.nickname,
          sub: user.sub,
        }}
        space={{
          _id: space._id,
          name: space.spaceName,
          currentStep: space.currentStep,
          completed: space.completed,
        }}
        totalSteps={agentSteps.length}
      >
        {/* Main Content - Two Panel Layout */}
        <div className="flex max-w-[1600px] mx-auto">
        {/* Left Panel - Agent Pipeline */}
        <aside className="w-80 bg-white border-r shrink-0" style={{
          borderColor: 'var(--border)',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em'
              }}>
                Workflow
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                AI-powered development pipeline
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                <span className="text-xs font-semibold" style={{
                  color: space.completed ? 'var(--success)' : 'var(--primary)'
                }}>
                  {(() => {
                    const completedSteps = agentSteps.filter(step => hasStepData(step.number)).length;
                    const progressPercent = Math.round((completedSteps / agentSteps.length) * 100);
                    return space.completed ? '100%' : `${progressPercent}%`;
                  })()}
                </span>
              </div>
              <div className="h-1.5" style={{
                backgroundColor: 'var(--border-secondary)',
                borderRadius: 'var(--radius-full)'
              }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    backgroundColor: space.completed ? 'var(--success)' : 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    width: (() => {
                      if (space.completed) return '100%';
                      const completedSteps = agentSteps.filter(step => hasStepData(step.number)).length;
                      return `${(completedSteps / agentSteps.length) * 100}%`;
                    })(),
                  }}
                />
              </div>
              {space.completed && (
                <div className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1 text-xs font-medium" style={{
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success)',
                  borderRadius: 'var(--radius-full)'
                }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Complete
                </div>
              )}
            </div>

            {/* Problem Statement */}
            <div className="mb-6 pb-6" style={{ borderBottom: `1px solid var(--border)` }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em'
              }}>
                Problem
              </h3>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
                {space.problemStatement}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(space.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Agent Steps */}
            <div className="space-y-2">
              {agentSteps.map((step) => {
                // Check if this step has actual data (truly completed)
                const hasData = hasStepData(step.number);

                // A step is completed if it has data OR if we've moved past it
                const isCompleted = hasData || step.number < space.currentStep;

                // A step is pending if it has no data AND we haven't reached it yet
                const isPending = !hasData && step.number > space.currentStep;

                // A step is clickable if:
                // 1. It has data (can revisit)
                // 2. It's the current step
                // 3. The previous step has data (can proceed)
                const prevStepComplete = step.number === 1 || hasStepData(step.number - 1);
                const isClickable = hasData || step.number === space.currentStep || prevStepComplete;

                // Determine if this is the active viewed step
                const isActiveView = viewStep ? step.number === viewStep : step.number === space.currentStep;

                return (
                  <SpaceStepLink
                    key={step.number}
                    spaceId={space._id}
                    stepNumber={step.number}
                    isClickable={isClickable}
                    isActiveView={isActiveView}
                    isPending={isPending}
                    isCompleted={isCompleted}
                    stepName={step.name}
                    stepIcon={step.icon}
                  />
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Panel - Agent Content */}
        <main className="flex-1 p-4">
          <SpaceAgentContent space={space} agentSteps={agentSteps} viewStep={viewStep} />
        </main>
        </div>
      </SpacePageClient>
    </div>
  );
}

