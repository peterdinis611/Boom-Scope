/** Preset swatches shared across canvas, notes, settings, and design system. */
export const APP_PALETTE = [
	"#ffffff",
	"#f8fafc",
	"#e2e8f0",
	"#94a3b8",
	"#64748b",
	"#334155",
	"#1e293b",
	"#000000",
	"#fef2f2",
	"#fecaca",
	"#f87171",
	"#ef4444",
	"#dc2626",
	"#991b1b",
	"#fff7ed",
	"#fed7aa",
	"#fb923c",
	"#f97316",
	"#ea580c",
	"#fefce8",
	"#fde047",
	"#facc15",
	"#eab308",
	"#ca8a04",
	"#f0fdf4",
	"#86efac",
	"#4ade80",
	"#22c55e",
	"#16a34a",
	"#ecfeff",
	"#67e8f9",
	"#22d3ee",
	"#06b6d4",
	"#0891b2",
	"#eff6ff",
	"#93c5fd",
	"#60a5fa",
	"#3b82f6",
	"#2563eb",
	"#eef2ff",
	"#a5b4fc",
	"#818cf8",
	"#6366f1",
	"#4f46e5",
	"#faf5ff",
	"#d8b4fe",
	"#c084fc",
	"#a855f7",
	"#9333ea",
	"#fdf4ff",
	"#f0abfc",
	"#f472b6",
	"#ec4899",
	"#db2777",
	"var(--primary)",
	"var(--success)",
	"var(--destructive)",
] as const;

/** @deprecated Use APP_PALETTE */
export const CANVAS_PALETTE = APP_PALETTE;

/** Hex-only palette for contexts that cannot resolve CSS variables (e.g. TipTap). */
export const APP_PALETTE_HEX = APP_PALETTE.filter((color) =>
	color.startsWith("#"),
) as readonly string[];

/** Soft pastels for text highlighting in notes. */
export const HIGHLIGHT_PALETTE = [
	"#fef08a",
	"#fef9c3",
	"#fde047",
	"#bbf7d0",
	"#86efac",
	"#bfdbfe",
	"#93c5fd",
	"#ddd6fe",
	"#f5d0fe",
	"#fbcfe8",
	"#fed7aa",
	"#fecaca",
	"#ccfbf1",
	"#e0e7ff",
	"#fae8ff",
	"#f1f5f9",
	"#e2e8f0",
	"#ffffff",
] as const;

export const ARTBOARD_PALETTE = [
	null,
	...APP_PALETTE_HEX.slice(0, 11),
] as const;

export function getPickerHexValue(color: string | null | undefined): string {
	if (color?.startsWith("#")) return color;
	return "#3b82f6";
}

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function isValidHexColor(value: string): boolean {
	return HEX_COLOR.test(value.trim());
}

export function normalizeHexColor(value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed.startsWith("#")) {
		const withHash = `#${trimmed}`;
		return isValidHexColor(withHash) ? withHash.toLowerCase() : null;
	}
	return isValidHexColor(trimmed) ? trimmed.toLowerCase() : null;
}

export function colorsMatch(a: string, b: string): boolean {
	return a.trim().toLowerCase() === b.trim().toLowerCase();
}
