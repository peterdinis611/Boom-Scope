"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { render } from "@react-email/render";
import { v } from "convex/values";
import type { ReactElement } from "react";
import { RegistrationWelcomeEmail } from "../emails/registration-welcome";
import {
	VerificationCodeEmail,
	type VerificationCodeKind,
} from "../emails/verification-code";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";
import { isMailerooEmailsEnabled } from "./authEmail";
import { sendMailerooEmail } from "./maileroo";

async function renderEmailTemplate(component: ReactElement) {
	const html = await render(component);
	const plain = await render(component, { plainText: true });
	return { html, plain };
}

const otpSubjects: Record<VerificationCodeKind, string> = {
	verify: "Overte svoj email – Boom Scope",
	reset: "Obnovenie hesla – Boom Scope",
};

export const deliverOtpEmail = internalAction({
	args: {
		to: v.string(),
		code: v.string(),
		kind: v.union(v.literal("verify"), v.literal("reset")),
	},
	handler: async (_ctx, args) => {
		const email = args.to.trim();
		if (!email) {
			throw new Error("Chýba emailová adresa príjemcu.");
		}

		const { html, plain } = await renderEmailTemplate(
			VerificationCodeEmail({ code: args.code, kind: args.kind }),
		);

		await sendMailerooEmail({
			to: email,
			subject: otpSubjects[args.kind],
			plain,
			html,
		});
	},
});

/** Po úspešnej registrácii — neblokuje prihlásenie pri zlyhaní odoslania. */
export const sendRegistrationWelcome = action({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		if (!isMailerooEmailsEnabled()) {
			return { sent: false as const, reason: "emails_disabled" };
		}

		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return { sent: false as const, reason: "unauthorized" };
		}

		const user = await ctx.runQuery(internal.emails.getUserById, { userId });
		const email = user?.email?.trim().toLowerCase();
		const requested = args.email.trim().toLowerCase();
		if (!user || !email || email !== requested) {
			return { sent: false as const, reason: "email_mismatch" };
		}

		const { html, plain } = await renderEmailTemplate(
			RegistrationWelcomeEmail({ name: user.name }),
		);

		try {
			await sendMailerooEmail({
				to: email,
				subject: "Registrácia úspešná – Boom Scope",
				plain,
				html,
			});
			return { sent: true as const };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Nepodarilo sa odoslať email.";
			return { sent: false as const, reason: message };
		}
	},
});
