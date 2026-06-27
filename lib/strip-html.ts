const MAX_CACHE_SIZE = 256;
const stripHtmlCache = new Map<string, string>();

export function stripHtml(html: string): string {
	if (!html) return "";

	const cached = stripHtmlCache.get(html);
	if (cached !== undefined) return cached;

	if (typeof DOMParser === "undefined") {
		return "";
	}

	const doc = new DOMParser().parseFromString(html, "text/html");
	const text = doc.body.textContent ?? "";

	if (stripHtmlCache.size >= MAX_CACHE_SIZE) {
		const oldest = stripHtmlCache.keys().next().value;
		if (oldest) stripHtmlCache.delete(oldest);
	}
	stripHtmlCache.set(html, text);

	return text;
}

export function clearStripHtmlCache(): void {
	stripHtmlCache.clear();
}
