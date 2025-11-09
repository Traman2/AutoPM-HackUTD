"use client";

import Link from "next/link";
import { useState } from "react";

interface SpaceStepLinkProps {
  spaceId: string;
  stepNumber: number;
  isClickable: boolean;
  isActiveView: boolean;
  isPending: boolean;
  isCompleted: boolean;
  stepName: string;
  stepIcon: React.ReactNode;
}

export default function SpaceStepLink({
  spaceId,
  stepNumber,
  isClickable,
  isActiveView,
  isPending,
  isCompleted,
  stepName,
  stepIcon,
}: SpaceStepLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={isClickable ? `/space/${spaceId}?step=${stepNumber}` : '#'}
      className={`block w-full text-left px-3 py-2.5 transition-all ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      style={{
        backgroundColor: isActiveView ? 'var(--primary-bg)' : isPending ? 'var(--background)' : 'var(--background-secondary)',
        border: `1px solid ${isActiveView ? 'var(--primary)' : isHovered && isClickable && !isActiveView ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        {/* Step Icon */}
        <div
          className="w-7 h-7 flex items-center justify-center shrink-0 transition-all"
          style={{
            backgroundColor: isCompleted ? 'var(--success)' : isActiveView ? 'var(--primary)' : 'var(--background)',
            color: isCompleted || isActiveView ? '#FFFFFF' : 'var(--text-tertiary)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          {isCompleted && !isActiveView ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="scale-75">{stepIcon}</div>
          )}
        </div>

        {/* Step Name */}
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium"
            style={{
              color: isPending ? 'var(--text-tertiary)' : 'var(--text-primary)',
            }}
          >
            {stepName}
          </p>
        </div>
      </div>
    </Link>
  );
}
