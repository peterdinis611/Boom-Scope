import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { HeaderQuickActions } from "@/components/dashboard/header-quick-actions";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: vi.fn(),
}));

vi.mock("convex/react", () => ({
	useQuery: vi.fn(() => []),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
	DropdownMenu: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuItem: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
	}) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
	DropdownMenuSeparator: () => <hr />,
}));

describe("Component: HeaderQuickActions", () => {
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

	test("renders quick actions trigger", () => {
		render(<HeaderQuickActions />);
		expect(screen.getByRole("button", { name: /Quick actions/i })).toBeDefined();
	});

	test("navigates to canvas from quick action", () => {
		render(<HeaderQuickActions />);
		fireEvent.click(screen.getByRole("button", { name: /Canvas/i }));
		expect(mockPush).toHaveBeenCalledWith("/dashboard/canvas");
	});

	test("opens quick note dialog from menu", () => {
		render(<HeaderQuickActions />);
		fireEvent.click(screen.getByRole("button", { name: /New note/i }));
		expect(screen.getByRole("heading", { name: /Quick note/i })).toBeDefined();
	});

	test("shows clipboard badge when count is provided", () => {
		const onOpenClipboard = vi.fn();
		render(
			<HeaderQuickActions
				onOpenClipboard={onOpenClipboard}
				clipboardCount={3}
			/>,
		);

		expect(screen.getByText("3")).toBeDefined();
		fireEvent.click(screen.getByRole("button", { name: /Clipboard/i }));
		expect(onOpenClipboard).toHaveBeenCalled();
	});
});
