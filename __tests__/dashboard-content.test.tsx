import { render, screen } from "@testing-library/react";
import { useQuery } from "convex/react";
import { describe, expect, test, vi } from "vitest";
import { DashboardContent } from "@/components/dashboard/dashboard-content-client";

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
	default: () =>
		function DynamicPlaceholder({ loading }: { loading?: React.ReactNode }) {
			return <>{loading ?? null}</>;
		},
}));

describe("Component: DashboardContent", () => {
	test("shows quick access placeholders while sticky note data is loading", () => {
		vi.mocked(useQuery)
			.mockReturnValueOnce({
				projects: 1,
				notes: 1,
				tasks: 0,
				designSystems: 0,
			})
			.mockReturnValueOnce(undefined);

		render(<DashboardContent viewer={{ email: "pdinis1@gmail.com" }} />);

		expect(screen.getByText(/Welcome back, pdinis1/i)).toBeDefined();
		expect(screen.getByText("Quick access")).toBeDefined();
		expect(screen.getByText("Sticky notes")).toBeDefined();
		expect(screen.getAllByText("—").length).toBeGreaterThan(0);
	});

	test("renders sticky note count in quick access", () => {
		vi.mocked(useQuery)
			.mockReturnValueOnce({
				projects: 1,
				notes: 1,
				tasks: 0,
				designSystems: 0,
				stickyNotes: 2,
			})
			.mockReturnValueOnce({
				boardId: "board-1",
				items: JSON.stringify([
					{
						id: "note-1",
						color: "#fef08a",
						text: "Idea",
						position: { x: 0, y: 0 },
					},
					{
						id: "note-2",
						color: "#bbf7d0",
						text: "Todo",
						position: { x: 20, y: 20 },
					},
				]),
			});

		render(<DashboardContent viewer={{ name: "Peter" }} />);

		const stickyRow = screen.getByText("Sticky notes").closest("a");
		expect(stickyRow).toBeDefined();
		expect(stickyRow?.textContent).toContain("2");
	});
});
