"use client";

import {
	FileText,
	FolderKanban,
	Layout,
	Palette,
	Sparkles,
} from "lucide-react";
import { useQuery } from "convex/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { api } from "@/convex/_generated/api";

type ViewerSummary = {
	name?: string | null;
	email?: string | null;
} | null;

export function DashboardContent({ viewer }: { viewer: ViewerSummary }) {
	const greeting = viewer?.name ?? viewer?.email?.split("@")[0] ?? "Užívateľ";
	const stats = useQuery(api.dashboard.dashboardStats);

	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title={`Vitajte späť, ${greeting}`}
				description="Prehľad vašej práce v Boom Scope."
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard
					title="Projekty"
					value={stats?.projects ?? "—"}
					description="Spravujte projekty na jednom mieste"
					icon={FolderKanban}
					href="/dashboard/projects"
				/>
				<StatCard
					title="Poznámky"
					value={stats?.notes ?? "—"}
					description="Vaše poznámky a dokumenty"
					icon={FileText}
					href="/dashboard/notes"
				/>
				<StatCard
					title="Canvas"
					value="Otvoriť"
					description="Pracovný priestor pre dizajn"
					icon={Palette}
					href="/dashboard/canvas"
				/>
				<StatCard
					title="Design System"
					value={stats?.designSystems ?? "—"}
					description="Vizuálna DNA projektov"
					icon={Layout}
					href="/dashboard/design-system/v2"
				/>
				<StatCard
					title="AI Generátor"
					value="Spustiť"
					description="Generovanie multi-viewport dizajnu"
					icon={Sparkles}
					href="/dashboard/generator"
				/>
			</div>
		</PageContainer>
	);
}
