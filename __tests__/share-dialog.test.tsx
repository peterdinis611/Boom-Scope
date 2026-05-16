import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ShareDialog } from "../components/design/ShareDialog";

describe("Component: ShareDialog", () => {
	const mockOnClose = vi.fn();
	const designId = "design123";

	test("renders when open", () => {
		render(
			<ShareDialog isOpen={true} onClose={mockOnClose} designId={designId} />,
		);
		expect(screen.getByText(/Zdieľať Design/i)).toBeDefined();
		expect(screen.getByText(/^Verejný Odkaz$/i)).toBeDefined();
	});

	test("displays correctly truncated designId in URL", () => {
		render(
			<ShareDialog isOpen={true} onClose={mockOnClose} designId={designId} />,
		);
		expect(screen.getByText(new RegExp(designId, "i"))).toBeDefined();
	});

	test("calls onClose when close button is clicked", () => {
		render(
			<ShareDialog isOpen={true} onClose={mockOnClose} designId={designId} />,
		);
		const closeBtn = screen.getByRole("button", { name: "" }); // The X icon button
		fireEvent.click(closeBtn);
		expect(mockOnClose).toHaveBeenCalled();
	});

	test("copies to clipboard on copy button click", async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: {
				writeText: writeTextMock,
			},
		});

		render(
			<ShareDialog isOpen={true} onClose={mockOnClose} designId={designId} />,
		);

		const copyBtn = screen.getByText(/Kopírovať/i);
		fireEvent.click(copyBtn);

		expect(writeTextMock).toHaveBeenCalled();
		// After click, the label is replaced with the Check icon.
		expect(screen.queryByText(/Kopírovať/i)).toBeNull();
	});
});
