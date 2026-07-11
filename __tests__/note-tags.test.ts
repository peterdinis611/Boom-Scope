import { describe, expect, test } from "vitest";
import {
	formatTagsInput,
	normalizeNoteTags,
	parseTagsInput,
} from "@/lib/note-tags";

describe("note-tags lib", () => {
	test("normalizeNoteTags trims, lowercases, dedupes, and sorts", () => {
		expect(normalizeNoteTags([" Ideas ", "ideas", "Draft"])).toEqual([
			"draft",
			"ideas",
		]);
	});

	test("parseTagsInput splits comma-separated values", () => {
		expect(parseTagsInput("ideas, draft, ideas")).toEqual(["draft", "ideas"]);
	});

	test("formatTagsInput joins normalized tags", () => {
		expect(formatTagsInput(["draft", "ideas"])).toBe("draft, ideas");
		expect(formatTagsInput(undefined)).toBe("");
	});
});
