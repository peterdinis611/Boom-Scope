import { assign, setup } from "xstate";
import {
	createInitialPomodoroContext,
	DEFAULT_POMODORO_SETTINGS,
	getDurationForMode,
	getNextModeAfterComplete,
	getNextModeAfterSkip,
	type PomodoroContext,
	type PomodoroMode,
	type PomodoroSettings,
} from "./pomodoro.helpers";

export type PomodoroEvent =
	| { type: "TOGGLE" }
	| { type: "TICK" }
	| { type: "RESET" }
	| { type: "SKIP_MODE" }
	| { type: "SET_MODE"; mode: PomodoroMode }
	| { type: "UPDATE_SETTINGS"; settings: Partial<PomodoroSettings> }
	| { type: "LOAD_SETTINGS"; settings: PomodoroSettings }
	| { type: "ACK_COMPLETE" };

export const pomodoroMachine = setup({
	types: {
		context: {} as PomodoroContext,
		events: {} as PomodoroEvent,
	},
	actions: {
		decrementTime: assign({
			timeLeft: ({ context }) => Math.max(0, context.timeLeft - 1),
		}),
		resetTimeForCurrentMode: assign({
			timeLeft: ({ context }) =>
				getDurationForMode(context.mode, context.settings),
		}),
		applyMode: assign({
			mode: ({ event }) =>
				event.type === "SET_MODE" ? event.mode : "focus",
			timeLeft: ({ context, event }) =>
				event.type === "SET_MODE"
					? getDurationForMode(event.mode, context.settings)
					: context.timeLeft,
			justCompleted: false,
			completedMode: null,
		}),
		skipMode: assign({
			mode: ({ context }) => getNextModeAfterSkip(context.mode),
			timeLeft: ({ context }) =>
				getDurationForMode(
					getNextModeAfterSkip(context.mode),
					context.settings,
				),
			justCompleted: false,
			completedMode: null,
		}),
		applySettings: assign({
			settings: ({ context, event }) =>
				event.type === "UPDATE_SETTINGS"
					? { ...context.settings, ...event.settings }
					: context.settings,
			timeLeft: ({ context, event, self }) => {
				if (event.type !== "UPDATE_SETTINGS") return context.timeLeft;
				const settings = { ...context.settings, ...event.settings };
				if (self.getSnapshot().matches("running")) {
					return context.timeLeft;
				}
				return getDurationForMode(context.mode, settings);
			},
		}),
		loadSettings: assign(({ event }) => {
			if (event.type !== "LOAD_SETTINGS") {
				return {};
			}
			return {
				settings: event.settings,
				mode: "focus" as const,
				timeLeft: event.settings.focusDuration,
				justCompleted: false,
				completedMode: null,
			};
		}),
		completeSession: assign(({ context }) => {
			const completedMode = context.mode;
			const nextMode = getNextModeAfterComplete(context.mode);
			return {
				completedMode,
				justCompleted: true,
				mode: nextMode,
				timeLeft: getDurationForMode(nextMode, context.settings),
			};
		}),
		ackComplete: assign({
			justCompleted: false,
			completedMode: null,
		}),
	},
	guards: {
		shouldCompleteOnTick: ({ context }) => context.timeLeft <= 1,
	},
}).createMachine({
	id: "pomodoro",
	initial: "idle",
	context: createInitialPomodoroContext(),
	states: {
		idle: {
			on: {
				TOGGLE: "running",
				RESET: { actions: "resetTimeForCurrentMode" },
				SKIP_MODE: { actions: "skipMode" },
				SET_MODE: { actions: "applyMode" },
				UPDATE_SETTINGS: { actions: "applySettings" },
				LOAD_SETTINGS: { actions: "loadSettings" },
			},
		},
		running: {
			on: {
				TOGGLE: "idle",
				TICK: [
					{
						guard: "shouldCompleteOnTick",
						target: "idle",
						actions: "completeSession",
					},
					{ actions: "decrementTime" },
				],
				RESET: {
					target: "idle",
					actions: "resetTimeForCurrentMode",
				},
				SKIP_MODE: {
					target: "idle",
					actions: "skipMode",
				},
				SET_MODE: {
					target: "idle",
					actions: "applyMode",
				},
				UPDATE_SETTINGS: { actions: "applySettings" },
			},
		},
	},
});

export { DEFAULT_POMODORO_SETTINGS };
export type { PomodoroContext, PomodoroMode, PomodoroSettings };
