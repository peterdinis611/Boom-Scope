import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { PomodoroStatsPanel } from "@/components/pomodoro/pomodoro-stats";

vi.mock("@/lib/pomodoro-sessions", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/pomodoro-sessions")>();
	return {
		...actual,
		getPomodoroSessions: vi.fn(),
	};
});

import { getPomodoroSessions } from "@/lib/pomodoro-sessions";

describe("Component: PomodoroStatsPanel", () => {
	test("shows loading state initially", () => {
		vi.mocked(getPomodoroSessions).mockReturnValue(new Promise(() => {}));
		render(<PomodoroStatsPanel />);
		expect(screen.getByText(/Loading focus stats/i)).toBeDefined();
	});

	test("renders stats cards and chart after sessions load", async () => {
		vi.mocked(getPomodoroSessions).mockResolvedValue([
			{
				id: "1",
				mode: "focus",
				durationMinutes: 25,
				completedAt: Date.now(),
			},
			{
				id: "2",
				mode: "shortBreak",
				durationMinutes: 5,
				completedAt: Date.now(),
			},
		]);

		render(<PomodoroStatsPanel />);

		await waitFor(() => {
			expect(screen.getByText("Your focus")).toBeDefined();
			expect(screen.getAllByText("25m").length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("Sessions")).toBeDefined();
			expect(screen.getByText("Streak")).toBeDefined();
			expect(screen.getByText("Last 7 days")).toBeDefined();
			expect(screen.getByText("Today")).toBeDefined();
		});
	});

	test("shows zero stats for empty sessions", async () => {
		vi.mocked(getPomodoroSessions).mockResolvedValue([]);

		render(<PomodoroStatsPanel />);

		await waitFor(() => {
			expect(screen.getByText("0m")).toBeDefined();
			expect(screen.getByText("0d")).toBeDefined();
		});
	});
});
