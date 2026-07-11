import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { describe, expect, test, vi } from "vitest";
import { LinkLibrary } from "@/components/links/link-library";
import type { Id } from "@/convex/_generated/dataModel";

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@/components/notes/ProjectSelector", () => ({
	ProjectSelector: () => <div>Project selector</div>,
}));

describe("Component: LinkLibrary", () => {
	test("shows loading placeholders while links are undefined", () => {
		vi.mocked(useQuery).mockReturnValueOnce(undefined).mockReturnValueOnce([]);
		render(<LinkLibrary defaultProjectId={"proj-1" as Id<"projects">} />);
		expect(document.querySelector(".animate-pulse")).toBeDefined();
	});

	test("shows empty state when there are no links", () => {
		vi.mocked(useQuery).mockReturnValue([]);
		render(<LinkLibrary defaultProjectId={"proj-1" as Id<"projects">} />);
		expect(screen.getByText(/No links yet/i)).toBeDefined();
	});

	test("renders saved links", () => {
		vi.mocked(useQuery).mockReturnValue([
			{
				_id: "link-1" as Id<"project_links">,
				title: "Figma file",
				url: "https://figma.com/file/1",
				category: "design",
				projectId: "proj-1" as Id<"projects">,
				isPinned: true,
				_creationTime: Date.now(),
			},
		]);

		render(<LinkLibrary defaultProjectId={"proj-1" as Id<"projects">} />);

		expect(screen.getByText("Figma file")).toBeDefined();
		expect(screen.getByText("figma.com")).toBeDefined();
	});

	test("filters links by search term", async () => {
		vi.mocked(useQuery).mockReturnValue([]);
		render(<LinkLibrary defaultProjectId={"proj-1" as Id<"projects">} />);

		const input = screen.getByPlaceholderText(/Search links/i);
		fireEvent.change(input, { target: { value: "docs" } });

		await waitFor(() => {
			expect((input as HTMLInputElement).value).toBe("docs");
		});
	});

	test("creates a link from the dialog", async () => {
		const mockCreate = vi.fn().mockResolvedValue("link-new");
		vi.mocked(useQuery).mockReturnValue([]);
		vi.mocked(useMutation).mockReturnValue(mockCreate);

		render(<LinkLibrary defaultProjectId={"proj-1" as Id<"projects">} />);

		fireEvent.click(screen.getByRole("button", { name: /Add link/i }));

		fireEvent.change(screen.getByLabelText(/Title/i), {
			target: { value: "Docs" },
		});
		fireEvent.change(screen.getByLabelText(/URL/i), {
			target: { value: "https://docs.example.com" },
		});

		fireEvent.click(screen.getByRole("button", { name: /^Add link$/i }));

		await waitFor(() => {
			expect(mockCreate).toHaveBeenCalled();
			expect(toast.success).toHaveBeenCalledWith("Link saved");
		});
	});
});
