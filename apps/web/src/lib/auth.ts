import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";

export const Auth = {
	OIDC: {
		providerId: "pawmery-pet",
		clientId: process.env.PAWMERY_PET_IDP_CLIENT_ID as string,
		clientSecret: process.env.PAWMERY_PET_IDP_CLIENT_SECRET as string,
		discoveryUrl: process.env.PAWMERY_PET_IDP_DISCOVERY_URL as string,
	},
	Url: process.env.BETTER_AUTH_URL as string,
	TrustedOrigins:
		process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").filter((o) => !!o) ||
		[],
};

export const auth = betterAuth({
	// TODO: Configure database adapter later for microservices architecture
	// database: customAdapter(),
	emailAndPassword: {
		enabled: false,
	},
	plugins: [
		genericOAuth({
			config: [Auth.OIDC],
		}),
		nextCookies(),
	],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 7 * 24 * 60 * 60
		}
	},
	trustedOrigins: [Auth.Url, ...Auth.TrustedOrigins],
});

export type Session = typeof auth.$Infer.Session;
