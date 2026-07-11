import { parseStickyNoteItems } from "@/lib/sticky-notes";
import type { PomodoroSession } from "@/lib/pomodoro-sessions";

export function countStickyNotesForProject(
	itemsJson: string | undefined,
	projectId: string,
): number {
	return parseStickyNoteItems(itemsJson).filter(
		(note) => note.projectId === projectId,
	).length;
}

export function sumFocusMinutesForProject(
	sessions: PomodoroSession[],
	projectId: string,
): number {
	return sessions
		.filter(
			(session) =>
				session.mode === "focus" && session.projectId === projectId,
		)
		.reduce((sum, session) => sum + session.durationMinutes, 0);
}

export function sumFocusMinutesForTask(
	sessions: PomodoroSession[],
	taskId: string,
): number {
	return sessions
		.filter((session) => session.mode === "focus" && session.taskId === taskId)
		.reduce((sum, session) => sum + session.durationMinutes, 0);
}
