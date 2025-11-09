"use client";

import { useState } from "react";

export default function SettingsNav() {
  const [activeSection, setActiveSection] = useState('integrations');

  const handleClick = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white border p-4" style={{
      borderColor: 'var(--border)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <h3 style={{
        color: 'var(--text-primary)',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1rem'
      }}>
        Settings
      </h3>
      <div className="space-y-1">
        <button
          onClick={() => handleClick('integrations')}
          className="w-full text-left px-3 py-2 text-sm font-medium transition-colors"
          style={{
            color: activeSection === 'integrations' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: activeSection === 'integrations' ? 'var(--primary-bg)' : 'transparent',
            borderRadius: 'var(--radius)'
          }}
        >
          Integrations
        </button>
        <button
          onClick={() => handleClick('account')}
          className="w-full text-left px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
          style={{
            color: activeSection === 'account' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: activeSection === 'account' ? 'var(--primary-bg)' : 'transparent',
            borderRadius: 'var(--radius)'
          }}
        >
          Account
        </button>
      </div>
    </div>
  );
}
