export function columnDroppableId(columnId: string): string {
	return `column:${columnId}`;
}

export function parseColumnDroppableId(id: string): string | null {
	if (!id.startsWith("column:")) return null;
	const columnId = id.slice("column:".length);
	return columnId.length > 0 ? columnId : null;
}

type TaskLike = { _id: string; columnId?: string };

export function resolveDropTarget(
	overId: string,
	tasksByColumn: Record<string, TaskLike[]>,
): { columnId: string; index: number } | null {
	const columnId = parseColumnDroppableId(overId);
	if (columnId) {
		return { columnId, index: tasksByColumn[columnId]?.length ?? 0 };
	}

	for (const [groupColumnId, tasks] of Object.entries(tasksByColumn)) {
		const index = tasks.findIndex((task) => task._id === overId);
		if (index !== -1) {
			return { columnId: groupColumnId, index };
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
