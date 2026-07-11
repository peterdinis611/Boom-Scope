"use client";

import {
	DndContext,
	DragOverlay,
	PointerSensor,
	closestCorners,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "convex/react";
import { AlignLeft, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProjectSelector } from "@/components/notes/ProjectSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/errors";
import { resolveDropTarget } from "@/lib/kanban-dnd";
import { KANBAN_COLUMNS, type KanbanStatus } from "@/lib/kanban";
import { KanbanColumn } from "./kanban-column";
import {
	TaskDetailsDialog,
	type TaskDetailsFormValues,
} from "./task-details-dialog";

type ProjectTask = Doc<"project_tasks"> & { projectName?: string | null };

type ProjectKanbanProps = {
	defaultProjectId?: Id<"projects">;
};

export function ProjectKanban({ defaultProjectId }: ProjectKanbanProps) {
	const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
		defaultProjectId,
	);
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [activeTaskId, setActiveTaskId] = useState<Id<"project_tasks"> | null>(
		null,
	);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
	const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
	const taskInputRef = useRef<HTMLInputElement>(null);

	const projects = useQuery(api.projects.list);
	const tasks = useQuery(api.project_tasks.list, {
		projectId,
	});
	const createTask = useMutation(api.project_tasks.create);
	const updateTask = useMutation(api.project_tasks.update);
	const moveTaskMutation = useMutation(api.project_tasks.move);
	const removeTask = useMutation(api.project_tasks.remove);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 6 },
		}),
	);

	useEffect(() => {
		if (defaultProjectId) {
			setProjectId(defaultProjectId);
		}
	}, [defaultProjectId]);

	useEffect(() => {
		if (projectId || !projects?.length) return;
		setProjectId(projects[0]._id);
	}, [projectId, projects]);

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

	const activeTask = useMemo(() => {
		if (!activeTaskId) return null;
		for (const column of KANBAN_COLUMNS) {
			const match = grouped[column.id].find((task) => task._id === activeTaskId);
			if (match) return match;
		}
		return null;
	}, [activeTaskId, grouped]);

	const handleCreate = async (
		title: string,
		description = "",
		status: KanbanStatus = "todo",
	) => {
		if (!projectId) {
			toast.error("Select a project first");
			return;
		}

		if (!title.trim()) {
			toast.error("Enter a task title");
			return;
		}

		setIsCreating(true);
		try {
			await createTask({
				title: title.trim(),
				description: description.trim() || undefined,
				projectId,
				status,
			});
			setNewTaskTitle("");
			toast.success("Task created");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Failed to create task");
		} finally {
			setIsCreating(false);
		}
	};

	const handleQuickCreate = async () => {
		await handleCreate(newTaskTitle);
	};

	const openCreateDialog = () => {
		setDialogMode("create");
		setEditingTask(null);
		setDialogOpen(true);
	};

	const openEditDialog = (task: ProjectTask) => {
		setDialogMode("edit");
		setEditingTask(task);
		setDialogOpen(true);
	};

	const handleDialogSubmit = async (values: TaskDetailsFormValues) => {
		if (!projectId) {
			toast.error("Select a project first");
			return;
		}

		try {
			if (dialogMode === "create") {
				await createTask({
					title: values.title,
					description: values.description || undefined,
					projectId,
					status: "todo",
				});
				setNewTaskTitle("");
				toast.success("Task created");
			} else if (editingTask) {
				await updateTask({
					taskId: editingTask._id,
					title: values.title,
					description: values.description,
				});
				toast.success("Task updated");
			}
		} catch (error) {
			toast.error(getErrorMessage(error) || "Failed to save task");
			throw error;
		}
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveTaskId(event.active.id as Id<"project_tasks">);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		setActiveTaskId(null);
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeId = active.id as Id<"project_tasks">;
		const dropTarget = resolveDropTarget(String(over.id), grouped);
		if (!dropTarget) return;

		try {
			await moveTaskMutation({
				taskId: activeId,
				toStatus: dropTarget.status,
				toIndex: dropTarget.index,
			});
		} catch (error) {
			toast.error(getErrorMessage(error) || "Failed to move task");
		}
	};

	const handleDelete = async (taskId: Id<"project_tasks">) => {
		try {
			await removeTask({ taskId });
			toast.success("Task deleted");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Failed to delete task");
		}
	};

	if (!projectId) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Select a project</CardTitle>
				</CardHeader>
				<CardContent className="max-w-sm space-y-3">
					<ProjectSelector value={projectId} onChange={setProjectId} />
					<p className="text-sm text-muted-foreground">
						Choose a project to view and manage its task board.
					</p>
				</CardContent>
			</Card>
		);
	}

	const canCreate = Boolean(newTaskTitle.trim()) && !isCreating;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div className="w-full max-w-xs space-y-1.5">
					<p className="text-sm font-medium">Project</p>
					<ProjectSelector value={projectId} onChange={setProjectId} />
				</div>

				<div className="flex w-full flex-1 flex-col gap-2 sm:flex-row lg:max-w-2xl">
					<form
						className="flex flex-1 gap-2"
						onSubmit={(event) => {
							event.preventDefault();
							void handleQuickCreate();
						}}
					>
						<Input
							ref={taskInputRef}
							placeholder="New task title…"
							value={newTaskTitle}
							onChange={(event) => setNewTaskTitle(event.target.value)}
							disabled={isCreating}
							aria-label="New task title"
						/>
						<Button type="submit" disabled={!canCreate} className="shrink-0 gap-2">
							{isCreating ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Plus className="size-4" />
							)}
							Add
						</Button>
					</form>
					<Button
						type="button"
						variant="outline"
						className="gap-2"
						onClick={openCreateDialog}
						disabled={isCreating}
					>
						<AlignLeft className="size-4" />
						Add with details
					</Button>
				</div>
			</div>

			{tasks === undefined ? (
				<div className="flex justify-center py-16">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCorners}
					onDragStart={handleDragStart}
					onDragEnd={(event) => void handleDragEnd(event)}
				>
					<div className="grid gap-4 lg:grid-cols-3">
						{KANBAN_COLUMNS.map((column) => (
							<KanbanColumn
								key={column.id}
								column={column}
								tasks={grouped[column.id]}
								onEditTask={openEditDialog}
								onDeleteTask={(taskId) => void handleDelete(taskId)}
								onFocusCreate={
									column.id === "todo"
										? () => taskInputRef.current?.focus()
										: undefined
								}
							/>
						))}
					</div>
					<DragOverlay>
						{activeTask ? (
							<div className="rounded-lg border border-primary/30 bg-background p-3 shadow-lg">
								<p className="text-sm font-medium">{activeTask.title}</p>
								{activeTask.description ? (
									<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
										{activeTask.description}
									</p>
								) : null}
							</div>
						) : null}
					</DragOverlay>
				</DndContext>
			)}

			<TaskDetailsDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				mode={dialogMode}
				initialValues={
					dialogMode === "edit" && editingTask
						? {
								title: editingTask.title,
								description: editingTask.description ?? "",
							}
						: {
								title: newTaskTitle,
								description: "",
							}
				}
				onSubmit={handleDialogSubmit}
			/>
		</div>
	);
}
