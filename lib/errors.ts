import { toast } from "sonner";

export type FriendlyError = {
	title: string;
	description: string;
	hint?: string;
	technicalMessage: string;
};

export type ErrorReport = {
	message: string;
	digest?: string;
	stack?: string;
	url: string;
	userAgent: string;
	timestamp: string;
	appVersion: string;
	environment: string;
	sessionDuration: number;
	referrer: string;
	viewport: string;
	memoryMB?: number;
};

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return "Unexpected error";
}

export function toFriendlyError(
	error: unknown,
	digest?: string,
): FriendlyError {
	const technicalMessage = getErrorMessage(error);
	const msg = technicalMessage.toLowerCase();

	if (
		msg.includes("chunk") ||
		msg.includes("loading chunk") ||
		msg.includes("dynamically imported module")
	) {
		return {
			title: "App was updated",
			description:
				"Page loading failed due to a new version. Refresh the page and try again.",
			hint: "If the problem persists, clear your browser cache.",
			technicalMessage,
		};
	}

	if (
		msg.includes("failed to fetch") ||
		msg.includes("networkerror") ||
		msg.includes("network request failed") ||
		msg.includes("load failed")
	) {
		return {
			title: "Connection problem",
			description:
				"Could not connect to the server. Check your internet connection.",
			hint: "Try refreshing the page in a moment.",
			technicalMessage,
		};
	}

	if (
		msg.includes("unauthorized") ||
		msg.includes("not authenticated") ||
		msg.includes("unauthenticated")
	) {
		return {
			title: "Session expired",
			description:
				"Your login expired or you are not signed in. Please sign in again.",
			hint: "Your unsaved changes may not be saved.",
			technicalMessage,
		};
	}

	if (msg.includes("could not find public function")) {
		return {
			title: "Server error",
			description:
				"The app is calling an unavailable function. The backend may be deploying.",
			hint: "Wait a moment and refresh the page.",
			technicalMessage,
		};
	}

	if (msg.includes("timeout") || msg.includes("timed out")) {
		return {
			title: "Request took too long",
			description: "The server did not respond in time. Try the action again.",
			hint: "On a slow connection, waiting a moment may help.",
			technicalMessage,
		};
	}

	return {
		title: "Something went wrong",
		description:
			"An unexpected error occurred. Try the action again or return to a safe page.",
		hint: digest
			? `If you contact support, include reference ID: ${digest}`
			: undefined,
		technicalMessage,
	};
}

export function collectErrorReport(
	error: Error & { digest?: string },
): ErrorReport {
	const now = new Date();
	const memory = (performance as { memory?: { usedJSHeapSize: number } })
		.memory;
	const memoryMB = memory
		? Math.round(memory.usedJSHeapSize / 1024 / 1024)
		: undefined;

	return {
		message: error.message,
		digest: error.digest,
		stack: error.stack,
		url: window.location.href,
		userAgent: navigator.userAgent,
		timestamp: now.toISOString(),
		appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
		environment: process.env.NODE_ENV,
		sessionDuration: Math.round(performance.now() / 1000),
		referrer: document.referrer || "(direct)",
		viewport: `${window.innerWidth}×${window.innerHeight}`,
		memoryMB,
	};
}

export function logClientError(error: Error & { digest?: string }): void {
	const report = collectErrorReport(error);
	console.group(
		`%cClientError  %c${report.timestamp}`,
		"color:#ef4444;font-weight:700;font-size:13px",
		"color:#6b7280;font-weight:400;font-size:11px",
	);
	console.error("Error:", error);
	console.groupCollapsed("Context");
	console.table({
		URL: report.url,
		Digest: report.digest ?? "—",
		Environment: report.environment,
		"App Version": report.appVersion,
		"Session Age": `${report.sessionDuration}s`,
		Referrer: report.referrer,
		Viewport: report.viewport,
		...(report.memoryMB !== undefined
			? { "JS Heap": `${report.memoryMB} MB` }
			: {}),
	});
	console.groupEnd();
	console.groupEnd();
}

export async function copyErrorReference(
	error: Error & { digest?: string },
): Promise<boolean> {
	const report = collectErrorReport(error);
	const lines = [
		`Boom Scope error`,
		report.digest ? `Digest: ${report.digest}` : null,
		`Message: ${report.message}`,
		`URL: ${report.url}`,
		`Time: ${report.timestamp}`,
	]
		.filter(Boolean)
		.join("\n");

	try {
		await navigator.clipboard.writeText(lines);
		return true;
	} catch {
		return false;
	}
}

/** Konzistentné toast chyby v celej aplikácii. */
export function toastAppError(context: string, error: unknown): void {
	const friendly = toFriendlyError(error);
	toast.error(context || friendly.title, {
		description: friendly.hint
			? `${friendly.description} ${friendly.hint}`
			: friendly.description,
	});
}
