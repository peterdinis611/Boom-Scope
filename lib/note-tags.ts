export function normalizeNoteTags(tags: string[] | undefined): string[] {
	if (!tags?.length) return [];
	const seen = new Set<string>();
	const normalized: string[] = [];
	for (const tag of tags) {
		const value = tag.trim().toLowerCase();
		if (!value || seen.has(value)) continue;
		seen.add(value);
		normalized.push(value);
	}
	return normalized.sort();
}

export function parseTagsInput(input: string): string[] {
	return normalizeNoteTags(
		input
			.split(",")
			.map((part) => part.trim())
			.filter(Boolean),
	);
}

export function formatTagsInput(tags: string[] | undefined): string {
	return normalizeNoteTags(tags).join(", ");
}
