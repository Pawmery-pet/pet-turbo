import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { PetOnboardingPage } from "./pet-onboarding-page";

export default async function PetOnboardPage() {
	const session = await getSession();
	if (!session?.user?.id) redirect("/");
	const userId = session.user.id;
	return <PetOnboardingPage userId={userId} />;
}
