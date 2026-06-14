import {
	Clipboard,
	FileText,
	FolderKanban,
	Palette,
	Sparkles,
	Timer,
} from "lucide-react";
import type { Route } from "next";
import type { ElementType } from "react";

export type QuickActionItem = {
	id: string;
	label: string;
	description: string;
	icon: ElementType;
	iconClassName: string;
	href?: Route;
	action?: "note";
};

export const QUICK_ACTION_ITEMS: QuickActionItem[] = [
	{
		id: "note",
		label: "New note",
		description: "Quick note",
		icon: FileText,
		iconClassName:
			"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
		action: "note",
	},
	{
		id: "canvas",
		label: "Canvas",
		description: "Design workspace",
		icon: Palette,
		iconClassName: "bg-primary/15 text-primary border-primary/20",
		href: "/dashboard/canvas",
	},
	{
		id: "generator",
		label: "AI Generator",
		description: "Generate design",
		icon: Sparkles,
		iconClassName:
			"bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
		href: "/dashboard/generator",
	},
	{
		id: "pomodoro",
		label: "Pomodoro",
		description: "Start timer",
		icon: Timer,
		iconClassName:
			"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
		href: "/dashboard/pomodoro",
	},
	{
		id: "projects",
		label: "Projects",
		description: "Manage projects",
		icon: FolderKanban,
		iconClassName:
			"bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
		href: "/dashboard/projects",
	},
];

export const CLIPBOARD_ACTION: QuickActionItem = {
	id: "clipboard",
	label: "Clipboard",
	description: "Recently copied",
	icon: Clipboard,
	iconClassName:
		"bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
};
