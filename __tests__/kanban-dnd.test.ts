import { describe, expect, test } from "vitest";
import {
	columnDroppableId,
	parseColumnDroppableId,
	reorderIds,
	resolveDropTarget,
} from "@/lib/kanban-dnd";

describe("Lib: kanban-dnd", () => {
	test("creates and parses column droppable ids", () => {
		expect(columnDroppableId("todo")).toBe("column:todo");
		expect(parseColumnDroppableId("column:in_progress")).toBe("in_progress");
		expect(parseColumnDroppableId("task-1")).toBeNull();
	});

	test("resolves drop on empty column", () => {
		const target = resolveDropTarget("column:done", {
			todo: [{ _id: "t1", status: "todo" }],
			in_progress: [],
			done: [],
		});

		expect(target).toEqual({ status: "done", index: 0 });
	});

	test("resolves drop on task index", () => {
		const target = resolveDropTarget("t2", {
			todo: [],
			in_progress: [
				{ _id: "t1", status: "in_progress" },
				{ _id: "t2", status: "in_progress" },
			],
			done: [],
		});

		expect(target).toEqual({ status: "in_progress", index: 1 });
	});

	test("reorders ids within a list", () => {
		expect(reorderIds(["a", "b", "c"], "a", "c")).toEqual(["b", "c", "a"]);
	});
});
