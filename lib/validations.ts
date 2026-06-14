import { z } from "zod";

export const projectSchema = z.object({
	name: z
		.string()
		.min(3, "Project name must be at least 3 characters")
		.max(50, "Project name is too long (max 50 characters)"),
	description: z.string().max(200, "Description is too long").optional(),
});

export const noteSchema = z.object({
	title: z
		.string()
		.min(1, "Note title is required")
		.max(100, "Note title is too long"),
	content: z.string().min(1, "Note content cannot be empty"),
	projectId: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
