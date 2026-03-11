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
  session: {
    cookieCache: {
      // Store session in a signed cookie — no DB lookup on each request.
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  },
  user: {
    additionalFields: {
      uid: {
        type: "string",
      },
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          ...Auth.OIDC,
          mapProfileToUser: async (profile) => {
            return {
              uid: profile.id,
              email: profile.email as string,
              name: profile.name,
              emailVerified: profile.email_verified,
            };
          },
        },
      ],
    }),
    nextCookies(),
  ],
  trustedOrigins: [Auth.Url, ...Auth.TrustedOrigins],
});

export type Session = typeof auth.$Infer.Session;
