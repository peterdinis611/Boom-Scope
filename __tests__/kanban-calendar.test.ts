import { describe, expect, test } from "vitest";
import {
	buildMonthGrid,
	formatMonthYear,
	getWeekdayLabels,
	groupTasksByDay,
	shiftMonth,
	toDayKey,
} from "@/lib/kanban-calendar";
import { startOfLocalDay } from "@/lib/kanban";

describe("Lib: kanban-calendar", () => {
	test("builds a 42-day month grid starting on Monday", () => {
		const days = buildMonthGrid(2026, 4);
		expect(days).toHaveLength(42);
		expect(days[0]?.date.getDay()).toBe(1);
		expect(days.some((day) => day.isCurrentMonth)).toBe(true);
	});

	test("groups tasks by due date", () => {
		const due = startOfLocalDay(Date.UTC(2026, 4, 15));
		const grouped = groupTasksByDay([
			{ _id: "1", title: "A", dueDate: due },
			{ _id: "2", title: "B", dueDate: due + 86_400_000 },
			{ _id: "3", title: "C" },
		]);

		expect(grouped.get(toDayKey(due))).toHaveLength(1);
		expect(grouped.get(toDayKey(due + 86_400_000))).toHaveLength(1);
	});

	test("formats month labels and shifts months", () => {
		expect(formatMonthYear(2026, 4)).toMatch(/May/);
		expect(shiftMonth(2026, 0, 1)).toEqual({ year: 2026, month: 1 });
		expect(getWeekdayLabels()[0]).toBe("Mon");
	});
});
