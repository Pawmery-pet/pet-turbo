import { getSession } from "@/lib/auth-server";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";

export default async function Page() {
	const session = await getSession();
	const isLoggedIn = !!session?.user;
	const userEmail = session?.user?.email;

	return (
		<div>
			<Header isLoggedIn={isLoggedIn} userEmail={userEmail || undefined} />
			<HeroSection isLoggedIn={isLoggedIn} />
		</div>
	);
}
