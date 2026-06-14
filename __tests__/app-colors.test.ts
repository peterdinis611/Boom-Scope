import { describe, expect, it } from "vitest";
import {
	APP_PALETTE,
	APP_PALETTE_HEX,
	HIGHLIGHT_PALETTE,
	colorsMatch,
	normalizeHexColor,
} from "@/lib/canvas-colors";

describe("app-colors", () => {
	it("exposes a large shared palette with theme tokens", () => {
		expect(APP_PALETTE.length).toBeGreaterThan(50);
		expect(APP_PALETTE).toContain("var(--primary)");
	});

	it("filters hex-only colors for editors that need raw hex", () => {
		expect(APP_PALETTE_HEX.every((color) => color.startsWith("#"))).toBe(true);
		expect(APP_PALETTE_HEX.length).toBeGreaterThan(40);
	});

	it("includes highlight pastels for notes", () => {
		expect(HIGHLIGHT_PALETTE.length).toBeGreaterThan(10);
		expect(HIGHLIGHT_PALETTE).toContain("#fef08a");
	});

	it("normalizes and compares hex values", () => {
		expect(normalizeHexColor("3b82f6")).toBe("#3b82f6");
		expect(colorsMatch("#3B82F6", "#3b82f6")).toBe(true);
	});
});
