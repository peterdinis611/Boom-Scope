import type { KanbanStatus } from "@/lib/kanban";

export function columnDroppableId(status: KanbanStatus): string {
	return `column:${status}`;
}

export function parseColumnDroppableId(id: string): KanbanStatus | null {
	if (!id.startsWith("column:")) return null;
	const status = id.slice("column:".length);
	if (status === "todo" || status === "in_progress" || status === "done") {
		return status;
	}
	return null;
}

type TaskLike = { _id: string; status: KanbanStatus };

export function resolveDropTarget(
	overId: string,
	tasksByStatus: Record<KanbanStatus, TaskLike[]>,
): { status: KanbanStatus; index: number } | null {
	const columnStatus = parseColumnDroppableId(overId);
	if (columnStatus) {
		return { status: columnStatus, index: tasksByStatus[columnStatus].length };
	}

	for (const status of ["todo", "in_progress", "done"] as KanbanStatus[]) {
		const index = tasksByStatus[status].findIndex((task) => task._id === overId);
		if (index !== -1) {
			return { status, index };
		}
	}

	return null;
}

export function reorderIds(ids: string[], activeId: string, overId: string): string[] {
	const oldIndex = ids.indexOf(activeId);
	const newIndex = ids.indexOf(overId);
	if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
		return ids;
	}

	const next = [...ids];
	next.splice(oldIndex, 1);
	next.splice(newIndex, 0, activeId);
	return next;
}
