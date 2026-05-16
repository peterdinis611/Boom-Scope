import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {
		projectId: v.id("projects"),
		colors: v.array(
			v.object({
				name: v.string(),
				hex: v.string(),
				rgb: v.string(),
			}),
		),
		fonts: v.array(v.string()),
		description: v.optional(v.string()),
		goodThings: v.optional(v.array(v.string())),
		badThings: v.optional(v.array(v.string())),
		suggestions: v.optional(v.array(v.string())),
		isPublic: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorized");

		// Verify project ownership
		const project = await ctx.db.get(args.projectId);
		if (!project || project.userId !== userId) throw new Error("Unauthorized");

		return await ctx.db.insert("design_systems", {
			projectId: args.projectId,
			userId,
			colors: args.colors,
			fonts: args.fonts,
			description: args.description,
			goodThings: args.goodThings,
			badThings: args.badThings,
			suggestions: args.suggestions,
			isPublic: args.isPublic ?? false,
		});
	},
});

export const getByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const systems = await ctx.db
			.query("design_systems")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.collect();

		return systems;
	},
});

/** List all design systems for the current user (history) */
export const listByUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const systems = await ctx.db
			.query("design_systems")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();

		// Attach project name
		return Promise.all(
			systems.map(async (s) => {
				const project = await ctx.db.get(s.projectId);
				return { ...s, projectName: project?.name ?? "Neznámy projekt" };
			}),
		);
	},
});

/** Get a single design system publicly (no auth required) */
export const getPublic = query({
	args: { id: v.id("design_systems") },
	handler: async (ctx, args) => {
		const system = await ctx.db.get(args.id);
		if (!system) return null;
		if (!system.isPublic) return null;
		return system;
	},
});

/** Owner-only fetch for editing / share UI */
export const getById = query({
	args: { id: v.id("design_systems") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;
		const system = await ctx.db.get(args.id);
		if (!system || system.userId !== userId) return null;
		return system;
	},
});

export const update = mutation({
	args: {
		id: v.id("design_systems"),
		colors: v.optional(
			v.array(
				v.object({
					name: v.string(),
					hex: v.string(),
					rgb: v.string(),
				}),
			),
		),
		fonts: v.optional(v.array(v.string())),
		description: v.optional(v.string()),
		goodThings: v.optional(v.array(v.string())),
		badThings: v.optional(v.array(v.string())),
		suggestions: v.optional(v.array(v.string())),
		isPublic: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorized");
		const existing = await ctx.db.get(args.id);
		if (!existing || existing.userId !== userId)
			throw new Error("Unauthorized");
		const { id, ...rest } = args;
		const patch: Record<string, unknown> = {};
		if (rest.colors !== undefined) patch.colors = rest.colors;
		if (rest.fonts !== undefined) patch.fonts = rest.fonts;
		if (rest.description !== undefined) patch.description = rest.description;
		if (rest.goodThings !== undefined) patch.goodThings = rest.goodThings;
		if (rest.badThings !== undefined) patch.badThings = rest.badThings;
		if (rest.suggestions !== undefined) patch.suggestions = rest.suggestions;
		if (rest.isPublic !== undefined) patch.isPublic = rest.isPublic;
		await ctx.db.patch(id, patch);
	},
});

/** Toggle isPublic flag */
export const setPublic = mutation({
	args: { id: v.id("design_systems"), isPublic: v.boolean() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorized");
		const system = await ctx.db.get(args.id);
		if (!system || system.userId !== userId) throw new Error("Unauthorized");
		await ctx.db.patch(args.id, { isPublic: args.isPublic });
	},
});

/** Delete a design system */
export const remove = mutation({
	args: { id: v.id("design_systems") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorized");
		const system = await ctx.db.get(args.id);
		if (!system || system.userId !== userId) throw new Error("Unauthorized");
		await ctx.db.delete(args.id);
	},
});
