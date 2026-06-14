import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { QuickActions } from "../components/dashboard/quick-actions";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
}));

vi.mock("convex/react", () => ({
	useQuery: vi.fn(() => []),
	useMutation: vi.fn(() => vi.fn()),
}));

describe("Component: QuickActions", () => {
	test("renders toggle button and opens action menu", () => {
		render(<QuickActions />);

		const toggle = screen.getByRole("button", {
			name: /Open quick actions/i,
		});
		fireEvent.click(toggle);

		expect(screen.getByText(/^New note$/i)).toBeInTheDocument();
		expect(screen.getByText(/^AI Generator$/i)).toBeInTheDocument();
		expect(screen.getByText(/^Canvas$/i)).toBeInTheDocument();
	});

	test("navigates to canvas when canvas action is clicked", () => {
		render(<QuickActions />);

		fireEvent.click(
			screen.getByRole("button", { name: /Open quick actions/i }),
		);
		fireEvent.click(screen.getByText(/^Canvas$/i).closest("button")!);

		expect(pushMock).toHaveBeenCalledWith("/dashboard/canvas");
	});

	test("opens quick note dialog from note action", () => {
		render(<QuickActions />);

		fireEvent.click(
			screen.getByRole("button", { name: /Open quick actions/i }),
		);
		fireEvent.click(screen.getByText(/^New note$/i).closest("button")!);

		expect(
			screen.getByRole("heading", { name: /Quick note/i }),
		).toBeInTheDocument();
	});
});
