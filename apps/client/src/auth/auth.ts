import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DatabaseAdapter } from "./adapter";
import { Provider } from "next-auth/providers";

const customProvider: Provider ={
	id: "pet-authentik", // signIn("my-provider") and will be part of the callback URL
	name: "Pet Identity Provider", // optional, used on the default login page as the button text.
	type: "oidc", // or "oauth" for OAuth 2 providers
	issuer: "http://localhost:9000/application/o/pet-client/", // to infer the .well-known/openid-configuration URL
	clientId: "3opWisjIEthY9c1tpB5jM75RH0nBzMKYdUrsL6jj", // from the provider's dashboard
	clientSecret: "fVMlB04MVaK1j1VGJVdU2Cv5XLWBo4oHYXAjH2CUrzk2R3sFfG1b7vLN58SCEhk2lFrHDaD9hVFmaA4AvNIYthS4vrfBBI73ETO4PEgxqwinbz1YnUX6M1Y0TDzqTqaL", // from the provider's dashboard
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: DatabaseAdapter(),
	providers: [
		GitHub,
		customProvider,
	],
});
