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
