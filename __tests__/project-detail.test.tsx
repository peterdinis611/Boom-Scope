import { render, screen } from "@testing-library/react";
import { useQuery } from "convex/react";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ProjectDetailPage from "../app/dashboard/projects/[projectId]/page";
import type { Id } from "../convex/_generated/dataModel";

// Mock Convex
vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		back: vi.fn(),
	}),
	useParams: vi.fn(),
	useSearchParams: vi.fn(() => ({
		get: vi.fn(),
	})),
}));

describe("Page: Project Detail", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test("renders project title and description", async () => {
		vi.mocked(useParams).mockReturnValue({ projectId: "test-id" });

		const mockProject = {
			_id: "test-id" as unknown as Id<"projects">,
			name: "Architecture Project",
			description: "A custom villa design",
			_creationTime: Date.now(),
		};

		// Mock sequence of queries in ProjectDetailPage:
		// 1. project = useQuery(api.projects.getById, ...)
		// 2. designs = useQuery(api.designs.listByProject, ...)
		// 3. designSystems = useQuery(api.design_systems.getByProject, ...)
		// 4. notes = useQuery(api.notes.list, ...)
		vi.mocked(useQuery)
			.mockReturnValueOnce(mockProject) // project
			.mockReturnValueOnce([]) // designs
			.mockReturnValueOnce([]) // systems
			.mockReturnValueOnce({ page: [] }); // notes

		render(<ProjectDetailPage />);

		expect(await screen.findByText("Architecture Project")).toBeDefined();
		expect(screen.getByText("A custom villa design")).toBeDefined();
	});

	test("shows the correct module sections", async () => {
		vi.mocked(useParams).mockReturnValue({ projectId: "test-id" });

		const mockProject = {
			_id: "test-id" as unknown as Id<"projects">,
			name: "Test Project",
			_creationTime: Date.now(),
		};

		vi.mocked(useQuery)
			.mockReturnValueOnce(mockProject)
			.mockReturnValueOnce([])
			.mockReturnValueOnce([])
			.mockReturnValueOnce({ page: [] });

		render(<ProjectDetailPage />);

		expect(await screen.findByText("Notes")).toBeDefined();
		expect(screen.getByText("Canvas")).toBeDefined();
		expect(screen.getByText("Design systems")).toBeDefined();
	});

	test("handles non-existent project", async () => {
		vi.mocked(useParams).mockReturnValue({ projectId: "wrong-id" });

		// 1. project = useQuery returns null
		vi.mocked(useQuery).mockReturnValueOnce(null);

		render(<ProjectDetailPage />);

		expect(await screen.findByText(/Project does not exist/i)).toBeDefined();
	});
});
