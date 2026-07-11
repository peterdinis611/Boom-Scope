"use client";

import { useQuery } from "convex/react";
import {
	CalendarClock,
	FileText,
	Flame,
	Plus,
	SquareKanban,
	Timer,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { formatDueDate } from "@/lib/kanban";
import { getPomodoroSessions, computePomodoroStats } from "@/lib/pomodoro-sessions";
import { startOfLocalDay } from "@/lib/kanban";
import { cn } from "@/lib/utils";

export function TodayWidget() {
	const summary = useQuery(api.dashboard.todaySummary);
	const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);
	const [streakDays, setStreakDays] = useState(0);

	useEffect(() => {
		void getPomodoroSessions().then((sessions) => {
			const stats = computePomodoroStats(sessions);
			setStreakDays(stats.streakDays);
			const todayStart = startOfLocalDay();
			const todayEnd = todayStart + 86_400_000;
			const minutes = sessions
				.filter(
					(session) =>
						session.mode === "focus" &&
						session.completedAt >= todayStart &&
						session.completedAt < todayEnd,
				)
				.reduce((sum, session) => sum + session.durationMinutes, 0);
			setTodayFocusMinutes(minutes);
		});
	}, []);

	return (
		<Card className="overflow-hidden">
			<CardHeader className="border-b border-border/60 bg-muted/20">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<CardTitle className="text-base">Today</CardTitle>
						<p className="text-sm text-muted-foreground">
							Your focus, deadlines, and recent notes
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button asChild size="sm" variant="outline" className="gap-2">
							<Link href={"/dashboard/tasks" as Route}>
								<SquareKanban className="size-4" />
								New task
							</Link>
						</Button>
						<Button asChild size="sm" className="gap-2">
							<Link href="/dashboard/notes/new">
								<Plus className="size-4" />
								New note
							</Link>
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-4 p-4 lg:grid-cols-3">
				<section className="space-y-3 rounded-xl border border-border/70 p-4">
					<div className="flex items-center gap-2">
						<CalendarClock className="size-4 text-sky-600" />
						<h3 className="text-sm font-semibold">Due soon</h3>
					</div>
					{summary === undefined ? (
						<p className="text-sm text-muted-foreground">Loading tasks…</p>
					) : (
						<div className="space-y-3">
							<TaskBucket
								title="Today"
								tasks={summary.dueToday}
								emptyLabel="Nothing due today"
							/>
							<TaskBucket
								title="This week"
								tasks={summary.dueThisWeek}
								emptyLabel="Nothing else this week"
							/>
							{summary.overdue.length > 0 ? (
								<TaskBucket
									title="Overdue"
									tasks={summary.overdue}
									emptyLabel=""
									variant="danger"
								/>
							) : null}
						</div>
					)}
				</section>

				<section className="space-y-3 rounded-xl border border-border/70 p-4">
					<div className="flex items-center gap-2">
						<Timer className="size-4 text-orange-600" />
						<h3 className="text-sm font-semibold">Focus</h3>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-lg bg-muted/40 p-3">
							<p className="text-2xl font-semibold tabular-nums">
								{todayFocusMinutes}m
							</p>
							<p className="text-xs text-muted-foreground">Focused today</p>
						</div>
						<div className="rounded-lg bg-muted/40 p-3">
							<p className="flex items-center gap-1 text-2xl font-semibold tabular-nums">
								<Flame className="size-5 text-orange-500" />
								{streakDays}
							</p>
							<p className="text-xs text-muted-foreground">Day streak</p>
						</div>
					</div>
					<Button asChild size="sm" variant="outline" className="w-full gap-2">
						<Link href="/dashboard/pomodoro">
							<Timer className="size-4" />
							Open Pomodoro
						</Link>
					</Button>
				</section>

				<section className="space-y-3 rounded-xl border border-border/70 p-4">
					<div className="flex items-center gap-2">
						<FileText className="size-4 text-emerald-600" />
						<h3 className="text-sm font-semibold">Recent notes</h3>
					</div>
					{summary === undefined ? (
						<p className="text-sm text-muted-foreground">Loading notes…</p>
					) : summary.recentNotes.length === 0 ? (
						<p className="text-sm text-muted-foreground">No notes yet</p>
					) : (
						<div className="space-y-2">
							{summary.recentNotes.map((note) => (
								<Link
									key={note._id}
									href={`/dashboard/notes/${note._id}`}
									className="block rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
								>
									<p className="truncate text-sm font-medium">{note.title}</p>
								</Link>
							))}
						</div>
					)}
				</section>
			</CardContent>
		</Card>
	);
}

function TaskBucket({
	title,
	tasks,
	emptyLabel,
	variant = "default",
}: {
	title: string;
	tasks: Array<{
		_id: string;
		title: string;
		projectId: string;
		projectName: string | null;
		dueDate?: number;
	}>;
	emptyLabel: string;
	variant?: "default" | "danger";
}) {
	if (tasks.length === 0 && emptyLabel) {
		return (
			<div>
				<p
					className={cn(
						"mb-1 text-xs font-medium uppercase tracking-wide",
						variant === "danger" ? "text-destructive" : "text-muted-foreground",
					)}
				>
					{title}
				</p>
				<p className="text-sm text-muted-foreground">{emptyLabel}</p>
			</div>
		);
	}

	if (tasks.length === 0) return null;

	return (
		<div>
			<p
				className={cn(
					"mb-1 text-xs font-medium uppercase tracking-wide",
					variant === "danger" ? "text-destructive" : "text-muted-foreground",
				)}
			>
				{title}
			</p>
			<div className="space-y-1">
				{tasks.slice(0, 4).map((task) => (
					<Link
						key={task._id}
						href={`/dashboard/tasks?projectId=${task.projectId}` as Route}
						className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/60"
					>
						<span className="truncate font-medium">{task.title}</span>
						<span className="shrink-0 text-xs text-muted-foreground">
							{task.dueDate ? formatDueDate(task.dueDate) : task.projectName}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
