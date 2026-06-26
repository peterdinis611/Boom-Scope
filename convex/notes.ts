import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {
		paginationOpts: paginationOptsValidator,
		searchTerm: v.optional(v.string()),
		projectId: v.optional(v.id("projects")),
		tag: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return { page: [], isDone: true, continueCursor: "" };

		let q = ctx.db
			.query("notes")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.order("desc");

		// Filtering by project if provided
		if (args.projectId) {
			q = ctx.db
				.query("notes")
				.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
				.filter((q) => q.eq(q.field("userId"), userId))
				.order("desc");
		}

		const result = await q.paginate(args.paginationOpts);

		// Fetch project names for each note that has a projectId
		const pageWithProjects = await Promise.all(
			result.page.map(async (note) => {
				let projectName = null;
				if (note.projectId) {
					const project = await ctx.db.get(note.projectId);
					projectName = project?.name ?? null;
				}
				return { ...note, projectName };
			}),
		);

		// Manual filtering for search term
		let filteredPage = pageWithProjects;
		if (args.searchTerm) {
			const lowerSearch = args.searchTerm.toLowerCase();
			filteredPage = pageWithProjects.filter(
				(note) =>
					note.title.toLowerCase().includes(lowerSearch) ||
					note.content.toLowerCase().includes(lowerSearch) ||
					(note.projectName &&
						note.projectName.toLowerCase().includes(lowerSearch)) ||
					note.tags?.some((tag) => tag.toLowerCase().includes(lowerSearch)),
			);
		}

		if (args.tag?.trim()) {
			const tag = args.tag.trim().toLowerCase();
			filteredPage = filteredPage.filter((note) =>
				note.tags?.includes(tag),
			);
		}

		return { ...result, page: filteredPage };
	},
});

export const listTags = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const notes = await ctx.db
			.query("notes")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();

		const counts = new Map<string, number>();
		for (const note of notes) {
			for (const tag of note.tags ?? []) {
				counts.set(tag, (counts.get(tag) ?? 0) + 1);
			}
		}

		return [...counts.entries()]
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
	},
});

export const get = query({
	args: { noteId: v.id("notes") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;
		const note = await ctx.db.get(args.noteId);
		if (!note || note.userId !== userId) return null;
		return note;
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		content: v.string(),
		projectId: v.optional(v.id("projects")),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");
		const tags = args.tags
			?.map((tag) => tag.trim().toLowerCase())
			.filter(Boolean);
		return await ctx.db.insert("notes", {
			title: args.title,
			content: args.content,
			projectId: args.projectId,
			userId,
			tags: tags?.length ? [...new Set(tags)] : undefined,
		});
	},
});

export const update = mutation({
	args: {
		noteId: v.id("notes"),
		title: v.optional(v.string()),
		content: v.optional(v.string()),
		projectId: v.optional(v.id("projects")),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");
		const existing = await ctx.db.get(args.noteId);
		if (!existing || existing.userId !== userId)
			throw new ConvexError("Unauthorized");

		const { noteId, tags, ...updates } = args;
		const patch: Record<string, unknown> = { ...updates };
		if (tags !== undefined) {
			const normalized = tags
				.map((tag) => tag.trim().toLowerCase())
				.filter(Boolean);
			patch.tags = normalized.length ? [...new Set(normalized)] : undefined;
		}
		await ctx.db.patch(noteId, patch);
	},
});

export const remove = mutation({
	args: { noteId: v.id("notes") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");
		const existing = await ctx.db.get(args.noteId);
		if (!existing || existing.userId !== userId)
			throw new ConvexError("Unauthorized");
		await ctx.db.delete(args.noteId);
	},
});
