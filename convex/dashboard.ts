import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { fuseSearch, stripHtmlForSearch } from "../lib/fuse-search";
import { query } from "./_generated/server";

export const dashboardStats = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return { projects: 0, notes: 0, designSystems: 0, tasks: 0, stickyNotes: 0 };
		}

		const [projects, notes, designSystems, tasks, stickyBoard] = await Promise.all([
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
			ctx.db
				.query("project_tasks")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("sticky_note_boards")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.first(),
		]);

		let stickyNotes = 0;
		if (stickyBoard?.items) {
			try {
				const parsed = JSON.parse(stickyBoard.items);
				stickyNotes = Array.isArray(parsed) ? parsed.length : 0;
			} catch {
				stickyNotes = 0;
			}
		}

		return {
			projects: projects.length,
			notes: notes.length,
			designSystems: designSystems.length,
			tasks: tasks.length,
			stickyNotes,
		};
	},
});

export const recentActivity = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const limit = Math.min(args.limit ?? 12, 30);

		const [notes, designs, links, designSystems, tasks] = await Promise.all([
			ctx.db
				.query("notes")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.order("desc")
				.take(limit),
			ctx.db
				.query("designs")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.order("desc")
				.take(limit),
			ctx.db
				.query("project_links")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.order("desc")
				.take(limit),
			ctx.db
				.query("design_systems")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.order("desc")
				.take(limit),
			ctx.db
				.query("project_tasks")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.order("desc")
				.take(limit),
		]);

		const items = [
			...notes.map((note) => ({
				id: note._id,
				type: "note" as const,
				title: note.title,
				timestamp: note._creationTime,
				href: `/dashboard/notes/${note._id}`,
			})),
			...designs.map((design) => ({
				id: design._id,
				type: "design" as const,
				title: design.name,
				timestamp: design._creationTime,
				href: `/dashboard/canvas?projectId=${design.projectId}&designId=${design._id}`,
			})),
			...links.map((link) => ({
				id: link._id,
				type: "link" as const,
				title: link.title,
				timestamp: link._creationTime,
				href: "/dashboard/links",
			})),
			...designSystems.map((system) => ({
				id: system._id,
				type: "design-system" as const,
				title: "Design system updated",
				timestamp: system._creationTime,
				href: `/dashboard/design-system/v2?projectId=${system.projectId}`,
			})),
			...tasks.map((task) => ({
				id: task._id,
				type: "task" as const,
				title: task.title,
				timestamp: task._creationTime,
				href: `/dashboard/tasks?projectId=${task.projectId}`,
			})),
		];

		return items
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);
	},
});

const GLOBAL_SEARCH_NAVIGATION = [
	{ label: "Overview", href: "/dashboard", keywords: "home dashboard" },
	{ label: "Projects", href: "/dashboard/projects", keywords: "projects" },
	{ label: "Notes", href: "/dashboard/notes", keywords: "notes documents" },
	{ label: "Link Hub", href: "/dashboard/links", keywords: "links resources" },
	{
		label: "Sticky Notes",
		href: "/dashboard/sticky-notes",
		keywords: "sticky notes board",
	},
	{
		label: "Task Board",
		href: "/dashboard/tasks",
		keywords: "tasks kanban board",
	},
	{ label: "Canvas", href: "/dashboard/canvas", keywords: "canvas design" },
	{
		label: "Design System",
		href: "/dashboard/design-system/v2",
		keywords: "design system tokens",
	},
	{
		label: "AI Generator",
		href: "/dashboard/generator",
		keywords: "ai generator",
	},
	{
		label: "Placeholder Images",
		href: "/dashboard/images",
		keywords: "images placeholder picsum",
	},
	{ label: "Pomodoro", href: "/dashboard/pomodoro", keywords: "pomodoro timer focus" },
	{ label: "Settings", href: "/dashboard/settings", keywords: "settings profile" },
] as const;

export const globalSearch = query({
	args: { term: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return { navigation: [], results: [] };

		const term = args.term.trim();
		if (!term) return { navigation: [], results: [] };

		const navigation = fuseSearch(
			GLOBAL_SEARCH_NAVIGATION,
			term,
			["label", "keywords"],
		);

		const [projects, notes, links, designs, tasks] = await Promise.all([
			ctx.db
				.query("projects")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("notes")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("project_links")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("designs")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("project_tasks")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
		]);

		const results = [
			...fuseSearch(projects, term, ["name", "description"]).map((project) => ({
				type: "project" as const,
				label: project.name,
				href: `/dashboard/projects/${project._id}`,
			})),
			...fuseSearch(
				notes.map((note) => ({
					...note,
					plainContent: stripHtmlForSearch(note.content),
				})),
				term,
				["title", "plainContent", "tags"],
				undefined,
				8,
			).map((note) => ({
				type: "note" as const,
				label: note.title,
				href: `/dashboard/notes/${note._id}`,
			})),
			...fuseSearch(links, term, ["title", "url", "description"], undefined, 8).map(
				(link) => ({
					type: "link" as const,
					label: link.title,
					href: "/dashboard/links",
				}),
			),
			...fuseSearch(designs, term, ["name"], undefined, 8).map((design) => ({
				type: "design" as const,
				label: design.name,
				href: `/dashboard/canvas?projectId=${design.projectId}&designId=${design._id}`,
			})),
			...fuseSearch(tasks, term, ["title", "description"], undefined, 8).map(
				(task) => ({
					type: "task" as const,
					label: task.title,
					href: `/dashboard/tasks?projectId=${task.projectId}`,
				}),
			),
		];

		return { navigation, results: results.slice(0, 20) };
	},
});
