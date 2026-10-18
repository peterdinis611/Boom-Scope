/** Shared browser download helpers. */

export function downloadBlob(filename: string, blob: Blob) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
	downloadBlob(filename, new Blob([text], { type: `${mime};charset=utf-8` }));
}

export function downloadJson(filename: string, data: unknown) {
	downloadText(filename, JSON.stringify(data, null, 2), "application/json");
}

export function downloadCsv(
	filename: string,
	rows: Array<Record<string, string | number | null | undefined>>,
) {
	if (rows.length === 0) {
		downloadText(filename, "");
		return;
	}
	const headers = Object.keys(rows[0]);
	const escape = (value: string | number | null | undefined) => {
		const raw = value == null ? "" : String(value);
		if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
		return raw;
	};
	const lines = [
		headers.join(","),
		...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
	];
	downloadText(filename, lines.join("\n"), "text/csv");
}

/** Convert TipTap/HTML note content to Markdown-ish text. */
export function htmlToMarkdown(html: string): string {
	if (typeof document === "undefined") {
		return html.replace(/<[^>]+>/g, "");
	}
	const root = document.createElement("div");
	root.innerHTML = html;

	const walk = (node: Node): string => {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.textContent ?? "";
		}
		if (!(node instanceof HTMLElement)) return "";

		const children = Array.from(node.childNodes).map(walk).join("");
		const tag = node.tagName.toLowerCase();

		switch (tag) {
			case "h1":
				return `# ${children.trim()}\n\n`;
			case "h2":
				return `## ${children.trim()}\n\n`;
			case "h3":
				return `### ${children.trim()}\n\n`;
			case "p":
				return `${children.trim()}\n\n`;
			case "br":
				return "\n";
			case "strong":
			case "b":
				return `**${children}**`;
			case "em":
			case "i":
				return `*${children}*`;
			case "a": {
				const href = node.getAttribute("href") ?? "";
				return `[${children}](${href})`;
			}
			case "li":
				return `- ${children.trim()}\n`;
			case "ul":
			case "ol":
				return `${children}\n`;
			case "blockquote":
				return `> ${children.trim()}\n\n`;
			case "code":
				return `\`${children}\``;
			case "pre":
				return `\`\`\`\n${children.trim()}\n\`\`\`\n\n`;
			default:
				return children;
		}
	};

	return walk(root).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function downloadNoteAsMarkdown(title: string, html: string) {
	const md = `# ${title || "Note"}\n\n${htmlToMarkdown(html)}`;
	const safe = (title || "note").replace(/[^\w\-]+/g, "_").slice(0, 60);
	downloadText(`${safe}.md`, md, "text/markdown");
}
