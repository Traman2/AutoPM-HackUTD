"use client";

import { useState } from "react";
import IdeaAgentView from "./IdeaAgentView";
import StoryAgentView from "./StoryAgentView";
import EmailAgentView from "./EmailAgentView";
import RiceAgentView from "./RiceAgentView";
import WireframeAgentView from "./WireframeAgentView";
import OkrAgentView from "./OkrAgentView";
import JiraAgentView from "./JiraAgentView";

interface AgentStep {
  number: number;
  name: string;
  icon: React.ReactNode;
}

interface Space {
  _id: string;
  name: string;
  problemStatement: string;
  currentStep: number;
  completed: boolean;
  ideaAgent?: any;
  storyAgent?: any;
  emailAgent?: any;
  riceAgent?: any;
  okrAgent?: any;
  wireframeAgent?: any;
  jiraAgent?: any;
  createdAt: string;
  updatedAt: string;
}

interface SpaceAgentContentProps {
  space: Space;
  agentSteps: AgentStep[];
  viewStep: number | null;
}

export default function SpaceAgentContent({ space: initialSpace, agentSteps, viewStep }: SpaceAgentContentProps) {
  const [space, setSpace] = useState(initialSpace);

  // Helper to check if a step has data
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

  // Determine which step to show
  // Allow viewing if: it's the current step, has data, or previous step has data
  const activeStep = (() => {
    if (!viewStep) return space.currentStep;

    // Allow viewing if:
    // 1. View step is at or before current step
    // 2. View step has data (can revisit)
    // 3. Previous step has data (can preview next step)
    const prevStepHasData = viewStep === 1 || hasStepData(viewStep - 1);
    const canView = viewStep <= space.currentStep || hasStepData(viewStep) || prevStepHasData;

    console.log('[SpaceAgentContent] viewStep:', viewStep, 'currentStep:', space.currentStep, 'canView:', canView, 'prevStepHasData:', prevStepHasData);

    return canView ? viewStep : space.currentStep;
  })();

  const handleAgentComplete = () => {
    // Refresh the page to get updated space data
    window.location.reload();
  };

  console.log('[SpaceAgentContent] Final activeStep:', activeStep);

  // Render based on active step
  const renderAgentContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <IdeaAgentView
            spaceId={space._id}
            problemStatement={space.problemStatement}
            ideaAgentData={space.ideaAgent || null}
            onComplete={handleAgentComplete}
            isViewingPastStep={viewStep !== null && viewStep < space.currentStep}
          />
        );
      
      case 2:
        const selectedSolution = (space.ideaAgent as any)?.selectedSolution;
        console.log('[SpaceAgentContent] Step 2 - Selected solution from space:', selectedSolution);
        
        return (
          <StoryAgentView
            spaceId={space._id}
            selectedSolution={selectedSolution || null}
            storyAgentData={(space as any).storyAgent || null}
            onComplete={handleAgentComplete}
            isViewingPastStep={viewStep !== null && viewStep < space.currentStep}
          />
        );
      
      case 3:
        const emailSelectedSolution = (space.ideaAgent as any)?.selectedSolution;
        console.log('[SpaceAgentContent] Step 3 - Selected solution:', emailSelectedSolution);
        
        return (
          <EmailAgentView
            spaceId={space._id}
            selectedSolution={emailSelectedSolution || null}
            emailAgentData={(space as any).emailAgent || null}
            onComplete={handleAgentComplete}
            isViewingPastStep={viewStep !== null && viewStep < space.currentStep}
          />
        );
      
      case 4:
        const riceSelectedSolution = (space.ideaAgent as any)?.selectedSolution;
        console.log('[SpaceAgentContent] Step 4 - Selected solution:', riceSelectedSolution);
        
        return (
          <RiceAgentView
            spaceId={space._id}
            selectedSolution={riceSelectedSolution || null}
            riceAgentData={(space as any).riceAgent || null}
            onComplete={handleAgentComplete}
            isViewingPastStep={viewStep !== null && viewStep < space.currentStep}
          />
        );
      
      case 5:
        console.log('[SpaceAgentContent] Step 5 - OKR Planning');
        
        return (
          <OkrAgentView
            spaceId={space._id}
            okrAgentData={(space as any).okrAgent || null}
            onComplete={handleAgentComplete}
            isViewingPastStep={viewStep !== null && viewStep < space.currentStep}
          />
        );
      
      case 6:
        const wireframeSelectedSolution = (space.ideaAgent as any)?.selectedSolution;
        console.log('[SpaceAgentContent] Step 6 - Wireframe Design');

        return (
          <WireframeAgentView
            spaceId={space._id}
            selectedSolution={wireframeSelectedSolution || null}
            wireframeAgentData={(space as any).wireframeAgent || null}
          />
        );

      case 7:
        const jiraSelectedSolution = (space.ideaAgent as any)?.selectedSolution;
        const emailResults = (space.emailAgent as any)?.results || [];
        const teamMemberCount = emailResults.filter((r: any) => r.success).length;
        console.log('[SpaceAgentContent] Step 7 - Jira Tickets');

        return (
          <JiraAgentView
            spaceId={space._id}
            selectedSolution={jiraSelectedSolution || null}
            jiraAgentData={(space as any).jiraAgent || null}
            teamMemberCount={teamMemberCount}
          />
        );

      default:
        return (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center" style={{ border: '1px solid #E5E5E5' }}>
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)' }}>
              {agentSteps[space.currentStep - 1].icon && (
                <div style={{ color: '#9B6B7A' }} className="scale-150">
                  {agentSteps[space.currentStep - 1].icon}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: '#1A1A1A' }}>
              {agentSteps[space.currentStep - 1].name}
            </h2>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)', color: '#9B6B7A' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Coming Soon
            </div>

            <p className="text-sm max-w-md mx-auto" style={{ color: '#9CA3AF' }}>
              This agent is currently under development. It will be available soon!
            </p>
          </div>
        );
    }
  };

  return (
    <div>
      {renderAgentContent()}
    </div>
  );
}

