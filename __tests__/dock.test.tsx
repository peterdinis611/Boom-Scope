import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Dock } from "../components/design/Dock";

describe("Component: Dock", () => {
	test("renders all tool icons", () => {
		render(<Dock activeTool="select" onToolChange={() => {}} />);

		expect(screen.getByText(/Výber/i)).toBeDefined();
		expect(screen.getByText(/Pero/i)).toBeDefined();
		expect(screen.getByText(/Obdĺžnik/i)).toBeDefined();
		expect(screen.getByText(/Text/i)).toBeDefined();
		expect(screen.getByText(/Trojuholník/i)).toBeDefined();
		expect(screen.getByText(/Mnohouholník/i)).toBeDefined();
		expect(screen.getByText(/Uložiť/i)).toBeDefined();
	});

	test("calls onToolChange when a tool is clicked", () => {
		const onToolChange = vi.fn();
		render(<Dock activeTool="select" onToolChange={onToolChange} />);

		const pencilBtn = screen.getByText(/Pero/i).closest("button");
		if (pencilBtn) fireEvent.click(pencilBtn);

		expect(onToolChange).toHaveBeenCalledWith("pencil");
	});

	test("highlights the active tool", () => {
		render(<Dock activeTool="rect" onToolChange={() => {}} />);

		const rectBtn = screen.getByText(/Obdĺžnik/i).closest("button");
		// Check if it has the active class/style (bg-primary)
		expect(rectBtn?.innerHTML).toContain("bg-primary");
	});
});
