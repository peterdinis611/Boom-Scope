"use client";

import { useQuery } from "convex/react";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	FileText,
	Inbox,
	Link2Off,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { formatDueDate } from "@/lib/kanban";

export function WeeklyReviewWidget() {
	const review = useQuery(api.dashboard.weeklyReview);

	return (
		<Card className="overflow-hidden">
			<CardHeader className="border-b border-border/60 bg-muted/20">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="font-mono text-[10px] tracking-[0.18em] text-scope uppercase">
							Weekly review
						</p>
						<CardTitle className="mt-1 text-base">Last 7 days</CardTitle>
						<p className="text-sm text-muted-foreground">
							What moved, what’s overdue, and what’s still unscoped
						</p>
					</div>
					{review && review.inboxOpen > 0 ? (
						<Button asChild size="sm" variant="outline" className="gap-2">
							<Link href={"/dashboard/inbox" as Route}>
								<Inbox className="size-4" />
								{review.inboxOpen} in inbox
							</Link>
						</Button>
					) : null}
				</div>
			</CardHeader>
			<CardContent className="grid gap-4 p-4 lg:grid-cols-2 xl:grid-cols-4">
				<section className="space-y-3 rounded-xl border border-border/70 p-4">
					<div className="flex items-center gap-2">
						<Activity className="size-4 text-scope" />
						<h3 className="text-sm font-semibold">Moved</h3>
						{review ? (
							<span className="text-[11px] text-muted-foreground">
								{review.moved.length}
							</span>
						) : null}
					</div>
					{review === undefined ? (
						<p className="text-sm text-muted-foreground">Loading…</p>
					) : review.moved.length === 0 ? (
						<p className="text-sm text-muted-foreground">No board moves yet.</p>
					) : (
						<ul className="space-y-2">
							{review.moved.map((item) => (
								<li key={item._id} className="text-sm">
									<p className="line-clamp-2 text-foreground">{item.summary}</p>
									<p className="text-[11px] text-muted-foreground">
										{item.projectName ?? "Project"}
									</p>
								</li>
							))}
						</ul>
					)}
					{review && review.completed.length > 0 ? (
						<p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
							<CheckCircle2 className="size-3 text-success" />
							{review.completed.length} completed this week
						</p>
					) : null}
				</section>

				<section className="space-y-3 rounded-xl border border-border/70 p-4">
					<div className="flex items-center gap-2">
						<AlertTriangle className="size-4 text-destructive" />
						<h3 className="text-sm font-semibold">Overdue</h3>
					</div>
					{review === undefined ? (
						<p className="text-sm text-muted-foreground">Loading…</p>
					) : review.overdue.length === 0 ? (
						<p className="text-sm text-muted-foreground">Nothing overdue.</p>
					) : (
						<ul className="space-y-2">
							{review.overdue.map((task) => (
								<li key={task._id}>
									<Link
										href={`/dashboard/tasks?projectId=${task.projectId}` as Route}
										className="block text-sm hover:text-primary"
									>
										<span className="font-medium">{task.title}</span>
										<span className="mt-0.5 block text-[11px] text-destructive">
											{task.dueDate ? formatDueDate(task.dueDate) : "Overdue"} ·{" "}
											{task.projectName}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>

				<section className="space-y-3 rounded-xl border border-border/70 p-4">
					<div className="flex items-center gap-2">
						<Link2Off className="size-4 text-warning" />
						<h3 className="text-sm font-semibold">Unlinked tasks</h3>
					</div>
					{review === undefined ? (
						<p className="text-sm text-muted-foreground">Loading…</p>
					) : review.unlinkedTasks.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Open tasks have note or canvas links.
						</p>
					) : (
						<ul className="space-y-2">
							{review.unlinkedTasks.map((task) => (
								<li key={task._id}>
									<Link
										href={`/dashboard/tasks?projectId=${task.projectId}` as Route}
										className="block text-sm hover:text-primary"
									>
										<span className="font-medium">{task.title}</span>
										<span className="mt-0.5 block text-[11px] text-muted-foreground">
											{task.projectName} · no note/canvas
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>

				<section className="space-y-3 rounded-xl border border-border/70 p-4">
					<div className="flex items-center gap-2">
						<FileText className="size-4 text-muted-foreground" />
						<h3 className="text-sm font-semibold">Notes without project</h3>
					</div>
					{review === undefined ? (
						<p className="text-sm text-muted-foreground">Loading…</p>
					) : review.notesWithoutProject.length === 0 ? (
						<p className="text-sm text-muted-foreground">All notes have a project.</p>
					) : (
						<ul className="space-y-2">
							{review.notesWithoutProject.map((note) => (
								<li key={note._id}>
									<Link
										href={`/dashboard/notes/${note._id}`}
										className="block text-sm hover:text-primary"
									>
										{note.title}
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>
			</CardContent>
		</Card>
	);
}
