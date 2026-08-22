"use client";

import type { LucideIcon } from "lucide-react";
import {
	ChevronRight,
	FileText,
	FolderKanban,
	Layout,
	Palette,
	SquareKanban,
	Sparkles,
	StickyNote,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QuickAccessItem = {
	title: string;
	value: string | number;
	href: Route;
	icon: LucideIcon;
	iconClassName?: string;
};

type DashboardQuickAccessProps = {
	stats?: {
		projects?: number;
		notes?: number;
		tasks?: number;
		designSystems?: number;
		stickyNotes?: number;
	};
	stickyNoteCount?: number;
};

const WORK_ITEMS: Array<
	Omit<QuickAccessItem, "value"> & { statKey: keyof NonNullable<DashboardQuickAccessProps["stats"]> | "stickyNotes" }
> = [
	{
		title: "Projects",
		href: "/dashboard/projects",
		icon: FolderKanban,
		iconClassName: "text-scope",
		statKey: "projects",
	},
	{
		title: "Notes",
		href: "/dashboard/notes",
		icon: FileText,
		iconClassName: "text-success",
		statKey: "notes",
	},
	{
		title: "Tasks",
		href: "/dashboard/tasks",
		icon: SquareKanban,
		iconClassName: "text-primary",
		statKey: "tasks",
	},
	{
		title: "Sticky notes",
		href: "/dashboard/sticky-notes",
		icon: StickyNote,
		iconClassName: "text-warning",
		statKey: "stickyNotes",
	},
];

const CREATE_ITEMS: QuickAccessItem[] = [
	{
		title: "Canvas",
		value: "Open",
		href: "/dashboard/canvas",
		icon: Palette,
		iconClassName: "text-scope",
	},
	{
		title: "Design system",
		value: "—",
		href: "/dashboard/design-system/v2",
		icon: Layout,
		iconClassName: "text-warning",
	},
	{
		title: "AI generator",
		value: "Launch",
		href: "/dashboard/generator",
		icon: Sparkles,
		iconClassName: "text-primary",
	},
];

function QuickAccessRow({ item }: { item: QuickAccessItem }) {
	const Icon = item.icon;

	return (
		<Link
			href={item.href}
			className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
		>
			<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
				<Icon className={cn("size-4", item.iconClassName)} />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm font-medium">{item.title}</span>
			</span>
			<span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground group-hover:text-foreground">
				{item.value}
			</span>
			<ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
		</Link>
	);
}

export function DashboardQuickAccess({
	stats,
	stickyNoteCount,
}: DashboardQuickAccessProps) {
	const workItems: QuickAccessItem[] = WORK_ITEMS.map((item) => {
		const value =
			item.statKey === "stickyNotes"
				? (stats?.stickyNotes ?? stickyNoteCount ?? "—")
				: (stats?.[item.statKey] ?? "—");

		return {
			title: item.title,
			href: item.href,
			icon: item.icon,
			iconClassName: item.iconClassName,
			value,
		};
	});

	const createItems: QuickAccessItem[] = CREATE_ITEMS.map((item) =>
		item.title === "Design system"
			? { ...item, value: stats?.designSystems ?? "—" }
			: item,
	);

	return (
		<Card className="h-full">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Quick access</CardTitle>
				<p className="text-sm text-muted-foreground">
					Jump to your workspaces and tools
				</p>
			</CardHeader>
			<CardContent className="space-y-5">
				<section className="space-y-1">
					<p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Work
					</p>
					{workItems.map((item) => (
						<QuickAccessRow key={item.href} item={item} />
					))}
				</section>
				<section className="space-y-1">
					<p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Create
					</p>
					{createItems.map((item) => (
						<QuickAccessRow key={item.href} item={item} />
					))}
				</section>
			</CardContent>
		</Card>
	);
}
