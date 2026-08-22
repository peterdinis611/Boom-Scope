import type { Id } from "@/convex/_generated/dataModel";

/** Default column presets seeded per project. */
export const DEFAULT_KANBAN_COLUMNS = [
	{
		key: "todo",
		label: "To do",
		color: "bg-muted text-muted-foreground",
	},
	{
		key: "in_progress",
		label: "In progress",
		color: "bg-scope/10 text-scope",
	},
	{
		key: "done",
		label: "Done",
		color: "bg-success/10 text-success",
	},
] as const;

export type KanbanColumnKey = (typeof DEFAULT_KANBAN_COLUMNS)[number]["key"];

/** @deprecated Use dynamic columns — kept for migration and all-tasks grouping. */
export const KANBAN_COLUMNS = DEFAULT_KANBAN_COLUMNS.map((column) => ({
	id: column.key,
	label: column.label,
	color: column.color,
})) as unknown as readonly {
	id: KanbanColumnKey;
	label: string;
	color: string;
}[];

export type KanbanStatus = KanbanColumnKey;

export type KanbanColumn = {
	_id: Id<"kanban_columns">;
	projectId: Id<"projects">;
	label: string;
	color: string;
	position: number;
	key?: string | null;
	wipLimit?: number | null;
};

export type TaskPriority = "low" | "medium" | "high";

export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export const PRIORITY_META: Record<
	TaskPriority,
	{ label: string; color: string }
> = {
	low: { label: "Low", color: "bg-muted text-muted-foreground" },
	medium: { label: "Medium", color: "bg-warning/15 text-warning" },
	high: { label: "High", color: "bg-destructive/15 text-destructive" },
};

export type TaskSubtask = {
	id: string;
	title: string;
	completed: boolean;
};

export function getKanbanColumnLabel(
	statusOrKey: string,
	columns?: KanbanColumn[],
): string {
	const fromColumns = columns?.find(
		(column) => column.key === statusOrKey || column._id === statusOrKey,
	);
	if (fromColumns) return fromColumns.label;

	return (
		DEFAULT_KANBAN_COLUMNS.find((column) => column.key === statusOrKey)?.label ??
		statusOrKey
	);
}

export function startOfLocalDay(timestamp = Date.now()): number {
	const date = new Date(timestamp);
	date.setHours(0, 0, 0, 0);
	return date.getTime();
}

export function endOfLocalDay(timestamp = Date.now()): number {
	return startOfLocalDay(timestamp) + 86_400_000;
}

export function isTaskOverdue(
	dueDate: number | undefined,
	columnKey?: string | null,
): boolean {
	if (!dueDate || columnKey === "done") return false;
	return dueDate < startOfLocalDay();
}

export function formatDueDate(dueDate: number): string {
	return new Date(dueDate).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

export function createSubtask(title: string): TaskSubtask {
	return {
		id: crypto.randomUUID(),
		title: title.trim(),
		completed: false,
	};
}

export function formatWipCount(taskCount: number, wipLimit?: number | null): string {
	if (!wipLimit) return String(taskCount);
	return `${taskCount}/${wipLimit}`;
}

export function isWipLimitReached(
	taskCount: number,
	wipLimit?: number | null,
): boolean {
	return Boolean(wipLimit && wipLimit > 0 && taskCount >= wipLimit);
}

export function isWipLimitExceeded(
	taskCount: number,
	wipLimit?: number | null,
): boolean {
	return Boolean(wipLimit && wipLimit > 0 && taskCount > wipLimit);
}
