import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const saveDesign = mutation({
	args: {
		name: v.string(),
		elements: v.string(),
		projectId: v.id("projects"),
		canvasSize: v.optional(
			v.object({
				width: v.number(),
				height: v.number(),
			}),
		),
		artboardColor: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const userId = await auth.getUserId(ctx);
		if (!userId) throw new ConvexError("User not found");

		const designId = await ctx.db.insert("designs", {
			name: args.name,
			elements: args.elements,
			projectId: args.projectId,
			userId: userId,
			canvasSize: args.canvasSize,
			artboardColor: args.artboardColor,
		});

		return designId;
	},
});

export const getDesign = query({
	args: { designId: v.id("designs") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.designId);
	},
});
export const updateDesign = mutation({
	args: {
		id: v.id("designs"),
		elements: v.string(),
		canvasSize: v.optional(
			v.object({
				width: v.number(),
				height: v.number(),
			}),
		),
		artboardColor: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const userId = await auth.getUserId(ctx);
		if (!userId) throw new ConvexError("User not found");

		const existing = await ctx.db.get(args.id);
		if (!existing || existing.userId !== userId) throw new ConvexError("Unauthorized");

		await ctx.db.patch(args.id, {
			elements: args.elements,
			canvasSize: args.canvasSize,
			artboardColor: args.artboardColor,
		});
	},
});

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("designs")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.filter((q) => q.eq(q.field("userId"), userId))
			.collect();
	},
});

