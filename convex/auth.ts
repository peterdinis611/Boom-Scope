import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { getPasswordEmailProviders } from "./authEmail";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Password({
			...getPasswordEmailProviders(),
			profile(params) {
				const raw = params.email;
				if (raw === undefined || raw === null) {
					throw new ConvexError("Email is missing.");
				}
				const email = typeof raw === "string" ? raw.trim() : "";
				if (!email) {
					throw new ConvexError("Email is required.");
				}
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
					throw new ConvexError("Invalid email format.");
				}
				return { email };
			},
			validatePasswordRequirements(password: string) {
				if (password.length < 8) {
					throw new ConvexError("Password must be at least 8 characters.");
				}
			},
		}),
	],
});
