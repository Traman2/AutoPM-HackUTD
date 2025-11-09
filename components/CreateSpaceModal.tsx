"use client";

import { useState } from "react";

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: (space: any) => void;
}

export default function CreateSpaceModal({ isOpen, onClose, onSpaceCreated }: CreateSpaceModalProps) {
  const [spaceName, setSpaceName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (spaceName.trim().length === 0) {
      setError("Space name is required");
      return;
    }
    
    if (problemStatement.trim().length < 10) {
      setError("Problem statement must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: spaceName.trim(),
          problemStatement: problemStatement.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create space');
      }

      const newSpace = await response.json();
      onSpaceCreated(newSpace);
      
      // Reset form
      setSpaceName("");
      setProblemStatement("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create space");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSpaceName("");
      setProblemStatement("");
      setError("");
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'modalEnter 200ms ease-out',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-8 pb-4 border-b" style={{ borderColor: '#E5E5E5' }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>Create New Product Space</h2>
            <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>Start a new AI-powered product workflow</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: '#6B6B6B' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444' }}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: '#991B1B' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Space Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Space Name
            </label>
            <input
              type="text"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="E.g., Mobile App Redesign"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-md text-sm border transition-all duration-200 focus:outline-none focus:ring-4"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5E5',
                color: '#1A1A1A',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#9B6B7A';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(155, 107, 122, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E5';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Problem Statement Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Problem Statement
            </label>
            <p className="text-xs mb-2" style={{ color: '#6B6B6B' }}>
              Describe the problem you want to solve (minimum 10 characters)
            </p>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Our users are experiencing difficulties with..."
              disabled={isSubmitting}
              rows={5}
              className="w-full px-4 py-2.5 rounded-md text-sm border transition-all duration-200 resize-y focus:outline-none focus:ring-4"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5E5',
                color: '#1A1A1A',
                lineHeight: '1.625',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#9B6B7A';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(155, 107, 122, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E5';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <div className="text-right mt-1">
              <span className="text-xs" style={{ color: problemStatement.length < 10 ? '#EF4444' : '#9CA3AF' }}>
                {problemStatement.length} characters
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: '#E5E5E5' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-semibold text-sm border transition-all duration-200"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#E5E5E5',
                color: '#1A1A1A',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F7';
                e.currentTarget.style.borderColor = '#D4D4D4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#E5E5E5';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || spaceName.trim().length === 0 || problemStatement.trim().length < 10}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#9B6B7A' }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#8A5A69';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#9B6B7A';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Create Space
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

