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
		iconClassName: "bg-success/15 text-success border-success/20",
		action: "note",
	},
	{
		id: "canvas",
		label: "Canvas",
		description: "Design workspace",
		icon: Palette,
		iconClassName: "bg-scope/15 text-scope border-scope/20",
		href: "/dashboard/canvas",
	},
	{
		id: "generator",
		label: "AI Generator",
		description: "Generate design",
		icon: Sparkles,
		iconClassName: "bg-primary/15 text-primary border-primary/20",
		href: "/dashboard/generator",
	},
	{
		id: "pomodoro",
		label: "Pomodoro",
		description: "Start timer",
		icon: Timer,
		iconClassName: "bg-warning/15 text-warning border-warning/20",
		href: "/dashboard/pomodoro",
	},
	{
		id: "projects",
		label: "Projects",
		description: "Manage projects",
		icon: FolderKanban,
		iconClassName: "bg-scope/15 text-scope border-scope/20",
		href: "/dashboard/projects",
	},
];

export const CLIPBOARD_ACTION: QuickActionItem = {
	id: "clipboard",
	label: "Clipboard",
	description: "Recently copied",
	icon: Clipboard,
	iconClassName: "bg-primary/15 text-primary border-primary/20",
};
