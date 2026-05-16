import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { QuickNoteDialog } from "../components/notes/QuickNoteDialog";

// Mock Convex hooks
vi.mock("convex/react", () => ({
	useQuery: vi.fn(() => []),
	useMutation: vi.fn(() => vi.fn()),
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("Component: QuickNoteDialog", () => {
	test("renders correctly when open", () => {
		render(<QuickNoteDialog open={true} onOpenChange={() => {}} />);

		expect(screen.getByText(/Rýchla poznámka/i)).toBeDefined();
		expect(screen.getByPlaceholderText(/Napr. Farebná paleta/i)).toBeDefined();
	});

	test("does not render when closed", () => {
		const { queryByText } = render(
			<QuickNoteDialog open={false} onOpenChange={() => {}} />,
		);
		expect(queryByText(/Rýchla poznámka/i)).toBeNull();
	});

	test("validates required fields before saving", async () => {
		render(<QuickNoteDialog open={true} onOpenChange={() => {}} />);

		const saveBtn = screen.getByText(/Uložiť/i);
		fireEvent.click(saveBtn);

		// Button should be disabled if fields are empty (based on component logic)
		expect(saveBtn).toBeDisabled();
	});

	test("updates title and content on input", () => {
		render(<QuickNoteDialog open={true} onOpenChange={() => {}} />);

		const titleInput = screen.getByPlaceholderText(
			/Napr. Farebná paleta/i,
		) as HTMLInputElement;
		const contentArea = screen.getByPlaceholderText(
			/Napíšte vaše poznámky/i,
		) as HTMLTextAreaElement;

		fireEvent.change(titleInput, { target: { value: "New Note" } });
		fireEvent.change(contentArea, { target: { value: "Some content" } });

		expect(titleInput.value).toBe("New Note");
		expect(contentArea.value).toBe("Some content");
	});
});
