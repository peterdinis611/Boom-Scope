import { startOfLocalDay } from "@/lib/kanban";

export type CalendarTask = {
	_id: string;
	title: string;
	dueDate: number;
	projectId: string;
	projectName?: string | null;
	priority?: "low" | "medium" | "high" | null;
	columnKey?: string | null;
};

export type CalendarDay = {
	date: Date;
	dayKey: string;
	isCurrentMonth: boolean;
	isToday: boolean;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getWeekdayLabels(): string[] {
	return WEEKDAY_LABELS;
}

export function toDayKey(timestamp: number): string {
	const date = new Date(startOfLocalDay(timestamp));
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function buildMonthGrid(year: number, month: number): CalendarDay[] {
	const firstOfMonth = new Date(year, month, 1);
	const startOffset = (firstOfMonth.getDay() + 6) % 7;
	const gridStart = new Date(year, month, 1 - startOffset);
	const todayKey = toDayKey(Date.now());

	return Array.from({ length: 42 }, (_, index) => {
		const date = new Date(
			gridStart.getFullYear(),
			gridStart.getMonth(),
			gridStart.getDate() + index,
		);
		const dayKey = toDayKey(date.getTime());
		return {
			date,
			dayKey,
			isCurrentMonth: date.getMonth() === month,
			isToday: dayKey === todayKey,
		};
	});
}

export function groupTasksByDay<T extends { dueDate?: number }>(
	tasks: T[],
): Map<string, T[]> {
	const grouped = new Map<string, T[]>();

	for (const task of tasks) {
		if (!task.dueDate) continue;
		const key = toDayKey(task.dueDate);
		const bucket = grouped.get(key) ?? [];
		bucket.push(task);
		grouped.set(key, bucket);
	}

	for (const bucket of grouped.values()) {
		bucket.sort((a, b) => a.dueDate! - b.dueDate!);
	}

	return grouped;
}

export function formatMonthYear(year: number, month: number): string {
	return new Date(year, month, 1).toLocaleDateString(undefined, {
		month: "long",
		year: "numeric",
	});
}

export function shiftMonth(
	year: number,
	month: number,
	delta: number,
): { year: number; month: number } {
	const date = new Date(year, month + delta, 1);
	return { year: date.getFullYear(), month: date.getMonth() };
}
