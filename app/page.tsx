'use client';

import Link from 'next/link';

export default function DashboardPage() {
  const pages = [
    { name: 'Wireframe Generator', href: '/wireframe', description: 'Generate wireframes from descriptions' },
    { name: 'OKR', href: '/okr', description: 'Objectives and Key Results' },
    { name: 'RICE', href: '/rice', description: 'RICE prioritization framework' },
    { name: 'Search', href: '/search', description: 'Search functionality' },
    { name: 'Story', href: '/story', description: 'User stories' },
    { name: 'Orchestrator', href: '/orchestrator', description: 'Agent orchestrator' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600">Select a tool to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{page.name}</h2>
              <p className="text-gray-600 text-sm">{page.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
