import { describe, expect, test } from "vitest";
import { fuseSearch, stripHtmlForSearch } from "@/lib/fuse-search";

describe("Lib: fuse-search", () => {
	test("returns all items for empty query", () => {
		const items = [{ name: "Alpha" }, { name: "Beta" }];
		expect(fuseSearch(items, "", ["name"])).toEqual(items);
		expect(fuseSearch(items, "   ", ["name"])).toEqual(items);
	});

	test("finds fuzzy matches by configured keys", () => {
		const items = [
			{ name: "Web application", description: "Client portal" },
			{ name: "Mobile app", description: "iOS redesign" },
		];

		const results = fuseSearch(items, "web aplication", ["name", "description"]);
		expect(results).toHaveLength(1);
		expect(results[0]?.name).toBe("Web application");
	});

	test("respects result limit", () => {
		const items = [
			{ title: "Alpha task" },
			{ title: "Beta task" },
			{ title: "Gamma task" },
		];

		expect(fuseSearch(items, "task", ["title"], undefined, 2)).toHaveLength(2);
	});

	test("strips html before searching note content", () => {
		expect(stripHtmlForSearch("<p>Hello <strong>world</strong></p>")).toBe(
			"Hello world",
		);
	});

	test("matches tags and plain text content", () => {
		const notes = [
			{
				title: "Planning",
				plainContent: "Sprint goals for Q2",
				tags: ["meeting"],
			},
			{
				title: "Design",
				plainContent: "Color palette draft",
				tags: ["design"],
			},
		];

		const byTag = fuseSearch(notes, "meetng", ["tags"]);
		expect(byTag[0]?.title).toBe("Planning");

		const byContent = fuseSearch(notes, "palete", ["plainContent"]);
		expect(byContent[0]?.title).toBe("Design");
	});
});
