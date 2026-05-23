import { describe, expect, test } from "vitest";
import { CANVAS_PRESETS } from "@/lib/canvas-presets";

describe("Lib: Canvas Presets", () => {
	test("every preset has a unique id and positive dimensions", () => {
		const ids = CANVAS_PRESETS.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);

		for (const preset of CANVAS_PRESETS) {
			expect(preset.width).toBeGreaterThan(0);
			expect(preset.height).toBeGreaterThan(0);
			expect(preset.name.length).toBeGreaterThan(0);
			expect(preset.icon.length).toBeGreaterThan(0);
		}
	});

	test("includes social and device preset groups", () => {
		const icons = new Set(CANVAS_PRESETS.map((p) => p.icon));
		expect(icons.has("facebook")).toBe(true);
		expect(icons.has("instagram")).toBe(true);
		expect(icons.has("smartphone")).toBe(true);
		expect(icons.has("tablet")).toBe(true);
	});

	test("instagram story is portrait orientation", () => {
		const story = CANVAS_PRESETS.find((p) => p.id === "ig-story");
		expect(story).toBeDefined();
		expect(story!.height).toBeGreaterThan(story!.width);
	});
});
