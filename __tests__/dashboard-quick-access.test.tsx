import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { DashboardQuickAccess } from "@/components/dashboard/dashboard-quick-access";

describe("Component: DashboardQuickAccess", () => {
	test("groups work and create links with counts", () => {
		render(
			<DashboardQuickAccess
				stats={{
					projects: 3,
					notes: 5,
					tasks: 2,
					designSystems: 1,
					stickyNotes: 4,
				}}
			/>,
		);

		expect(screen.getByText("Quick access")).toBeDefined();
		expect(screen.getByText("Work")).toBeDefined();
		expect(screen.getByText("Create")).toBeDefined();
		expect(screen.getByText("Projects").closest("a")?.textContent).toContain("3");
		expect(screen.getByText("Design system").closest("a")?.textContent).toContain(
			"1",
		);
	});
});
