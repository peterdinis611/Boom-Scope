import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { ensureProjectColumns } from "./kanban_columns";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const taskStatus = v.union(
	v.literal("todo"),
	v.literal("in_progress"),
	v.literal("done"),
);

const taskPriority = v.union(
	v.literal("low"),
	v.literal("medium"),
	v.literal("high"),
);

const subtaskValidator = v.object({
	id: v.string(),
	title: v.string(),
	completed: v.boolean(),
});

async function assertProjectAccess(
	ctx: QueryCtx,
	projectId: Id<"projects">,
	userId: Id<"users">,
) {
	const project = await ctx.db.get(projectId);
	if (!project || project.userId !== userId) {
		throw new ConvexError("Unauthorized project");
	}
}

async function assertNoteAccess(
	ctx: QueryCtx,
	noteId: Id<"notes">,
	userId: Id<"users">,
) {
	const note = await ctx.db.get(noteId);
	if (!note || note.userId !== userId) {
		throw new ConvexError("Unauthorized note");
	}
}

async function assertDesignAccess(
	ctx: QueryCtx,
	designId: Id<"designs">,
	userId: Id<"users">,
) {
	const design = await ctx.db.get(designId);
	if (!design || design.userId !== userId) {
		throw new ConvexError("Unauthorized design");
	}
}

async function getColumnMeta(
	ctx: QueryCtx,
	columnId: Id<"kanban_columns"> | undefined,
) {
	if (!columnId) return { label: "Unknown", key: null as string | null };
	const column = await ctx.db.get(columnId);
	return {
		label: column?.label ?? "Unknown",
		key: column?.key ?? null,
	};
}

async function logTaskActivity(
	ctx: MutationCtx,
	args: {
		userId: Id<"users">;
		projectId: Id<"projects">;
		taskId: Id<"project_tasks">;
		kind: "created" | "updated" | "moved" | "completed" | "deleted";
		summary: string;
	},
) {
	await ctx.db.insert("task_activity_events", args);
}

async function enrichTask(ctx: QueryCtx, task: Doc<"project_tasks">) {
	const project = await ctx.db.get(task.projectId);
	const linkedNote = task.linkedNoteId
		? await ctx.db.get(task.linkedNoteId)
		: null;
	const linkedDesign = task.linkedDesignId
		? await ctx.db.get(task.linkedDesignId)
		: null;
	const column = task.columnId ? await ctx.db.get(task.columnId) : null;

	return {
		...task,
		projectName: project?.name ?? null,
		linkedNoteTitle: linkedNote?.title ?? null,
		linkedDesignName: linkedDesign?.name ?? null,
		columnLabel: column?.label ?? null,
		columnKey: column?.key ?? task.status ?? null,
		columnColor: column?.color ?? null,
	};
}

async function resolveColumnId(
	ctx: MutationCtx,
	projectId: Id<"projects">,
	userId: Id<"users">,
	columnId?: Id<"kanban_columns">,
	legacyStatus?: "todo" | "in_progress" | "done",
) {
	if (columnId) {
		const column = await ctx.db.get(columnId);
		if (!column || column.projectId !== projectId || column.userId !== userId) {
			throw new ConvexError("Invalid column");
		}
		return columnId;
	}

	const columns = await ensureProjectColumns(ctx, projectId, userId);
	const status = legacyStatus ?? "todo";
	const match = columns.find((column) => column.key === status);
	if (!match) throw new ConvexError("Column not found");
	return match._id;
}

export const list = query({
	args: {
		projectId: v.optional(v.id("projects")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		let tasks = args.projectId
			? await ctx.db
					.query("project_tasks")
					.withIndex("by_projectId", (q) =>
						q.eq("projectId", args.projectId as Id<"projects">),
					)
					.filter((q) => q.eq(q.field("userId"), userId))
					.collect()
			: await ctx.db
					.query("project_tasks")
					.withIndex("by_userId", (q) => q.eq("userId", userId))
					.collect();

		const enriched = await Promise.all(
			tasks.map((task) => enrichTask(ctx, task)),
		);

		return enriched.sort((a, b) => a.position - b.position);
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		projectId: v.id("projects"),
		columnId: v.optional(v.id("kanban_columns")),
		status: v.optional(taskStatus),
		linkedNoteId: v.optional(v.id("notes")),
		linkedDesignId: v.optional(v.id("designs")),
		dueDate: v.optional(v.number()),
		priority: v.optional(taskPriority),
		labels: v.optional(v.array(v.string())),
		subtasks: v.optional(v.array(subtaskValidator)),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const title = args.title.trim();
		if (!title) throw new ConvexError("Title is required");

		await assertProjectAccess(ctx, args.projectId, userId);

		if (args.linkedNoteId) {
			await assertNoteAccess(ctx, args.linkedNoteId, userId);
		}
		if (args.linkedDesignId) {
			await assertDesignAccess(ctx, args.linkedDesignId, userId);
		}

		const columnId = await resolveColumnId(
			ctx,
			args.projectId,
			userId,
			args.columnId,
			args.status,
		);

		const existing = await ctx.db
			.query("project_tasks")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.filter((q) => q.eq(q.field("userId"), userId))
			.collect();

		const inColumn = existing.filter((task) => task.columnId === columnId);
		const position =
			inColumn.length === 0
				? 0
				: Math.max(...inColumn.map((task) => task.position)) + 1;

		const taskId = await ctx.db.insert("project_tasks", {
			title,
			description: args.description?.trim() || undefined,
			columnId,
			projectId: args.projectId,
			userId,
			position,
			linkedNoteId: args.linkedNoteId,
			linkedDesignId: args.linkedDesignId,
			dueDate: args.dueDate,
			priority: args.priority,
			labels: args.labels?.map((label) => label.trim()).filter(Boolean),
			subtasks: args.subtasks,
		});

		const column = await getColumnMeta(ctx, columnId);
		await logTaskActivity(ctx, {
			userId,
			projectId: args.projectId,
			taskId,
			kind: "created",
			summary: `Created in ${column.label}`,
		});

		return taskId;
	},
});

export const update = mutation({
	args: {
		taskId: v.id("project_tasks"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		status: v.optional(taskStatus),
		columnId: v.optional(v.id("kanban_columns")),
		position: v.optional(v.number()),
		linkedNoteId: v.optional(v.union(v.id("notes"), v.null())),
		linkedDesignId: v.optional(v.union(v.id("designs"), v.null())),
		dueDate: v.optional(v.union(v.number(), v.null())),
		priority: v.optional(v.union(taskPriority, v.null())),
		labels: v.optional(v.array(v.string())),
		subtasks: v.optional(v.array(subtaskValidator)),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const existing = await ctx.db.get(args.taskId);
		if (!existing || existing.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		const updates: Record<string, unknown> = {};
		const summaries: string[] = [];

		if (args.title !== undefined) {
			const title = args.title.trim();
			if (!title) throw new ConvexError("Title is required");
			updates.title = title;
		}
		if (args.description !== undefined) {
			updates.description = args.description.trim() || undefined;
		}
		if (args.position !== undefined) updates.position = args.position;
		if (args.dueDate !== undefined) {
			updates.dueDate = args.dueDate ?? undefined;
			summaries.push(
				args.dueDate ? "Due date updated" : "Due date cleared",
			);
		}
		if (args.priority !== undefined) {
			updates.priority = args.priority ?? undefined;
			summaries.push(
				args.priority ? `Priority set to ${args.priority}` : "Priority cleared",
			);
		}
		if (args.labels !== undefined) {
			updates.labels = args.labels.map((label) => label.trim()).filter(Boolean);
			summaries.push("Labels updated");
		}
		if (args.subtasks !== undefined) {
			updates.subtasks = args.subtasks;
			summaries.push("Checklist updated");
		}
		if (args.linkedNoteId !== undefined) {
			if (args.linkedNoteId) {
				await assertNoteAccess(ctx, args.linkedNoteId, userId);
			}
			updates.linkedNoteId = args.linkedNoteId ?? undefined;
			summaries.push("Linked note updated");
		}
		if (args.linkedDesignId !== undefined) {
			if (args.linkedDesignId) {
				await assertDesignAccess(ctx, args.linkedDesignId, userId);
			}
			updates.linkedDesignId = args.linkedDesignId ?? undefined;
			summaries.push("Linked canvas updated");
		}
		if (args.columnId !== undefined || args.status !== undefined) {
			const nextColumnId = await resolveColumnId(
				ctx,
				existing.projectId,
				userId,
				args.columnId,
				args.status,
			);
			if (nextColumnId !== existing.columnId) {
				updates.columnId = nextColumnId;
				const column = await getColumnMeta(ctx, nextColumnId);
				summaries.push(`Moved to ${column.label}`);
				if (column.key === "done") {
					await logTaskActivity(ctx, {
						userId,
						projectId: existing.projectId,
						taskId: existing._id,
						kind: "completed",
						summary: `Completed “${existing.title}”`,
					});
				}
			}
		}

		await ctx.db.patch(args.taskId, updates);

		if (summaries.length > 0) {
			await logTaskActivity(ctx, {
				userId,
				projectId: existing.projectId,
				taskId: existing._id,
				kind: summaries.some((summary) => summary.startsWith("Moved"))
					? "moved"
					: "updated",
				summary: summaries.join(" · "),
			});
		}
	},
});

export const addFocusMinutes = mutation({
	args: {
		taskId: v.id("project_tasks"),
		minutes: v.number(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const existing = await ctx.db.get(args.taskId);
		if (!existing || existing.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		const minutes = Math.max(0, Math.round(args.minutes));
		if (minutes === 0) return;

		await ctx.db.patch(args.taskId, {
			focusMinutes: (existing.focusMinutes ?? 0) + minutes,
		});
	},
});

export const move = mutation({
	args: {
		taskId: v.id("project_tasks"),
		toColumnId: v.optional(v.id("kanban_columns")),
		toColumnKey: v.optional(taskStatus),
		toIndex: v.number(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const task = await ctx.db.get(args.taskId);
		if (!task || task.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		const toColumnId =
			args.toColumnId ??
			(await resolveColumnId(
				ctx,
				task.projectId,
				userId,
				undefined,
				args.toColumnKey,
			));

		if (!toColumnId) {
			throw new ConvexError("Destination column required");
		}

		const destinationColumn = await ctx.db.get(toColumnId);
		if (
			!destinationColumn ||
			destinationColumn.projectId !== task.projectId ||
			destinationColumn.userId !== userId
		) {
			throw new ConvexError("Invalid destination column");
		}

		const projectTasks = await ctx.db
			.query("project_tasks")
			.withIndex("by_projectId", (q) => q.eq("projectId", task.projectId))
			.filter((q) => q.eq(q.field("userId"), userId))
			.collect();

		const fromColumnId = task.columnId;
		const toIndex = Math.max(0, Math.floor(args.toIndex));

		if (
			fromColumnId !== toColumnId &&
			destinationColumn.wipLimit &&
			destinationColumn.wipLimit > 0
		) {
			const destinationCount = projectTasks.filter(
				(item) => item.columnId === toColumnId,
			).length;
			if (destinationCount >= destinationColumn.wipLimit) {
				throw new ConvexError(
					`WIP limit reached for ${destinationColumn.label} (${destinationColumn.wipLimit})`,
				);
			}
		}

		const sourceTasks = projectTasks
			.filter((item) => item.columnId === fromColumnId)
			.sort((a, b) => a.position - b.position);

		const activeIndex = sourceTasks.findIndex((item) => item._id === task._id);
		if (activeIndex === -1) throw new ConvexError("Task not found");

		const [movedTask] = sourceTasks.splice(activeIndex, 1);

		if (fromColumnId === toColumnId) {
			const clampedIndex = Math.min(toIndex, sourceTasks.length);
			sourceTasks.splice(clampedIndex, 0, movedTask);
			for (let index = 0; index < sourceTasks.length; index++) {
				const item = sourceTasks[index];
				if (item.position !== index) {
					await ctx.db.patch(item._id, { position: index });
				}
			}
			return;
		}

		const destinationTasks = projectTasks
			.filter((item) => item.columnId === toColumnId)
			.sort((a, b) => a.position - b.position);
		const clampedIndex = Math.min(toIndex, destinationTasks.length);
		destinationTasks.splice(clampedIndex, 0, movedTask);

		for (let index = 0; index < sourceTasks.length; index++) {
			const item = sourceTasks[index];
			if (item.position !== index) {
				await ctx.db.patch(item._id, { position: index });
			}
		}

		for (let index = 0; index < destinationTasks.length; index++) {
			const item = destinationTasks[index];
			const patch =
				item._id === task._id
					? { position: index, columnId: toColumnId }
					: { position: index };
			if (
				item.position !== index ||
				(item._id === task._id && item.columnId !== toColumnId)
			) {
				await ctx.db.patch(item._id, patch);
			}
		}

		const summary = `Moved to ${destinationColumn.label}`;
		await logTaskActivity(ctx, {
			userId,
			projectId: task.projectId,
			taskId: task._id,
			kind: destinationColumn.key === "done" ? "completed" : "moved",
			summary:
				destinationColumn.key === "done"
					? `Completed “${task.title}”`
					: summary,
		});
	},
});

export const remove = mutation({
	args: { taskId: v.id("project_tasks") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const existing = await ctx.db.get(args.taskId);
		if (!existing || existing.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		await logTaskActivity(ctx, {
			userId,
			projectId: existing.projectId,
			taskId: existing._id,
			kind: "deleted",
			summary: `Deleted “${existing.title}”`,
		});

		await ctx.db.delete(args.taskId);
	},
});
