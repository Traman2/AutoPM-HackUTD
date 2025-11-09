"use client";

export default function LoginButton() {
  return (
    <a
      href="/auth/login"
      className="w-full block text-center text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
      style={{ 
        backgroundColor: '#9B6B7A'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#8A5A69';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#9B6B7A';
      }}
    >
      Sign in with Auth0
    </a>
  );
}
