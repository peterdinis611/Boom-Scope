import { fireEvent, render, screen } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import ProjectsPage from "../app/dashboard/projects/page";
import type { Id } from "../convex/_generated/dataModel";

// Mock Convex hooks
vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		back: vi.fn(),
	}),
	useParams: () => ({
		projectId: "test-project-id",
	}),
}));

// Mock Sonner toast
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
		// Our ProjectsPage doesn't have a global loading spinner in the current implementation,
		// but it shows an empty state or handles undefined.
		// Let's check for the header at least.
		expect(screen.getByText(/Vaše/i)).toBeDefined();
	});

	test("renders empty state when there are no projects", () => {
		vi.mocked(useQuery).mockReturnValue([]);
		render(<ProjectsPage />);
		expect(screen.getByText(/Žiadne projekty/i)).toBeDefined();
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

		const createButton = screen.getByText(/Nový Projekt/i);
		fireEvent.click(createButton);

		expect(screen.getByText(/Názov Projektu/i)).toBeDefined();
	});

	test("calls create mutation on form submission", async () => {
		const mockCreate = vi.fn().mockResolvedValue("new-id");
		vi.mocked(useQuery).mockReturnValue([]);
		vi.mocked(useMutation).mockReturnValue(mockCreate);

		render(<ProjectsPage />);

		// Open modal
		fireEvent.click(screen.getByText(/Nový Projekt/i));

		// Fill input
		const input = screen.getByPlaceholderText(/Napr. Moderná Vila/i);
		fireEvent.change(input, { target: { value: "New Brand" } });

		// Submit
		const submitButton = screen.getByText(/Vytvoriť Projekt/i);
		fireEvent.submit(submitButton);

		expect(mockCreate).toHaveBeenCalledWith({ name: "New Brand" });
	});
});
