"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import {
	type DashboardLayoutMode,
	getDashboardLayoutMode,
} from "@/lib/layout-mode";

type LayoutChromeContextValue = {
	mode: DashboardLayoutMode;
	clipboardOpen: boolean;
	setClipboardOpen: (open: boolean) => void;
};

const LayoutChromeContext = createContext<LayoutChromeContextValue | null>(
	null,
);

export function LayoutChromeProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const mode = getDashboardLayoutMode(pathname);
	const [clipboardOpen, setClipboardOpen] = useState(false);

	const value = useMemo(
		() => ({ mode, clipboardOpen, setClipboardOpen }),
		[mode, clipboardOpen],
	);

	return (
		<LayoutChromeContext.Provider value={value}>
			{children}
		</LayoutChromeContext.Provider>
	);
}

export function useLayoutChrome() {
	const context = useContext(LayoutChromeContext);
	if (!context) {
		throw new Error("useLayoutChrome must be used within LayoutChromeProvider");
	}
	return context;
}
