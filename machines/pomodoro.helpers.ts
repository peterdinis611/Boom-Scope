export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
	focusDuration: number;
	shortBreakDuration: number;
	longBreakDuration: number;
}

export interface PomodoroContext {
	mode: PomodoroMode;
	timeLeft: number;
	settings: PomodoroSettings;
	justCompleted: boolean;
	completedMode: PomodoroMode | null;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
	focusDuration: 25 * 60,
	shortBreakDuration: 5 * 60,
	longBreakDuration: 15 * 60,
};

export function getDurationForMode(
	mode: PomodoroMode,
	settings: PomodoroSettings,
): number {
	switch (mode) {
		case "focus":
			return settings.focusDuration;
		case "shortBreak":
			return settings.shortBreakDuration;
		case "longBreak":
			return settings.longBreakDuration;
		default:
			return settings.focusDuration;
	}
}

export function getNextModeAfterSkip(mode: PomodoroMode): PomodoroMode {
	return mode === "focus" ? "shortBreak" : "focus";
}

export function getNextModeAfterComplete(mode: PomodoroMode): PomodoroMode {
	return mode === "focus" ? "shortBreak" : "focus";
}

export function getPomodoroProgress(
	mode: PomodoroMode,
	timeLeft: number,
	settings: PomodoroSettings,
): number {
	const totalDuration = getDurationForMode(mode, settings);
	if (totalDuration <= 0) return 0;
	return ((totalDuration - timeLeft) / totalDuration) * 100;
}

export function createInitialPomodoroContext(
	settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
): PomodoroContext {
	return {
		mode: "focus",
		timeLeft: settings.focusDuration,
		settings,
		justCompleted: false,
		completedMode: null,
	};
}
