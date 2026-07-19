import type { Id } from "@/convex/_generated/dataModel";
import { isTaskOverdue, type TaskPriority } from "@/lib/kanban";

export type KanbanFilters = {
	search: string;
	priority: TaskPriority | "all";
	columnId: Id<"kanban_columns"> | "all";
	showOverdueOnly: boolean;
};

export const EMPTY_KANBAN_FILTERS: KanbanFilters = {
	search: "",
	priority: "all",
	columnId: "all",
	showOverdueOnly: false,
};

export type KanbanFilterableTask = {
	title: string;
	description?: string | null;
	projectName?: string | null;
	labels?: string[] | null;
	priority?: TaskPriority | null;
	columnId?: Id<"kanban_columns"> | null;
	columnKey?: string | null;
	dueDate?: number | null;
};

export function filterKanbanTasks<T extends KanbanFilterableTask>(
	tasks: T[],
	filters: KanbanFilters,
): T[] {
	const search = filters.search.trim().toLowerCase();

	return tasks.filter((task) => {
		if (filters.columnId !== "all" && task.columnId !== filters.columnId) {
			return false;
		}

		if (filters.priority !== "all" && task.priority !== filters.priority) {
			return false;
		}

		if (
			filters.showOverdueOnly &&
			!isTaskOverdue(task.dueDate ?? undefined, task.columnKey)
		) {
			return false;
		}

		if (!search) return true;

		const haystack = [
			task.title,
			task.description ?? "",
			task.projectName ?? "",
			...(task.labels ?? []),
		]
			.join(" ")
			.toLowerCase();

		return haystack.includes(search);
	});
}
