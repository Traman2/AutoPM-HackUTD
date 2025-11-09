'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, ExternalLink, CheckCircle, User, FolderKanban } from 'lucide-react';

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  style?: string;
}

interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  description: string;
  assignee?: string;
  status: string;
}

interface JiraAgentData {
  projectKey?: string;
  projectName?: string;
  projectUrl?: string;
  invitedUsers?: number;
  ticketsCreated?: number;
  tickets?: JiraTicket[];
  summary?: string;
  generatedAt?: string;
}

interface JiraAgentViewProps {
  spaceId: string;
  selectedSolution: string | null;
  jiraAgentData?: JiraAgentData;
  teamMemberCount?: number;
}

export default function JiraAgentView({
  spaceId,
  selectedSolution,
  jiraAgentData,
  teamMemberCount = 0,
}: JiraAgentViewProps) {
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(null);

  const hasJiraData = jiraAgentData?.projectKey && jiraAgentData?.tickets && jiraAgentData.tickets.length > 0;
  const tickets = jiraAgentData?.tickets || [];

  console.log('[JiraAgentView] Render - hasJiraData:', hasJiraData);
  console.log('[JiraAgentView] Render - tickets count:', tickets.length);

  // Fetch Jira projects on component mount
  useEffect(() => {
    if (!hasJiraData) {
      fetchJiraProjects();
    }
  }, [hasJiraData]);

  const fetchJiraProjects = async () => {
    console.log('[JiraAgentView] Fetching Jira projects...');
    setIsLoadingProjects(true);
    setError(null);

    try {
      const response = await fetch(`/api/spaces/${spaceId}/run-jira-agent`, {
        method: 'GET',
      });

      console.log('[JiraAgentView] Projects response status:', response.status);
      const data = await response.json();
      console.log('[JiraAgentView] Projects response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch Jira projects');
      }

      setProjects(data.projects || []);
      console.log(`[JiraAgentView] Loaded ${data.projects?.length || 0} projects`);
    } catch (err) {
      console.error('[JiraAgentView] Error fetching Jira projects:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleGenerateTickets = async () => {
    console.log('[JiraAgentView] Starting Jira workflow...');
    console.log('[JiraAgentView] Space ID:', spaceId);
    console.log('[JiraAgentView] Selected Project:', selectedProject);

    if (!selectedSolution) {
      setError('Please complete Step 1 and select a solution first.');
      return;
    }

    if (!selectedProject) {
      setError('Please select a Jira project first.');
      return;
    }

    if (teamMemberCount === 0) {
      setError('No team members available. Please run the email agent first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('[JiraAgentView] Calling API:', `/api/spaces/${spaceId}/run-jira-agent`);

      const response = await fetch(`/api/spaces/${spaceId}/run-jira-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectKey: selectedProject.key,
          projectName: selectedProject.name,
        }),
      });

      console.log('[JiraAgentView] Response status:', response.status);
      const data = await response.json();
      console.log('[JiraAgentView] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create Jira tickets');
      }

      console.log('[JiraAgentView] Success! Reloading page...');
      // Reload the page to show the new Jira data
      window.location.reload();
    } catch (err) {
      console.error('[JiraAgentView] Error creating Jira tickets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  // If Jira data has been generated, show results
  if (hasJiraData) {
    return (
      <div className="space-y-6">
        {/* Project Info Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
                  {jiraAgentData.projectName}
                </h3>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'rgba(155, 107, 122, 0.1)', color: '#9B6B7A' }}
                >
                  {jiraAgentData.projectKey}
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: '#6B6B6B' }}>
                {jiraAgentData.summary}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                  <span style={{ color: '#6B6B6B' }}>
                    {jiraAgentData.ticketsCreated} ticket{jiraAgentData.ticketsCreated !== 1 ? 's' : ''} created
                  </span>
                </div>
              </div>
            </div>

            {jiraAgentData.projectUrl && (
              <a
                href={jiraAgentData.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shrink-0"
                style={{
                  backgroundColor: '#9B6B7A',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#8A5A69';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#9B6B7A';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Open in Jira
              </a>
            )}
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
          <div className="p-4 border-b" style={{ borderColor: '#E5E5E5' }}>
            <h4 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
              Created Tickets ({tickets.length})
            </h4>
          </div>

          <div className="divide-y" style={{ borderColor: '#E5E5E5' }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}
                      >
                        {ticket.key}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: 'rgba(107, 107, 107, 0.1)', color: '#6B6B6B' }}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <h5 className="text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                      {ticket.summary}
                    </h5>
                    <p className="text-xs" style={{ color: '#6B6B6B', lineHeight: '1.5' }}>
                      {ticket.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-semibold text-green-900 mb-1">
                Jira Tickets Created Successfully!
              </h4>
              <p className="text-sm text-green-700">
                Your Jira tickets have been created in the selected project. Click "Open in Jira" to view and manage your tickets.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the two-step selection UI
  return (
    <div className="space-y-6">
      {/* Selected Solution Context */}
      {selectedSolution && (
        <div className="bg-white rounded-lg p-6 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>
            Selected Solution
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm" style={{ color: '#6B6B6B', lineHeight: '1.6' }}>
              {selectedSolution}
            </p>
          </div>
        </div>
      )}

      {/* Team Members Info */}
      {teamMemberCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {teamMemberCount} team member{teamMemberCount !== 1 ? 's' : ''} will be assigned to tickets
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Team members from the email agent will automatically be assigned tickets based on their roles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Select Jira Project */}
      <div className="bg-white rounded-lg p-6 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)' }}
          >
            <FolderKanban className="w-5 h-5" style={{ color: '#9B6B7A' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
              Step 1: Select Jira Project
            </h3>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              Choose which Jira project to add the tickets to
            </p>
          </div>
        </div>

        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#9B6B7A' }} />
            <span className="ml-3 text-sm" style={{ color: '#6B6B6B' }}>Loading your Jira projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              No Jira projects found. Please create a project in Jira first.
            </p>
            <button
              onClick={fetchJiraProjects}
              className="mt-4 text-sm font-medium"
              style={{ color: '#9B6B7A' }}
            >
              Refresh Projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedProject?.id === project.id
                    ? 'bg-purple-50'
                    : 'bg-white hover:bg-gray-50'
                }`}
                style={{
                  borderColor: selectedProject?.id === project.id ? '#9B6B7A' : '#E5E5E5',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                        {project.name}
                      </span>
                      {selectedProject?.id === project.id && (
                        <CheckCircle className="w-4 h-4" style={{ color: '#9B6B7A' }} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}
                      >
                        {project.key}
                      </span>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>
                        {project.projectTypeKey}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Generate Tickets */}
      <div className="bg-white rounded-lg p-8 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)' }}
        >
          <Sparkles className="w-8 h-8" style={{ color: '#9B6B7A' }} />
        </div>

        <h3 className="text-xl font-semibold mb-3 text-center" style={{ color: '#1A1A1A' }}>
          Step 2: Generate Jira Tickets
        </h3>

        <p className="text-sm mb-6 max-w-md mx-auto text-center" style={{ color: '#6B6B6B' }}>
          Our AI will generate actionable tickets in your selected Jira project based on your solution plan.
        </p>

        <div className="text-center">
          <button
            onClick={handleGenerateTickets}
            disabled={isGenerating || !selectedSolution || !selectedProject || teamMemberCount === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all duration-200"
            style={{
              backgroundColor: isGenerating || !selectedSolution || !selectedProject || teamMemberCount === 0 ? '#D1D5DB' : '#9B6B7A',
              cursor: isGenerating || !selectedSolution || !selectedProject || teamMemberCount === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isGenerating && selectedSolution && selectedProject && teamMemberCount > 0) {
                e.currentTarget.style.backgroundColor = '#8A5A69';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isGenerating && selectedSolution && selectedProject && teamMemberCount > 0) {
                e.currentTarget.style.backgroundColor = '#9B6B7A';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Tickets...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Tickets
              </>
            )}
          </button>

          {(!selectedSolution || !selectedProject || teamMemberCount === 0) && (
            <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
              {!selectedSolution
                ? 'Please complete Step 1 and select a solution first'
                : !selectedProject
                ? 'Please select a Jira project first'
                : 'Please run the email agent first to add team members'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}