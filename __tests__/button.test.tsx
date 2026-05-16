import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Button } from "../components/ui/button";

describe("Component: Button", () => {
	test("renders with children correctly", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByText("Click me")).toBeDefined();
	});

	test("applies variant classes correctly", () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button", { name: /delete/i });
		expect(button.getAttribute("data-variant")).toBe("destructive");
	});

	test("is disabled when disabled prop is passed", () => {
		render(<Button disabled>Disabled</Button>);
		const button = screen.getByRole("button", { name: /disabled/i });
		expect(button).toBeDisabled();
	});
});
