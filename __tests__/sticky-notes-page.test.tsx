import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import StickyNotesPage from "@/app/dashboard/sticky-notes/page";

vi.mock("next/navigation", () => ({
	useSearchParams: vi.fn(() => ({
		get: vi.fn(() => null),
	})),
}));

vi.mock("next/dynamic", () => ({
	default: () => {
		const DynamicMock = () => (
			<div data-testid="sticky-notes-board">Sticky notes board</div>
		);
		return DynamicMock;
	},
}));

describe("Page: Sticky Notes", () => {
	test("renders page title and board", () => {
		render(<StickyNotesPage />);
		expect(screen.getByText("Sticky Notes")).toBeDefined();
		expect(
			screen.getByText(/Drag, resize, and edit notes on your board/i),
		).toBeDefined();
		expect(screen.getByTestId("sticky-notes-board")).toBeDefined();
	});
});
