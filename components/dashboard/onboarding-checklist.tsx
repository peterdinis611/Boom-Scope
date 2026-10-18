"use client";

import { useMutation, useQuery } from "convex/react";
import {
	CheckCircle2,
	Circle,
	FolderKanban,
	Inbox,
	Timer,
	X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { getPomodoroSessions } from "@/lib/pomodoro-sessions";

export function OnboardingChecklist() {
	const viewer = useQuery(api.users.viewer);
	const stats = useQuery(api.dashboard.dashboardStats);
	const inboxCount = useQuery(api.inbox.openCount);
	const dismiss = useMutation(api.users.dismissOnboarding);
	const [hasFocusSession, setHasFocusSession] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void getPomodoroSessions().then((sessions) => {
			if (cancelled) return;
			setHasFocusSession(
				sessions.some((session) => session.mode === "focus"),
			);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	if (viewer === undefined || stats === undefined) return null;
	if (viewer?.onboardingDismissedAt) return null;

	const steps = [
		{
			id: "project",
			label: "Create your first project",
			done: (stats.projects ?? 0) > 0,
			href: "/dashboard/projects" as Route,
			icon: FolderKanban,
		},
		{
			id: "capture",
			label: "Capture something with ⌘N",
			done:
				(inboxCount ?? 0) > 0 ||
				(stats.notes ?? 0) > 0 ||
				(stats.tasks ?? 0) > 0,
			href: "/dashboard/inbox" as Route,
			icon: Inbox,
		},
		{
			id: "focus",
			label: "Run a Pomodoro focus session",
			done: hasFocusSession,
			href: "/dashboard/pomodoro" as Route,
			icon: Timer,
			hint: "Start from a task or the timer",
		},
	];

	const completed = steps.filter((step) => step.done).length;
	if (completed === steps.length) return null;

	return (
		<Card className="overflow-hidden border-primary/20">
			<CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 bg-primary/5">
				<div>
					<p className="font-mono text-[10px] tracking-[0.18em] text-primary uppercase">
						Getting started
					</p>
					<CardTitle className="mt-1 text-base">
						Set up your desk ({completed}/{steps.length})
					</CardTitle>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Dismiss onboarding"
					onClick={() => void dismiss({})}
				>
					<X className="size-4" />
				</Button>
			</CardHeader>
			<CardContent className="space-y-2 p-4">
				{steps.map((step) => {
					const Icon = step.icon;
					return (
						<Link
							key={step.id}
							href={step.href}
							className="flex items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/40"
						>
							{step.done ? (
								<CheckCircle2 className="size-4 shrink-0 text-success" />
							) : (
								<Circle className="size-4 shrink-0 text-muted-foreground" />
							)}
							<Icon className="size-4 shrink-0 text-muted-foreground" />
							<span className="min-w-0 flex-1 text-sm">
								<span
									className={
										step.done
											? "text-muted-foreground line-through"
											: "font-medium text-foreground"
									}
								>
									{step.label}
								</span>
								{step.hint && !step.done ? (
									<span className="mt-0.5 block text-[11px] text-muted-foreground">
										{step.hint}
									</span>
								) : null}
							</span>
						</Link>
					);
				})}
			</CardContent>
		</Card>
	);
}
