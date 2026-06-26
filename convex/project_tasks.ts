import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const taskStatus = v.union(
	v.literal("todo"),
	v.literal("in_progress"),
	v.literal("done"),
);

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

export const list = query({
	args: {
		projectId: v.optional(v.id("projects")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		let tasks = args.projectId
			? await (async () => {
					const projectId = args.projectId;
					if (!projectId) return [];
					return ctx.db
						.query("project_tasks")
						.withIndex("by_projectId", (q) => q.eq("projectId", projectId))
						.filter((q) => q.eq(q.field("userId"), userId))
						.collect();
				})()
			: await ctx.db
					.query("project_tasks")
					.withIndex("by_userId", (q) => q.eq("userId", userId))
					.collect();

		const enriched = await Promise.all(
			tasks.map(async (task) => {
				const project = await ctx.db.get(task.projectId);
				return { ...task, projectName: project?.name ?? null };
			}),
		);

		return enriched.sort((a, b) => a.position - b.position);
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		projectId: v.id("projects"),
		status: v.optional(taskStatus),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const title = args.title.trim();
		if (!title) throw new ConvexError("Title is required");

		await assertProjectAccess(ctx, args.projectId, userId);

		const existing = await ctx.db
			.query("project_tasks")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.filter((q) => q.eq(q.field("userId"), userId))
			.collect();

		const status = args.status ?? "todo";
		const inColumn = existing.filter((task) => task.status === status);
		const position =
			inColumn.length === 0
				? 0
				: Math.max(...inColumn.map((task) => task.position)) + 1;

		return await ctx.db.insert("project_tasks", {
			title,
			description: args.description?.trim() || undefined,
			status,
			projectId: args.projectId,
			userId,
			position,
		});
	},
});

export const update = mutation({
	args: {
		taskId: v.id("project_tasks"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		status: v.optional(taskStatus),
		position: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const existing = await ctx.db.get(args.taskId);
		if (!existing || existing.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		const updates: Record<string, unknown> = {};
		if (args.title !== undefined) {
			const title = args.title.trim();
			if (!title) throw new ConvexError("Title is required");
			updates.title = title;
		}
		if (args.description !== undefined) {
			updates.description = args.description.trim() || undefined;
		}
		if (args.status !== undefined) updates.status = args.status;
		if (args.position !== undefined) updates.position = args.position;

		await ctx.db.patch(args.taskId, updates);
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

		await ctx.db.delete(args.taskId);
	},
});
