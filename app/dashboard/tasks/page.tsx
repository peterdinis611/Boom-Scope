"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProjectKanban } from "@/components/kanban/project-kanban";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Id } from "@/convex/_generated/dataModel";

function TasksContent() {
	const searchParams = useSearchParams();
	const projectId = searchParams.get("projectId");

	return (
		<ProjectKanban
			defaultProjectId={
				projectId ? (projectId as Id<"projects">) : undefined
			}
		/>
	);
}

export default function TasksPage() {
	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title="Task Board"
				description="Organize project work with a simple Kanban board."
			/>
			<Suspense
				fallback={
					<p className="text-sm text-muted-foreground">Loading tasks…</p>
				}
			>
				<TasksContent />
			</Suspense>
		</PageContainer>
	);
}
