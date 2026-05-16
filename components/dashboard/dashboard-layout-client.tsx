"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebarNav } from "./dashboard-nav";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
	const { isCollapsed } = useSidebar();

	return (
		<div className="flex min-h-screen bg-background">
			<aside
				className={cn(
					"hidden shrink-0 transition-all duration-300 ease-in-out md:flex md:flex-col border-r border-sidebar-border",
					isCollapsed ? "w-0 overflow-hidden border-none" : "w-64",
				)}
			>
				<DashboardSidebarNav />
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<DashboardHeader />
				<main className="flex-1 overflow-y-auto">
					<div className="h-full">{children}</div>
				</main>
			</div>
		</div>
	);
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<DashboardLayoutContent>{children}</DashboardLayoutContent>
		</SidebarProvider>
	);
}
