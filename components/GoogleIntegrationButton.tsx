"use client";

import { useState } from "react";

interface GoogleIntegrationButtonProps {
  isConnected: boolean;
}

export default function GoogleIntegrationButton({ isConnected }: GoogleIntegrationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    window.location.href = '/api/integrations/google/authorize';
  };

  if (isConnected) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed"
        style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
      >
        Connected
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
      style={{ backgroundColor: '#9B6B7A' }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#8A5A69';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#9B6B7A';
        }
      }}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </span>
      ) : (
        'Connect'
      )}
    </button>
  );
}