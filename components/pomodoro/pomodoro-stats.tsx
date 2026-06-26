"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	computePomodoroStats,
	getPomodoroSessions,
	type PomodoroStats,
} from "@/lib/pomodoro-sessions";

export function PomodoroStatsPanel() {
	const [stats, setStats] = useState<PomodoroStats | null>(null);

	useEffect(() => {
		void getPomodoroSessions().then((sessions) => {
			setStats(computePomodoroStats(sessions));
		});
	}, []);

	if (!stats) {
		return (
			<Card>
				<CardContent className="py-6 text-sm text-muted-foreground">
					Loading focus stats…
				</CardContent>
			</Card>
		);
	}

	const maxDay = Math.max(...stats.last7DaysFocusMinutes, 1);

	return (
		<div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground">
							Focus time
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold">{stats.totalFocusMinutes}m</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground">
							Focus sessions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold">{stats.focusSessions}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground">
							Current streak
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold">{stats.streakDays} days</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm">Last 7 days</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-32 items-end gap-2">
						{stats.last7DaysFocusMinutes.map((minutes, index) => (
							<div
								key={`focus-day-${index}`}
								className="flex flex-1 flex-col items-center gap-2"
							>
								<div
									className="w-full rounded-md bg-primary/80 transition-all"
									style={{
										height: `${Math.max(8, (minutes / maxDay) * 100)}%`,
									}}
									title={`${minutes} minutes`}
								/>
								<span className="text-[10px] text-muted-foreground">
									{index === 6 ? "Today" : `-${6 - index}d`}
								</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
