/** Pastel palette for sticky note backgrounds (white text from the library). */
export const STICKY_NOTE_COLORS = [
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#06b6d4",
	"#3b82f6",
	"#8b5cf6",
	"#ec4899",
] as const;

export type StickyNotePosition = {
	x: number;
	y: number;
};

export type StickyNoteItem = {
	id: string;
	color: string;
	text: string;
	selected?: boolean;
	position: StickyNotePosition;
};

export type StickyNoteChangeType =
	| "add"
	| "update"
	| "delete"
	| "changeview"
	| "changemodal"
	| "import";

export function parseStickyNoteItems(raw: string | undefined): StickyNoteItem[] {
	if (!raw?.trim()) return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isStickyNoteItem);
	} catch {
		return [];
	}
}

export function serializeStickyNoteItems(items: StickyNoteItem[]): string {
	return JSON.stringify(items);
}

function isStickyNoteItem(value: unknown): value is StickyNoteItem {
	if (!value || typeof value !== "object") return false;
	const item = value as Partial<StickyNoteItem>;
	return (
		typeof item.id === "string" &&
		typeof item.color === "string" &&
		typeof item.text === "string" &&
		item.position !== null &&
		typeof item.position === "object" &&
		typeof item.position?.x === "number" &&
		typeof item.position?.y === "number"
	);
}

export function toLibraryNotes(items: StickyNoteItem[]) {
	return items.map(({ id, color, text, position, selected }) => ({
		id,
		color,
		text,
		position,
		...(selected !== undefined ? { selected } : {}),
	}));
}
