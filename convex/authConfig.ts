import { query } from "./_generated/server";
import {
	isEmailVerificationEnabled,
	isMailerooEmailsEnabled,
} from "./authEmail";

export const emailVerificationEnabled = query({
	args: {},
	handler: async () => isEmailVerificationEnabled(),
});

export const transactionalEmailsEnabled = query({
	args: {},
	handler: async () => isMailerooEmailsEnabled(),
});
