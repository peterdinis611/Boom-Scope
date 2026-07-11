"use client";

import { useEffect, useState } from "react";
import { getPomodoroSessions } from "@/lib/pomodoro-sessions";
import { sumFocusMinutesForProject } from "@/lib/workflow-stats";

export function useProjectFocusMinutes(projectId?: string) {
	const [minutes, setMinutes] = useState(0);

	useEffect(() => {
		if (!projectId) {
			setMinutes(0);
			return;
		}

		let cancelled = false;

		void getPomodoroSessions().then((sessions) => {
			if (cancelled) return;
			setMinutes(sumFocusMinutesForProject(sessions, projectId));
		});

		return () => {
			cancelled = true;
		};
	}, [projectId]);

	return minutes;
}
