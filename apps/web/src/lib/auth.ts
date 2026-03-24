import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { getAccountCookie } from "better-auth/cookies";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";

const userSyncBaseUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "http://localhost:3010";

async function syncUserFromIdToken(idToken: string) {
  const response = await fetch(`${userSyncBaseUrl.replace(/\/$/, "")}/users/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`User sync failed: ${response.status} ${body}`);
  }
}

const authentikUserSyncPlugin = {
  id: "authentik-user-sync",
  hooks: {
    after: [
      {
        matcher(ctx: { path?: string }) {
          return ctx.path?.startsWith("/oauth2/callback/") ?? false;
        },
        handler: createAuthMiddleware(async (ctx) => {
          if (!ctx.context.newSession) {
            return;
          }

          const account = await getAccountCookie(ctx);
          const idToken =
            typeof account?.idToken === "string" && account.idToken.trim()
              ? account.idToken.trim()
              : null;

          if (!idToken) {
            return;
          }

          await syncUserFromIdToken(idToken);
        }),
      },
    ],
  },
};

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
  account: {
    storeAccountCookie: true,
  },
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
    authentikUserSyncPlugin,
  ],
  trustedOrigins: [Auth.Url, ...Auth.TrustedOrigins],
});

export type Session = typeof auth.$Infer.Session;
