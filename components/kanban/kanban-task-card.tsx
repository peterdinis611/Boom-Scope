"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type ProjectTask = Doc<"project_tasks">;

type KanbanTaskCardProps = {
	task: ProjectTask;
	onEdit: (task: ProjectTask) => void;
	onDelete: (taskId: Id<"project_tasks">) => void;
};

export function KanbanTaskCard({ task, onEdit, onDelete }: KanbanTaskCardProps) {
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

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"rounded-lg border border-border bg-background p-3 shadow-sm",
				isDragging && "z-20 opacity-60 ring-2 ring-primary/30",
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
				</div>
			</div>
			<div className="mt-3 flex justify-end gap-1">
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
	);
}
