import { describe, expect, test } from "vitest";
import {
	computePomodoroStats,
	type PomodoroSession,
} from "@/lib/pomodoro-sessions";

function session(
	overrides: Partial<PomodoroSession> & Pick<PomodoroSession, "mode" | "durationMinutes">,
): PomodoroSession {
	return {
		id: crypto.randomUUID(),
		completedAt: Date.now(),
		...overrides,
	};
}

describe("Lib: pomodoro-sessions", () => {
	test("aggregates focus minutes and session counts", () => {
		const stats = computePomodoroStats([
			session({ mode: "focus", durationMinutes: 25 }),
			session({ mode: "focus", durationMinutes: 15 }),
			session({ mode: "shortBreak", durationMinutes: 5 }),
		]);

		expect(stats.totalFocusMinutes).toBe(40);
		expect(stats.focusSessions).toBe(2);
		expect(stats.totalSessions).toBe(3);
	});

	test("builds a 7-day focus chart ending today", () => {
		const today = new Date();
		today.setHours(12, 0, 0, 0);

		const stats = computePomodoroStats([
			session({
				mode: "focus",
				durationMinutes: 20,
				completedAt: today.getTime(),
			}),
		]);

		expect(stats.last7DaysFocusMinutes).toHaveLength(7);
		expect(stats.last7DaysFocusMinutes.at(-1)).toBe(20);
	});

	test("returns zeroed stats for empty sessions", () => {
		const stats = computePomodoroStats([]);
		expect(stats.totalFocusMinutes).toBe(0);
		expect(stats.focusSessions).toBe(0);
		expect(stats.streakDays).toBe(0);
	});
});
