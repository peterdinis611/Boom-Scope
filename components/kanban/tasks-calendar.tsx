"use client";

import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { ProjectSelector } from "@/components/notes/ProjectSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	buildMonthGrid,
	formatMonthYear,
	getWeekdayLabels,
	groupTasksByDay,
	shiftMonth,
} from "@/lib/kanban-calendar";
import { formatDueDate, isTaskOverdue, PRIORITY_META } from "@/lib/kanban";
import { cn } from "@/lib/utils";
import type { EnrichedProjectTask } from "./kanban-task-card";

type TasksCalendarProps = {
	defaultProjectId?: Id<"projects">;
};

export function TasksCalendar({ defaultProjectId }: TasksCalendarProps) {
	const now = new Date();
	const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
		defaultProjectId,
	);
	const [year, setYear] = useState(now.getFullYear());
	const [month, setMonth] = useState(now.getMonth());

	const tasks = useQuery(api.project_tasks.list, {
		projectId,
	});

	const scheduledTasks = useMemo(
		() => (tasks ?? []).filter((task) => task.dueDate),
		[tasks],
	);
	const unscheduledTasks = useMemo(
		() => (tasks ?? []).filter((task) => !task.dueDate),
		[tasks],
	);

	const tasksByDay = useMemo(
		() => groupTasksByDay(scheduledTasks),
		[scheduledTasks],
	);
	const monthDays = useMemo(() => buildMonthGrid(year, month), [year, month]);
	const weekdayLabels = getWeekdayLabels();

	const shift = (delta: number) => {
		const next = shiftMonth(year, month, delta);
		setYear(next.year);
		setMonth(next.month);
	};

	if (tasks === undefined) {
		return (
			<div className="flex justify-center py-16">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="w-full max-w-xs space-y-1.5">
					<p className="text-sm font-medium">Project</p>
					<ProjectSelector
						value={projectId}
						onChange={setProjectId}
						noneLabel="All projects"
						placeholder="All projects"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						onClick={() => shift(-1)}
						aria-label="Previous month"
					>
						<ChevronLeft className="size-4" />
					</Button>
					<p className="min-w-36 text-center text-sm font-medium">
						{formatMonthYear(year, month)}
					</p>
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						onClick={() => shift(1)}
						aria-label="Next month"
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base">Due date calendar</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
						{weekdayLabels.map((label) => (
							<div key={label}>{label}</div>
						))}
					</div>
					<div className="grid grid-cols-7 gap-2">
						{monthDays.map((day) => {
							const dayTasks = tasksByDay.get(day.dayKey) ?? [];
							return (
								<div
									key={day.dayKey}
									className={cn(
										"min-h-24 rounded-lg border border-border/70 p-2",
										!day.isCurrentMonth && "bg-muted/20 opacity-60",
										day.isToday && "border-primary/40 bg-primary/5",
									)}
								>
									<p
										className={cn(
											"mb-1 text-xs font-medium",
											day.isToday && "text-primary",
										)}
									>
										{day.date.getDate()}
									</p>
									<div className="space-y-1">
										{dayTasks.slice(0, 3).map((task) => (
											<CalendarTaskChip key={task._id} task={task} />
										))}
										{dayTasks.length > 3 ? (
											<p className="text-[10px] text-muted-foreground">
												+{dayTasks.length - 3} more
											</p>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{unscheduledTasks.length > 0 ? (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">No due date</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{unscheduledTasks.slice(0, 12).map((task) => (
							<Link
								key={task._id}
								href={
									`/dashboard/tasks?projectId=${task.projectId}` as Route
								}
								className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted/60"
							>
								{task.title}
							</Link>
						))}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}

function CalendarTaskChip({ task }: { task: EnrichedProjectTask }) {
	const overdue = isTaskOverdue(task.dueDate, task.columnKey);
	const priorityClass = task.priority
		? PRIORITY_META[task.priority].color
		: "bg-muted text-foreground";

	return (
		<Link
			href={`/dashboard/tasks?projectId=${task.projectId}` as Route}
			className={cn(
				"block truncate rounded px-1.5 py-0.5 text-[10px] font-medium hover:opacity-90",
				priorityClass,
				overdue && "ring-1 ring-destructive/40",
			)}
			title={
				task.dueDate
					? `${task.title} · ${formatDueDate(task.dueDate)}`
					: task.title
			}
		>
			{task.title}
		</Link>
	);
}
