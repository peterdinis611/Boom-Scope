import { describe, expect, test } from "vitest";
import {
	columnDroppableId,
	parseColumnDroppableId,
	reorderIds,
	resolveDropTarget,
} from "@/lib/kanban-dnd";

describe("Lib: kanban-dnd", () => {
	test("creates and parses column droppable ids", () => {
		expect(columnDroppableId("col-1")).toBe("column:col-1");
		expect(parseColumnDroppableId("column:key:done")).toBe("key:done");
		expect(parseColumnDroppableId("task-1")).toBeNull();
	});

	test("resolves drop on empty column", () => {
		const target = resolveDropTarget("column:done", {
			todo: [{ _id: "t1" }],
			done: [],
		});

		expect(target).toEqual({ columnId: "done", index: 0 });
	});

	test("resolves drop on task index", () => {
		const target = resolveDropTarget("t2", {
			todo: [],
			in_progress: [
				{ _id: "t1" },
				{ _id: "t2" },
			],
			done: [],
		});

		expect(target).toEqual({ columnId: "in_progress", index: 1 });
	});

	test("reorders ids within a list", () => {
		expect(reorderIds(["a", "b", "c"], "a", "c")).toEqual(["b", "c", "a"]);
	});
});
