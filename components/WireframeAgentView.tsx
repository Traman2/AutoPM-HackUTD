'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Download, Code, ChevronDown, ChevronUp } from 'lucide-react';

interface WireframePage {
  name: string;
  description: string;
  html: string;
}

interface WireframeAgentData {
  pages?: WireframePage[];
  generatedAt?: string;
}

interface WireframeAgentViewProps {
  spaceId: string;
  selectedSolution: string | null;
  wireframeAgentData?: WireframeAgentData;
}

export default function WireframeAgentView({
  spaceId,
  selectedSolution,
  wireframeAgentData,
}: WireframeAgentViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);

  // Pages are retrieved from MongoDB - each contains HTML as a string
  const hasWireframes = wireframeAgentData?.pages && wireframeAgentData.pages.length > 0;
  const pages = wireframeAgentData?.pages || []; // Array of {name, description, html}
  const currentPage = hasWireframes && pages[currentPageIndex] ? pages[currentPageIndex] : null;

  // Debug logging
  console.log('[WireframeAgentView] Render - hasWireframes:', hasWireframes);
  console.log('[WireframeAgentView] Render - pages count:', pages.length);
  console.log('[WireframeAgentView] Render - currentPageIndex:', currentPageIndex);
  console.log('[WireframeAgentView] Render - currentPage:', currentPage ? `${currentPage.name} (${currentPage.html?.length || 0} chars)` : 'null');

  const handleGenerate = async () => {
    console.log('[WireframeAgentView] Starting wireframe generation...');
    console.log('[WireframeAgentView] Space ID:', spaceId);
    console.log('[WireframeAgentView] Selected Solution:', selectedSolution?.substring(0, 100));
    
    if (!selectedSolution) {
      setError('Please complete Step 1 and select a solution first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('[WireframeAgentView] Calling API:', `/api/spaces/${spaceId}/run-wireframe-agent`);
      
      const response = await fetch(`/api/spaces/${spaceId}/run-wireframe-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[WireframeAgentView] Response status:', response.status);
      const data = await response.json();
      console.log('[WireframeAgentView] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate wireframes');
      }

      console.log('[WireframeAgentView] Success! Reloading to show wireframes...');
      // Reload the page to show the new wireframes and updated step
      window.location.reload();
    } catch (err) {
      console.error('[WireframeAgentView] Error generating wireframes:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPage = () => {
    if (!currentPage) return;

    const blob = new Blob([currentPage.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (!hasWireframes || !pages.length) return;

    pages.forEach((page) => {
      const blob = new Blob([page.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${page.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const toggleCodeView = () => {
    setShowCode(!showCode);
  };

  // If no wireframes generated yet
  if (!hasWireframes) {
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Generation Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm text-center" style={{ border: '1px solid #E5E5E5' }}>
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(155, 107, 122, 0.08)' }}
          >
            <Sparkles className="w-8 h-8" style={{ color: '#9B6B7A' }} />
          </div>

          <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1A1A' }}>
            Generate Wireframe Designs
          </h3>

          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: '#6B6B6B' }}>
            Our AI will create multiple beautiful, modern HTML wireframes for your product, including landing pages, dashboards, and feature-specific screens.
          </p>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedSolution}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all duration-200"
            style={{
              backgroundColor: isGenerating || !selectedSolution ? '#D1D5DB' : '#9B6B7A',
              cursor: isGenerating || !selectedSolution ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isGenerating && selectedSolution) {
                e.currentTarget.style.backgroundColor = '#8A5A69';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isGenerating && selectedSolution) {
                e.currentTarget.style.backgroundColor = '#9B6B7A';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Wireframes...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Wireframes
              </>
            )}
          </button>

          {!selectedSolution && (
            <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
              Please complete Step 1 and select a solution first
            </p>
          )}
        </div>
      </div>
    );
  }

  // Wireframes have been generated
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
              Wireframe Designs
            </h3>
            <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>
              {pages.length} pages generated • Click tabs to switch between pages
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
              style={{
                border: '1px solid #E5E5E5',
                backgroundColor: 'white',
                color: '#1A1A1A',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F7';
                e.currentTarget.style.borderColor = '#D4D4D4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#E5E5E5';
              }}
            >
              <Download className="w-4 h-4" />
              Download This Page
            </button>

            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
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
              <Download className="w-4 h-4" />
              Download All Pages
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-t-lg shadow-sm" style={{ border: '1px solid #E5E5E5', borderBottom: 'none' }}>
        <div className="flex overflow-x-auto" style={{ borderBottom: '2px solid #E5E5E5' }}>
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => setCurrentPageIndex(index)}
              className="px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 relative"
              style={{
                color: index === currentPageIndex ? '#9B6B7A' : '#6B6B6B',
                backgroundColor: index === currentPageIndex ? 'rgba(155, 107, 122, 0.04)' : 'transparent',
              }}
            >
              {page.name}
              {index === currentPageIndex && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: '#9B6B7A' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Section */}
      {currentPage && (
        <div className="bg-white rounded-b-lg shadow-sm" style={{ border: '1px solid #E5E5E5', borderTop: 'none' }}>
          <div className="p-4 border-b" style={{ borderColor: '#E5E5E5' }}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                  {currentPage.name}
                </h4>
                <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>
                  {currentPage.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                <span>{(currentPage.html.length / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          </div>

          {/* Iframe Preview - renders HTML string from MongoDB */}
          <div className="relative" style={{ height: '600px', backgroundColor: '#F5F5F7' }}>
            {currentPage.html && currentPage.html.length > 0 ? (
              <iframe
                srcDoc={currentPage.html} // HTML string pulled from MongoDB
                className="w-full h-full"
                title={`Preview of ${currentPage.name}`}
                sandbox="allow-same-origin allow-scripts"
                style={{ border: 'none' }}
                onLoad={() => console.log('[WireframeAgentView] Iframe loaded successfully for:', currentPage.name)}
                onError={(e) => console.error('[WireframeAgentView] Iframe error:', e)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: '#6B6B6B' }}>
                    No HTML content available
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                    HTML length: {currentPage.html?.length || 0} characters
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* HTML Code Section */}
          <div className="border-t" style={{ borderColor: '#E5E5E5' }}>
            <button
              onClick={toggleCodeView}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" style={{ color: '#9B6B7A' }} />
                <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                  {showCode ? 'Hide' : 'View'} HTML Code
                </span>
              </div>
              {showCode ? (
                <ChevronUp className="w-4 h-4" style={{ color: '#6B6B6B' }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: '#6B6B6B' }} />
              )}
            </button>

            {showCode && (
              <div className="p-4 bg-gray-50 border-t" style={{ borderColor: '#E5E5E5' }}>
                {currentPage.html && currentPage.html.length > 0 ? (
                  <pre className="text-xs overflow-x-auto max-h-96 p-4 bg-gray-900 rounded-lg" style={{ color: '#E5E5E5' }}>
                    <code>{currentPage.html}</code>
                  </pre>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      No HTML content found for this page.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentPage.html);
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200"
                  style={{
                    border: '1px solid #E5E5E5',
                    backgroundColor: 'white',
                    color: '#1A1A1A',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step Complete Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-semibold text-green-900 mb-1">
                Wireframes Generated Successfully!
              </h4>
              <p className="text-sm text-green-700">
                All wireframes have been generated. Preview them above, download pages, or continue to the next step to create Jira tickets.
              </p>
            </div>
          </div>
          <a
            href={`/space/${spaceId}?step=7`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap shrink-0"
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
            Continue to Jira
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

