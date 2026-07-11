import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import { describe, expect, test, vi } from "vitest";
import {
	CommandPalette,
	CommandPaletteTrigger,
} from "@/components/command-palette/command-palette";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: vi.fn(),
}));

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));

import { useRouter } from "next/navigation";

describe("Component: CommandPalette", () => {
	beforeEach(() => {
		vi.mocked(useRouter).mockReturnValue({
			push: mockPush,
			back: vi.fn(),
			refresh: vi.fn(),
			replace: vi.fn(),
			prefetch: vi.fn(),
			forward: vi.fn(),
		});
		mockPush.mockReset();
	});

	test("shows hint when open with empty search", () => {
		vi.mocked(useQuery).mockReturnValue(undefined);
		render(<CommandPalette open onOpenChange={() => {}} />);
		expect(screen.getByText(/Type to search or jump to a page/i)).toBeDefined();
	});

	test("opens via keyboard shortcut", () => {
		vi.mocked(useQuery).mockReturnValue(undefined);
		const onOpenChange = vi.fn();

		render(<CommandPalette open={false} onOpenChange={onOpenChange} />);

		fireEvent.keyDown(window, { key: "k", metaKey: true });
		expect(onOpenChange).toHaveBeenCalledWith(true);
	});

	test("renders grouped search results", async () => {
		vi.mocked(useQuery).mockReturnValue({
			navigation: [{ label: "Notes", href: "/dashboard/notes", type: "nav" }],
			results: [{ label: "Meeting note", href: "/dashboard/notes/n1", type: "note" }],
		});

		render(<CommandPalette open onOpenChange={() => {}} />);

		const input = screen.getByPlaceholderText(/Search projects, notes/i);
		fireEvent.change(input, { target: { value: "meet" } });

		await waitFor(
			() => {
				expect(screen.getByText("Navigation")).toBeDefined();
				expect(screen.getByText("Results")).toBeDefined();
				expect(screen.getByRole("button", { name: "Notes" })).toBeDefined();
				expect(screen.getByRole("button", { name: "Meeting note" })).toBeDefined();
			},
			{ timeout: 1000 },
		);
	});

	test("navigates and closes when selecting a result", async () => {
		vi.mocked(useQuery).mockReturnValue({
			navigation: [],
			results: [{ label: "Tasks", href: "/dashboard/tasks", type: "nav" }],
		});
		const onOpenChange = vi.fn();

		render(<CommandPalette open onOpenChange={onOpenChange} />);

		const input = screen.getByPlaceholderText(/Search projects, notes/i);
		fireEvent.change(input, { target: { value: "task" } });

		const resultButton = await screen.findByRole(
			"button",
			{ name: "Tasks" },
			{ timeout: 1000 },
		);
		fireEvent.click(resultButton);

		expect(mockPush).toHaveBeenCalledWith("/dashboard/tasks");
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	test("trigger button renders search label", () => {
		render(<CommandPaletteTrigger onClick={() => {}} />);
		expect(screen.getByText(/Search/i)).toBeDefined();
		expect(screen.getByText("⌘K")).toBeDefined();
	});
});
