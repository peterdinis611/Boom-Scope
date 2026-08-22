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

		const [notes, designs, links, designSystems, tasks, taskEvents] =
			await Promise.all([
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
			ctx.db
				.query("task_activity_events")
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
				href: link.projectId
					? `/dashboard/links?projectId=${link.projectId}`
					: "/dashboard/links",
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
			...taskEvents.map((event) => ({
				id: event._id,
				type: "task-event" as const,
				title: event.summary,
				timestamp: event._creationTime,
				href: `/dashboard/tasks?projectId=${event.projectId}`,
			})),
		];

		return items
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);
	},
});

const GLOBAL_SEARCH_NAVIGATION = [
	{ label: "Overview", href: "/dashboard", keywords: "home dashboard" },
	{
		label: "Inbox",
		href: "/dashboard/inbox",
		keywords: "inbox capture triage",
	},
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
	{
		label: "Placeholder Text",
		href: "/dashboard/placeholder-text",
		keywords: "text lorem ipsum placeholder copy filler",
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

function startOfLocalDay(timestamp = Date.now()): number {
	const date = new Date(timestamp);
	date.setHours(0, 0, 0, 0);
	return date.getTime();
}

export const todaySummary = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return {
				dueToday: [],
				dueThisWeek: [],
				overdue: [],
				recentNotes: [],
			};
		}

		const todayStart = startOfLocalDay();
		const tomorrowStart = todayStart + 86_400_000;
		const weekEnd = todayStart + 7 * 86_400_000;

		const [tasks, notes] = await Promise.all([
			ctx.db
				.query("project_tasks")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("notes")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.order("desc")
				.take(5),
		]);

		const enriched = await Promise.all(
			tasks.map(async (task) => {
				const project = await ctx.db.get(task.projectId);
				const column = task.columnId ? await ctx.db.get(task.columnId) : null;
				return {
					_id: task._id,
					title: task.title,
					projectId: task.projectId,
					projectName: project?.name ?? null,
					dueDate: task.dueDate,
					priority: task.priority,
					columnKey: column?.key ?? task.status ?? null,
				};
			}),
		);

		const openTasks = enriched.filter((task) => task.columnKey !== "done");

		const dueToday = openTasks.filter(
			(task) =>
				task.dueDate !== undefined &&
				task.dueDate >= todayStart &&
				task.dueDate < tomorrowStart,
		);
		const dueThisWeek = openTasks.filter(
			(task) =>
				task.dueDate !== undefined &&
				task.dueDate >= tomorrowStart &&
				task.dueDate < weekEnd,
		);
		const overdue = openTasks.filter(
			(task) => task.dueDate !== undefined && task.dueDate < todayStart,
		);

		return {
			dueToday,
			dueThisWeek,
			overdue,
			recentNotes: notes.map((note) => ({
				_id: note._id,
				title: note.title,
				projectId: note.projectId,
				updatedAt: note._creationTime,
			})),
		};
	},
});

export const weeklyReview = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return {
				weekStart: 0,
				moved: [],
				completed: [],
				overdue: [],
				unlinkedTasks: [],
				notesWithoutProject: [],
				inboxOpen: 0,
			};
		}

		const weekStart = startOfLocalDay() - 6 * 86_400_000;
		const todayStart = startOfLocalDay();

		const [tasks, notes, events, inbox] = await Promise.all([
			ctx.db
				.query("project_tasks")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("notes")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
			ctx.db
				.query("task_activity_events")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.order("desc")
				.take(80),
			ctx.db
				.query("inbox_items")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect(),
		]);

		const weekEvents = events.filter(
			(event) => event._creationTime >= weekStart,
		);

		const moved = await Promise.all(
			weekEvents
				.filter((event) => event.kind === "moved" || event.kind === "updated")
				.slice(0, 8)
				.map(async (event) => {
					const project = await ctx.db.get(event.projectId);
					return {
						_id: event._id,
						summary: event.summary,
						kind: event.kind,
						taskId: event.taskId,
						projectName: project?.name ?? null,
						at: event._creationTime,
					};
				}),
		);

		const completed = await Promise.all(
			weekEvents
				.filter((event) => event.kind === "completed")
				.slice(0, 8)
				.map(async (event) => {
					const project = await ctx.db.get(event.projectId);
					return {
						_id: event._id,
						summary: event.summary,
						taskId: event.taskId,
						projectName: project?.name ?? null,
						at: event._creationTime,
					};
				}),
		);

		const enrichedTasks = await Promise.all(
			tasks.map(async (task) => {
				const project = await ctx.db.get(task.projectId);
				const column = task.columnId ? await ctx.db.get(task.columnId) : null;
				const columnKey = column?.key ?? task.status ?? null;
				return {
					_id: task._id,
					title: task.title,
					projectId: task.projectId,
					projectName: project?.name ?? null,
					dueDate: task.dueDate,
					columnKey,
					linkedNoteId: task.linkedNoteId,
					linkedDesignId: task.linkedDesignId,
				};
			}),
		);

		const openTasks = enrichedTasks.filter((task) => task.columnKey !== "done");

		const overdue = openTasks
			.filter(
				(task) => task.dueDate !== undefined && task.dueDate < todayStart,
			)
			.slice(0, 10);

		const unlinkedTasks = openTasks
			.filter((task) => !task.linkedNoteId && !task.linkedDesignId)
			.slice(0, 10);

		const notesWithoutProject = notes
			.filter((note) => !note.projectId)
			.sort((a, b) => b._creationTime - a._creationTime)
			.slice(0, 8)
			.map((note) => ({
				_id: note._id,
				title: note.title,
				at: note._creationTime,
			}));

		return {
			weekStart,
			moved,
			completed,
			overdue,
			unlinkedTasks,
			notesWithoutProject,
			inboxOpen: inbox.filter((item) => item.triagedAt === undefined).length,
		};
	},
});
