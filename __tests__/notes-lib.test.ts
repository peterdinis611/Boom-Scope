import { afterEach, describe, expect, test, vi } from "vitest";
import { downloadNoteAsTxt } from "@/lib/notes";

describe("Lib: Notes", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("downloadNoteAsTxt strips HTML and downloads plain text", () => {
		const clickMock = vi.fn();
		const revokeMock = vi.fn();
		const createObjectURLMock = vi.fn().mockReturnValue("blob:mock-note");

		vi.stubGlobal("URL", {
			createObjectURL: createObjectURLMock,
			revokeObjectURL: revokeMock,
		});

		const anchor = document.createElement("a");
		anchor.click = clickMock;
		const createElementOriginal = document.createElement.bind(document);
		const createElementSpy = vi
			.spyOn(document, "createElement")
			.mockImplementation((tag: string) => {
				if (tag === "a") return anchor;
				return createElementOriginal(tag);
			});

		downloadNoteAsTxt("My note", "<p>Content <strong>note</strong></p>");

		expect(createElementSpy).toHaveBeenCalledWith("a");
		expect(anchor.download).toBe("My note.txt");
		expect(clickMock).toHaveBeenCalled();
		expect(revokeMock).toHaveBeenCalledWith("blob:mock-note");

		const blobArg = createObjectURLMock.mock.calls[0]?.[0] as Blob;
		expect(blobArg.type).toBe("text/plain");
	});
});
