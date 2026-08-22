export const LINK_CATEGORIES = [
	{ id: "general", label: "General" },
	{ id: "design", label: "Design" },
	{ id: "docs", label: "Documentation" },
	{ id: "tools", label: "Tools" },
	{ id: "reference", label: "Reference" },
	{ id: "other", label: "Other" },
] as const;

export type LinkCategory = (typeof LINK_CATEGORIES)[number]["id"];

export function getLinkCategoryLabel(category: LinkCategory): string {
	return LINK_CATEGORIES.find((item) => item.id === category)?.label ?? category;
}

export function normalizeLinkUrl(url: string): string {
	const trimmed = url.trim();
	if (!trimmed) {
		throw new Error("URL is required");
	}
	const withProtocol = /^https?:\/\//i.test(trimmed)
		? trimmed
		: `https://${trimmed}`;
	const parsed = new URL(withProtocol);
	if (!["http:", "https:"].includes(parsed.protocol)) {
		throw new Error("Only HTTP and HTTPS links are allowed");
	}
	return parsed.toString();
}

export function getLinkHostname(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

export function getLinkCategoryClassName(category: LinkCategory): string {
	switch (category) {
		case "design":
			return "bg-scope/10 text-scope";
		case "docs":
			return "bg-primary/10 text-primary";
		case "tools":
			return "bg-warning/15 text-warning";
		case "reference":
			return "bg-success/10 text-success";
		case "other":
			return "bg-muted text-muted-foreground";
		default:
			return "bg-primary/10 text-primary";
	}
}
