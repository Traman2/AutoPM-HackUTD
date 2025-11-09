"use client";

export default function LoginButton() {
  return (
    <a
      href="/auth/login"
      className="group w-full flex items-center justify-center gap-3 text-white font-medium py-3 px-6 transition-all duration-200 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--primary)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)'
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
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.09 4.56c-.7-1.03-1.53-1.95-2.48-2.72l-1.41.94c.82.66 1.54 1.46 2.14 2.35.6.89 1.05 1.86 1.33 2.88l1.54-.46c-.33-1.21-.84-2.36-1.54-3.4l.42-.59zm-2.95 5.94c.48 1.33.73 2.75.73 4.21 0 6.63-5.37 12-12 12V24c7.73 0 14-6.27 14-14 0-1.57-.26-3.08-.78-4.5l-1.95.5zM2.91 4.56l-.42-.59C1.79 5.43 1.28 6.58.95 7.79l1.54.46c.28-1.02.73-1.99 1.33-2.88.6-.89 1.32-1.69 2.14-2.35l-1.41-.94c-.95.77-1.78 1.69-2.48 2.72l-.16.76zM12 2C9.79 2 7.7 2.68 6 3.86l1.42 1.42C8.63 4.47 10.26 4 12 4c5.52 0 10 4.48 10 10h2c0-6.63-5.37-12-12-12z"/>
      </svg>
      Continue with Auth0
    </a>
  );
}
