import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useQuery } from "convex/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { UserMenu } from "../components/UserMenu";
import type { Doc } from "../convex/_generated/dataModel";

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));
const mockSignOut = vi.fn().mockResolvedValue(undefined);

vi.mock("@convex-dev/auth/react", () => ({
	useAuthActions: () => ({
		signOut: mockSignOut,
	}),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		replace: vi.fn(),
		refresh: vi.fn(),
	}),
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
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
		<div role="menu">{children}</div>
	),
	DropdownMenuItem: ({
		children,
		onClick,
		asChild,
		...props
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		asChild?: boolean;
	}) =>
		asChild ? (
			<>{children}</>
		) : (
			<button type="button" role="menuitem" onClick={onClick} {...props}>
				{children}
			</button>
		),
	DropdownMenuSeparator: () => <hr />,
}));

describe("Component: UserMenu", () => {
	test("renders loading skeleton initially", () => {
		vi.mocked(useQuery).mockReturnValue(undefined);
		const { container } = render(<UserMenu />);
		expect(container.querySelector(".animate-pulse")).toBeDefined();
	});

	test("displays user info in the account menu", () => {
		vi.mocked(useQuery).mockReturnValue({
			name: "Peter Dinis",
			email: "peter@example.com",
			image: null,
		} as unknown as Doc<"users">);

		render(<UserMenu />);
		fireEvent.click(screen.getByRole("button", { name: /account menu/i }));

		expect(screen.getAllByText("Peter Dinis").length).toBeGreaterThan(0);
		expect(screen.getByText("peter@example.com")).toBeDefined();
		expect(screen.getAllByText("PE").length).toBeGreaterThan(0);
	});

	test("calls signOut from the dropdown menu", async () => {
		vi.mocked(useQuery).mockReturnValue({
			name: "User",
			email: "user@example.com",
		} as unknown as Doc<"users">);

		render(<UserMenu />);
		fireEvent.click(screen.getByRole("button", { name: /account menu/i }));
		fireEvent.click(screen.getByRole("menuitem", { name: /sign out/i }));

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalled();
		});
	});
});
