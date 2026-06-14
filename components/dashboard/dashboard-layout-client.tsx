"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getDashboardLayoutMode } from "@/lib/layout-mode";
import { cn } from "@/lib/utils";
import { ClipboardPanel } from "./clipboard-panel";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebarNav } from "./dashboard-nav";
import { LayoutChromeProvider } from "./layout-chrome-context";
import { PomodoroProvider } from "./pomodoro-context";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const mode = getDashboardLayoutMode(pathname);
	const { isCollapsed } = useSidebar();
	const isImmersive = mode === "immersive";
	const showSidebar = !isImmersive;

	return (
		<div className="flex min-h-screen bg-background">
			{showSidebar ? (
				<aside
					className={cn(
						"hidden shrink-0 transition-all duration-200 ease-in-out md:flex md:flex-col border-r border-sidebar-border",
						isCollapsed ? "w-0 overflow-hidden border-none" : "w-64",
					)}
				>
					<DashboardSidebarNav />
				</aside>
			) : null}

			<div className="flex min-w-0 flex-1 flex-col">
				<DashboardHeader />
				<main className="flex-1 overflow-y-auto">
					<div className="h-full">{children}</div>
				</main>
			</div>

			<ClipboardPanel />
		</div>
	);
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
	return (
		<PomodoroProvider>
			<SidebarProvider>
				<LayoutChromeProvider>
					<DashboardLayoutContent>{children}</DashboardLayoutContent>
				</LayoutChromeProvider>
			</SidebarProvider>
		</PomodoroProvider>
	);
}
