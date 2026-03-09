import { getSession } from "@/lib/auth-server";
import { PetOnboardingPage } from "./pet-onboarding-page";

export default async function PetOnboardPage() {
	const session = await getSession();
	const userId = session!.user.id;
	return <PetOnboardingPage userId={userId} />;
}
