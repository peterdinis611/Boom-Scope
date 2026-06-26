"use client";

import type React from "react";
import { useMachine } from "@xstate/react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";
import { toast } from "sonner";
import { getPomodoroSettings, savePomodoroSettings } from "@/lib/pomodoro-db";
import { logPomodoroSession } from "@/lib/pomodoro-sessions";
import {
	getPomodoroProgress,
	pomodoroMachine,
	type PomodoroMode,
	type PomodoroSettings,
} from "@/machines";

export type { PomodoroMode, PomodoroSettings };

interface PomodoroContextType {
	timeLeft: number;
	isActive: boolean;
	mode: PomodoroMode;
	settings: PomodoroSettings;
	progress: number;
	toggleTimer: () => void;
	resetTimer: () => void;
	skipMode: () => void;
	setMode: (mode: PomodoroMode) => void;
	updateSettings: (settings: Partial<PomodoroSettings>) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(
	undefined,
);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
	const [snapshot, send] = useMachine(pomodoroMachine);
	const { mode, timeLeft, settings, justCompleted, completedMode } =
		snapshot.context;
	const isActive = snapshot.matches("running");

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
						? "Great work! Take a break."
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
			void logPomodoroSession("focus", settings.focusDuration / 60);
		}

		send({ type: "ACK_COMPLETE" });
	}, [justCompleted, completedMode, send, settings.focusDuration]);

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

	const progress = getPomodoroProgress(mode, timeLeft, settings);

	const value = useMemo(
		() => ({
			timeLeft,
			isActive,
			mode,
			settings,
			progress,
			toggleTimer,
			resetTimer,
			skipMode,
			setMode,
			updateSettings,
		}),
		[
			timeLeft,
			isActive,
			mode,
			settings,
			progress,
			toggleTimer,
			resetTimer,
			skipMode,
			setMode,
			updateSettings,
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
