/** Pastel sticky note backgrounds with dark text. */
export const STICKY_NOTE_COLORS = [
	"#fef08a",
	"#fbcfe8",
	"#bbf7d0",
	"#bfdbfe",
	"#fed7aa",
	"#ddd6fe",
	"#fecaca",
	"#ccfbf1",
] as const;

export const DEFAULT_STICKY_NOTE_SIZE = {
	width: 240,
	height: 240,
} as const;

export const STICKY_NOTES_CACHE_KEY = "boom-scope-sticky-notes";

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
	width?: number;
	height?: number;
};

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

export function readStickyNotesCache(): StickyNoteItem[] {
	if (typeof window === "undefined") return [];
	try {
		return parseStickyNoteItems(
			localStorage.getItem(STICKY_NOTES_CACHE_KEY) ?? "",
		);
	} catch {
		return [];
	}
}

export function writeStickyNotesCache(items: StickyNoteItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(
			STICKY_NOTES_CACHE_KEY,
			serializeStickyNoteItems(items),
		);
	} catch {
		// Ignore quota / private mode errors.
	}
}

export function pickStickyNoteColor(): string {
	const index = Math.floor(Math.random() * STICKY_NOTE_COLORS.length);
	return STICKY_NOTE_COLORS[index] ?? STICKY_NOTE_COLORS[0];
}

export function createStickyNote(
	existing: StickyNoteItem[],
	color = pickStickyNoteColor(),
): StickyNoteItem {
	const offset = existing.length * 28;
	return {
		id: crypto.randomUUID(),
		color,
		text: "",
		selected: true,
		position: {
			x: 32 + offset,
			y: 32 + offset,
		},
		width: DEFAULT_STICKY_NOTE_SIZE.width,
		height: DEFAULT_STICKY_NOTE_SIZE.height,
	};
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
		typeof item.position?.y === "number" &&
		(item.width === undefined || typeof item.width === "number") &&
		(item.height === undefined || typeof item.height === "number")
	);
}
