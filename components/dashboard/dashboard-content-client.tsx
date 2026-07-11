"use client";

import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import {
	FileText,
	FolderKanban,
	Layout,
	Palette,
	SquareKanban,
	Sparkles,
	StickyNote,
} from "lucide-react";
import { useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { parseStickyNoteItems } from "@/lib/sticky-notes";

const ActivityFeed = dynamic(
	() =>
		import("@/components/dashboard/activity-feed").then(
			(module) => module.ActivityFeed,
		),
	{
		loading: () => <Skeleton className="h-48 w-full rounded-xl" />,
	},
);

const TodayWidget = dynamic(
	() =>
		import("@/components/dashboard/today-widget").then(
			(module) => module.TodayWidget,
		),
	{
		loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
	},
);

const StickyNotesPreview = dynamic(
	() =>
		import("@/components/dashboard/sticky-notes-preview").then(
			(module) => module.StickyNotesPreview,
		),
	{
		loading: () => <Skeleton className="h-48 w-full rounded-xl" />,
	},
);

type ViewerSummary = {
	name?: string | null;
	email?: string | null;
} | null;

export function DashboardContent({ viewer }: { viewer: ViewerSummary }) {
	const greeting = viewer?.name ?? viewer?.email?.split("@")[0] ?? "User";
	const stats = useQuery(api.dashboard.dashboardStats);
	const stickyBoard = useQuery(api.sticky_notes.get);

	const stickyNoteCount = useMemo(() => {
		if (stickyBoard === undefined) return undefined;
		return parseStickyNoteItems(stickyBoard.items).length;
	}, [stickyBoard]);

	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title={`Welcome back, ${greeting}`}
				description="Overview of your work in Boom Scope."
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard
					title="Projects"
					value={stats?.projects ?? "—"}
					description="Manage projects in one place"
					icon={FolderKanban}
					href="/dashboard/projects"
				/>
				<StatCard
					title="Notes"
					value={stats?.notes ?? "—"}
					description="Your notes and documents"
					icon={FileText}
					href="/dashboard/notes"
				/>
				<StatCard
					title="Sticky Notes"
					value={stats?.stickyNotes ?? stickyNoteCount ?? "—"}
					description="Visual board for quick ideas"
					icon={StickyNote}
					href="/dashboard/sticky-notes"
				/>
				<StatCard
					title="Tasks"
					value={stats?.tasks ?? "—"}
					description="Kanban board per project"
					icon={SquareKanban}
					href="/dashboard/tasks"
				/>
				<StatCard
					title="Canvas"
					value="Open"
					description="Design workspace"
					icon={Palette}
					href="/dashboard/canvas"
				/>
				<StatCard
					title="Design System"
					value={stats?.designSystems ?? "—"}
					description="Project visual DNA"
					icon={Layout}
					href="/dashboard/design-system/v2"
				/>
				<StatCard
					title="AI Generator"
					value="Launch"
					description="Generate multi-viewport designs"
					icon={Sparkles}
					href="/dashboard/generator"
				/>
			</div>

			<TodayWidget />

			<div className="grid gap-4 lg:grid-cols-2">
				<StickyNotesPreview />
				<ActivityFeed />
			</div>
		</PageContainer>
	);
}
