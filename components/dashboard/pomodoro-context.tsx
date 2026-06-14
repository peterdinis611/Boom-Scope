"use client";

import type React from "react";
import { useMachine } from "@xstate/react";
import { createContext, useContext, useEffect } from "react";
import { toast } from "sonner";
import { getPomodoroSettings, savePomodoroSettings } from "@/lib/pomodoro-db";
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

		send({ type: "ACK_COMPLETE" });
	}, [justCompleted, completedMode, send]);

	const toggleTimer = () => send({ type: "TOGGLE" });
	const resetTimer = () => send({ type: "RESET" });
	const skipMode = () => send({ type: "SKIP_MODE" });
	const setMode = (newMode: PomodoroMode) =>
		send({ type: "SET_MODE", mode: newMode });
	const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
		const updated = { ...settings, ...newSettings };
		send({ type: "UPDATE_SETTINGS", settings: newSettings });
		savePomodoroSettings(updated);
	};

	const progress = getPomodoroProgress(mode, timeLeft, settings);

	return (
		<PomodoroContext.Provider
			value={{
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
			}}
		>
			{children}
		</PomodoroContext.Provider>
	);
}

export function usePomodoro() {
	const context = useContext(PomodoroContext);
	if (context === undefined) {
		throw new Error("usePomodoro must be used within a PomodoroProvider");
	}
	return context;
}
