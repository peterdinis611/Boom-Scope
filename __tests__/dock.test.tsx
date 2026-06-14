import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Dock } from "../components/design/Dock";

describe("Component: Dock", () => {
	test("renders all tool icons", () => {
		render(<Dock activeTool="select" onToolChange={() => {}} />);

		expect(screen.getByRole("button", { name: /Select/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /Pencil/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /Rectangle/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /Text/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /Triangle/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /Polygon/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /Save/i })).toBeDefined();
	});

	test("calls onToolChange when a tool is clicked", () => {
		const onToolChange = vi.fn();
		render(<Dock activeTool="select" onToolChange={onToolChange} />);

		fireEvent.click(screen.getByRole("button", { name: /Pencil/i }));
		expect(onToolChange).toHaveBeenCalledWith("pencil");
	});

	test("highlights the active tool", () => {
		render(<Dock activeTool="rect" onToolChange={() => {}} />);

		const rectBtn = screen.getByRole("button", { name: /Rectangle/i });
		expect(rectBtn.getAttribute("data-variant")).toBe("default");
	});
});
