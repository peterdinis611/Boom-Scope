import { describe, expect, test } from "vitest";
import {
	DEFAULT_KANBAN_COLUMNS,
	formatDueDate,
	formatWipCount,
	getKanbanColumnLabel,
	isTaskOverdue,
	isWipLimitExceeded,
	isWipLimitReached,
	startOfLocalDay,
} from "@/lib/kanban";
import {
	EMPTY_KANBAN_FILTERS,
	filterKanbanTasks,
} from "@/lib/kanban-filters";

describe("Lib: kanban", () => {
	test("exposes default column presets", () => {
		expect(DEFAULT_KANBAN_COLUMNS.map((column) => column.key)).toEqual([
			"todo",
			"in_progress",
			"done",
		]);
	});

	test("resolves column labels", () => {
		expect(getKanbanColumnLabel("todo")).toBe("To do");
		expect(getKanbanColumnLabel("in_progress")).toBe("In progress");
	});

	test("detects overdue tasks", () => {
		const yesterday = startOfLocalDay() - 86_400_000;
		expect(isTaskOverdue(yesterday, "todo")).toBe(true);
		expect(isTaskOverdue(yesterday, "done")).toBe(false);
	});

	test("formats due dates", () => {
		expect(formatDueDate(Date.UTC(2026, 4, 23))).toMatch(/May/);
	});

	test("formats and evaluates WIP limits", () => {
		expect(formatWipCount(3)).toBe("3");
		expect(formatWipCount(3, 5)).toBe("3/5");
		expect(isWipLimitReached(5, 5)).toBe(true);
		expect(isWipLimitReached(4, 5)).toBe(false);
		expect(isWipLimitExceeded(6, 5)).toBe(true);
	});
});

describe("Lib: kanban-filters", () => {
	test("filters by search text and priority", () => {
		const tasks = [
			{
				_id: "1",
				title: "Write docs",
				description: "",
				projectId: "p1",
				userId: "u1",
				position: 0,
				priority: "high" as const,
				labels: ["docs"],
			},
			{
				_id: "2",
				title: "Ship feature",
				description: "",
				projectId: "p1",
				userId: "u1",
				position: 1,
				priority: "low" as const,
			},
		];

		const filtered = filterKanbanTasks(tasks, {
			...EMPTY_KANBAN_FILTERS,
			search: "docs",
			priority: "high",
		});

		expect(filtered).toHaveLength(1);
		expect(filtered[0]?.title).toBe("Write docs");
	});
});
