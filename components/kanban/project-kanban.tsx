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
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/errors";
import { filterKanbanTasks } from "@/lib/kanban-filters";
import { resolveDropTarget } from "@/lib/kanban-dnd";
import {
	DEFAULT_KANBAN_COLUMNS,
	isWipLimitReached,
	startOfLocalDay,
	type KanbanColumn,
} from "@/lib/kanban";
import { KanbanColumnManager } from "./kanban-column-manager";
import { KanbanColumn as KanbanColumnView } from "./kanban-column";
import {
	EMPTY_KANBAN_FILTERS,
	KanbanFiltersBar,
} from "./kanban-filters-bar";
import type { EnrichedProjectTask } from "./kanban-task-card";
import {
	TaskDetailsDialog,
	type TaskDetailsFormValues,
} from "./task-details-dialog";

type ProjectTask = EnrichedProjectTask;

type BoardLane = KanbanColumn & {
	laneId: string;
};

type ProjectKanbanProps = {
	defaultProjectId?: Id<"projects">;
	variant?: "full" | "embedded";
	scope?: "project" | "all";
};

function formatDueDateInput(value?: number): string {
	if (!value) return "";
	return new Date(value).toISOString().slice(0, 10);
}

function parseDueDateInput(value?: string): number | undefined {
	if (!value?.trim()) return undefined;
	const parsed = new Date(`${value}T12:00:00`);
	if (Number.isNaN(parsed.getTime())) return undefined;
	return startOfLocalDay(parsed.getTime());
}

function parseLabelsInput(value: string): string[] {
	return value
		.split(",")
		.map((label) => label.trim())
		.filter(Boolean);
}

export function ProjectKanban({
	defaultProjectId,
	variant = "full",
	scope = "project",
}: ProjectKanbanProps) {
	const isEmbedded = variant === "embedded";
	const isAllScope = scope === "all";
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
	const [filters, setFilters] = useState(EMPTY_KANBAN_FILTERS);
	const taskInputRef = useRef<HTMLInputElement>(null);

	const projects = useQuery(api.projects.list);
	const columns = useQuery(
		api.kanban_columns.list,
		projectId && !isAllScope ? { projectId } : "skip",
	);
	const tasks = useQuery(api.project_tasks.list, {
		projectId: isAllScope ? undefined : projectId,
	});
	const projectNotes = useQuery(
		api.notes.list,
		projectId && !isAllScope
			? {
					projectId,
					paginationOpts: { numItems: 100, cursor: null },
				}
			: "skip",
	);
	const projectDesigns = useQuery(
		api.designs.listByProject,
		projectId && !isAllScope ? { projectId } : "skip",
	);

	const ensureDefaults = useMutation(api.kanban_columns.ensureDefaults);
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
		if (isAllScope || isEmbedded || projectId || !projects?.length) return;
		setProjectId(projects[0]._id);
	}, [isAllScope, isEmbedded, projectId, projects]);

	useEffect(() => {
		if (!projectId || isAllScope) return;
		void ensureDefaults({ projectId });
	}, [projectId, isAllScope, ensureDefaults]);

	const noteOptions = useMemo(
		() =>
			(projectNotes?.page ?? []).map((note) => ({
				id: note._id,
				label: note.title,
			})),
		[projectNotes],
	);

	const designOptions = useMemo(
		() =>
			(projectDesigns ?? []).map((design) => ({
				id: design._id,
				label: design.name,
			})),
		[projectDesigns],
	);

	const filteredTasks = useMemo(
		() => filterKanbanTasks(tasks ?? [], filters),
		[tasks, filters],
	);

	const boardLanes = useMemo((): BoardLane[] => {
		if (!isAllScope) {
			return (columns ?? []).map((column) => ({
				...column,
				laneId: column._id,
			}));
		}

		const lanes: BoardLane[] = DEFAULT_KANBAN_COLUMNS.map((definition, index) => ({
			_id: `lane-${definition.key}` as Id<"kanban_columns">,
			projectId: "skip" as Id<"projects">,
			label: definition.label,
			color: definition.color,
			position: index,
			key: definition.key,
			laneId: `key:${definition.key}`,
		}));

		const seen = new Set<string>();
		for (const task of filteredTasks) {
			if (!task.columnId || task.columnKey) continue;
			if (seen.has(task.columnId)) continue;
			seen.add(task.columnId);
			lanes.push({
				_id: task.columnId,
				projectId: task.projectId,
				label: task.columnLabel ?? "Column",
				color:
					task.columnColor ??
					"bg-violet-500/10 text-violet-700 dark:text-violet-300",
				position: lanes.length,
				key: undefined,
				laneId: task.columnId,
			});
		}

		return lanes;
	}, [columns, filteredTasks, isAllScope]);

	const grouped = useMemo(() => {
		const map: Record<string, ProjectTask[]> = {};
		for (const lane of boardLanes) {
			map[lane.laneId] = [];
		}

		for (const task of filteredTasks) {
			if (isAllScope) {
				const lane = boardLanes.find((candidate) =>
					candidate.key
						? task.columnKey === candidate.key
						: candidate._id === task.columnId,
				);
				if (lane) {
					map[lane.laneId]?.push(task);
				}
				continue;
			}

			if (task.columnId && map[task.columnId]) {
				map[task.columnId].push(task);
			}
		}

		for (const laneId of Object.keys(map)) {
			map[laneId].sort((a, b) => a.position - b.position);
		}

		return map;
	}, [boardLanes, filteredTasks, isAllScope]);

	const activeTask = useMemo(() => {
		if (!activeTaskId) return null;
		return (tasks ?? []).find((task) => task._id === activeTaskId) ?? null;
	}, [activeTaskId, tasks]);

	const columnsById = useMemo(() => {
		const map = new Map<string, KanbanColumn>();
		for (const column of columns ?? []) {
			map.set(column._id, column);
		}
		return map;
	}, [columns]);

	const firstColumnId = useMemo(() => {
		if (isAllScope || !columns?.length) return undefined;
		return columns[0]?._id;
	}, [columns, isAllScope]);

	const handleCreate = async (
		title: string,
		details?: Partial<TaskDetailsFormValues>,
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
				description: details?.description?.trim() || undefined,
				projectId,
				columnId: firstColumnId,
				linkedNoteId: details?.linkedNoteId ?? undefined,
				linkedDesignId: details?.linkedDesignId ?? undefined,
				dueDate: parseDueDateInput(details?.dueDate),
				priority: details?.priority ?? undefined,
				labels: details?.labels ? parseLabelsInput(details.labels) : undefined,
				subtasks: details?.subtasks,
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
		if (!projectId && dialogMode === "create") {
			toast.error("Select a project first");
			return;
		}

		try {
			if (dialogMode === "create") {
				await handleCreate(values.title, values);
			} else if (editingTask) {
				await updateTask({
					taskId: editingTask._id,
					title: values.title,
					description: values.description,
					linkedNoteId: values.linkedNoteId,
					linkedDesignId: values.linkedDesignId,
					dueDate: parseDueDateInput(values.dueDate) ?? null,
					priority: values.priority,
					labels: parseLabelsInput(values.labels),
					subtasks: values.subtasks,
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
		const task = (tasks ?? []).find((item) => item._id === activeId);
		if (!task) return;

		const dropTarget = resolveDropTarget(String(over.id), grouped);
		if (!dropTarget) return;

		let toColumnId: Id<"kanban_columns"> | null = null;

		if (isAllScope) {
			if (dropTarget.columnId.startsWith("key:")) {
				const key = dropTarget.columnId.slice(4) as
					| "todo"
					| "in_progress"
					| "done";
				try {
					await moveTaskMutation({
						taskId: activeId,
						toColumnKey: key,
						toIndex: dropTarget.index,
					});
				} catch (error) {
					toast.error(getErrorMessage(error) || "Failed to move task");
				}
				return;
			}
			toColumnId = dropTarget.columnId as Id<"kanban_columns">;
		} else {
			toColumnId = dropTarget.columnId as Id<"kanban_columns">;
		}

		if (!toColumnId) return;

		if (!isAllScope) {
			const destinationColumn = columnsById.get(toColumnId);
			const movingAcrossColumns = task.columnId !== toColumnId;
			const destinationCount = grouped[dropTarget.columnId]?.length ?? 0;

			if (
				movingAcrossColumns &&
				isWipLimitReached(destinationCount, destinationColumn?.wipLimit)
			) {
				toast.error(
					`WIP limit reached for ${destinationColumn?.label ?? "column"} (${destinationColumn?.wipLimit})`,
				);
				return;
			}
		}

		try {
			await moveTaskMutation({
				taskId: activeId,
				toColumnId,
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

	if (!isAllScope && !projectId) {
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

	const canCreate = Boolean(newTaskTitle.trim()) && !isCreating && !isAllScope;
	const showCreateBar = !isAllScope;
	const filterColumns = (columns ?? []) as KanbanColumn[];

	return (
		<div className="space-y-4">
			{!isEmbedded ? (
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					{!isAllScope ? (
						<div className="w-full max-w-xs space-y-1.5">
							<p className="text-sm font-medium">Project</p>
							<ProjectSelector value={projectId} onChange={setProjectId} />
						</div>
					) : (
						<div className="space-y-1">
							<p className="text-sm font-medium">All projects</p>
							<p className="text-sm text-muted-foreground">
								Tasks from every project in one board. Drag to change status.
							</p>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2">
						{projectId && !isAllScope ? (
							<KanbanColumnManager
								projectId={projectId}
								columns={filterColumns}
							/>
						) : null}
						{showCreateBar ? (
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
									<Button
										type="submit"
										disabled={!canCreate}
										className="shrink-0 gap-2"
									>
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
						) : null}
					</div>
				</div>
			) : showCreateBar ? (
				<div className="flex flex-col gap-2 sm:flex-row">
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
						Details
					</Button>
				</div>
			) : null}

			{!isEmbedded ? (
				<KanbanFiltersBar
					filters={filters}
					columns={filterColumns}
					onChange={setFilters}
				/>
			) : null}

			{tasks === undefined || (!isAllScope && columns === undefined) ? (
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
					<div
						className="grid gap-4"
						style={{
							gridTemplateColumns: `repeat(${Math.max(boardLanes.length, 1)}, minmax(0, 1fr))`,
						}}
					>
						{boardLanes.map((lane) => (
							<KanbanColumnView
								key={lane.laneId}
								column={{
									...lane,
									_id: lane.laneId as Id<"kanban_columns">,
								}}
								tasks={grouped[lane.laneId] ?? []}
								showProjectName={isAllScope}
								onEditTask={openEditDialog}
								onDeleteTask={(taskId) => void handleDelete(taskId)}
								onFocusCreate={
									showCreateBar && lane.position === 0
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
				noteOptions={noteOptions}
				designOptions={designOptions}
				initialValues={
					dialogMode === "edit" && editingTask
						? {
								title: editingTask.title,
								description: editingTask.description ?? "",
								linkedNoteId: editingTask.linkedNoteId ?? null,
								linkedDesignId: editingTask.linkedDesignId ?? null,
								dueDate: formatDueDateInput(editingTask.dueDate),
								priority: editingTask.priority ?? null,
								labels: (editingTask.labels ?? []).join(", "),
								subtasks: editingTask.subtasks ?? [],
							}
						: {
								title: newTaskTitle,
								description: "",
								linkedNoteId: null,
								linkedDesignId: null,
								dueDate: "",
								priority: null,
								labels: "",
								subtasks: [],
							}
				}
				onSubmit={handleDialogSubmit}
			/>
		</div>
	);
}
