import { describe, expect, test } from "vitest";
import type { PomodoroSession } from "@/lib/pomodoro-sessions";
import {
	clearPomodoroFocusTarget,
	getPomodoroFocusTarget,
	setPomodoroFocusTarget,
} from "@/lib/pomodoro-focus";
import {
	countStickyNotesForProject,
	sumFocusMinutesForProject,
} from "@/lib/workflow-stats";

describe("Lib: pomodoro-focus", () => {
	test("stores and clears focus target in session storage", () => {
		clearPomodoroFocusTarget();
		expect(getPomodoroFocusTarget()).toBeNull();

		setPomodoroFocusTarget({
			taskId: "task-1",
			taskTitle: "Write tests",
			projectId: "proj-1",
		});

		expect(getPomodoroFocusTarget()).toEqual({
			taskId: "task-1",
			taskTitle: "Write tests",
			projectId: "proj-1",
		});

		clearPomodoroFocusTarget();
		expect(getPomodoroFocusTarget()).toBeNull();
	});
});

describe("Lib: workflow-stats", () => {
	test("counts sticky notes for a project", () => {
		const items = JSON.stringify([
			{
				id: "1",
				color: "#fef08a",
				text: "A",
				position: { x: 0, y: 0 },
				projectId: "proj-1",
			},
			{
				id: "2",
				color: "#fef08a",
				text: "B",
				position: { x: 0, y: 0 },
			},
		]);

		expect(countStickyNotesForProject(items, "proj-1")).toBe(1);
	});

	test("sums focus minutes for a project", () => {
		const sessions: PomodoroSession[] = [
			{
				id: "1",
				mode: "focus",
				durationMinutes: 25,
				completedAt: Date.now(),
				projectId: "proj-1",
			},
			{
				id: "2",
				mode: "focus",
				durationMinutes: 10,
				completedAt: Date.now(),
				projectId: "proj-2",
			},
		];

		expect(sumFocusMinutesForProject(sessions, "proj-1")).toBe(25);
	});
});
