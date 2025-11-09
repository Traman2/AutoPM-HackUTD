import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { syncUserToDatabase } from "@/lib/syncUser";

export default async function DashboardPage() {
  const session = await auth0.getSession();
  const user = session?.user;

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Sync user to MongoDB (only creates if doesn't exist)
  try {
    const { user: dbUser, isNewUser } = await syncUserToDatabase();
    if (isNewUser) {
      console.log(`New user registered: ${dbUser?.email}`);
    }
  } catch (error) {
    console.error('Failed to sync user to database:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user details in top right */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            {/* User details in top right */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                )}
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">You are successfully authenticated with Auth0.</p>
          </div>

          {/* User info card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-600">{user.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-600">{user.email}</span>
              </div>
              {user.nickname && (
                <div>
                  <span className="font-medium text-gray-700">Nickname:</span>
                  <span className="ml-2 text-gray-600">{user.nickname}</span>
                </div>
              )}
            </div>
          </div>

          {/* Placeholder card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h2>
            <p className="text-gray-600">Your dashboard content goes here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}