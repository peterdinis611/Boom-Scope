"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { getPomodoroSettings, savePomodoroSettings } from "@/lib/pomodoro-db";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroSettings {
	focusDuration: number;
	shortBreakDuration: number;
	longBreakDuration: number;
}

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

const DEFAULT_SETTINGS: PomodoroSettings = {
	focusDuration: 25 * 60,
	shortBreakDuration: 5 * 60,
	longBreakDuration: 15 * 60,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(
	undefined,
);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
	const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
	const [mode, setModeState] = useState<PomodoroMode>("focus");
	const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration);
	const [isActive, setIsActive] = useState(false);

	// Load settings from IndexedDB on mount
	useEffect(() => {
		getPomodoroSettings<PomodoroSettings>().then((saved) => {
			if (saved) {
				setSettings(saved);
				setTimeLeft(saved.focusDuration);
			}
		});
	}, []);

	// Timer countdown
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (timeLeft === 0 && isActive) {
			setIsActive(false);
			handleTimerComplete();
		}

		return () => clearInterval(interval);
	}, [isActive, timeLeft]);

	const handleTimerComplete = () => {
		const nextMode = mode === "focus" ? "shortBreak" : "focus";

		toast.success(mode === "focus" ? "Time for a break!" : "Back to work!", {
			description:
				mode === "focus"
					? "Great work! Take a break."
					: "Break is over, let's go!",
			duration: 5000,
		});

		try {
			const audio = new Audio("/sounds/notification.mp3");
			audio.play().catch(() => {});
		} catch (e) {}

		setMode(nextMode);
	};

	const toggleTimer = () => setIsActive((prev) => !prev);

	const resetTimer = () => {
		setIsActive(false);
		setTimeLeft(getDurationForMode(mode, settings));
	};

	const skipMode = () => {
		setIsActive(false);
		const nextMode = mode === "focus" ? "shortBreak" : "focus";
		setMode(nextMode);
	};

	const setMode = (newMode: PomodoroMode) => {
		setModeState(newMode);
		setTimeLeft(getDurationForMode(newMode, settings));
		setIsActive(false);
	};

	const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
		const updated = { ...settings, ...newSettings };
		setSettings(updated);
		savePomodoroSettings(updated); // async, fire-and-forget

		if (!isActive) {
			setTimeLeft(getDurationForMode(mode, updated));
		}
	};

	const getDurationForMode = (m: PomodoroMode, s: PomodoroSettings): number => {
		switch (m) {
			case "focus":
				return s.focusDuration;
			case "shortBreak":
				return s.shortBreakDuration;
			case "longBreak":
				return s.longBreakDuration;
			default:
				return s.focusDuration;
		}
	};

	const totalDuration = getDurationForMode(mode, settings);
	const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

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
