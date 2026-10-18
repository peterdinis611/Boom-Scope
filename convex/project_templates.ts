import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { ensureProjectColumns } from "./kanban_columns";
import { mutation } from "./_generated/server";

const STARTER_NOTE = `<h2>Project brief</h2><p>What are we shipping? Who is it for?</p><ul><li>Goal</li><li>Constraints</li><li>Definition of done</li></ul>`;

const STARTER_CANVAS = JSON.stringify([]);

const TEMPLATE_TASKS = [
	{ title: "Define scope", labels: ["planning"] },
	{ title: "Draft first note", labels: ["docs"] },
	{ title: "Sketch layout on canvas", labels: ["design"] },
	{ title: "Ship first milestone", labels: ["focus"] },
] as const;

/**
 * Create a project pre-seeded with Kanban columns, a starter note,
 * a blank canvas frame, and four starter tasks.
 */
export const createFromTemplate = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		templateId: v.optional(v.literal("starter-desk")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new ConvexError("Unauthorized");

		const name = args.name.trim();
		if (name.length < 3) throw new ConvexError("Name is too short");

		const projectId = await ctx.db.insert("projects", {
			name,
			description: args.description?.trim() || undefined,
			userId,
			fromTemplate: args.templateId ?? "starter-desk",
		});

		const columns = await ensureProjectColumns(ctx, projectId, userId);
		const todoColumn =
			columns.find((column) => column.key === "todo") ?? columns[0];
		if (!todoColumn) throw new ConvexError("Failed to seed columns");

		const noteId = await ctx.db.insert("notes", {
			title: `${name} — Brief`,
			content: STARTER_NOTE,
			projectId,
			userId,
			tags: ["brief"],
		});

		const designId = await ctx.db.insert("designs", {
			name: `${name} — Canvas`,
			elements: STARTER_CANVAS,
			canvasSize: { width: 1440, height: 900 },
			artboardColor: "#ffffff",
			projectId,
			userId,
		});

		for (let index = 0; index < TEMPLATE_TASKS.length; index++) {
			const item = TEMPLATE_TASKS[index];
			await ctx.db.insert("project_tasks", {
				title: item.title,
				projectId,
				userId,
				columnId: todoColumn._id,
				position: index,
				labels: [...item.labels],
				linkedNoteId: index === 1 ? noteId : undefined,
				linkedDesignId: index === 2 ? designId : undefined,
			});
		}

		return {
			projectId,
			noteId,
			designId,
		};
	},
});
