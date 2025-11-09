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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(155, 107, 122, 0.1)' }}>
              <svg className="w-8 h-8" style={{ color: '#9B6B7A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2" style={{ color: '#1A1A1A' }}>Welcome</h1>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>Sign in to access your product workspace</p>
        </div>

        <div className="space-y-4">
          <LoginButton />
        </div>

        <div className="mt-8 text-center text-xs" style={{ color: '#9CA3AF' }}>
          <p>Secure authentication powered by Auth0</p>
        </div>
      </div>
    </div>
  );
}