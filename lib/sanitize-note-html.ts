const DANGEROUS_SELECTORS =
	"script, iframe, object, embed, form, input, style, link, meta, base";

export function sanitizeNoteHtml(html: string): string {
	if (typeof DOMParser === "undefined") {
		return "";
	}

	const doc = new DOMParser().parseFromString(html, "text/html");

	for (const element of doc.body.querySelectorAll(DANGEROUS_SELECTORS)) {
		element.remove();
	}

	for (const element of doc.body.querySelectorAll("*")) {
		for (const attribute of [...element.attributes]) {
			const name = attribute.name.toLowerCase();
			const value = attribute.value.trim().toLowerCase();

			if (
				name.startsWith("on") ||
				(name === "href" && value.startsWith("javascript:")) ||
				(name === "src" && value.startsWith("javascript:"))
			) {
				element.removeAttribute(attribute.name);
			}
		}
	}

	return doc.body.innerHTML;
}
