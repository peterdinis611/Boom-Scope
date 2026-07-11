import { fireEvent, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { renderWithDashboardProviders } from "./helpers/render-dashboard";

vi.mock("next/navigation", () => ({
	usePathname: vi.fn(),
	useRouter: () => ({
		push: vi.fn(),
		back: vi.fn(),
		replace: vi.fn(),
	}),
}));

vi.mock("convex/react", () => ({
	useQuery: vi.fn(() => undefined),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("@/hooks/useCopyToClipboard", () => ({
	useCopyToClipboard: () => ({
		history: [],
		copy: vi.fn(),
		copiedValue: null,
		clearHistory: vi.fn(),
		deleteHistoryItem: vi.fn(),
	}),
}));

vi.mock("@/components/mode-toggle", () => ({
	ModeToggle: () => <div data-testid="mode-toggle" />,
}));

vi.mock("@/components/UserMenu", () => ({
	UserMenu: () => <div data-testid="user-menu" />,
}));

vi.mock("@/components/command-palette/command-palette", () => ({
	CommandPalette: () => null,
	CommandPaletteTrigger: ({ onClick }: { onClick: () => void }) => (
		<button type="button" onClick={onClick}>
			Search
		</button>
	),
}));

vi.mock("@/components/dashboard/dashboard-nav", () => ({
	DashboardMobileNav: () => <div data-testid="mobile-nav" />,
}));

describe("Component: DashboardHeader", () => {
	test("renders the correct title based on pathname", () => {
		vi.mocked(usePathname).mockReturnValue("/dashboard/notes");

		renderWithDashboardProviders(<DashboardHeader />);

		expect(screen.getByText("Notes")).toBeDefined();
		expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeDefined();
	});

	test("toggles sidebar on button click", () => {
		vi.mocked(usePathname).mockReturnValue("/dashboard");

		renderWithDashboardProviders(<DashboardHeader />);

		const toggleBtn = screen.getByRole("button", { name: /Close sidebar/i });
		fireEvent.click(toggleBtn);

		expect(screen.getByRole("button", { name: /Open sidebar/i })).toBeDefined();
	});

	test("renders command palette trigger on default layout", () => {
		vi.mocked(usePathname).mockReturnValue("/dashboard");

		renderWithDashboardProviders(<DashboardHeader />);

		expect(screen.getByRole("button", { name: /Search/i })).toBeDefined();
	});
});
