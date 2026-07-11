import type { EnrichedProjectTask } from "@/components/kanban/kanban-task-card";
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

export function filterKanbanTasks(
	tasks: EnrichedProjectTask[],
	filters: KanbanFilters,
): EnrichedProjectTask[] {
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
			!isTaskOverdue(task.dueDate, task.columnKey)
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
