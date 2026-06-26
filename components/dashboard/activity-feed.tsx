"use client";

import { useQuery } from "convex/react";
import {
	FileText,
	FolderKanban,
	Layout,
	Link2,
	Palette,
	SquareKanban,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const ACTIVITY_META = {
	note: { icon: FileText, label: "Note", color: "text-emerald-600" },
	design: { icon: Palette, label: "Canvas", color: "text-violet-600" },
	link: { icon: Link2, label: "Link", color: "text-indigo-600" },
	"design-system": { icon: Layout, label: "Design system", color: "text-amber-600" },
	task: { icon: SquareKanban, label: "Task", color: "text-sky-600" },
	project: { icon: FolderKanban, label: "Project", color: "text-sky-600" },
} as const;

function formatRelativeTime(timestamp: number): string {
	const diff = Date.now() - timestamp;
	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export function ActivityFeed() {
	const activity = useQuery(api.dashboard.recentActivity, { limit: 10 });

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Recent activity</CardTitle>
			</CardHeader>
			<CardContent className="space-y-1">
				{activity === undefined ? (
					<p className="text-sm text-muted-foreground">Loading activity…</p>
				) : activity.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No recent activity yet. Create a note, task, or design to get started.
					</p>
				) : (
					activity.map((item) => {
						const meta = ACTIVITY_META[item.type];
						const Icon = meta.icon;
						return (
							<Link
								key={`${item.type}-${item.id}`}
								href={item.href as Route}
								className={cn(
									"flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60",
								)}
							>
								<span
									className={cn(
										"flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted",
										meta.color,
									)}
								>
									<Icon className="size-4" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm font-medium">
										{item.title}
									</span>
									<span className="block text-xs text-muted-foreground">
										{meta.label} · {formatRelativeTime(item.timestamp)}
									</span>
								</span>
							</Link>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
