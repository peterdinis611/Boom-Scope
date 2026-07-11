"use client";

import { BarChart3, Flame, Target, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	computePomodoroStats,
	getPomodoroSessions,
	type PomodoroStats,
} from "@/lib/pomodoro-sessions";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["-6d", "-5d", "-4d", "-3d", "-2d", "-1d", "Today"] as const;

function StatTile({
	label,
	value,
	icon: Icon,
	iconClassName,
}: {
	label: string;
	value: string;
	icon: typeof Timer;
	iconClassName: string;
}) {
	return (
		<div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-3">
			<div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
				<Icon className={cn("size-3.5", iconClassName)} />
				<span className="text-[11px] font-medium uppercase tracking-wide">
					{label}
				</span>
			</div>
			<p className="text-xl font-semibold tabular-nums tracking-tight">{value}</p>
		</div>
	);
}

export function PomodoroStatsPanel() {
	const [stats, setStats] = useState<PomodoroStats | null>(null);

	useEffect(() => {
		void getPomodoroSessions().then((sessions) => {
			setStats(computePomodoroStats(sessions));
		});
	}, []);

	if (!stats) {
		return (
			<Card className="h-full">
				<CardContent className="flex min-h-[320px] items-center justify-center py-10 text-sm text-muted-foreground">
					Loading focus stats…
				</CardContent>
			</Card>
		);
	}

	const maxDay = Math.max(...stats.last7DaysFocusMinutes, 1);
	const hasActivity = stats.last7DaysFocusMinutes.some((minutes) => minutes > 0);

	return (
		<Card className="h-full">
			<CardHeader className="pb-4">
				<CardTitle className="text-base">Your focus</CardTitle>
				<CardDescription>Sessions saved on this device</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-3 gap-3">
					<StatTile
						label="Focus time"
						value={`${stats.totalFocusMinutes}m`}
						icon={Timer}
						iconClassName="text-primary"
					/>
					<StatTile
						label="Sessions"
						value={String(stats.focusSessions)}
						icon={Target}
						iconClassName="text-emerald-500"
					/>
					<StatTile
						label="Streak"
						value={`${stats.streakDays}d`}
						icon={Flame}
						iconClassName="text-amber-500"
					/>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between gap-2">
						<p className="text-sm font-medium">Last 7 days</p>
						<BarChart3 className="size-4 text-muted-foreground" />
					</div>

					{hasActivity ? (
						<div className="flex h-36 items-end gap-1.5 rounded-lg border border-border/60 bg-muted/15 px-3 pb-3 pt-4">
							{stats.last7DaysFocusMinutes.map((minutes, index) => (
								<div
									key={`focus-day-${index}`}
									className="flex min-w-0 flex-1 flex-col items-center gap-2"
								>
									<span className="text-[10px] font-medium tabular-nums text-muted-foreground">
										{minutes > 0 ? `${minutes}m` : ""}
									</span>
									<div
										className="flex w-full items-end justify-center"
										style={{ height: "88px" }}
									>
										<div
											className={cn(
												"w-full max-w-8 rounded-t-md bg-primary/85 transition-all",
												minutes === 0 && "bg-muted-foreground/20",
											)}
											style={{
												height: `${Math.max(minutes > 0 ? 12 : 6, (minutes / maxDay) * 100)}%`,
											}}
											title={`${minutes} minutes`}
										/>
									</div>
									<span className="text-[10px] text-muted-foreground">
										{DAY_LABELS[index]}
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="flex h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/10 px-4 text-center">
							<p className="text-sm font-medium">No focus data yet</p>
							<p className="text-xs text-muted-foreground">
								Complete a focus session to start tracking your progress.
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
