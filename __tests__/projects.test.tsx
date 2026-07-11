import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import ProjectsPage from "../app/dashboard/projects/page";
import type { Id } from "../convex/_generated/dataModel";

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		back: vi.fn(),
	}),
	useParams: () => ({
		projectId: "test-project-id",
	}),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("Page: Projects", () => {
	test("renders loading state when projects are undefined", () => {
		vi.mocked(useQuery).mockReturnValue(undefined);
		render(<ProjectsPage />);
		expect(screen.getByText("Projects")).toBeDefined();
	});

	test("renders empty state when there are no projects", () => {
		vi.mocked(useQuery).mockReturnValue([]);
		render(<ProjectsPage />);
		expect(screen.getByText(/No projects/i)).toBeDefined();
	});

	test("renders a list of projects", () => {
		const mockProjects = [
			{
				_id: "1" as unknown as Id<"projects">,
				name: "Project One",
				description: "Desc one",
			},
			{
				_id: "2" as unknown as Id<"projects">,
				name: "Project Two",
				description: "Desc two",
			},
		];
		vi.mocked(useQuery).mockReturnValue(mockProjects);
		render(<ProjectsPage />);

		expect(screen.getByText("Project One")).toBeDefined();
		expect(screen.getByText("Project Two")).toBeDefined();
	});

	test("opens create project modal", () => {
		vi.mocked(useQuery).mockReturnValue([]);
		render(<ProjectsPage />);

		const createButton = screen.getAllByText(/New project/i)[0];
		fireEvent.click(createButton);

		expect(screen.getByText(/Project name/i)).toBeDefined();
	});

	test("calls create mutation on form submission", async () => {
		const mockCreate = vi.fn().mockResolvedValue("new-id");
		vi.mocked(useQuery).mockReturnValue([]);
		vi.mocked(useMutation).mockReturnValue(mockCreate);

		render(<ProjectsPage />);

		fireEvent.click(screen.getAllByText(/New project/i)[0]);

		const input = screen.getByPlaceholderText(/e.g. Web application/i);
		fireEvent.change(input, { target: { value: "New Brand" } });

		const submitButton = screen.getByRole("button", { name: /^Create$/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockCreate).toHaveBeenCalledWith({ name: "New Brand" });
		});
	});
});
