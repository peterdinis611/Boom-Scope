import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const board = await ctx.db
			.query("sticky_note_boards")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		if (!board) {
			return { boardId: null, items: "[]" };
		}

		return { boardId: board._id, items: board.items };
	},
});

export const save = mutation({
	args: {
		items: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		let parsed: unknown;
		try {
			parsed = JSON.parse(args.items);
		} catch {
			throw new ConvexError("Invalid sticky notes payload");
		}

		if (!Array.isArray(parsed)) {
			throw new ConvexError("Sticky notes must be an array");
		}

		const existing = await ctx.db
			.query("sticky_note_boards")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, { items: args.items });
			return existing._id;
		}

		return await ctx.db.insert("sticky_note_boards", {
			userId,
			items: args.items,
		});
	},
});
