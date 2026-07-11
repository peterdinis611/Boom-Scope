"use client";

import { useMutation } from "convex/react";
import type React from "react";
import { useMachine } from "@xstate/react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { getPomodoroSettings, savePomodoroSettings } from "@/lib/pomodoro-db";
import {
	clearPomodoroFocusTarget,
	getPomodoroFocusTarget,
	setPomodoroFocusTarget,
	type PomodoroFocusTarget,
} from "@/lib/pomodoro-focus";
import { logPomodoroSession } from "@/lib/pomodoro-sessions";
import {
	getPomodoroProgress,
	pomodoroMachine,
	type PomodoroMode,
	type PomodoroSettings,
} from "@/machines";

export type { PomodoroMode, PomodoroSettings, PomodoroFocusTarget };

interface PomodoroContextType {
	timeLeft: number;
	isActive: boolean;
	mode: PomodoroMode;
	settings: PomodoroSettings;
	progress: number;
	focusTarget: PomodoroFocusTarget | null;
	toggleTimer: () => void;
	resetTimer: () => void;
	skipMode: () => void;
	setMode: (mode: PomodoroMode) => void;
	updateSettings: (settings: Partial<PomodoroSettings>) => void;
	startFocusOnTask: (target: PomodoroFocusTarget) => void;
	clearFocusOnTask: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(
	undefined,
);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
	const [snapshot, send] = useMachine(pomodoroMachine);
	const { mode, timeLeft, settings, justCompleted, completedMode } =
		snapshot.context;
	const isActive = snapshot.matches("running");
	const [focusTarget, setFocusTarget] = useState<PomodoroFocusTarget | null>(
		null,
	);
	const addFocusMinutes = useMutation(api.project_tasks.addFocusMinutes);

	useEffect(() => {
		setFocusTarget(getPomodoroFocusTarget());
	}, []);

	useEffect(() => {
		getPomodoroSettings<PomodoroSettings>().then((saved) => {
			if (saved) {
				send({ type: "LOAD_SETTINGS", settings: saved });
			}
		});
	}, [send]);

	useEffect(() => {
		if (!isActive) return;

		const interval = setInterval(() => {
			send({ type: "TICK" });
		}, 1000);

		return () => clearInterval(interval);
	}, [isActive, send]);

	useEffect(() => {
		if (!justCompleted || !completedMode) return;

		toast.success(
			completedMode === "focus" ? "Time for a break!" : "Back to work!",
			{
				description:
					completedMode === "focus"
						? focusTarget
							? `Finished focus on “${focusTarget.taskTitle}”. Take a break.`
							: "Great work! Take a break."
						: "Break is over, let's go!",
				duration: 5000,
			},
		);

		try {
			const audio = new Audio("/sounds/notification.mp3");
			audio.play().catch(() => {});
		} catch {
			// Audio playback is optional.
		}

		if (completedMode === "focus") {
			const durationMinutes = settings.focusDuration / 60;
			const meta = focusTarget
				? {
						taskId: focusTarget.taskId,
						taskTitle: focusTarget.taskTitle,
						projectId: focusTarget.projectId,
					}
				: undefined;

			void logPomodoroSession("focus", durationMinutes, meta);

			if (focusTarget) {
				void addFocusMinutes({
					taskId: focusTarget.taskId,
					minutes: durationMinutes,
				});
			}
		}

		send({ type: "ACK_COMPLETE" });
	}, [
		justCompleted,
		completedMode,
		send,
		settings.focusDuration,
		focusTarget,
		addFocusMinutes,
	]);

	const toggleTimer = useCallback(() => send({ type: "TOGGLE" }), [send]);
	const resetTimer = useCallback(() => send({ type: "RESET" }), [send]);
	const skipMode = useCallback(() => send({ type: "SKIP_MODE" }), [send]);
	const setMode = useCallback(
		(newMode: PomodoroMode) => send({ type: "SET_MODE", mode: newMode }),
		[send],
	);
	const updateSettings = useCallback(
		(newSettings: Partial<PomodoroSettings>) => {
			const updated = { ...settings, ...newSettings };
			send({ type: "UPDATE_SETTINGS", settings: newSettings });
			savePomodoroSettings(updated);
		},
		[send, settings],
	);

	const startFocusOnTask = useCallback(
		(target: PomodoroFocusTarget) => {
			setPomodoroFocusTarget(target);
			setFocusTarget(target);
			send({ type: "SET_MODE", mode: "focus" });
			send({ type: "RESET" });
		},
		[send],
	);

	const clearFocusOnTask = useCallback(() => {
		clearPomodoroFocusTarget();
		setFocusTarget(null);
	}, []);

	const progress = getPomodoroProgress(mode, timeLeft, settings);

	const value = useMemo(
		() => ({
			timeLeft,
			isActive,
			mode,
			settings,
			progress,
			focusTarget,
			toggleTimer,
			resetTimer,
			skipMode,
			setMode,
			updateSettings,
			startFocusOnTask,
			clearFocusOnTask,
		}),
		[
			timeLeft,
			isActive,
			mode,
			settings,
			progress,
			focusTarget,
			toggleTimer,
			resetTimer,
			skipMode,
			setMode,
			updateSettings,
			startFocusOnTask,
			clearFocusOnTask,
		],
	);

	return (
		<PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
	);
}

export function usePomodoro() {
	const context = useContext(PomodoroContext);
	if (context === undefined) {
		throw new Error("usePomodoro must be used within a PomodoroProvider");
	}
	return context;
}
