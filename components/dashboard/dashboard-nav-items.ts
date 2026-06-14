import {
	FileText,
	FolderKanban,
	Layout,
	LayoutDashboard,
	Palette,
	Settings as SettingsIcon,
	Sparkles,
	Timer,
} from "lucide-react";
import type { Route } from "next";
import type { ElementType } from "react";

export type DashboardNavId =
	| "overview"
	| "projects"
	| "notes"
	| "design"
	| "design-system"
	| "generate"
	| "pomodoro"
	| "settings";

export type DashboardNavItem = {
	id: DashboardNavId;
	label: string;
	description: string;
	icon: ElementType;
	iconClassName: string;
	activeIconClassName: string;
	href?: Route;
};

export type DashboardNavGroup = {
	id: string;
	label?: string;
	items: DashboardNavItem[];
};

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
	{
		id: "main",
		items: [
			{
				id: "overview",
				label: "Overview",
				description: "Project home page",
				icon: LayoutDashboard,
				iconClassName:
					"bg-primary/10 text-primary border-primary/15 group-hover:bg-primary/15",
				activeIconClassName: "bg-primary/20 text-primary border-primary/25",
				href: "/dashboard",
			},
		],
	},
	{
		id: "workspace",
		label: "Work",
		items: [
			{
				id: "projects",
				label: "Projects",
				description: "Manage your projects",
				icon: FolderKanban,
				iconClassName:
					"bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/15 group-hover:bg-sky-500/15",
				activeIconClassName:
					"bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/25",
				href: "/dashboard/projects",
			},
			{
				id: "notes",
				label: "Notes",
				description: "Write project notes",
				icon: FileText,
				iconClassName:
					"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15 group-hover:bg-emerald-500/15",
				activeIconClassName:
					"bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
				href: "/dashboard/notes",
			},
		],
	},
	{
		id: "tools",
		label: "Tools",
		items: [
			{
				id: "design",
				label: "Canvas",
				description: "Design workspace",
				icon: Palette,
				iconClassName:
					"bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/15 group-hover:bg-violet-500/15",
				activeIconClassName:
					"bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/25",
				href: "/dashboard/canvas",
			},
			{
				id: "design-system",
				label: "Design System",
				description: "Project visual DNA",
				icon: Layout,
				iconClassName:
					"bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15 group-hover:bg-amber-500/15",
				activeIconClassName:
					"bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/25",
				href: "/dashboard/design-system/v2",
			},
			{
				id: "generate",
				label: "AI Generator",
				description: "Generate multi-viewport designs",
				icon: Sparkles,
				iconClassName:
					"bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/15 group-hover:bg-fuchsia-500/15",
				activeIconClassName:
					"bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/25",
				href: "/dashboard/generator",
			},
			{
				id: "pomodoro",
				label: "Pomodoro",
				description: "Focused work with a timer",
				icon: Timer,
				iconClassName:
					"bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/15 group-hover:bg-orange-500/15",
				activeIconClassName:
					"bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/25",
				href: "/dashboard/pomodoro",
			},
		],
	},
	{
		id: "system",
		label: "System",
		items: [
			{
				id: "settings",
				label: "Settings",
				description: "Account and preferences",
				icon: SettingsIcon,
				iconClassName:
					"bg-muted text-muted-foreground border-border/60 group-hover:bg-muted/80",
				activeIconClassName: "bg-muted text-foreground border-border",
				href: "/dashboard/settings",
			},
		],
	},
];

export const DASHBOARD_NAV_ITEMS = DASHBOARD_NAV_GROUPS.flatMap(
	(group) => group.items,
);

export function isDashboardNavItemActive(
	pathname: string,
	item: DashboardNavItem,
): boolean {
	if (item.id === "overview") {
		return pathname === "/dashboard";
	}
	return Boolean(item.href && pathname.startsWith(item.href));
}
