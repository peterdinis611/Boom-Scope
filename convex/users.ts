import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const viewer = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return null;
		return await ctx.db.get(userId);
	},
});

export const updateUser = mutation({
	args: {
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		accentColor: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) throw new Error("Unauthorized");

		await ctx.db.patch(userId, {
			name: args.name,
			image: args.image,
			accentColor: args.accentColor,
		});
	},
});
