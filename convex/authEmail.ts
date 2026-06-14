import { MailerooResetOTP, MailerooVerifyOTP } from "./mailerooOtp";

/** Zapnite až s vlastnou overenou doménou v Maileroo (nie sandbox *.maileroo.org). */
export function isEmailVerificationEnabled(): boolean {
	return process.env.AUTH_EMAIL_VERIFICATION === "true";
}

/** Uvítacie a ďalšie transakčné emaily — len s vlastnou doménou, nie sandbox. */
export function isMailerooEmailsEnabled(): boolean {
	return process.env.MAILEROO_EMAILS_ENABLED === "true";
}

export function getPasswordEmailProviders() {
	if (!isEmailVerificationEnabled()) {
		return {};
	}

	return {
		verify: MailerooVerifyOTP,
		reset: MailerooResetOTP,
	};
}
