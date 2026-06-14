import { MailerooResetOTP, MailerooVerifyOTP } from "./mailerooOtp";

/** Email OTP verification — disabled for now. Set AUTH_EMAIL_VERIFICATION=true to re-enable. */
export function isEmailVerificationEnabled(): boolean {
	return false;
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
