import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { DashboardSidebarNav } from "../components/dashboard/dashboard-nav";
import { SidebarProvider } from "../components/dashboard/sidebar-context";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	usePathname: vi.fn(),
}));

describe("Component: DashboardSidebarNav", () => {
	test("renders all navigation links", () => {
		vi.mocked(usePathname).mockReturnValue("/dashboard");

		render(
			<SidebarProvider>
				<DashboardSidebarNav />
			</SidebarProvider>,
		);

		expect(screen.getByText("Prehľad")).toBeDefined();
		expect(screen.getByText("Projekty")).toBeDefined();
		expect(screen.getByText("Poznámky")).toBeDefined();
		expect(screen.getByText("Canvas")).toBeDefined();
		expect(screen.getByText("Design System")).toBeDefined();
	});

	test("highlights the active link", () => {
		vi.mocked(usePathname).mockReturnValue("/dashboard/projects");

		render(
			<SidebarProvider>
				<DashboardSidebarNav />
			</SidebarProvider>,
		);

		const projectsLink = screen.getByRole("link", { name: /Projekty/i });
		expect(projectsLink.className).toContain("bg-sidebar-accent");
	});
});
