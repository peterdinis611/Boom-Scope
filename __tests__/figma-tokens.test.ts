import { describe, expect, it } from "vitest";
import { designSystemToFigmaTokensJson } from "@/lib/figma-tokens";

describe("designSystemToFigmaTokensJson", () => {
	it("should convert colors and fonts to a valid Figma tokens JSON", () => {
		const colors = [
			{ name: "Brand Primary", hex: "#3b82f6" },
			{ name: "Secondary", hex: "#10b981" },
		];
		const fonts = ["Inter, sans-serif", "Georgia, serif"];

		const jsonString = designSystemToFigmaTokensJson(colors, fonts);
		const parsed = JSON.parse(jsonString);

		expect(parsed.$boomScopeMeta).toBeDefined();
		expect(parsed.tokens["color/brand-primary"]).toEqual({
			type: "color",
			value: { hex: "#3b82f6" },
		});
		expect(parsed.tokens["fontFamily/primary"]).toEqual({
			type: "string",
			value: "Inter, sans-serif",
		});
		expect(parsed.tokens["fontFamily/alt-1"]).toEqual({
			type: "string",
			value: "Georgia, serif",
		});
	});

	it("should handle empty inputs", () => {
		const jsonString = designSystemToFigmaTokensJson([], []);
		const parsed = JSON.parse(jsonString);
		expect(Object.keys(parsed.tokens).length).toBe(0);
	});

	it("should slugify color names correctly", () => {
		const colors = [{ name: "   Very Cool Blue!!!  ", hex: "#0000ff" }];
		const jsonString = designSystemToFigmaTokensJson(colors, []);
		const parsed = JSON.parse(jsonString);
		expect(parsed.tokens["color/very-cool-blue"]).toBeDefined();
	});
});
