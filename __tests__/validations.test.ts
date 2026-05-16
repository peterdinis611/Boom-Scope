import { describe, expect, it } from "vitest";
import { noteSchema, projectSchema } from "@/lib/validations";

describe("projectSchema", () => {
	it("should validate a correct project", () => {
		const validProject = {
			name: "Môj Skvelý Projekt",
			description: "Toto je popis projektu",
		};
		expect(projectSchema.safeParse(validProject).success).toBe(true);
	});

	it("should fail if name is too short", () => {
		const invalidProject = { name: "Ab" };
		const result = projectSchema.safeParse(invalidProject);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Názov projektu musí mať aspoň 3 znaky",
			);
		}
	});

	it("should fail if name is too long", () => {
		const invalidProject = { name: "a".repeat(51) };
		const result = projectSchema.safeParse(invalidProject);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Názov projektu je príliš dlhý (max 50 znakov)",
			);
		}
	});

	it("should allow optional description", () => {
		const validProject = { name: "Projekt bez popisu" };
		expect(projectSchema.safeParse(validProject).success).toBe(true);
	});
});

describe("noteSchema", () => {
	it("should validate a correct note", () => {
		const validNote = {
			title: "Dôležitá poznámka",
			content: "Obsah mojej poznámky...",
			projectId: "proj_123",
		};
		expect(noteSchema.safeParse(validNote).success).toBe(true);
	});

	it("should fail if title is empty", () => {
		const invalidNote = { title: "", content: "Obsah" };
		const result = noteSchema.safeParse(invalidNote);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe("Názov poznámky je povinný");
		}
	});

	it("should fail if content is empty", () => {
		const invalidNote = { title: "Názov", content: "" };
		const result = noteSchema.safeParse(invalidNote);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Obsah poznámky nemôže byť prázdny",
			);
		}
	});

	it("should allow optional projectId", () => {
		const validNote = { title: "Názov", content: "Obsah" };
		expect(noteSchema.safeParse(validNote).success).toBe(true);
	});
});
