const MAILEROO_API_URL = "https://smtp.maileroo.com/api/v2/emails";

type SendMailerooEmailArgs = {
	to: string;
	subject: string;
	plain: string;
	html?: string;
};

function normalizeRecipient(email: string): string {
	return email.trim().toLowerCase();
}

export async function sendMailerooEmail({
	to,
	subject,
	plain,
	html,
}: SendMailerooEmailArgs) {
	const apiKey = process.env.MAILEROO_API_KEY;
	const fromEmail = process.env.MAILEROO_FROM_EMAIL;
	const fromName = process.env.MAILEROO_FROM_NAME ?? "Boom Scope";

	if (!apiKey) {
		throw new Error("Chýba MAILEROO_API_KEY v Convex prostredí.");
	}
	if (!fromEmail) {
		throw new Error("Chýba MAILEROO_FROM_EMAIL v Convex prostredí.");
	}

	const recipient = normalizeRecipient(to);
	if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
		throw new Error(`Neplatná emailová adresa príjemcu: "${to}"`);
	}

	const response = await fetch(MAILEROO_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			from: {
				address: fromEmail,
				display_name: fromName,
			},
			to: {
				address: recipient,
			},
			subject,
			plain,
			html:
				html ??
				`<div style="font-family:sans-serif;line-height:1.6">${plain.replace(/\n/g, "<br>")}</div>`,
			tracking: false,
		}),
	});

	const result = (await response.json()) as {
		success?: boolean;
		message?: string;
	};

	if (!response.ok || !result.success) {
		throw new Error(
			result.message ?? `Maileroo API chyba (${response.status}).`,
		);
	}
}
