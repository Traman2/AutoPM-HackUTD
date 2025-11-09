"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import CreateSpaceModal from "./CreateSpaceModal";
import ProfileDropdown from "./ProfileDropdown";
import AutoPMLogo from "./AutoPMLogo";

interface Space {
  _id: string;
  name: string;
  problemStatement: string;
  createdAt: string;
  currentStep: number;
  completed: boolean;
}

interface DashboardClientProps {
  user: any;
  initialSpaces: Space[];
}

export default function DashboardClient({ user, initialSpaces }: DashboardClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);

  const handleSpaceCreated = (newSpace: Space) => {
    setSpaces([newSpace, ...spaces]);
    setIsCreateModalOpen(false);
  };

  const totalSteps = 6;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top Navigation Bar */}
      <header className="bg-white border-b sticky top-0 z-40" style={{
        borderColor: 'var(--border)',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-6">
            <AutoPMLogo size="sm" />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <ProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 style={{
            color: 'var(--text-primary)',
            fontSize: '2rem',
            fontWeight: '600',
            letterSpacing: '-0.015em',
            marginBottom: '0.5rem'
          }}>
            Spaces
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            lineHeight: '1.6',
            maxWidth: '600px'
          }}>
            Each space represents a complete product development workflow—from ideation to execution. Create a new space to start building with AI-powered agents.
          </p>
        </div>

        {/* Space Grid */}
        {spaces.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 flex items-center justify-center mb-6" style={{
              backgroundColor: 'var(--primary-bg)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <Icon icon="solar:folder-with-files-bold-duotone" width="48" height="48" style={{ color: 'var(--primary)' }} />
            </div>
            <h2 style={{
              color: 'var(--text-primary)',
              fontSize: '1.25rem',
              fontWeight: '600',
              letterSpacing: '-0.005em',
              marginBottom: '0.5rem'
            }}>
              No spaces yet
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: '1.6',
              maxWidth: '480px',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Get started by creating your first space. Define a problem statement and let AI agents guide you through ideation, planning, and execution.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all duration-200"
              style={{
                backgroundColor: 'var(--primary)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)',
                fontSize: '1rem',
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Icon icon="solar:add-circle-bold" width="20" height="20" />
              Create Your First Space
            </button>

            {/* Feature Highlights */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center" style={{
                  backgroundColor: 'var(--primary-bg)',
                  borderRadius: 'var(--radius)'
                }}>
                  <Icon icon="solar:lightbulb-bolt-bold-duotone" width="20" height="20" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
                }}>
                  AI-Powered Ideation
                </h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  lineHeight: '1.5'
                }}>
                  Generate solutions with context-aware AI
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center" style={{
                  backgroundColor: 'var(--primary-bg)',
                  borderRadius: 'var(--radius)'
                }}>
                  <Icon icon="solar:widget-5-bold-duotone" width="20" height="20" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
                }}>
                  Automated Workflows
                </h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  lineHeight: '1.5'
                }}>
                  From planning to execution in one flow
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center" style={{
                  backgroundColor: 'var(--primary-bg)',
                  borderRadius: 'var(--radius)'
                }}>
                  <Icon icon="solar:users-group-two-rounded-bold-duotone" width="20" height="20" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
                }}>
                  Team Collaboration
                </h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  lineHeight: '1.5'
                }}>
                  Seamless integration with your tools
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Create Space Card */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white p-6 border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center min-h-[240px] group"
              style={{
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = 'var(--primary-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <div className="w-11 h-11 flex items-center justify-center mb-3 transition-colors" style={{
                backgroundColor: 'var(--primary-bg)',
                borderRadius: 'var(--radius)'
              }}>
                <Icon icon="solar:add-square-bold-duotone" width="20" height="20" style={{ color: 'var(--primary)' }} />
              </div>
              <span className="font-medium mb-1" style={{
                color: 'var(--text-primary)',
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
              }}>New Space</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Start a new workflow</span>
            </button>

            {/* Space Cards */}
            {spaces.map((space) => {
              const completedSteps = space.currentStep - 1;

              return (
                <Link
                  key={space._id}
                  href={`/space/${space._id}`}
                  className="bg-white p-6 border transition-all duration-200 group"
                  style={{
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="mb-4">
                    <h3 className="text-base font-semibold mb-1 line-clamp-1 tracking-tight" style={{
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em'
                    }}>
                      {space.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(space.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <p className="text-sm mb-5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {space.problemStatement}
                  </p>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                      {space.completed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium" style={{
                          color: 'var(--success)',
                          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
                        }}>
                          <Icon icon="solar:check-circle-bold" width="12" height="12" />
                          Complete
                        </span>
                      ) : (
                        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                          {completedSteps} / {totalSteps}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 transition-all duration-300"
                          style={{
                            backgroundColor: space.completed
                              ? 'var(--success)'
                              : i < completedSteps
                              ? 'var(--primary)'
                              : i === completedSteps
                              ? 'var(--warning)'
                              : 'var(--border-secondary)',
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {space.completed && (
                    <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium" style={{
                      backgroundColor: 'var(--success-bg)',
                      color: 'var(--success)',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      <div className="w-1.5 h-1.5" style={{
                        backgroundColor: 'var(--success)',
                        borderRadius: 'var(--radius-full)'
                      }} />
                      Completed
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Space Modal */}
      <CreateSpaceModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSpaceCreated={handleSpaceCreated}
      />
    </div>
  );
}

