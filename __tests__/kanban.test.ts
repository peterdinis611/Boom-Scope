import { describe, expect, test } from "vitest";
import { getKanbanColumnLabel, KANBAN_COLUMNS } from "@/lib/kanban";

describe("kanban lib", () => {
	test("defines three workflow columns", () => {
		expect(KANBAN_COLUMNS.map((column) => column.id)).toEqual([
			"todo",
			"in_progress",
			"done",
		]);
	});

	test("getKanbanColumnLabel returns human-readable labels", () => {
		expect(getKanbanColumnLabel("todo")).toBe("To do");
		expect(getKanbanColumnLabel("in_progress")).toBe("In progress");
		expect(getKanbanColumnLabel("done")).toBe("Done");
	});
});
