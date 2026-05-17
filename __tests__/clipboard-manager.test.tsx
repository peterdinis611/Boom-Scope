import {
	act,
	fireEvent,
	render,
	renderHook,
	screen,
} from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ClipboardManager } from "../components/dashboard/clipboard-manager";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

// Mock Sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

describe("Hook: useCopyToClipboard & History Manager", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();

		// Mock navigator.clipboard
		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText: vi.fn().mockImplementation(() => Promise.resolve()),
			},
			writable: true,
			configurable: true,
		});
	});

	test("copies value and adds it to local storage history", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copy("#123456");
		});

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("#123456");
		expect(toast.success).toHaveBeenCalledWith("Skopírované: #123456");
		expect(result.current.history.length).toBe(1);
		expect(result.current.history[0].text).toBe("#123456");
	});

	test("restricts clipboard history to a maximum of 10 items", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			// Copy 11 distinct items
			for (let i = 1; i <= 11; i++) {
				await result.current.copy(`item-${i}`);
			}
		});

		// History length must be capped at 10
		expect(result.current.history.length).toBe(10);

		// The oldest item (item-1) should have been overridden/evicted,
		// and the newest item (item-11) should be at the top of the stack.
		expect(result.current.history[0].text).toBe("item-11");
		expect(result.current.history.some((h) => h.text === "item-1")).toBe(false);
	});

	test("removes duplicate items and pushes most recent to top", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copy("duplicate-item");
			await result.current.copy("other-item");
			await result.current.copy("duplicate-item"); // copied again
		});

		expect(result.current.history.length).toBe(2);
		expect(result.current.history[0].text).toBe("duplicate-item");
	});

	test("clears the clipboard history fully", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copy("something");
			result.current.clearHistory();
		});

		expect(result.current.history.length).toBe(0);
		expect(toast.success).toHaveBeenCalledWith("História schránky vymazaná.");
	});

	test("deletes an individual item from clipboard history", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copy("item-a");
			await result.current.copy("item-b");
		});

		const itemToDeleteId = result.current.history.find(
			(h) => h.text === "item-a",
		)?.id;

		await act(async () => {
			if (itemToDeleteId) {
				result.current.deleteHistoryItem(itemToDeleteId);
			}
		});

		expect(result.current.history.length).toBe(1);
		expect(result.current.history[0].text).toBe("item-b");
	});
});

describe("Component: ClipboardManager Widget UI", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	test("renders clipboard floating toggle button and displays history badge count", () => {
		// Populate mock localStorage with 3 elements
		const mockHistory = [
			{ id: "1", text: "#ff0000", timestamp: Date.now() },
			{ id: "2", text: "Inter", timestamp: Date.now() - 1000 },
			{ id: "3", text: "font-family: Roboto", timestamp: Date.now() - 2000 },
		];
		localStorage.setItem(
			"boom_scope_clipboard_history",
			JSON.stringify(mockHistory),
		);

		render(<ClipboardManager />);

		// Check badge count display is "3"
		const badge = screen.getByText("3");
		expect(badge).toBeDefined();
	});

	test("toggles the clipboard drawer open on click and displays historical items", () => {
		const mockHistory = [
			{ id: "col1", text: "#00ff00", timestamp: Date.now() },
			{ id: "font1", text: "Outfit", timestamp: Date.now() - 1000 },
		];
		localStorage.setItem(
			"boom_scope_clipboard_history",
			JSON.stringify(mockHistory),
		);

		render(<ClipboardManager />);

		// Trigger drawer open
		const toggleBtn = screen.getByRole("button");
		fireEvent.click(toggleBtn);

		// Drawer headers and items must be visible
		expect(screen.getByText(/Schránka \(2\/10\)/i)).toBeDefined();
		expect(screen.getByText("#00ff00")).toBeDefined();
		expect(screen.getByText("Outfit")).toBeDefined();
	});

	test("re-copies item to clipboard when clicked from list", async () => {
		const mockHistory = [
			{ id: "col1", text: "#aa55ff", timestamp: Date.now() },
		];
		localStorage.setItem(
			"boom_scope_clipboard_history",
			JSON.stringify(mockHistory),
		);

		// Mock navigator.clipboard
		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText: vi.fn().mockImplementation(() => Promise.resolve()),
			},
			writable: true,
			configurable: true,
		});

		render(<ClipboardManager />);

		// Open drawer
		const toggleBtn = screen.getByRole("button");
		fireEvent.click(toggleBtn);

		// Click the list card to trigger copy
		const itemCard = screen.getByText("#aa55ff");
		await act(async () => {
			fireEvent.click(itemCard);
		});

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("#aa55ff");
		expect(toast.success).toHaveBeenCalledWith(
			"Položka skopírovaná z histórie schránky",
		);
	});
});
