import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DatabaseAdapter } from "./adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: DatabaseAdapter(),
	providers: [GitHub],
});
