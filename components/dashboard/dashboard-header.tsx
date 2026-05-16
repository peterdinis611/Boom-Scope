"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { DashboardMobileNav, type DashboardNavId } from "./dashboard-nav";
import { useSidebar } from "./sidebar-context";

export function DashboardHeader() {
	const pathname = usePathname();
	const { isCollapsed, toggleSidebar } = useSidebar();

	let activeId: DashboardNavId = "overview";
	if (pathname.startsWith("/dashboard/projects")) activeId = "projects";
	if (pathname.startsWith("/dashboard/notes")) activeId = "notes";
	if (pathname.startsWith("/dashboard/canvas")) activeId = "design";
	if (pathname.startsWith("/dashboard/design-system")) activeId = "generate";
	if (pathname.startsWith("/dashboard/settings")) activeId = "settings";

	const titles: Record<DashboardNavId, { title: string; subtitle: string }> = {
		overview: {
			title: "Prehľad",
			subtitle: "Rýchle odkazy na prácu s projektom",
		},
		projects: {
			title: "Projekty",
			subtitle: "Spravujte všetky svoje projekty",
		},
		notes: { title: "Poznámky", subtitle: "Správa vašich poznámok k projektu" },
		design: { title: "Canvas", subtitle: "Pracovný priestor pre dizajn" },
		generate: {
			title: "Design System",
			subtitle: "AI generátor vizuálnej identity",
		},
		settings: {
			title: "Nastavenia",
			subtitle: "Správa účtu a preferencií",
		},
	};

	const { title, subtitle } = titles[activeId];

	return (
		<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6">
			<DashboardMobileNav />
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={toggleSidebar}
				className="hidden md:flex"
				title={isCollapsed ? "Otvoriť bočný panel" : "Zatvoriť bočný panel"}
			>
				{isCollapsed ? (
					<PanelLeftOpen className="size-4" />
				) : (
					<PanelLeftClose className="size-4" />
				)}
			</Button>
			<div className="hidden min-w-0 flex-1 md:block">
				<p className="font-heading text-sm font-semibold text-foreground">
					{title}
				</p>
				<p className="truncate text-xs text-muted-foreground">{subtitle}</p>
			</div>
			<div className="ml-auto flex shrink-0 items-center gap-2">
				<ModeToggle />
				<UserMenu />
			</div>
		</header>
	);
}
