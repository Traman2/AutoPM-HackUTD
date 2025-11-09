import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { syncUserToDatabase } from "@/lib/syncUser";
import DashboardClient from "@/components/DashboardClient";
import connectDB from "@/lib/mongodb";
import Space from "@/models/Space";

export default async function DashboardPage() {
  const session = await auth0.getSession();
  const user = session?.user;

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Sync user to MongoDB (only creates if doesn't exist)
  try {
    const { user: syncedUser, isNewUser } = await syncUserToDatabase();
    if (isNewUser) {
      console.log(`New user registered: ${syncedUser?.email}`);
    }
  } catch (error) {
    console.error('Failed to sync user to database:', error);
  }

  // Fetch spaces from MongoDB
  let spaces: any[] = [];
  try {
    await connectDB();
    const spacesData = await Space.find({ userId: user.sub })
      .sort({ createdAt: -1 })
      .lean();
    
    // Convert MongoDB objects to plain objects and serialize dates
    spaces = spacesData.map((space: any) => ({
      ...space,
      _id: space._id.toString(),
      createdAt: space.createdAt.toISOString(),
      updatedAt: space.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch spaces:', error);
  }

  return <DashboardClient user={user} initialSpaces={spaces} />;
}
