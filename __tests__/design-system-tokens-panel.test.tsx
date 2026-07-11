import { fireEvent, render, screen } from "@testing-library/react";
import { useQuery } from "convex/react";
import { describe, expect, test, vi } from "vitest";
import { DesignSystemTokensPanel } from "@/components/design/canvas/DesignSystemTokensPanel";

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));

describe("Component: DesignSystemTokensPanel", () => {
	test("shows assign-project message when projectId is missing", () => {
		render(
			<DesignSystemTokensPanel
				projectId={null}
				onApplyColor={vi.fn()}
				onApplyFont={vi.fn()}
			/>,
		);
		expect(
			screen.getByText(/Assign this canvas to a project/i),
		).toBeDefined();
	});

	test("shows loading state while design system loads", () => {
		vi.mocked(useQuery).mockReturnValue(undefined);
		render(
			<DesignSystemTokensPanel
				projectId="proj-1"
				onApplyColor={vi.fn()}
				onApplyFont={vi.fn()}
			/>,
		);
		expect(screen.getByText(/Loading design system/i)).toBeDefined();
	});

	test("shows empty state when project has no design system", () => {
		vi.mocked(useQuery).mockReturnValue([]);
		render(
			<DesignSystemTokensPanel
				projectId="proj-1"
				onApplyColor={vi.fn()}
				onApplyFont={vi.fn()}
			/>,
		);
		expect(
			screen.getByText(/No design system saved for this project/i),
		).toBeDefined();
	});

	test("applies color and font tokens", () => {
		const onApplyColor = vi.fn();
		const onApplyFont = vi.fn();

		vi.mocked(useQuery).mockReturnValue([
			{
				_id: "ds-1",
				colors: [{ name: "Primary", hex: "#3366ff" }],
				fonts: ["Inter, sans-serif"],
			},
		]);

		render(
			<DesignSystemTokensPanel
				projectId="proj-1"
				onApplyColor={onApplyColor}
				onApplyFont={onApplyFont}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /Primary/i }));
		fireEvent.click(screen.getByRole("button", { name: /Inter, sans-serif/i }));

		expect(onApplyColor).toHaveBeenCalledWith("#3366ff");
		expect(onApplyFont).toHaveBeenCalledWith("Inter, sans-serif");
	});
});
