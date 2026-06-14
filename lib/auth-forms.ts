import { z } from "zod";

export const credentialsSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Enter your email.")
		.max(320, "Email is too long.")
		.refine(
			(s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
			"Invalid email format.",
		),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

export function firstZodIssueMessage(error: z.ZodError): string {
	return error.issues[0]?.message ?? "Invalid input.";
}

/** Výsledok `signIn` z Convex Auth (password / OAuth). */
export function classifySignInResult(
	result: unknown,
): "ok" | "redirect" | "pending" | "fail" {
	if (!result || typeof result !== "object") return "fail";
	const r = result as { signingIn?: boolean; redirect?: unknown };
	if (r.redirect !== undefined && r.redirect !== null) return "redirect";
	if (r.signingIn === true) return "ok";
	if (r.signingIn === false) return "pending";
	return "fail";
}
