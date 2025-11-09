import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import LoginButton from "@/components/LoginButton";
import AutoPMLogo from "@/components/AutoPMLogo";

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
          <div className="mb-8 flex justify-center">
            <AutoPMLogo size="lg" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
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
            <Icon icon="solar:lock-password-bold" width="14" height="14" />
            Secured by Auth0
          </p>
        </div>
      </div>
    </div>
  );
}