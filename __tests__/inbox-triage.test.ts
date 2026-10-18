import { describe, expect, test } from "vitest";
import { suggestInboxTriage } from "@/lib/inbox-triage";

describe("Lib: inbox-triage", () => {
	test("short action language → task", () => {
		const result = suggestInboxTriage("Buy milk tomorrow");
		expect(result.destination).toBe("task");
	});

	test("checklist lines → task", () => {
		const result = suggestInboxTriage("- draft brief\n- sketch wireframe\n- ship");
		expect(result.destination).toBe("task");
	});

	test("longer prose → note", () => {
		const result = suggestInboxTriage(
			"Here is a longer write-up about the product direction, audience, and the constraints we need to keep in mind while shipping the next milestone for the desk.",
		);
		expect(result.destination).toBe("note");
	});

	test("idea language → sticky", () => {
		const result = suggestInboxTriage("Random idea: neon sticky wall for weekly themes");
		expect(result.destination).toBe("sticky");
	});
});
