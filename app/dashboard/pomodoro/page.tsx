"use client";

import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";

export default function PomodoroPage() {
	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Pomodoro</h2>
					<p className="text-muted-foreground">
						Spravujte svoj čas efektívne pomocou techniky Pomodoro.
					</p>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<PomodoroTimer />
			</div>
		</div>
	);
}
