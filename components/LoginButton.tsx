"use client";

import { Icon } from "@iconify/react";

export default function LoginButton() {
  return (
    <a
      href="/auth/login"
      className="group w-full flex items-center justify-center gap-3 text-white font-medium py-3 px-6 transition-all duration-200 relative overflow-hidden"
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
      <Icon icon="solar:lock-keyhole-bold" width="20" height="20" />
      Continue with Auth0
    </a>
  );
}
