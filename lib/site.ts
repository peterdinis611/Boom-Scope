export const SITE_NAME = "Boom Scope";

export const SITE_TAGLINE =
	"Projects, notes, tasks, and design tools in one focused workspace.";

export const SITE_DESCRIPTION =
	"Boom Scope is a modern productivity workspace for builders — project management, Kanban tasks, notes, sticky boards, canvas design, design systems, Pomodoro focus, and placeholder tools in one place.";

export const SITE_KEYWORDS = [
	"Boom Scope",
	"productivity workspace",
	"project management",
	"Kanban board",
	"notes app",
	"design canvas",
	"design system",
	"Pomodoro timer",
	"Next.js workspace",
	"developer tools",
] as const;

/** Public marketing / auth routes included in the sitemap. */
export const PUBLIC_ROUTES = [
	{ path: "/", changeFrequency: "weekly" as const, priority: 1 },
	{ path: "/login", changeFrequency: "monthly" as const, priority: 0.6 },
	{ path: "/register", changeFrequency: "monthly" as const, priority: 0.7 },
	{
		path: "/forgot-password",
		changeFrequency: "yearly" as const,
		priority: 0.3,
	},
] as const;

export function getSiteUrl(): string {
	const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	if (explicit) {
		return explicit.replace(/\/$/, "");
	}

	const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
		|| process.env.VERCEL_URL?.trim();
	if (vercel) {
		return `https://${vercel.replace(/\/$/, "")}`;
	}

	return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
	const base = getSiteUrl();
	if (!path || path === "/") return base;
	return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
