import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  // Redirect based on authentication status
  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}