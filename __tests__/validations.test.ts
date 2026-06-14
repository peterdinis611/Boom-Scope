import { describe, expect, it } from "vitest";
import { noteSchema, projectSchema } from "@/lib/validations";

describe("projectSchema", () => {
	it("should validate a correct project", () => {
		const validProject = {
			name: "My Great Project",
			description: "This is a project description",
		};
		expect(projectSchema.safeParse(validProject).success).toBe(true);
	});

	it("should fail if name is too short", () => {
		const invalidProject = { name: "Ab" };
		const result = projectSchema.safeParse(invalidProject);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Project name must be at least 3 characters",
			);
		}
	});

	it("should fail if name is too long", () => {
		const invalidProject = { name: "a".repeat(51) };
		const result = projectSchema.safeParse(invalidProject);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Project name is too long (max 50 characters)",
			);
		}
	});

	it("should allow optional description", () => {
		const validProject = { name: "Project without description" };
		expect(projectSchema.safeParse(validProject).success).toBe(true);
	});
});

describe("noteSchema", () => {
	it("should validate a correct note", () => {
		const validNote = {
			title: "Important note",
			content: "Content of my note...",
			projectId: "proj_123",
		};
		expect(noteSchema.safeParse(validNote).success).toBe(true);
	});

	it("should fail if title is empty", () => {
		const invalidNote = { title: "", content: "Content" };
		const result = noteSchema.safeParse(invalidNote);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe("Note title is required");
		}
	});

	it("should fail if content is empty", () => {
		const invalidNote = { title: "Title", content: "" };
		const result = noteSchema.safeParse(invalidNote);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Note content cannot be empty",
			);
		}
	});

	it("should allow optional projectId", () => {
		const validNote = { title: "Title", content: "Content" };
		expect(noteSchema.safeParse(validNote).success).toBe(true);
	});
});
