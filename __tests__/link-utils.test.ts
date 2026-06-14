import { describe, expect, it } from "vitest";
import {
	getLinkCategoryLabel,
	getLinkHostname,
	normalizeLinkUrl,
} from "@/lib/link-utils";

describe("link-utils", () => {
	it("normalizes urls without protocol", () => {
		expect(normalizeLinkUrl("example.com/docs")).toBe("https://example.com/docs");
	});

	it("rejects invalid urls", () => {
		expect(() => normalizeLinkUrl("")).toThrow("URL is required");
	});

	it("extracts hostname and category labels", () => {
		expect(getLinkHostname("https://www.figma.com/file/abc")).toBe("figma.com");
		expect(getLinkCategoryLabel("docs")).toBe("Documentation");
	});
});
