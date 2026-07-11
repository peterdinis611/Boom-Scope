import { render, screen } from "@testing-library/react";
import { useQuery } from "convex/react";
import { describe, expect, test, vi } from "vitest";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));

describe("Component: ActivityFeed", () => {
	test("shows loading state while query is pending", () => {
		vi.mocked(useQuery).mockReturnValue(undefined);
		render(<ActivityFeed />);
		expect(screen.getByText(/Loading activity/i)).toBeDefined();
	});

	test("shows empty state when there is no activity", () => {
		vi.mocked(useQuery).mockReturnValue([]);
		render(<ActivityFeed />);
		expect(screen.getByText(/No recent activity yet/i)).toBeDefined();
	});

	test("renders activity items with links", () => {
		vi.mocked(useQuery).mockReturnValue([
			{
				type: "note",
				id: "note-1",
				title: "Sprint planning",
				href: "/dashboard/notes/note-1",
				timestamp: Date.now() - 60_000,
			},
			{
				type: "task",
				id: "task-1",
				title: "Ship kanban board",
				href: "/dashboard/tasks?projectId=proj-1",
				timestamp: Date.now() - 3_600_000,
			},
		]);

		render(<ActivityFeed />);

		expect(screen.getByRole("link", { name: /Sprint planning/i })).toHaveAttribute(
			"href",
			"/dashboard/notes/note-1",
		);
		expect(screen.getByRole("link", { name: /Ship kanban board/i })).toHaveAttribute(
			"href",
			"/dashboard/tasks?projectId=proj-1",
		);
		expect(screen.getByText(/Note ·/i)).toBeDefined();
		expect(screen.getByText(/Task ·/i)).toBeDefined();
	});
});
