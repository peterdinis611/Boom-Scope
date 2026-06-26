"use client";

import { useMutation, useQuery } from "convex/react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProjectSelector } from "@/components/notes/ProjectSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { KANBAN_COLUMNS, type KanbanStatus } from "@/lib/kanban";
import { cn } from "@/lib/utils";

type ProjectTask = Doc<"project_tasks"> & { projectName?: string | null };

type ProjectKanbanProps = {
	defaultProjectId?: Id<"projects">;
};

export function ProjectKanban({ defaultProjectId }: ProjectKanbanProps) {
	const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
		defaultProjectId,
	);
	const [newTaskTitle, setNewTaskTitle] = useState("");

	const tasks = useQuery(api.project_tasks.list, {
		projectId,
	});
	const createTask = useMutation(api.project_tasks.create);
	const updateTask = useMutation(api.project_tasks.update);
	const removeTask = useMutation(api.project_tasks.remove);

	const grouped = useMemo(() => {
		const map: Record<KanbanStatus, ProjectTask[]> = {
			todo: [],
			in_progress: [],
			done: [],
		};
		for (const task of tasks ?? []) {
			map[task.status].push(task);
		}
		for (const status of KANBAN_COLUMNS) {
			map[status.id].sort((a, b) => a.position - b.position);
		}
		return map;
	}, [tasks]);

	const handleCreate = async (status: KanbanStatus = "todo") => {
		if (!projectId || !newTaskTitle.trim()) return;
		try {
			await createTask({
				title: newTaskTitle.trim(),
				projectId,
				status,
			});
			setNewTaskTitle("");
			toast.success("Task created");
		} catch {
			toast.error("Failed to create task");
		}
	};

	const moveTask = async (task: ProjectTask, status: KanbanStatus) => {
		if (task.status === status) return;
		const columnTasks = grouped[status];
		const position =
			columnTasks.length === 0
				? 0
				: Math.max(...columnTasks.map((item) => item.position)) + 1;
		try {
			await updateTask({ taskId: task._id, status, position });
		} catch {
			toast.error("Failed to move task");
		}
	};

	if (!projectId) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Select a project</CardTitle>
				</CardHeader>
				<CardContent className="max-w-sm">
					<ProjectSelector value={projectId} onChange={setProjectId} />
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-xs space-y-1.5">
					<p className="text-sm font-medium">Project</p>
					<ProjectSelector value={projectId} onChange={setProjectId} />
				</div>
				<div className="flex flex-1 gap-2 sm:max-w-md">
					<Input
						placeholder="New task title…"
						value={newTaskTitle}
						onChange={(event) => setNewTaskTitle(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") void handleCreate("todo");
						}}
					/>
					<Button type="button" onClick={() => void handleCreate("todo")}>
						<Plus data-icon="inline-start" />
						Add
					</Button>
				</div>
			</div>

			{tasks === undefined ? (
				<div className="flex justify-center py-16">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<div className="grid gap-4 lg:grid-cols-3">
					{KANBAN_COLUMNS.map((column) => (
						<Card key={column.id} className="bg-muted/20">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center justify-between text-sm">
									<span
										className={cn(
											"rounded-full px-2.5 py-1 text-xs font-medium",
											column.color,
										)}
									>
										{column.label}
									</span>
									<span className="text-muted-foreground">
										{grouped[column.id].length}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{grouped[column.id].map((task) => (
									<div
										key={task._id}
										className="rounded-lg border border-border bg-background p-3 shadow-sm"
									>
										<p className="text-sm font-medium">{task.title}</p>
										{task.description ? (
											<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
												{task.description}
											</p>
										) : null}
										<div className="mt-3 flex flex-wrap gap-1">
											{KANBAN_COLUMNS.filter(
												(option) => option.id !== task.status,
											).map((option) => (
												<Button
													key={option.id}
													type="button"
													size="xs"
													variant="outline"
													onClick={() => void moveTask(task, option.id)}
												>
													→ {option.label}
												</Button>
											))}
											<Button
												type="button"
												size="icon-xs"
												variant="ghost"
												className="ml-auto text-destructive"
												onClick={() => void removeTask({ taskId: task._id })}
												aria-label="Delete task"
											>
												<Trash2 className="size-3.5" />
											</Button>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
