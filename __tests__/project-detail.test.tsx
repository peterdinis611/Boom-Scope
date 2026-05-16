import { render, screen } from "@testing-library/react";
import { useQuery } from "convex/react";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import ProjectDetailPage from "../app/dashboard/projects/[projectId]/page";
import { api } from "../convex/_generated/api";
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
	test("renders project title and description", () => {
		vi.mocked(useParams).mockReturnValue({ projectId: "test-id" });
		vi.mocked(useQuery).mockImplementation((query: any, args: any) => {
			// Identification by arguments or path
			if (args?.projectId && !args?.paginationOpts && !query?._path?.includes("list") && !query?._path?.includes("getByProject")) {
				return {
					_id: "test-id" as unknown as Id<"projects">,
					name: "Architecture Project",
					description: "A custom villa design",
				};
			}
			if (args?.paginationOpts) return { page: [] };
			return [];
		});

		render(<ProjectDetailPage />);

		expect(screen.getByText("Architecture Project")).toBeDefined();
		expect(screen.getByText("A custom villa design")).toBeDefined();
	});

	test("shows the correct module sections", () => {
		vi.mocked(useParams).mockReturnValue({ projectId: "test-id" });
		vi.mocked(useQuery).mockImplementation((query: any, args: any) => {
			if (args?.projectId && !args?.paginationOpts && !query?._path?.includes("list") && !query?._path?.includes("getByProject")) {
				return {
					_id: "test-id" as unknown as Id<"projects">,
					name: "Test Project",
				};
			}
			if (args?.paginationOpts) return { page: [] };
			return [];
		});

		render(<ProjectDetailPage />);

		expect(screen.getByText("Poznámky")).toBeDefined();
		expect(screen.getByText("Canvas")).toBeDefined();
		expect(screen.getByText("Design Systems")).toBeDefined();
	});

	test("handles non-existent project", () => {
		vi.mocked(useParams).mockReturnValue({ projectId: "wrong-id" });
		vi.mocked(useQuery).mockImplementation((query: any, args: any) => {
			if (args?.projectId && !args?.paginationOpts && !query?._path?.includes("list") && !query?._path?.includes("getByProject")) {
				return null;
			}
			return [];
		});

		render(<ProjectDetailPage />);

		expect(screen.getByText(/Projekt neexistuje/i)).toBeDefined();
	});
});
