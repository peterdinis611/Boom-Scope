import { describe, expect, test } from "vitest";
import {
	clampPlaceholderTextCount,
	countPlaceholderTextStats,
	generateLoremIpsum,
	generateParagraph,
	generateSentence,
	generateWords,
} from "@/lib/placeholder-text";

describe("placeholder-text", () => {
	test("generates sentences ending with a period", () => {
		const sentence = generateSentence(5, 5);
		expect(sentence.endsWith(".")).toBe(true);
		expect(sentence.split(" ").length).toBe(5);
		expect(sentence.charAt(0)).toMatch(/[A-Z]/);
	});

	test("generates paragraphs with multiple sentences", () => {
		const paragraph = generateParagraph(4);
		expect(paragraph.split(".").filter(Boolean).length).toBeGreaterThanOrEqual(4);
	});

	test("starts word output with lorem ipsum when requested", () => {
		const text = generateWords(12, true);
		expect(text.toLowerCase().startsWith("lorem ipsum dolor")).toBe(true);
	});

	test("generates paragraph blocks separated by blank lines", () => {
		const text = generateLoremIpsum({
			unit: "paragraphs",
			count: 3,
			startWithLorem: true,
		});

		expect(text.split("\n\n")).toHaveLength(3);
		expect(text.startsWith("Lorem ipsum dolor sit amet")).toBe(true);
	});

	test("clamps count to unit limits", () => {
		expect(clampPlaceholderTextCount("paragraphs", 99)).toBe(10);
		expect(clampPlaceholderTextCount("words", 0)).toBe(1);
	});

	test("counts words, characters, and paragraphs", () => {
		const stats = countPlaceholderTextStats("One two three.\n\nFour five.");
		expect(stats.words).toBe(5);
		expect(stats.characters).toBeGreaterThan(0);
		expect(stats.paragraphs).toBe(2);
	});
});
