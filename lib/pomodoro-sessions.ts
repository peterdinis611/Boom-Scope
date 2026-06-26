import { IDB_KEYS, idbGet, idbSet } from "@/lib/idb-storage";
import type { PomodoroMode } from "@/machines";

export type PomodoroSession = {
	id: string;
	mode: PomodoroMode;
	durationMinutes: number;
	completedAt: number;
};

const MAX_SESSIONS = 500;

export async function getPomodoroSessions(): Promise<PomodoroSession[]> {
	try {
		return (await idbGet<PomodoroSession[]>(IDB_KEYS.pomodoroSessions)) ?? [];
	} catch {
		return [];
	}
}

export async function logPomodoroSession(
	mode: PomodoroMode,
	durationMinutes: number,
): Promise<void> {
	try {
		const sessions = await getPomodoroSessions();
		const next: PomodoroSession = {
			id: crypto.randomUUID(),
			mode,
			durationMinutes,
			completedAt: Date.now(),
		};
		await idbSet(
			IDB_KEYS.pomodoroSessions,
			[next, ...sessions].slice(0, MAX_SESSIONS),
		);
	} catch {
		// Optional analytics — ignore storage failures.
	}
}

export type PomodoroStats = {
	totalFocusMinutes: number;
	totalSessions: number;
	focusSessions: number;
	streakDays: number;
	last7DaysFocusMinutes: number[];
};

function startOfDay(timestamp: number): number {
	const date = new Date(timestamp);
	date.setHours(0, 0, 0, 0);
	return date.getTime();
}

export function computePomodoroStats(sessions: PomodoroSession[]): PomodoroStats {
	const focusSessions = sessions.filter((session) => session.mode === "focus");
	const totalFocusMinutes = focusSessions.reduce(
		(sum, session) => sum + session.durationMinutes,
		0,
	);

	const today = startOfDay(Date.now());
	const last7DaysFocusMinutes = Array.from({ length: 7 }, (_, index) => {
		const dayStart = today - (6 - index) * 86_400_000;
		const dayEnd = dayStart + 86_400_000;
		return focusSessions
			.filter(
				(session) =>
					session.completedAt >= dayStart && session.completedAt < dayEnd,
			)
			.reduce((sum, session) => sum + session.durationMinutes, 0);
	});

	const focusDays = new Set(
		focusSessions.map((session) => startOfDay(session.completedAt)),
	);

	let streakDays = 0;
	for (let offset = 0; offset < 365; offset += 1) {
		const day = today - offset * 86_400_000;
		if (!focusDays.has(day)) break;
		streakDays += 1;
	}

	return {
		totalFocusMinutes,
		totalSessions: sessions.length,
		focusSessions: focusSessions.length,
		streakDays,
		last7DaysFocusMinutes,
	};
}
