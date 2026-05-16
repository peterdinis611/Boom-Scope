import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {
		paginationOpts: paginationOptsValidator,
		searchTerm: v.optional(v.string()),
		projectId: v.optional(v.id("projects")),
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
						note.projectName.toLowerCase().includes(lowerSearch)),
			);
		}

		return { ...result, page: filteredPage };
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
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");
		return await ctx.db.insert("notes", {
			title: args.title,
			content: args.content,
			projectId: args.projectId,
			userId,
		});
	},
});

export const update = mutation({
	args: {
		noteId: v.id("notes"),
		title: v.optional(v.string()),
		content: v.optional(v.string()),
		projectId: v.optional(v.id("projects")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");
		const existing = await ctx.db.get(args.noteId);
		if (!existing || existing.userId !== userId)
			throw new ConvexError("Unauthorized");

		const { noteId, ...updates } = args;
		await ctx.db.patch(noteId, updates);
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
