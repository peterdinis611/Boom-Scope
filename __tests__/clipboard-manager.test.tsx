import {
	act,
	fireEvent,
	render,
	renderHook,
	screen,
	waitFor,
} from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { IDB_KEYS, idbSet } from "@/lib/idb-storage";
import { ClipboardManager } from "../components/dashboard/clipboard-manager";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

describe("Hook: useCopyToClipboard & History Manager", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText: vi.fn().mockImplementation(() => Promise.resolve()),
			},
			writable: true,
			configurable: true,
		});
	});

	test("copies value and adds it to IndexedDB history", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copy("#123456");
		});

		await waitFor(() => {
			expect(result.current.history.length).toBe(1);
		});

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("#123456");
		expect(toast.success).toHaveBeenCalledWith("Copied: #123456");
		expect(result.current.history[0].text).toBe("#123456");
	});

	test("restricts clipboard history to a maximum of 10 items", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			for (let i = 1; i <= 11; i++) {
				await result.current.copy(`item-${i}`);
			}
		});

		await waitFor(() => {
			expect(result.current.history.length).toBe(10);
		});

		expect(result.current.history[0].text).toBe("item-11");
		expect(result.current.history.some((h) => h.text === "item-1")).toBe(false);
	});

	test("removes duplicate items and pushes most recent to top", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copy("duplicate-item");
			await result.current.copy("other-item");
			await result.current.copy("duplicate-item");
		});

		await waitFor(() => {
			expect(result.current.history.length).toBe(2);
		});

		expect(result.current.history[0].text).toBe("duplicate-item");
	});

	test("clears the clipboard history fully", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copy("something");
			await result.current.clearHistory();
		});

		await waitFor(() => {
			expect(result.current.history.length).toBe(0);
		});

		expect(toast.success).toHaveBeenCalledWith("Clipboard history cleared.");
	});

	test("deletes an individual item from clipboard history", async () => {
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copy("item-a");
			await result.current.copy("item-b");
		});

		await waitFor(() => {
			expect(result.current.history.length).toBe(2);
		});

		const itemToDeleteId = result.current.history.find(
			(h) => h.text === "item-a",
		)?.id;

		await act(async () => {
			if (itemToDeleteId) {
				await result.current.deleteHistoryItem(itemToDeleteId);
			}
		});

		await waitFor(() => {
			expect(result.current.history.length).toBe(1);
		});

		expect(result.current.history[0].text).toBe("item-b");
	});
});

describe("Component: ClipboardManager Widget UI", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("renders clipboard floating toggle button and displays history badge count", async () => {
		const mockHistory = [
			{ id: "1", text: "#ff0000", timestamp: Date.now() },
			{ id: "2", text: "Inter", timestamp: Date.now() - 1000 },
			{ id: "3", text: "font-family: Roboto", timestamp: Date.now() - 2000 },
		];
		await idbSet(IDB_KEYS.clipboardHistory, mockHistory);

		render(<ClipboardManager />);

		await waitFor(() => {
			expect(screen.getByText("3")).toBeDefined();
		});
	});

	test("toggles the clipboard drawer open on click and displays historical items", async () => {
		const mockHistory = [
			{ id: "col1", text: "#00ff00", timestamp: Date.now() },
			{ id: "font1", text: "Outfit", timestamp: Date.now() - 1000 },
		];
		await idbSet(IDB_KEYS.clipboardHistory, mockHistory);

		render(<ClipboardManager />);

		await waitFor(() => {
			expect(screen.getByText("2")).toBeDefined();
		});

		const toggleBtn = screen.getByRole("button");
		fireEvent.click(toggleBtn);

		expect(screen.getByText(/Clipboard \(2\/10\)/i)).toBeDefined();
		expect(screen.getByText("#00ff00")).toBeDefined();
		expect(screen.getByText("Outfit")).toBeDefined();
	});

	test("re-copies item to clipboard when clicked from list", async () => {
		const mockHistory = [
			{ id: "col1", text: "#aa55ff", timestamp: Date.now() },
		];
		await idbSet(IDB_KEYS.clipboardHistory, mockHistory);

		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText: vi.fn().mockImplementation(() => Promise.resolve()),
			},
			writable: true,
			configurable: true,
		});

		render(<ClipboardManager />);

		await waitFor(() => {
			expect(screen.getByText("1")).toBeDefined();
		});

		const toggleBtn = screen.getByRole("button");
		fireEvent.click(toggleBtn);

		const itemCard = screen.getByText("#aa55ff");
		await act(async () => {
			fireEvent.click(itemCard);
		});

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("#aa55ff");
		expect(toast.success).toHaveBeenCalledWith(
			"Item copied from clipboard history",
		);
	});
});
