import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { ensureProjectColumns } from "./kanban_columns";

export type RecurrenceInterval = "daily" | "weekly" | "monthly";

export function advanceDueDate(
	from: number,
	interval: RecurrenceInterval,
	intervalCount = 1,
): number {
	const count = Math.max(1, Math.floor(intervalCount));
	const date = new Date(from);
	if (interval === "daily") {
		date.setDate(date.getDate() + count);
	} else if (interval === "weekly") {
		date.setDate(date.getDate() + 7 * count);
	} else {
		date.setMonth(date.getMonth() + count);
	}
	return date.getTime();
}

/** Spawn the next occurrence when a recurring task is completed. */
export async function spawnRecurringTask(
	ctx: MutationCtx,
	task: Doc<"project_tasks">,
	userId: Id<"users">,
) {
	if (!task.recurrence) return null;

	const columns = await ensureProjectColumns(ctx, task.projectId, userId);
	const todoColumn =
		columns.find((column) => column.key === "todo") ?? columns[0];
	if (!todoColumn) return null;

	const existing = await ctx.db
		.query("project_tasks")
		.withIndex("by_projectId", (q) => q.eq("projectId", task.projectId))
		.filter((q) => q.eq(q.field("userId"), userId))
		.collect();
	const inColumn = existing.filter((item) => item.columnId === todoColumn._id);
	const position =
		inColumn.length === 0
			? 0
			: Math.max(...inColumn.map((item) => item.position)) + 1;

	const baseDue = task.dueDate ?? Date.now();
	const nextDue = advanceDueDate(
		baseDue,
		task.recurrence.interval,
		task.recurrence.intervalCount,
	);

	const resetSubtasks = task.subtasks?.map((item) => ({
		...item,
		completed: false,
	}));

	return await ctx.db.insert("project_tasks", {
		title: task.title,
		description: task.description,
		projectId: task.projectId,
		userId,
		columnId: todoColumn._id,
		position,
		linkedNoteId: task.linkedNoteId,
		linkedDesignId: task.linkedDesignId,
		dueDate: nextDue,
		priority: task.priority,
		labels: task.labels,
		subtasks: resetSubtasks,
		recurrence: task.recurrence,
		recurrenceParentId: task.recurrenceParentId ?? task._id,
	});
}
