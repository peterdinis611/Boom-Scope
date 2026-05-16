"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

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

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
	const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
	const [mode, setModeState] = useState<PomodoroMode>("focus");
	const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration);
	const [isActive, setIsActive] = useState(false);

	// Load settings from localStorage on mount
	useEffect(() => {
		const savedSettings = localStorage.getItem("pomodoro-settings");
		if (savedSettings) {
			try {
				const parsed = JSON.parse(savedSettings);
				setSettings(parsed);
				setTimeLeft(parsed.focusDuration);
			} catch (e) {
				console.error("Failed to parse pomodoro settings", e);
			}
		}
	}, []);

	// Timer logic
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
		
		toast.success(mode === "focus" ? "Čas na prestávku!" : "Späť do práce!", {
			description: mode === "focus" ? "Skvelá práca! Doprajte si oddych." : "Prestávka skončila, ideme na to!",
			duration: 5000,
		});

		// Play a sound if possible (optional)
		try {
			const audio = new Audio("/sounds/notification.mp3");
			audio.play().catch(() => {});
		} catch (e) {}

		setMode(nextMode);
	};

	const toggleTimer = () => setIsActive(!isActive);

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
		localStorage.setItem("pomodoro-settings", JSON.stringify(updated));
		
		// If we're not active, update current timeLeft if the changed mode matches current mode
		if (!isActive) {
			setTimeLeft(getDurationForMode(mode, updated));
		}
	};

	const getDurationForMode = (m: PomodoroMode, s: PomodoroSettings) => {
		switch (m) {
			case "focus": return s.focusDuration;
			case "shortBreak": return s.shortBreakDuration;
			case "longBreak": return s.longBreakDuration;
			default: return s.focusDuration;
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
