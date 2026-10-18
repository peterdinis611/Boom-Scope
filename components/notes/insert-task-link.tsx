"use client";

import { useQuery } from "convex/react";
import { SquareKanban } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type InsertTaskLinkProps = {
	projectId?: Id<"projects">;
	onInsert: (html: string) => void;
};

/** Inserts a deep link to a Kanban task into the note HTML body. */
export function InsertTaskLink({ projectId, onInsert }: InsertTaskLinkProps) {
	const tasks = useQuery(
		api.project_tasks.list,
		projectId ? { projectId } : "skip",
	);

	if (!projectId) {
		return (
			<p className="text-xs text-muted-foreground">
				Assign a project to embed @task links.
			</p>
		);
	}

	if (tasks === undefined) {
		return <p className="text-xs text-muted-foreground">Loading tasks…</p>;
	}

	if (tasks.length === 0) {
		return (
			<p className="text-xs text-muted-foreground">
				No tasks in this project yet.
			</p>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<SquareKanban className="size-3.5 text-muted-foreground" />
			<Select
				onValueChange={(taskId) => {
					const task = tasks.find((item) => item._id === taskId);
					if (!task) return;
					const href = `/dashboard/tasks?projectId=${projectId}`;
					onInsert(
						`<p><a href="${href}" data-task-id="${task._id}" class="task-mention">@${task.title}</a></p>`,
					);
				}}
			>
				<SelectTrigger className="h-8 w-56">
					<SelectValue placeholder="Insert @task link" />
				</SelectTrigger>
				<SelectContent>
					{tasks.map((task) => (
						<SelectItem key={task._id} value={task._id}>
							{task.title}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
