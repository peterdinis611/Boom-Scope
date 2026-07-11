"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { columnDroppableId } from "@/lib/kanban-dnd";
import { type KanbanStatus } from "@/lib/kanban";
import { cn } from "@/lib/utils";
import { KanbanTaskCard } from "./kanban-task-card";

type ProjectTask = Doc<"project_tasks">;

type KanbanColumnConfig = {
	id: KanbanStatus;
	label: string;
	color: string;
};

type KanbanColumnProps = {
	column: KanbanColumnConfig;
	tasks: ProjectTask[];
	onEditTask: (task: ProjectTask) => void;
	onDeleteTask: (taskId: Id<"project_tasks">) => void;
	onFocusCreate?: () => void;
};

export function KanbanColumn({
	column,
	tasks,
	onEditTask,
	onDeleteTask,
	onFocusCreate,
}: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: columnDroppableId(column.id),
	});

	return (
		<Card
			ref={setNodeRef}
			className={cn(
				"bg-muted/20 transition-colors",
				isOver && "ring-2 ring-primary/30",
			)}
		>
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
					<span className="text-muted-foreground">{tasks.length}</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<SortableContext
					items={tasks.map((task) => task._id)}
					strategy={verticalListSortingStrategy}
				>
					{tasks.length === 0 ? (
						<div className="rounded-lg border border-dashed border-border/80 bg-background/40 px-3 py-6 text-center">
							<p className="text-sm text-muted-foreground">
								{column.id === "todo"
									? "Drop tasks here or add one above."
									: `Drop tasks into ${column.label.toLowerCase()}.`}
							</p>
							{column.id === "todo" && onFocusCreate ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="mt-3"
									onClick={onFocusCreate}
								>
									<Plus className="size-4" />
									Add first task
								</Button>
							) : null}
						</div>
					) : (
						tasks.map((task) => (
							<KanbanTaskCard
								key={task._id}
								task={task}
								onEdit={onEditTask}
								onDelete={onDeleteTask}
							/>
						))
					)}
				</SortableContext>
			</CardContent>
		</Card>
	);
}
