import {
	FileText,
	FolderKanban,
	Image as ImageIcon,
	Layout,
	LayoutDashboard,
	Link2,
	Palette,
	Settings as SettingsIcon,
	Sparkles,
	SquareKanban,
	StickyNote,
	TextQuote,
	Timer,
} from "lucide-react";
import type { Route } from "next";
import type { ElementType } from "react";

export type DashboardNavId =
	| "overview"
	| "projects"
	| "notes"
	| "links"
	| "sticky-notes"
	| "tasks"
	| "design"
	| "design-system"
	| "generate"
	| "images"
	| "placeholder-text"
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

/** Shared Field Scope chip styles — primary / scope / success / warning / muted only */
const chip = {
	primary: {
		idle: "bg-primary/10 text-primary border-primary/15 group-hover:bg-primary/15",
		active: "bg-primary/20 text-primary border-primary/25",
	},
	scope: {
		idle: "bg-scope/10 text-scope border-scope/15 group-hover:bg-scope/15",
		active: "bg-scope/20 text-scope border-scope/25",
	},
	success: {
		idle: "bg-success/10 text-success border-success/15 group-hover:bg-success/15",
		active: "bg-success/20 text-success border-success/25",
	},
	warning: {
		idle: "bg-warning/15 text-warning border-warning/20 group-hover:bg-warning/20",
		active: "bg-warning/25 text-warning border-warning/30",
	},
	muted: {
		idle: "bg-muted text-muted-foreground border-border/60 group-hover:bg-muted/80",
		active: "bg-muted text-foreground border-border",
	},
} as const;

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
	{
		id: "main",
		items: [
			{
				id: "overview",
				label: "Overview",
				description: "Project home page",
				icon: LayoutDashboard,
				iconClassName: chip.primary.idle,
				activeIconClassName: chip.primary.active,
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
				iconClassName: chip.scope.idle,
				activeIconClassName: chip.scope.active,
				href: "/dashboard/projects",
			},
			{
				id: "notes",
				label: "Notes",
				description: "Write project notes",
				icon: FileText,
				iconClassName: chip.success.idle,
				activeIconClassName: chip.success.active,
				href: "/dashboard/notes",
			},
			{
				id: "links",
				label: "Link Hub",
				description: "Save project links and resources",
				icon: Link2,
				iconClassName: chip.scope.idle,
				activeIconClassName: chip.scope.active,
				href: "/dashboard/links",
			},
			{
				id: "sticky-notes",
				label: "Sticky Notes",
				description: "Visual board for quick ideas",
				icon: StickyNote,
				iconClassName: chip.warning.idle,
				activeIconClassName: chip.warning.active,
				href: "/dashboard/sticky-notes" as Route,
			},
			{
				id: "tasks",
				label: "Tasks",
				description: "Kanban board for project work",
				icon: SquareKanban,
				iconClassName: chip.primary.idle,
				activeIconClassName: chip.primary.active,
				href: "/dashboard/tasks" as Route,
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
				iconClassName: chip.scope.idle,
				activeIconClassName: chip.scope.active,
				href: "/dashboard/canvas",
			},
			{
				id: "design-system",
				label: "Design System",
				description: "Project visual DNA",
				icon: Layout,
				iconClassName: chip.warning.idle,
				activeIconClassName: chip.warning.active,
				href: "/dashboard/design-system/v2",
			},
			{
				id: "generate",
				label: "AI Generator",
				description: "Generate multi-viewport designs",
				icon: Sparkles,
				iconClassName: chip.primary.idle,
				activeIconClassName: chip.primary.active,
				href: "/dashboard/generator",
			},
			{
				id: "images",
				label: "Placeholder Images",
				description: "Generate optimized placeholder photos",
				icon: ImageIcon,
				iconClassName: chip.scope.idle,
				activeIconClassName: chip.scope.active,
				href: "/dashboard/images",
			},
			{
				id: "placeholder-text",
				label: "Placeholder Text",
				description: "Generate random lorem ipsum copy",
				icon: TextQuote,
				iconClassName: chip.muted.idle,
				activeIconClassName: chip.muted.active,
				href: "/dashboard/placeholder-text" as Route,
			},
			{
				id: "pomodoro",
				label: "Pomodoro",
				description: "Focused work with a timer",
				icon: Timer,
				iconClassName: chip.primary.idle,
				activeIconClassName: chip.primary.active,
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
				iconClassName: chip.muted.idle,
				activeIconClassName: chip.muted.active,
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
