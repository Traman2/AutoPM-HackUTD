"use client";

import { Icon } from '@iconify/react';

interface AutoPMLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function AutoPMLogo({ size = 'md', showText = true, className = '' }: AutoPMLogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl' }
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Icon
        icon="ri:apps-ai-fill"
        width={iconSizes[size]}
        height={iconSizes[size]}
        className="text-gradient-blue"
        style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      />
      {showText && (
        <span
          className={`font-display font-bold tracking-tight text-gradient-blue ${sizes[size].text}`}
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
          }}
        >
          AutoPM
        </span>
      )}
    </div>
  );
}
