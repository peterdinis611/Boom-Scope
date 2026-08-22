import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { ensureProjectColumns } from "./kanban_columns";

function firstLineTitle(body: string, fallback = "Inbox capture"): string {
	const line = body.trim().split("\n")[0]?.trim() ?? "";
	if (!line) return fallback;
	return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}

async function assertInboxAccess(
	ctx: QueryCtx | MutationCtx,
	itemId: Id<"inbox_items">,
	userId: Id<"users">,
) {
	const item = await ctx.db.get(itemId);
	if (!item || item.userId !== userId) {
		throw new ConvexError("Inbox item not found");
	}
	return item;
}

async function assertProjectAccess(
	ctx: QueryCtx | MutationCtx,
	projectId: Id<"projects">,
	userId: Id<"users">,
) {
	const project = await ctx.db.get(projectId);
	if (!project || project.userId !== userId) {
		throw new ConvexError("Unauthorized project");
	}
	return project;
}

export const listOpen = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const items = await ctx.db
			.query("inbox_items")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();

		return items.filter((item) => item.triagedAt === undefined);
	},
});

export const openCount = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return 0;

		const items = await ctx.db
			.query("inbox_items")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();

		return items.filter((item) => item.triagedAt === undefined).length;
	},
});

export const capture = mutation({
	args: {
		body: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const body = args.body.trim();
		if (!body) throw new ConvexError("Capture text is required");

		return await ctx.db.insert("inbox_items", {
			userId,
			body,
		});
	},
});

export const dismiss = mutation({
	args: {
		itemId: v.id("inbox_items"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const item = await assertInboxAccess(ctx, args.itemId, userId);
		if (item.triagedAt !== undefined) return item._id;

		await ctx.db.patch(item._id, { triagedAt: Date.now() });
		return item._id;
	},
});

export const remove = mutation({
	args: {
		itemId: v.id("inbox_items"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		await assertInboxAccess(ctx, args.itemId, userId);
		await ctx.db.delete(args.itemId);
		return args.itemId;
	},
});

export const triageToNote = mutation({
	args: {
		itemId: v.id("inbox_items"),
		projectId: v.optional(v.id("projects")),
		title: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const item = await assertInboxAccess(ctx, args.itemId, userId);
		if (args.projectId) {
			await assertProjectAccess(ctx, args.projectId, userId);
		}

		const title = (args.title?.trim() || firstLineTitle(item.body)).trim();
		const noteId = await ctx.db.insert("notes", {
			title,
			content: item.body,
			projectId: args.projectId,
			userId,
		});

		await ctx.db.patch(item._id, { triagedAt: Date.now() });
		return { noteId, itemId: item._id };
	},
});

export const triageToTask = mutation({
	args: {
		itemId: v.id("inbox_items"),
		projectId: v.id("projects"),
		title: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const item = await assertInboxAccess(ctx, args.itemId, userId);
		await assertProjectAccess(ctx, args.projectId, userId);

		const columns = await ensureProjectColumns(ctx, args.projectId, userId);
		const todoColumn =
			columns.find((column) => column.key === "todo") ?? columns[0];
		if (!todoColumn) throw new ConvexError("No kanban columns available");

		const existing = await ctx.db
			.query("project_tasks")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.filter((q) => q.eq(q.field("userId"), userId))
			.collect();
		const inColumn = existing.filter(
			(task) => task.columnId === todoColumn._id,
		);
		const position =
			inColumn.length === 0
				? 0
				: Math.max(...inColumn.map((task) => task.position)) + 1;

		const title = (args.title?.trim() || firstLineTitle(item.body)).trim();
		const description =
			item.body.trim() === title ? undefined : item.body.trim();

		const taskId = await ctx.db.insert("project_tasks", {
			title,
			description,
			projectId: args.projectId,
			userId,
			columnId: todoColumn._id,
			position,
		});

		await ctx.db.insert("task_activity_events", {
			userId,
			projectId: args.projectId,
			taskId,
			kind: "created",
			summary: `Created from inbox: ${title}`,
		});

		await ctx.db.patch(item._id, { triagedAt: Date.now() });
		return { taskId, itemId: item._id };
	},
});

export const triageToSticky = mutation({
	args: {
		itemId: v.id("inbox_items"),
		projectId: v.optional(v.id("projects")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const item = await assertInboxAccess(ctx, args.itemId, userId);
		if (args.projectId) {
			await assertProjectAccess(ctx, args.projectId, userId);
		}

		const board = await ctx.db
			.query("sticky_note_boards")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		let items: Array<Record<string, unknown>> = [];
		if (board?.items) {
			try {
				const parsed = JSON.parse(board.items) as unknown;
				if (Array.isArray(parsed)) items = parsed as Array<Record<string, unknown>>;
			} catch {
				items = [];
			}
		}

		const colors = [
			"#fef08a",
			"#fbcfe8",
			"#bbf7d0",
			"#bfdbfe",
			"#fed7aa",
			"#ddd6fe",
		];
		const offset = items.length * 28;
		const stickyId = `sticky-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		items.push({
			id: stickyId,
			color: colors[items.length % colors.length],
			text: item.body,
			selected: false,
			projectId: args.projectId,
			position: { x: 32 + offset, y: 32 + offset },
			width: 240,
			height: 240,
		});

		const payload = JSON.stringify(items);
		if (board) {
			await ctx.db.patch(board._id, { items: payload });
		} else {
			await ctx.db.insert("sticky_note_boards", {
				userId,
				items: payload,
			});
		}

		await ctx.db.patch(item._id, { triagedAt: Date.now() });
		return { stickyId, itemId: item._id };
	},
});
