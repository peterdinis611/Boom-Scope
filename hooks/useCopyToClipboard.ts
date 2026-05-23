import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IDB_KEYS, idbGet, idbRemove, idbSet } from "@/lib/idb-storage";

export interface CopiedItem {
	id: string;
	text: string;
	timestamp: number;
}

/**
 * A reactive hook to copy text to clipboard and track a history of the last 10 copied items.
 * Broadcasts copy/updates to other hook instances.
 */
export function useCopyToClipboard(resetInterval = 2000) {
	const [copiedValue, setCopiedValue] = useState<string | null>(null);
	const [history, setHistory] = useState<CopiedItem[]>([]);

	const loadHistory = useCallback(async () => {
		if (typeof window === "undefined") return;
		try {
			const stored = await idbGet<CopiedItem[]>(IDB_KEYS.clipboardHistory);
			setHistory(stored ?? []);
		} catch (e) {
			console.error(e);
			setHistory([]);
		}
	}, []);

	// Synchronize history lists reactively on mount
	useEffect(() => {
		void loadHistory();

		const handleCopyEvent = () => {
			void loadHistory();
		};

		window.addEventListener("boom-scope-clipboard-update", handleCopyEvent);

		return () => {
			window.removeEventListener(
				"boom-scope-clipboard-update",
				handleCopyEvent,
			);
		};
	}, [loadHistory]);

	const copy = useCallback(
		async (value: string, successMessage?: string) => {
			if (!navigator?.clipboard) {
				toast.error("Schránka nie je podporovaná.");
				return false;
			}
			try {
				await navigator.clipboard.writeText(value);
				setCopiedValue(value);
				toast.success(
					successMessage ||
						`Skopírované: ${
							value.length > 25 ? `${value.substring(0, 25)}...` : value
						}`,
				);

				const currentHistory =
					(await idbGet<CopiedItem[]>(IDB_KEYS.clipboardHistory)) ?? [];

				// Remove duplicates to push new copy to the top
				const filtered = currentHistory.filter((item) => item.text !== value);
				const newItem: CopiedItem = {
					id: Math.random().toString(36).substring(2, 9),
					text: value,
					timestamp: Date.now(),
				};

				// Cap at 10 items
				const updated = [newItem, ...filtered].slice(0, 10);
				await idbSet(IDB_KEYS.clipboardHistory, updated);

				// Broadcast change
				window.dispatchEvent(new Event("boom-scope-clipboard-update"));

				setTimeout(() => {
					setCopiedValue(null);
				}, resetInterval);
				return true;
			} catch (error) {
				console.error("Chyba pri kopírovaní do schránky:", error);
				toast.error("Nepodarilo sa skopírovať.");
				return false;
			}
		},
		[resetInterval],
	);

	const clearHistory = useCallback(async () => {
		await idbRemove(IDB_KEYS.clipboardHistory);
		window.dispatchEvent(new Event("boom-scope-clipboard-update"));
		toast.success("História schránky vymazaná.");
	}, []);

	const deleteHistoryItem = useCallback(async (id: string) => {
		try {
			const currentHistory =
				(await idbGet<CopiedItem[]>(IDB_KEYS.clipboardHistory)) ?? [];
			const updated = currentHistory.filter((item) => item.id !== id);
			await idbSet(IDB_KEYS.clipboardHistory, updated);
			window.dispatchEvent(new Event("boom-scope-clipboard-update"));
			toast.info("Položka zmazaná zo schránky.");
		} catch (e) {
			console.error(e);
		}
	}, []);

	return {
		copiedValue,
		copy,
		history,
		clearHistory,
		deleteHistoryItem,
	} as const;
}
