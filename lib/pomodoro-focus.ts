import type { Id } from "@/convex/_generated/dataModel";

export type PomodoroFocusTarget = {
	taskId: Id<"project_tasks">;
	taskTitle: string;
	projectId: Id<"projects">;
};

const STORAGE_KEY = "boom-scope-pomodoro-focus";

export function getPomodoroFocusTarget(): PomodoroFocusTarget | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as PomodoroFocusTarget;
		if (
			typeof parsed.taskId === "string" &&
			typeof parsed.taskTitle === "string" &&
			typeof parsed.projectId === "string"
		) {
			return parsed;
		}
		return null;
	} catch {
		return null;
	}
}

export function setPomodoroFocusTarget(target: PomodoroFocusTarget): void {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(target));
	} catch {
		// Ignore quota errors.
	}
}

export function clearPomodoroFocusTarget(): void {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// Ignore.
	}
}
