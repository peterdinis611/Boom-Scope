import { render, screen } from "@testing-library/react";
import { useQuery } from "convex/react";
import { describe, expect, test, vi } from "vitest";
import { StickyNotesPreview } from "@/components/dashboard/sticky-notes-preview";
import { api } from "@/convex/_generated/api";

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));

describe("Component: StickyNotesPreview", () => {
	test("shows loading state while board query is pending", () => {
		vi.mocked(useQuery).mockReturnValue(undefined);
		render(<StickyNotesPreview />);
		expect(screen.getByText(/Loading sticky notes/i)).toBeDefined();
	});

	test("shows empty state when there are no notes", () => {
		vi.mocked(useQuery).mockReturnValue({ boardId: null, items: "[]" });
		render(<StickyNotesPreview />);
		expect(screen.getByText(/No sticky notes yet/i)).toBeDefined();
		expect(screen.getByRole("link", { name: /Create your first note/i })).toHaveAttribute(
			"href",
			"/dashboard/sticky-notes",
		);
	});

	test("renders clickable sticky note previews", () => {
		vi.mocked(useQuery).mockReturnValue({
			boardId: "board-1",
			items: JSON.stringify([
				{
					id: "note-1",
					color: "#fef08a",
					text: "Ship dashboard tests",
					position: { x: 0, y: 0 },
				},
				{
					id: "note-2",
					color: "#bbf7d0",
					text: "Fix hydration",
					position: { x: 40, y: 40 },
				},
			]),
		});

		render(<StickyNotesPreview />);

		expect(screen.getByText("Ship dashboard tests")).toBeDefined();
		expect(screen.getByRole("link", { name: /Ship dashboard tests/i })).toHaveAttribute(
			"href",
			"/dashboard/sticky-notes?note=note-1",
		);
		expect(screen.getByRole("link", { name: /Fix hydration/i })).toHaveAttribute(
			"href",
			"/dashboard/sticky-notes?note=note-2",
		);
		expect(useQuery).toHaveBeenCalledWith(api.sticky_notes.get);
	});
});
