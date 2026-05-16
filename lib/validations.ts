import { z } from "zod";

export const projectSchema = z.object({
	name: z
		.string()
		.min(3, "Názov projektu musí mať aspoň 3 znaky")
		.max(50, "Názov projektu je príliš dlhý (max 50 znakov)"),
	description: z.string().max(200, "Popis je príliš dlhý").optional(),
});

export const noteSchema = z.object({
	title: z
		.string()
		.min(1, "Názov poznámky je povinný")
		.max(100, "Názov poznámky je príliš dlhý"),
	content: z.string().min(1, "Obsah poznámky nemôže byť prázdny"),
	projectId: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
