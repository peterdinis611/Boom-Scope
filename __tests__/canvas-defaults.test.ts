import { describe, expect, it } from "vitest";
import {
	DEFAULT_CANVAS_SIZE,
	normalizeCanvasSize,
} from "@/lib/canvas-defaults";

describe("normalizeCanvasSize", () => {
	it("returns defaults for empty input", () => {
		expect(normalizeCanvasSize()).toEqual(DEFAULT_CANVAS_SIZE);
		expect(normalizeCanvasSize(null)).toEqual(DEFAULT_CANVAS_SIZE);
	});

	it("fills missing dimensions from defaults", () => {
		expect(normalizeCanvasSize({ width: 1200 })).toEqual({
			width: 1200,
			height: DEFAULT_CANVAS_SIZE.height,
		});
	});

	it("rejects invalid dimensions", () => {
		expect(normalizeCanvasSize({ width: 0, height: -10 })).toEqual(
			DEFAULT_CANVAS_SIZE,
		);
	});
});
