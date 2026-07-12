import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

export const DEFAULT_COLUMN_DEFS = [
	{
		key: "todo",
		label: "To do",
		color: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
		position: 0,
	},
	{
		key: "in_progress",
		label: "In progress",
		color: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
		position: 1,
	},
	{
		key: "done",
		label: "Done",
		color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
		position: 2,
	},
] as const;

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

export async function ensureProjectColumns(
	ctx: MutationCtx,
	projectId: Id<"projects">,
	userId: Id<"users">,
) {
	const existing = await ctx.db
		.query("kanban_columns")
		.withIndex("by_projectId", (q) => q.eq("projectId", projectId))
		.collect();

	if (existing.length > 0) {
		return existing.sort((a, b) => a.position - b.position);
	}

	const created = [];
	for (const definition of DEFAULT_COLUMN_DEFS) {
		const columnId = await ctx.db.insert("kanban_columns", {
			projectId,
			userId,
			label: definition.label,
			color: definition.color,
			position: definition.position,
			key: definition.key,
		});
		const column = await ctx.db.get(columnId);
		if (column) created.push(column);
	}

	const tasks = await ctx.db
		.query("project_tasks")
		.withIndex("by_projectId", (q) => q.eq("projectId", projectId))
		.filter((q) => q.eq(q.field("userId"), userId))
		.collect();

	for (const task of tasks) {
		if (task.columnId) continue;
		const legacyStatus = task.status ?? "todo";
		const target = created.find((column) => column.key === legacyStatus);
		if (target) {
			await ctx.db.patch(task._id, { columnId: target._id });
		}
	}

	return created;
}

export const list = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		await assertProjectAccess(ctx, args.projectId, userId);

		const columns = await ctx.db
			.query("kanban_columns")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.collect();

		return columns.sort((a, b) => a.position - b.position);
	},
});

export const ensureDefaults = mutation({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		await assertProjectAccess(ctx, args.projectId, userId);
		return await ensureProjectColumns(ctx, args.projectId, userId);
	},
});

export const create = mutation({
	args: {
		projectId: v.id("projects"),
		label: v.string(),
		color: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		await assertProjectAccess(ctx, args.projectId, userId);

		const label = args.label.trim();
		if (!label) throw new ConvexError("Column label is required");

		const columns = await ctx.db
			.query("kanban_columns")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.collect();

		const position =
			columns.length === 0
				? 0
				: Math.max(...columns.map((column) => column.position)) + 1;

		return await ctx.db.insert("kanban_columns", {
			projectId: args.projectId,
			userId,
			label,
			color:
				args.color ??
				"bg-violet-500/10 text-violet-700 dark:text-violet-300",
			position,
		});
	},
});

export const update = mutation({
	args: {
		columnId: v.id("kanban_columns"),
		label: v.optional(v.string()),
		color: v.optional(v.string()),
		wipLimit: v.optional(v.union(v.number(), v.null())),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const column = await ctx.db.get(args.columnId);
		if (!column || column.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		const updates: Record<string, unknown> = {};
		if (args.label !== undefined) {
			const label = args.label.trim();
			if (!label) throw new ConvexError("Column label is required");
			updates.label = label;
		}
		if (args.color !== undefined) updates.color = args.color;
		if (args.wipLimit !== undefined) {
			if (args.wipLimit === null) {
				updates.wipLimit = undefined;
			} else {
				const wipLimit = Math.floor(args.wipLimit);
				if (wipLimit < 1) {
					throw new ConvexError("WIP limit must be at least 1");
				}
				updates.wipLimit = wipLimit;
			}
		}

		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(args.columnId, updates);
		}
	},
});

export const remove = mutation({
	args: { columnId: v.id("kanban_columns") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const column = await ctx.db.get(args.columnId);
		if (!column || column.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		const tasksInColumn = await ctx.db
			.query("project_tasks")
			.withIndex("by_projectId", (q) => q.eq("projectId", column.projectId))
			.filter((q) => q.eq(q.field("columnId"), args.columnId))
			.collect();

		if (tasksInColumn.length > 0) {
			throw new ConvexError("Move tasks out of this column before deleting it");
		}

		const allColumns = await ctx.db
			.query("kanban_columns")
			.withIndex("by_projectId", (q) => q.eq("projectId", column.projectId))
			.collect();

		if (allColumns.length <= 1) {
			throw new ConvexError("A project must keep at least one column");
		}

		await ctx.db.delete(args.columnId);
	},
});
