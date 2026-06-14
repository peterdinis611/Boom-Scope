import { describe, expect, test } from "vitest";
import {
	createStickyNote,
	parseStickyNoteItems,
	readStickyNotesCache,
	serializeStickyNoteItems,
	STICKY_NOTES_CACHE_KEY,
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
				width: 240,
				height: 240,
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
				width: 200,
				height: 180,
			},
		];

		const serialized = serializeStickyNoteItems(items);
		expect(parseStickyNoteItems(serialized)).toEqual(items);
	});

	test("createStickyNote offsets new notes on the board", () => {
		const first = createStickyNote([], "#fef08a");
		const second = createStickyNote([first], "#bbf7d0");

		expect(second.position.x).toBeGreaterThan(first.position.x);
		expect(second.position.y).toBeGreaterThan(first.position.y);
		expect(second.color).toBe("#bbf7d0");
	});

	test("writeStickyNotesCache round-trips through readStickyNotesCache", () => {
		const items = [
			{
				id: "abc",
				color: "#fef08a",
				text: "Cached",
				position: { x: 4, y: 8 },
			},
		];

		localStorage.setItem(
			STICKY_NOTES_CACHE_KEY,
			serializeStickyNoteItems(items),
		);
		expect(readStickyNotesCache()).toEqual(items);
		localStorage.removeItem(STICKY_NOTES_CACHE_KEY);
	});
});
