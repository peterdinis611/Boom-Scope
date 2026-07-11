import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { StickyNoteCard } from "@/components/sticky-notes/sticky-note-card";
import type { StickyNoteItem } from "@/lib/sticky-notes";

const baseNote: StickyNoteItem = {
	id: "note-1",
	color: "#fef08a",
	text: "Ship sticky note tests",
	position: { x: 12, y: 24 },
};

describe("Component: StickyNoteCard", () => {
	test("renders note text and delete control", () => {
		render(
			<StickyNoteCard
				note={baseNote}
				isActive={false}
				onSelect={vi.fn()}
				onUpdate={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(screen.getByText("Ship sticky note tests")).toBeDefined();
		expect(screen.getByRole("button", { name: /Delete note/i })).toBeDefined();
	});

	test("calls onDelete when delete button is clicked", () => {
		const onDelete = vi.fn();
		render(
			<StickyNoteCard
				note={baseNote}
				isActive
				onSelect={vi.fn()}
				onUpdate={vi.fn()}
				onDelete={onDelete}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /Delete note/i }));
		expect(onDelete).toHaveBeenCalledWith("note-1");
	});

	test("persists edited text on blur", () => {
		const onUpdate = vi.fn();
		render(
			<StickyNoteCard
				note={baseNote}
				isActive
				onSelect={vi.fn()}
				onUpdate={onUpdate}
				onDelete={vi.fn()}
			/>,
		);

		const editor = screen.getByText("Ship sticky note tests");
		editor.textContent = "Updated copy";
		fireEvent.blur(editor);

		expect(onUpdate).toHaveBeenCalledWith("note-1", { text: "Updated copy" });
	});
});
