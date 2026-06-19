export function stripHtml(html: string): string {
	if (typeof DOMParser === "undefined") {
		return "";
	}

	const doc = new DOMParser().parseFromString(html, "text/html");
	return doc.body.textContent ?? "";
}
