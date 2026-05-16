/**
 * Utility to download a note as a .txt file.
 * Strips HTML tags from the content to provide a clean text file.
 */
export function downloadNoteAsTxt(title: string, content: string) {
	// Simple HTML to text conversion by creating a temporary DOM element
	// This works in the browser environment
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = content;
	const plainText = tempDiv.textContent || tempDiv.innerText || "";

	const element = document.createElement("a");
	const file = new Blob([plainText], { type: "text/plain" });
	element.href = URL.createObjectURL(file);
	element.download = `${title || "poznamka"}.txt`;
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
	URL.revokeObjectURL(element.href);
}

/**
 * Utility to download a note as a .pdf file.
 * Uses html2pdf.js to convert HTML content to a PDF document.
 */
export async function downloadNoteAsPdf(title: string, content: string) {
	// Use dynamic import to avoid SSR issues
	// @ts-expect-error - html2pdf might not have types
	const html2pdf = (await import("html2pdf.js")).default;

	// Create a wrapper for the content to apply styles
	const element = document.createElement("div");
	element.style.padding = "40px";
	element.style.color = "#000";
	element.style.background = "#fff";
	element.style.fontFamily = "sans-serif";

	// Add Title
	const titleEl = document.createElement("h1");
	titleEl.innerText = title || "Poznámka";
	titleEl.style.fontSize = "24px";
	titleEl.style.fontWeight = "bold";
	titleEl.style.marginBottom = "20px";
	titleEl.style.borderBottom = "1px solid #eee";
	titleEl.style.paddingBottom = "10px";
	element.appendChild(titleEl);

	// Add Content
	const contentEl = document.createElement("div");
	contentEl.className = "prose prose-sm max-w-none";
	contentEl.innerHTML = content;
	element.appendChild(contentEl);

	const opt = {
		margin: 10,
		filename: `${title || "poznamka"}.pdf`,
		image: { type: "jpeg", quality: 0.98 },
		html2canvas: { scale: 2, useCORS: true, letterRendering: true },
		jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
	} as const;

	// Generate and save
	html2pdf().set(opt).from(element).save();
}
