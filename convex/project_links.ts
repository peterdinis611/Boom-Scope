import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const linkCategory = v.union(
	v.literal("general"),
	v.literal("design"),
	v.literal("docs"),
	v.literal("tools"),
	v.literal("reference"),
	v.literal("other"),
);

function normalizeUrl(url: string): string {
	const trimmed = url.trim();
	if (!trimmed) throw new ConvexError("URL is required");
	const withProtocol = /^https?:\/\//i.test(trimmed)
		? trimmed
		: `https://${trimmed}`;
	try {
		const parsed = new URL(withProtocol);
		if (!["http:", "https:"].includes(parsed.protocol)) {
			throw new ConvexError("Only HTTP and HTTPS links are allowed");
		}
		return parsed.toString();
	} catch (error) {
		if (error instanceof ConvexError) throw error;
		throw new ConvexError("Invalid URL");
	}
}

async function assertProjectAccess(
	ctx: QueryCtx,
	projectId: Id<"projects"> | undefined,
	userId: Id<"users">,
) {
	if (!projectId) return;
	const project = await ctx.db.get(projectId);
	if (!project || project.userId !== userId) {
		throw new ConvexError("Unauthorized project");
	}
}

export const list = query({
	args: {
		projectId: v.optional(v.id("projects")),
		searchTerm: v.optional(v.string()),
		category: v.optional(linkCategory),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		if (args.projectId) {
			await assertProjectAccess(ctx, args.projectId, userId);
		}

		let links = args.projectId
			? await ctx.db
					.query("project_links")
					.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
					.filter((q) => q.eq(q.field("userId"), userId))
					.collect()
			: await ctx.db
					.query("project_links")
					.withIndex("by_userId", (q) => q.eq("userId", userId))
					.collect();

		if (args.category) {
			links = links.filter((link) => link.category === args.category);
		}

		if (args.searchTerm?.trim()) {
			const search = args.searchTerm.trim().toLowerCase();
			links = links.filter(
				(link) =>
					link.title.toLowerCase().includes(search) ||
					link.url.toLowerCase().includes(search) ||
					link.description?.toLowerCase().includes(search),
			);
		}

		const enriched = await Promise.all(
			links.map(async (link) => {
				let projectName: string | null = null;
				if (link.projectId) {
					const project = await ctx.db.get(link.projectId);
					projectName = project?.name ?? null;
				}
				return { ...link, projectName };
			}),
		);

		return enriched.sort((a, b) => {
			const pinDiff = Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
			if (pinDiff !== 0) return pinDiff;
			return b._creationTime - a._creationTime;
		});
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		url: v.string(),
		description: v.optional(v.string()),
		category: linkCategory,
		projectId: v.optional(v.id("projects")),
		isPinned: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const title = args.title.trim();
		if (!title) throw new ConvexError("Title is required");

		await assertProjectAccess(ctx, args.projectId, userId);

		return await ctx.db.insert("project_links", {
			title,
			url: normalizeUrl(args.url),
			description: args.description?.trim() || undefined,
			category: args.category,
			projectId: args.projectId,
			userId,
			isPinned: args.isPinned ?? false,
		});
	},
});

export const update = mutation({
	args: {
		linkId: v.id("project_links"),
		title: v.optional(v.string()),
		url: v.optional(v.string()),
		description: v.optional(v.string()),
		category: v.optional(linkCategory),
		projectId: v.optional(v.id("projects")),
		isPinned: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const existing = await ctx.db.get(args.linkId);
		if (!existing || existing.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		if (args.projectId !== undefined) {
			await assertProjectAccess(ctx, args.projectId, userId);
		}

		const updates: Record<string, unknown> = {};
		if (args.title !== undefined) {
			const title = args.title.trim();
			if (!title) throw new ConvexError("Title is required");
			updates.title = title;
		}
		if (args.url !== undefined) updates.url = normalizeUrl(args.url);
		if (args.description !== undefined) {
			updates.description = args.description.trim() || undefined;
		}
		if (args.category !== undefined) updates.category = args.category;
		if (args.projectId !== undefined) updates.projectId = args.projectId;
		if (args.isPinned !== undefined) updates.isPinned = args.isPinned;

		await ctx.db.patch(args.linkId, updates);
	},
});

export const remove = mutation({
	args: { linkId: v.id("project_links") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const existing = await ctx.db.get(args.linkId);
		if (!existing || existing.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		await ctx.db.delete(args.linkId);
	},
});

export const togglePin = mutation({
	args: { linkId: v.id("project_links") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Not authenticated");

		const existing = await ctx.db.get(args.linkId);
		if (!existing || existing.userId !== userId) {
			throw new ConvexError("Unauthorized");
		}

		await ctx.db.patch(args.linkId, { isPinned: !existing.isPinned });
	},
});
