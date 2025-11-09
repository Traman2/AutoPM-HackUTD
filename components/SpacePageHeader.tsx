"use client";

import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";
import { MessageCircle } from "lucide-react";

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
}

export default function SpacePageHeader({ user, space, totalSteps, onOpenChatbot }: SpacePageHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: '#6B6B6B' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          {/* AI Chatbot Button - only show when space has some progress */}
          {space.currentStep > 0 && onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200"
              style={{ backgroundColor: '#9B6B7A' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8A5A69';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9B6B7A';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <MessageCircle className="w-4 h-4" />
              AI Assistant
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{space.name}</p>
              {space.completed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: '#6B6B6B' }}>
              {space.completed ? 'All steps completed' : `Step ${space.currentStep} of ${totalSteps}`}
            </p>
          </div>
          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
}

