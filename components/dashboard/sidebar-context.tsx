"use client";

import type React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface SidebarContextType {
	isCollapsed: boolean;
	toggleSidebar: () => void;
	setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggleSidebar = useCallback(
		() => setIsCollapsed((prev) => !prev),
		[],
	);
	const setCollapsed = useCallback(
		(collapsed: boolean) => setIsCollapsed(collapsed),
		[],
	);

	const value = useMemo(
		() => ({ isCollapsed, toggleSidebar, setCollapsed }),
		[isCollapsed, toggleSidebar, setCollapsed],
	);

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (context === undefined) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
}
