import type { EmailConfig } from "@convex-dev/auth/server";
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";
import type { VerificationCodeKind } from "../emails/verification-code";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";

type SendVerificationRequest = NonNullable<
	EmailConfig["sendVerificationRequest"]
>;
type SendVerificationParams = Parameters<SendVerificationRequest>[0];

type OtpProviderConfig = {
	id: string;
	kind: VerificationCodeKind;
};

function createOtpProvider(config: OtpProviderConfig): EmailConfig {
	const sendVerificationRequest = async (
		params: SendVerificationParams,
		ctx: ActionCtx,
	) => {
		const email = params.identifier.trim();
		if (!email) {
			throw new Error("Recipient email address is missing when sending OTP.");
		}

		await ctx.runAction(internal.emailsNode.deliverOtpEmail, {
			to: email,
			code: params.token,
			kind: config.kind,
		});
	};

	return {
		id: config.id,
		type: "email",
		name: "Maileroo",
		from: process.env.MAILEROO_FROM_EMAIL ?? "noreply@maileroo.org",
		maxAge: 60 * 15,
		async generateVerificationToken() {
			const random: RandomReader = {
				read(bytes) {
					crypto.getRandomValues(bytes);
				},
			};
			return generateRandomString(random, "0123456789", 8);
		},
		sendVerificationRequest:
			sendVerificationRequest as unknown as SendVerificationRequest,
		options: config,
	};
}

export const MailerooVerifyOTP = createOtpProvider({
	id: "maileroo-verify",
	kind: "verify",
});

export const MailerooResetOTP = createOtpProvider({
	id: "maileroo-reset",
	kind: "reset",
});
