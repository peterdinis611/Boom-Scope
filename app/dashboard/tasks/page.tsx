"use client";

import { useQuery } from "convex/react";
import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { ProjectKanban } from "@/components/kanban/project-kanban";
import { TasksCalendar } from "@/components/kanban/tasks-calendar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { downloadCsv } from "@/lib/download";
import { formatDueDate } from "@/lib/kanban";
import { cn } from "@/lib/utils";

type TasksView = "project" | "all" | "calendar";

function TasksContent() {
	const searchParams = useSearchParams();
	const projectId = searchParams.get("projectId");
	const viewParam = searchParams.get("view");
	const initialView: TasksView =
		viewParam === "all"
			? "all"
			: viewParam === "calendar"
				? "calendar"
				: "project";
	const [view, setView] = useState<TasksView>(initialView);

	const resolvedProjectId = projectId
		? (projectId as Id<"projects">)
		: undefined;

	const exportTasks = useQuery(api.project_tasks.list, {
		projectId: view === "project" ? resolvedProjectId : undefined,
	});

	const handleExportCsv = () => {
		if (!exportTasks?.length) {
			toast.error("No tasks to export");
			return;
		}
		downloadCsv(
			"boom-scope-tasks.csv",
			exportTasks.map((task) => ({
				title: task.title,
				project: task.projectName ?? "",
				column: task.columnLabel ?? "",
				priority: task.priority ?? "",
				dueDate: task.dueDate ? formatDueDate(task.dueDate) : "",
				labels: (task.labels ?? []).join("|"),
				recurrence: task.recurrence?.interval ?? "",
			})),
		);
		toast.success("Board exported as CSV");
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant={view === "project" ? "default" : "outline"}
					size="sm"
					className={cn(view === "project" && "pointer-events-none")}
					onClick={() => setView("project")}
				>
					Project board
				</Button>
				<Button
					type="button"
					variant={view === "all" ? "default" : "outline"}
					size="sm"
					className={cn(view === "all" && "pointer-events-none")}
					onClick={() => setView("all")}
				>
					My tasks
				</Button>
				<Button
					type="button"
					variant={view === "calendar" ? "default" : "outline"}
					size="sm"
					className={cn(view === "calendar" && "pointer-events-none")}
					onClick={() => setView("calendar")}
				>
					Calendar
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="ml-auto gap-1.5"
					onClick={handleExportCsv}
				>
					<Download className="size-3.5" />
					Export CSV
				</Button>
			</div>
			{view === "calendar" ? (
				<TasksCalendar defaultProjectId={resolvedProjectId} />
			) : (
				<ProjectKanban
					defaultProjectId={resolvedProjectId}
					scope={view === "all" ? "all" : "project"}
				/>
			)}
		</div>
	);
}

export default function TasksPage() {
	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title="Task Board"
				description="Organize project work with Kanban, cross-project views, and a due-date calendar."
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
