import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const dashboardStats = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return { projects: 0, notes: 0, designSystems: 0 };
		}

		const [projects, notes, designSystems] = await Promise.all([
			ctx.db
				.query("projects")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("notes")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("design_systems")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
		]);

		return {
			projects: projects.length,
			notes: notes.length,
			designSystems: designSystems.length,
		};
	},
});
