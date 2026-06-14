export const emailBrand = {
	appName: "Boom Scope",
	primary: "#1d5f9a",
	primaryForeground: "#ffffff",
	background: "#f4f4f5",
	card: "#ffffff",
	foreground: "#18181b",
	mutedForeground: "#71717a",
	border: "#e4e4e7",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

export function getAppUrl(): string {
	return (
		process.env.CONVEX_SITE_URL ??
		process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
		"https://boomscope.app"
	);
}
