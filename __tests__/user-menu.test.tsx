import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useQuery } from "convex/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { UserMenu } from "../components/UserMenu";
import type { Doc } from "../convex/_generated/dataModel";

// Mock Convex
vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));
const mockSignOut = vi.fn().mockResolvedValue(undefined);

vi.mock("@convex-dev/auth/react", () => ({
	useAuthActions: () => ({
		signOut: mockSignOut,
	}),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		replace: vi.fn(),
		refresh: vi.fn(),
	}),
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("Component: UserMenu", () => {
	test("renders loading skeletons initially", () => {
		vi.mocked(useQuery).mockReturnValue(undefined);
		const { container } = render(<UserMenu />);
		expect(container.querySelector(".animate-pulse")).toBeDefined();
	});

	test("displays user info when loaded", () => {
		vi.mocked(useQuery).mockReturnValue({
			name: "Peter Dinis",
			email: "peter@example.com",
			image: null,
		} as unknown as Doc<"users">);

		render(<UserMenu />);
		expect(screen.getByText("Peter Dinis")).toBeDefined();
		expect(screen.getByText("peter@example.com")).toBeDefined();
		// Initials check
		expect(screen.getByText("PE")).toBeDefined();
	});

	test("calls signOut when button is clicked", async () => {
		vi.mocked(useQuery).mockReturnValue({
			name: "User",
		} as unknown as Doc<"users">);

		render(<UserMenu />);
		const logoutBtn = screen.getByTitle("Odhlásiť sa");
		fireEvent.click(logoutBtn);

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalled();
		});
	});
});
