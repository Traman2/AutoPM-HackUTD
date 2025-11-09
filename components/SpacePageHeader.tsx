"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import ProfileDropdown from "./ProfileDropdown";

interface User {
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
  sub?: string;
}

interface Space {
  _id: string;
  name: string;
  currentStep: number;
  completed: boolean;
}

interface SpacePageHeaderProps {
  user: User;
  space: Space;
  totalSteps: number;
  onOpenChatbot?: () => void;
  onOpenMarketSearch?: () => void;
}

export default function SpacePageHeader({ user, space, totalSteps, onOpenChatbot, onOpenMarketSearch }: SpacePageHeaderProps) {
  return (
    <header className="bg-white border-b" style={{
      borderColor: 'var(--border)',
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)'
    }}>
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Icon icon="solar:alt-arrow-left-linear" width="16" height="16" />
            Back
          </Link>

          {/* AI Chatbot Button - only show when space has some progress */}
          {space.currentStep > 0 && onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200"
              style={{
                backgroundColor: 'var(--primary)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Icon icon="solar:chat-round-dots-bold" width="16" height="16" />
              AI Assistant
            </button>
          )}

          {/* Market Search Button - only show when space has some progress */}
          {space.currentStep > 0 && onOpenMarketSearch && (
            <button
              onClick={onOpenMarketSearch}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200"
              style={{
                backgroundColor: '#2563EB',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Icon icon="solar:graph-new-bold-duotone" width="16" height="16" />
              Market Search
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <p className="text-sm font-medium tracking-tight" style={{
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em'
              }}>
                {space.name}
              </p>
              {space.completed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium" style={{
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success)',
                  borderRadius: 'var(--radius-full)',
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
                }}>
                  <Icon icon="solar:check-circle-bold" width="12" height="12" />
                  Complete
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {space.completed ? 'All steps completed' : `Step ${space.currentStep} of ${totalSteps}`}
            </p>
          </div>
          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
}

