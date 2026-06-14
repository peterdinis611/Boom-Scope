import { describe, expect, test } from "vitest";
import {
	parseStickyNoteItems,
	serializeStickyNoteItems,
	toLibraryNotes,
} from "@/lib/sticky-notes";

describe("sticky-notes lib", () => {
	test("parseStickyNoteItems returns empty array for invalid input", () => {
		expect(parseStickyNoteItems(undefined)).toEqual([]);
		expect(parseStickyNoteItems("")).toEqual([]);
		expect(parseStickyNoteItems("not-json")).toEqual([]);
		expect(parseStickyNoteItems("{}")).toEqual([]);
	});

	test("parseStickyNoteItems keeps valid note items", () => {
		const items = [
			{
				id: "1",
				color: "#fef08a",
				text: "Hello",
				position: { x: 10, y: 20 },
			},
			{ id: "2", color: "#000", text: "bad" },
		];

		expect(parseStickyNoteItems(JSON.stringify(items))).toEqual([items[0]]);
	});

	test("serializeStickyNoteItems round-trips through parse", () => {
		const items = [
			{
				id: "abc",
				color: "#22c55e",
				text: "Ship it",
				selected: true,
				position: { x: 0, y: 0 },
			},
		];

		const serialized = serializeStickyNoteItems(items);
		expect(parseStickyNoteItems(serialized)).toEqual(items);
	});

	test("toLibraryNotes strips unknown fields", () => {
		const items = [
			{
				id: "abc",
				color: "#22c55e",
				text: "Ship it",
				selected: false,
				position: { x: 5, y: 15 },
			},
		];

		expect(toLibraryNotes(items)).toEqual(items);
	});
});
