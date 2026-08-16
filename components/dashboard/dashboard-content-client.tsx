"use client";

import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { DashboardQuickAccess } from "@/components/dashboard/dashboard-quick-access";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
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
		<PageContainer className="space-y-6">
			<PageHeader
				title={`Welcome back, ${greeting}`}
				description="Deadlines, focus, and recent work — scoped for today."
			/>

			<div className="grid gap-4 xl:grid-cols-12 xl:items-start">
				<div className="xl:col-span-8">
					<TodayWidget />
				</div>
				<div className="xl:col-span-4">
					<DashboardQuickAccess
						stats={stats ?? undefined}
						stickyNoteCount={stickyNoteCount}
					/>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<StickyNotesPreview />
				<ActivityFeed />
			</div>
		</PageContainer>
	);
}
