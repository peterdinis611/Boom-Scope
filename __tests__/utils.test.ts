import { describe, expect, test } from "vitest";
import { cn } from "../lib/utils";

describe("Utility: cn", () => {
	test("merges tailwind classes correctly", () => {
		expect(cn("px-2 py-2", "p-4")).toBe("p-4");
	});

	test("handles conditional classes", () => {
		expect(cn("base", true && "active", false && "hidden")).toBe("base active");
	});

	test("returns empty string for no arguments", () => {
		expect(cn()).toBe("");
	});
});

import { designSystemToFigmaTokensJson } from "../lib/figma-tokens";

describe("Utility: Figma Tokens", () => {
	test("generates valid JSON with colors and fonts", () => {
		const colors = [{ name: "Primary Blue", hex: "#0000ff" }];
		const fonts = ["Inter", "Roboto"];
		const json = designSystemToFigmaTokensJson(colors, fonts);
		const parsed = JSON.parse(json);

		expect(parsed.tokens["color/primary-blue"]).toBeDefined();
		expect(parsed.tokens["fontFamily/primary"].value).toBe("Inter");
		expect(parsed.tokens["fontFamily/alt-1"].value).toBe("Roboto");
	});
});
