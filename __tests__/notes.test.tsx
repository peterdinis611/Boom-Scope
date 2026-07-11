import { fireEvent, render, screen } from "@testing-library/react";
import { usePaginatedQuery, useQuery } from "convex/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { NoteList } from "../components/notes/NoteList";
import type { Id } from "../convex/_generated/dataModel";

vi.mock("convex/react", () => ({
	usePaginatedQuery: vi.fn(),
	useQuery: vi.fn(() => []),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

describe("Component: NoteList", () => {
	test("renders loading skeletons initially", () => {
		vi.mocked(usePaginatedQuery).mockReturnValue({
			results: [],
			status: "LoadingFirstPage",
			loadMore: vi.fn(),
		});

		const { container } = render(<NoteList />);
		expect(container.querySelector(".animate-pulse")).toBeDefined();
	});

	test("renders empty state when no notes found", () => {
		vi.mocked(usePaginatedQuery).mockReturnValue({
			results: [],
			status: "Exhausted",
			loadMore: vi.fn(),
		});

		render(<NoteList />);
		expect(screen.getByText("No notes")).toBeDefined();
	});

	test("renders a list of notes", () => {
		const mockNotes = [
			{
				_id: "n1" as unknown as Id<"notes">,
				title: "Meeting Note",
				content: "<p>Content</p>",
				_creationTime: Date.now(),
				projectName: "Alpha",
			},
		];
		vi.mocked(usePaginatedQuery).mockReturnValue({
			results: mockNotes,
			status: "CanLoadMore",
			loadMore: vi.fn(),
		});

		render(<NoteList />);
		expect(screen.getByText("Meeting Note")).toBeDefined();
		expect(screen.getByText("Alpha")).toBeDefined();
	});

	test("updates search term on input change", () => {
		const loadMore = vi.fn();
		vi.mocked(usePaginatedQuery).mockReturnValue({
			results: [],
			status: "Exhausted",
			loadMore,
		});

		render(<NoteList />);
		const input = screen.getByPlaceholderText(/Search notes/i);
		fireEvent.change(input, { target: { value: "test query" } });

		expect((input as HTMLInputElement).value).toBe("test query");
	});

	test("renders tag filter options from convex", () => {
		vi.mocked(useQuery).mockReturnValue([
			{ tag: "design", count: 2 },
			{ tag: "meeting", count: 1 },
		]);
		vi.mocked(usePaginatedQuery).mockReturnValue({
			results: [],
			status: "Exhausted",
			loadMore: vi.fn(),
		});

		render(<NoteList />);
		expect(screen.getByRole("button", { name: /design/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /meeting/i })).toBeDefined();
	});
});
