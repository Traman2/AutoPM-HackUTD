import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/syncUser";
import SettingsContent from "@/components/SettingsContent";

export default async function SettingsPage() {
  const session = await auth0.getSession();
  const user = session?.user;

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Get current user with integration status
  const dbUser = await getCurrentUser();

  const isJiraConnected = !!(dbUser?.jiraAuth?.cloudId);
  const isRedditConnected = !!(dbUser?.redditAuth?.tokenExpiry);
  const isGoogleConnected = !!(dbUser?.googleAuth?.tokenExpiry);

  return (
    <SettingsContent 
      user={user}
      isJiraConnected={isJiraConnected}
      isRedditConnected={isRedditConnected}
      isGoogleConnected={isGoogleConnected}
    />
  );
}

