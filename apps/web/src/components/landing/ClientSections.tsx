"use client";

import { NewsletterSection } from "./NewsletterSection";
import { PetTypesSection } from "./PetTypesSection";
import { VideoSection } from "./VideoSection";

export function ClientSections() {
	return (
		<>
			<PetTypesSection />
			<VideoSection />
			<NewsletterSection />
		</>
	);
}
