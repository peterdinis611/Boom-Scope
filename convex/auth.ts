import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Password({
			profile(params) {
				const raw = params.email;
				if (raw === undefined || raw === null) {
					throw new ConvexError("Chýba email.");
				}
				const email = typeof raw === "string" ? raw.trim() : "";
				if (!email) {
					throw new ConvexError("Email je povinný.");
				}
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
					throw new ConvexError("Neplatný formát emailu.");
				}
				return { email };
			},
			validatePasswordRequirements(password: string) {
				if (password.length < 8) {
					throw new ConvexError("Heslo musí mať aspoň 8 znakov.");
				}
			},
		}),
	],
});
