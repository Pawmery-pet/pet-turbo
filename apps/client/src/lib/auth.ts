import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

export const auth = betterAuth({
	// TODO: Configure database adapter later for microservices architecture
	// database: customAdapter(),
	emailAndPassword: {
		enabled: false,
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: "pawmery-pet",
					clientId: process.env.PAWMERY_PET_IDP_CLIENT_ID as string,
					clientSecret: process.env.PAWMERY_PET_IDP_CLIENT_SECRET as string,
					discoveryUrl: process.env.PAWMERY_PET_IDP_DISCOVERY_URL as string,
				},
			],
		}),
	],
	secret: process.env.BETTER_AUTH_SECRET as string,
	baseURL: process.env.BETTER_AUTH_URL as string,
	trustedOrigins: [process.env.BETTER_AUTH_URL as string],
});

export type Session = typeof auth.$Infer.Session;
