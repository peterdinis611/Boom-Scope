import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import { describe, expect, test, vi } from "vitest";
import { StickyNotesBoard } from "@/components/sticky-notes/sticky-notes-board";

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("@/components/notes/ProjectSelector", () => ({
	ProjectSelector: () => <div>Project filter</div>,
}));

vi.mock("@/lib/sticky-notes", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/sticky-notes")>();
	return {
		...actual,
		readStickyNotesCache: vi.fn(() => []),
		writeStickyNotesCache: vi.fn(),
	};
});

import { writeStickyNotesCache } from "@/lib/sticky-notes";

describe("Component: StickyNotesBoard", () => {
	test("shows empty board state", () => {
		vi.mocked(useQuery).mockReturnValue({ boardId: null, items: "[]" });
		render(<StickyNotesBoard />);
		expect(screen.getByText(/Your board is empty/i)).toBeDefined();
	});

	test("hydrates notes from convex board data", async () => {
		vi.mocked(useQuery).mockReturnValue({
			boardId: "board-1",
			items: JSON.stringify([
				{
					id: "note-1",
					color: "#fef08a",
					text: "Remember tests",
					position: { x: 10, y: 20 },
				},
			]),
		});

		render(<StickyNotesBoard />);

		expect(await screen.findByText("Remember tests")).toBeDefined();
	});

	test("adds a note and debounces save to convex", async () => {
		vi.useFakeTimers();
		const mockSave = vi.fn().mockResolvedValue(undefined);
		vi.mocked(useQuery).mockReturnValue({ boardId: "board-1", items: "[]" });
		vi.mocked(useMutation).mockReturnValue(mockSave);

		render(<StickyNotesBoard />);

		fireEvent.click(screen.getByRole("button", { name: /Add note/i }));

		expect(document.querySelector("[data-sticky-note-id]")).toBeDefined();
		expect(writeStickyNotesCache).toHaveBeenCalled();

		await act(async () => {
			vi.advanceTimersByTime(500);
		});

		expect(mockSave).toHaveBeenCalled();
		vi.useRealTimers();
	});

	test("highlights focused note from query param", async () => {
		vi.mocked(useQuery).mockReturnValue({
			boardId: "board-1",
			items: JSON.stringify([
				{
					id: "focus-note",
					color: "#bbf7d0",
					text: "Focused note",
					position: { x: 0, y: 0 },
				},
			]),
		});

		const scrollIntoView = vi.fn();
		HTMLElement.prototype.scrollIntoView = scrollIntoView;

		render(<StickyNotesBoard focusNoteId="focus-note" />);

		expect(await screen.findByText("Focused note")).toBeDefined();

		await waitFor(() => {
			expect(scrollIntoView).toHaveBeenCalled();
		});
	});
});
