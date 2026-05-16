import { z } from "zod";

export const credentialsSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Zadajte email.")
		.max(320, "Email je príliš dlhý.")
		.refine(
			(s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
			"Neplatný formát emailu.",
		),
	password: z.string().min(8, "Heslo musí mať aspoň 8 znakov."),
});

export function firstZodIssueMessage(error: z.ZodError): string {
	return error.issues[0]?.message ?? "Neplatné údaje.";
}

/** Výsledok `signIn` z Convex Auth (password / OAuth). */
export function classifySignInResult(
	result: unknown,
): "ok" | "redirect" | "fail" {
	if (!result || typeof result !== "object") return "fail";
	const r = result as { signingIn?: boolean; redirect?: unknown };
	if (r.redirect !== undefined && r.redirect !== null) return "redirect";
	if (r.signingIn === true) return "ok";
	return "fail";
}
