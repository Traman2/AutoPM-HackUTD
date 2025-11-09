import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage() {
  const session = await auth0.getSession();

  // If already logged in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br opacity-5" style={{
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl opacity-5" style={{
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
      </div>

      {/* Login Card */}
      <div className="relative bg-white p-10 max-w-md w-full border" style={{
        borderRadius: 'var(--radius-lg)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-14 h-14 mx-auto flex items-center justify-center" style={{
              backgroundColor: 'var(--primary-bg)',
              borderRadius: 'var(--radius)'
            }}>
              <svg className="w-7 h-7" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue to your workspace
          </p>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <LoginButton />
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--border-secondary)' }}>
          <p className="text-xs flex items-center justify-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secured by Auth0
          </p>
        </div>
      </div>
    </div>
  );
}