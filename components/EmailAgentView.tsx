"use client";

import { useState } from "react";

interface TeamMember {
  email: string;
  name: string;
  role: string;
  description: string;
}

interface EmailResult {
  email: string;
  name: string;
  role: string;
  success: boolean;
  error?: string;
}

interface EmailAgentData {
  totalUsers: number;
  relevantUsers: number;
  emailsSent: number;
  results: EmailResult[];
  summary: string;
  generatedAt?: string;
}

interface EmailAgentViewProps {
  spaceId: string;
  selectedSolution: string | null;
  emailAgentData: EmailAgentData | null;
  onComplete: () => void;
  isViewingPastStep?: boolean;
}

export default function EmailAgentView({
  spaceId,
  selectedSolution,
  emailAgentData,
  onComplete,
  isViewingPastStep
}: EmailAgentViewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<EmailAgentData | null>(emailAgentData);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: '', name: '', role: '', description: '' }
  ]);

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { email: '', name: '', role: '', description: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleRunAgent = async (skip: boolean = false) => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch(`/api/spaces/${spaceId}/run-email-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamMembers: skip ? [] : teamMembers.filter(m => m.email && m.name),
          skipEmail: skip,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run email agent');
      }

      const result = await response.json();
      setData(result.data);
      setIsEditing(false);
      onComplete();
    } catch (err) {
      console.error('Error running email agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to run email agent');
    } finally {
      setIsRunning(false);
    }
  };

  const handleEditMode = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTeamMembers([{ email: '', name: '', role: '', description: '' }]);
    setError(null);
  };

  // Block user if no solution is selected
  if (!selectedSolution && !data) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm text-center" style={{ border: '1px solid #E5E5E5' }}>
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <svg className="w-8 h-8" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>
          Solution Required
        </h3>
        <p className="text-sm mb-6" style={{ color: '#6B6B6B' }}>
          You need to select a solution in Step 1 before you can send email campaigns.
        </p>
        <a
          href={`/space/${spaceId}?step=1`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
          style={{
            backgroundColor: '#9B6B7A',
            color: '#FFFFFF',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back to Idea Generation
        </a>
      </div>
    );
  }
  
  // Show selected solution preview if available
  const solutionPreview = selectedSolution && !data;

  if (!data) {
    return (
      <div>
        {/* Run Agent Card */}
        <div className="bg-white rounded-lg p-8 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)' }}>
              <svg className="w-8 h-8" style={{ color: '#9B6B7A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                Email Campaign
              </h3>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                Send task assignments to relevant team members based on the selected solution.
              </p>
            </div>
          </div>

          {/* Selected Solution Preview */}
          {solutionPreview && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#6B6B6B' }}>
                Selected Solution:
              </p>
              <p className="text-sm" style={{ color: '#1A1A1A' }}>
                {selectedSolution}
              </p>
            </div>
          )}

          {/* Team Members Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                Team Members
              </h4>
              <button
                onClick={handleAddMember}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:shadow-sm"
                style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)', color: '#9B6B7A' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Member
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #E5E5E5' }}>
              <table className="w-full">
                <thead style={{ backgroundColor: '#FAFAFA' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Description</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#6B6B6B', width: '60px' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#FFFFFF' }}>
                  {teamMembers.map((member, index) => (
                    <tr key={index} className="border-t" style={{ borderColor: '#E5E5E5' }}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm"
                          style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          placeholder="Email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm"
                          style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Role"
                          value={member.role}
                          onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm"
                          style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Description"
                          value={member.description}
                          onChange={(e) => handleMemberChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm"
                          style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {teamMembers.length > 1 && (
                          <button
                            onClick={() => handleRemoveMember(index)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Remove member"
                          >
                            <svg className="w-4 h-4" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444' }}>
              <p className="text-sm" style={{ color: '#991B1B' }}>{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRunAgent(false)}
              disabled={isRunning || teamMembers.filter(m => m.email && m.name).length === 0}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isRunning ? '#9CA3AF' : '#9B6B7A',
                color: '#FFFFFF',
              }}
            >
              {isRunning ? 'Sending...' : 'Send Emails'}
            </button>
            <button
              onClick={() => handleRunAgent(true)}
              disabled={isRunning}
              className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: '#FAFAFA',
                color: '#6B6B6B',
                border: '1px solid #E5E5E5',
              }}
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If editing mode is active after completion
  if (data && isEditing) {
    return (
      <div>
        {/* Edit Mode Card */}
        <div className="bg-white rounded-lg p-8 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)' }}>
              <svg className="w-8 h-8" style={{ color: '#9B6B7A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                Edit & Resend Email Campaign
              </h3>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                Update team members or add new ones, then resend the campaign.
              </p>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                Team Members
              </h4>
              <button
                onClick={handleAddMember}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:shadow-sm"
                style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)', color: '#9B6B7A' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Member
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #E5E5E5' }}>
              <table className="w-full">
                <thead style={{ backgroundColor: '#FAFAFA' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Description</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#6B6B6B', width: '60px' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#FFFFFF' }}>
                  {teamMembers.map((member, index) => (
                    <tr key={index} className="border-t" style={{ borderColor: '#E5E5E5' }}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm"
                          style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          placeholder="Email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm"
                          style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Role"
                          value={member.role}
                          onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm"
                          style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Description"
                          value={member.description}
                          onChange={(e) => handleMemberChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm"
                          style={{ border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {teamMembers.length > 1 && (
                          <button
                            onClick={() => handleRemoveMember(index)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Remove member"
                          >
                            <svg className="w-4 h-4" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444' }}>
              <p className="text-sm" style={{ color: '#991B1B' }}>{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRunAgent(false)}
              disabled={isRunning || teamMembers.filter(m => m.email && m.name).length === 0}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isRunning ? '#9CA3AF' : '#9B6B7A',
                color: '#FFFFFF',
              }}
            >
              {isRunning ? 'Sending...' : 'Resend Emails'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isRunning}
              className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
              style={{
                backgroundColor: '#FAFAFA',
                color: '#6B6B6B',
                border: '1px solid #E5E5E5',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Viewing Past Step Banner */}
        {isViewingPastStep && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm" style={{ color: '#1E40AF' }}>
              You're viewing a completed step.
            </p>
          </div>
        )}

        {/* Email Campaign Results */}
        <div className="bg-white rounded-lg shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
          <div className="p-6 border-b" style={{ borderColor: '#E5E5E5' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                  Email Campaign Results
                </h2>
                {data.generatedAt && (
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    Completed {new Date(data.generatedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: 'rgba(155, 107, 122, 0.08)',
                    color: '#9B6B7A',
                    border: '1px solid rgba(155, 107, 122, 0.2)',
                  }}
                  title="Edit and resend"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm font-medium">Edit & Resend</span>
                </button>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                  Completed
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border-b" style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#9B6B7A' }}>
                  {data.totalUsers}
                </div>
                <div className="text-xs" style={{ color: '#6B6B6B' }}>
                  Total Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#3B82F6' }}>
                  {data.relevantUsers}
                </div>
                <div className="text-xs" style={{ color: '#6B6B6B' }}>
                  Relevant Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#10B981' }}>
                  {data.emailsSent}
                </div>
                <div className="text-xs" style={{ color: '#6B6B6B' }}>
                  Emails Sent
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 border-b" style={{ borderColor: '#E5E5E5' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#6B6B6B' }}>
              Summary
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>
              {data.summary}
            </p>
          </div>

          {/* Results Table */}
          {data.results && data.results.length > 0 && (
            <div className="p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#6B6B6B' }}>
                Email Results
              </h3>
              <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #E5E5E5' }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: '#FAFAFA' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B6B6B' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#FFFFFF' }}>
                    {data.results.map((result, index) => (
                      <tr key={index} className="border-t" style={{ borderColor: '#E5E5E5' }}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                            {result.name}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: '#6B6B6B' }}>
                            {result.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: '#6B6B6B' }}>
                            {result.role}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="px-2.5 py-1 rounded-full text-xs font-medium inline-block"
                              style={{
                                backgroundColor: result.success ? '#D1FAE5' : '#FEE2E2',
                                color: result.success ? '#065F46' : '#991B1B',
                              }}
                            >
                              {result.success ? 'Sent' : 'Failed'}
                            </div>
                            {result.error && (
                              <span className="text-xs" style={{ color: '#EF4444' }} title={result.error}>
                                ⓘ
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

