import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import TasksPage from "@/app/dashboard/tasks/page";

vi.mock("next/navigation", () => ({
	useSearchParams: vi.fn(() => ({
		get: vi.fn((key: string) => (key === "projectId" ? "proj-1" : null)),
	})),
}));

vi.mock("convex/react", () => ({
	useQuery: vi.fn(() => []),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("@/components/notes/ProjectSelector", () => ({
	ProjectSelector: () => <div>Project selector</div>,
}));

describe("Page: Tasks", () => {
	test("renders task board header and kanban columns", () => {
		render(<TasksPage />);
		expect(screen.getByText("Task Board")).toBeDefined();
		expect(screen.getByText(/Organize project work/i)).toBeDefined();
		expect(screen.getByText("To do")).toBeDefined();
		expect(screen.getByText("In progress")).toBeDefined();
		expect(screen.getByText("Done")).toBeDefined();
	});
});
