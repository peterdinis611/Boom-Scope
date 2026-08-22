"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	CalendarClock,
	FileText,
	GripVertical,
	Palette,
	Pencil,
	Timer,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { usePomodoro } from "@/components/dashboard/pomodoro-context";
import {
	formatDueDate,
	isTaskOverdue,
	PRIORITY_META,
	type TaskPriority,
} from "@/lib/kanban";
import { cn } from "@/lib/utils";

export type EnrichedProjectTask = Doc<"project_tasks"> & {
	projectName?: string | null;
	linkedNoteTitle?: string | null;
	linkedDesignName?: string | null;
	columnLabel?: string | null;
	columnKey?: string | null;
	columnColor?: string | null;
};

type KanbanTaskCardProps = {
	task: EnrichedProjectTask;
	showProjectName?: boolean;
	onEdit: (task: EnrichedProjectTask) => void;
	onDelete: (taskId: Id<"project_tasks">) => void;
};

export function KanbanTaskCard({
	task,
	showProjectName = false,
	onEdit,
	onDelete,
}: KanbanTaskCardProps) {
	const router = useRouter();
	const { startFocusOnTask, focusTarget } = usePomodoro();
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task._id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const isFocused = focusTarget?.taskId === task._id;
	const overdue = isTaskOverdue(task.dueDate, task.columnKey);
	const completedSubtasks =
		task.subtasks?.filter((item) => item.completed).length ?? 0;
	const totalSubtasks = task.subtasks?.length ?? 0;

	const handleFocus = () => {
		startFocusOnTask({
			taskId: task._id,
			taskTitle: task.title,
			projectId: task.projectId,
		});
		router.push("/dashboard/pomodoro");
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"rounded-lg border border-border bg-background p-3 shadow-sm",
				isDragging && "z-20 opacity-60 ring-2 ring-primary/30",
				isFocused && "border-primary/40 ring-1 ring-primary/20",
				overdue && "border-destructive/40 bg-destructive/5",
			)}
		>
			<div className="flex items-start gap-2">
				<button
					type="button"
					className="mt-0.5 cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
					aria-label={`Drag ${task.title}`}
					{...attributes}
					{...listeners}
				>
					<GripVertical className="size-4" />
				</button>
				<div className="min-w-0 flex-1">
					<div className="mb-1 flex flex-wrap items-center gap-1.5">
						{showProjectName && task.projectName ? (
							<span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
								{task.projectName}
							</span>
						) : null}
						{task.priority ? (
							<span
								className={cn(
									"rounded-full px-2 py-0.5 text-[10px] font-medium",
									PRIORITY_META[task.priority as TaskPriority].color,
								)}
							>
								{PRIORITY_META[task.priority as TaskPriority].label}
							</span>
						) : null}
						{overdue ? (
							<span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-medium text-destructive">
								Overdue
							</span>
						) : null}
					</div>
					<button
						type="button"
						className="w-full text-left text-sm font-medium hover:text-primary"
						onClick={() => onEdit(task)}
					>
						{task.title}
					</button>
					{task.description ? (
						<p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
							{task.description}
						</p>
					) : (
						<button
							type="button"
							className="mt-1 text-xs text-muted-foreground hover:text-foreground"
							onClick={() => onEdit(task)}
						>
							Add details
						</button>
					)}
					{task.dueDate ? (
						<p
							className={cn(
								"mt-1 flex items-center gap-1 text-[11px]",
								overdue ? "text-destructive" : "text-muted-foreground",
							)}
						>
							<CalendarClock className="size-3" />
							{formatDueDate(task.dueDate)}
						</p>
					) : null}
					{totalSubtasks > 0 ? (
						<p className="mt-1 text-[11px] text-muted-foreground">
							Checklist {completedSubtasks}/{totalSubtasks}
						</p>
					) : null}
					{(task.focusMinutes ?? 0) > 0 ? (
						<p className="mt-1 text-[11px] text-muted-foreground">
							{task.focusMinutes} min focused
						</p>
					) : null}
					{task.labels && task.labels.length > 0 ? (
						<div className="mt-2 flex flex-wrap gap-1">
							{task.labels.map((label) => (
								<span
									key={label}
									className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
								>
									{label}
								</span>
							))}
						</div>
					) : null}
				</div>
			</div>

			<div className="mt-3 flex flex-wrap items-center justify-between gap-1 pl-7">
				<div className="flex flex-wrap gap-1">
					{task.linkedNoteId ? (
						<Button
							asChild
							size="xs"
							variant="outline"
							className="h-7 gap-1 px-2 text-[11px]"
						>
							<Link href={`/dashboard/notes/${task.linkedNoteId}`}>
								<FileText className="size-3" />
								{task.linkedNoteTitle ?? "Note"}
							</Link>
						</Button>
					) : (
						<Button
							type="button"
							size="xs"
							variant="ghost"
							className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
							onClick={() => onEdit(task)}
						>
							<FileText className="size-3" />
							Link note
						</Button>
					)}
					{task.linkedDesignId ? (
						<Button
							asChild
							size="xs"
							variant="outline"
							className="h-7 gap-1 px-2 text-[11px]"
						>
							<Link
								href={`/dashboard/canvas?projectId=${task.projectId}&designId=${task.linkedDesignId}`}
							>
								<Palette className="size-3" />
								{task.linkedDesignName ?? "Canvas"}
							</Link>
						</Button>
					) : (
						<Button
							type="button"
							size="xs"
							variant="ghost"
							className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
							onClick={() => onEdit(task)}
						>
							<Palette className="size-3" />
							Link canvas
						</Button>
					)}
					<Button
						type="button"
						size="xs"
						variant={isFocused ? "default" : "outline"}
						className="h-7 gap-1 px-2 text-[11px]"
						onClick={handleFocus}
					>
						<Timer className="size-3" />
						Focus
					</Button>
				</div>
				<div className="flex gap-1">
					<Button
						type="button"
						size="icon-xs"
						variant="ghost"
						onClick={() => onEdit(task)}
						aria-label="Edit task"
					>
						<Pencil className="size-3.5" />
					</Button>
					<Button
						type="button"
						size="icon-xs"
						variant="ghost"
						className="text-destructive"
						onClick={() => onDelete(task._id)}
						aria-label="Delete task"
					>
						<Trash2 className="size-3.5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
