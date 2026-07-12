import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,
	users: defineTable({
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),
		isAnonymous: v.optional(v.boolean()),
		accentColor: v.optional(v.string()),
	})
		.index("email", ["email"])
		.index("phone", ["phone"]),
	projects: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		userId: v.id("users"),
	}).index("by_userId", ["userId"]),
	notes: defineTable({
		title: v.string(),
		content: v.string(),
		projectId: v.optional(v.id("projects")),
		userId: v.id("users"),
		tags: v.optional(v.array(v.string())),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
	designs: defineTable({
		name: v.string(),
		elements: v.string(),
		canvasSize: v.optional(
			v.object({
				width: v.number(),
				height: v.number(),
			}),
		),
		artboardColor: v.optional(v.string()),
		projectId: v.id("projects"),
		userId: v.id("users"),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
	design_systems: defineTable({
		projectId: v.id("projects"),
		userId: v.id("users"),
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
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
	project_links: defineTable({
		title: v.string(),
		url: v.string(),
		description: v.optional(v.string()),
		category: v.union(
			v.literal("general"),
			v.literal("design"),
			v.literal("docs"),
			v.literal("tools"),
			v.literal("reference"),
			v.literal("other"),
		),
		projectId: v.optional(v.id("projects")),
		userId: v.id("users"),
		isPinned: v.optional(v.boolean()),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
	sticky_note_boards: defineTable({
		userId: v.id("users"),
		items: v.string(),
	}).index("by_userId", ["userId"]),
	kanban_columns: defineTable({
		projectId: v.id("projects"),
		userId: v.id("users"),
		label: v.string(),
		color: v.string(),
		position: v.number(),
		key: v.optional(v.string()),
		wipLimit: v.optional(v.number()),
	})
		.index("by_projectId", ["projectId"]),
	project_tasks: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		status: v.optional(
			v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
		),
		columnId: v.optional(v.id("kanban_columns")),
		projectId: v.id("projects"),
		userId: v.id("users"),
		position: v.number(),
		linkedNoteId: v.optional(v.id("notes")),
		linkedDesignId: v.optional(v.id("designs")),
		focusMinutes: v.optional(v.number()),
		dueDate: v.optional(v.number()),
		priority: v.optional(
			v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
		),
		labels: v.optional(v.array(v.string())),
		subtasks: v.optional(
			v.array(
				v.object({
					id: v.string(),
					title: v.string(),
					completed: v.boolean(),
				}),
			),
		),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
	task_activity_events: defineTable({
		userId: v.id("users"),
		projectId: v.id("projects"),
		taskId: v.id("project_tasks"),
		kind: v.union(
			v.literal("created"),
			v.literal("updated"),
			v.literal("moved"),
			v.literal("completed"),
			v.literal("deleted"),
		),
		summary: v.string(),
	})
		.index("by_userId", ["userId"])
		.index("by_taskId", ["taskId"]),
});
