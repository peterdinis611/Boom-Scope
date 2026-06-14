import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import {
	getPomodoroProgress,
} from "@/machines/pomodoro.helpers";
import { pomodoroMachine } from "@/machines/pomodoro.machine";

describe("pomodoroMachine", () => {
	it("starts idle in focus mode", () => {
		const actor = createActor(pomodoroMachine).start();
		expect(actor.getSnapshot().matches("idle")).toBe(true);
		expect(actor.getSnapshot().context.mode).toBe("focus");
		expect(actor.getSnapshot().context.timeLeft).toBe(1500);
	});

	it("runs and decrements time on tick", () => {
		const actor = createActor(pomodoroMachine).start();
		actor.send({ type: "TOGGLE" });
		actor.send({ type: "TICK" });
		actor.send({ type: "TICK" });

		expect(actor.getSnapshot().matches("running")).toBe(true);
		expect(actor.getSnapshot().context.timeLeft).toBe(1498);
	});

	it("pauses back to idle", () => {
		const actor = createActor(pomodoroMachine).start();
		actor.send({ type: "TOGGLE" });
		actor.send({ type: "TOGGLE" });

		expect(actor.getSnapshot().matches("idle")).toBe(true);
	});

	it("switches modes and resets duration", () => {
		const actor = createActor(pomodoroMachine).start();
		actor.send({ type: "SET_MODE", mode: "shortBreak" });

		expect(actor.getSnapshot().context.mode).toBe("shortBreak");
		expect(actor.getSnapshot().context.timeLeft).toBe(300);
	});

	it("completes a focus session and moves to short break", () => {
		const actor = createActor(pomodoroMachine).start();
		actor.send({ type: "UPDATE_SETTINGS", settings: { focusDuration: 2 } });
		actor.send({ type: "TOGGLE" });
		actor.send({ type: "TICK" });
		actor.send({ type: "TICK" });

		const snapshot = actor.getSnapshot();
		expect(snapshot.matches("idle")).toBe(true);
		expect(snapshot.context.mode).toBe("shortBreak");
		expect(snapshot.context.justCompleted).toBe(true);
		expect(snapshot.context.completedMode).toBe("focus");
	});

	it("calculates progress from machine context", () => {
		expect(getPomodoroProgress("focus", 750, {
			focusDuration: 1500,
			shortBreakDuration: 300,
			longBreakDuration: 900,
		})).toBe(50);
	});
});
