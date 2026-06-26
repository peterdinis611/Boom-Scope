"use client";

import { useQuery } from "convex/react";
import {
	FileText,
	FolderKanban,
	Layout,
	Palette,
	SquareKanban,
	Sparkles,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { api } from "@/convex/_generated/api";

type ViewerSummary = {
	name?: string | null;
	email?: string | null;
} | null;

export function DashboardContent({ viewer }: { viewer: ViewerSummary }) {
	const greeting = viewer?.name ?? viewer?.email?.split("@")[0] ?? "User";
	const stats = useQuery(api.dashboard.dashboardStats);

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

			<ActivityFeed />
		</PageContainer>
	);
}
