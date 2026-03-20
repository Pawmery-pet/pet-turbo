import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { PetOnboardingPage } from "./pet-onboarding-page";

export default async function PetOnboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/");
  const userId = session.user.uid;
  return <PetOnboardingPage userId={userId} />;
}
