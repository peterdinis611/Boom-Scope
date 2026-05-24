// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	PomodoroProvider,
	usePomodoro,
} from "../components/dashboard/pomodoro-context";

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/pomodoro-db", () => ({
	getPomodoroSettings: vi.fn(() => Promise.resolve(null)),
	savePomodoroSettings: vi.fn(() => Promise.resolve()),
}));

// ── Helper component ─────────────────────────────────────────────────────────
function PomodoroDisplay() {
	const {
		timeLeft,
		isActive,
		mode,
		progress,
		settings,
		toggleTimer,
		resetTimer,
		skipMode,
		setMode,
		updateSettings,
	} = usePomodoro();

	return (
		<div>
			<span data-testid="time-left">{timeLeft}</span>
			<span data-testid="is-active">{String(isActive)}</span>
			<span data-testid="mode">{mode}</span>
			<span data-testid="progress">{progress.toFixed(2)}</span>
			<span data-testid="focus-duration">{settings.focusDuration}</span>
			<button data-testid="toggle" type="button" onClick={toggleTimer}>
				Toggle
			</button>
			<button data-testid="reset" type="button" onClick={resetTimer}>
				Reset
			</button>
			<button data-testid="skip" type="button" onClick={skipMode}>
				Skip
			</button>
			<button
				data-testid="set-short-break"
				type="button"
				onClick={() => setMode("shortBreak")}
			>
				Short Break
			</button>
			<button
				data-testid="set-long-break"
				type="button"
				onClick={() => setMode("longBreak")}
			>
				Long Break
			</button>
			<button
				data-testid="update-focus"
				type="button"
				onClick={() => updateSettings({ focusDuration: 10 * 60 })}
			>
				Set 10min Focus
			</button>
		</div>
	);
}

async function renderWithProvider() {
	render(
		<PomodoroProvider>
			<PomodoroDisplay />
		</PomodoroProvider>,
	);
	await act(async () => {
		await Promise.resolve();
	});
}

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Start the timer and wait for the interval effect to be registered. */
function startTimer() {
	act(() => {
		screen.getByTestId("toggle").click();
	});
}

/** Advance fake timers inside act() so React flushes state updates. */
function advanceTime(ms: number) {
	act(() => {
		vi.advanceTimersByTime(ms);
	});
}

// ── Suite ────────────────────────────────────────────────────────────────────
describe("PomodoroContext", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	// ── Initial state ──────────────────────────────────────────────────────────
	describe("Initial state", () => {
		test("starts in focus mode with 25:00 on the clock", async () => {
			await renderWithProvider();
			expect(screen.getByTestId("mode").textContent).toBe("focus");
			expect(screen.getByTestId("time-left").textContent).toBe("1500");
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});

		test("starts with 0% progress", async () => {
			await renderWithProvider();
			expect(screen.getByTestId("progress").textContent).toBe("0.00");
		});

		test("focus duration defaults to 1500 seconds", async () => {
			await renderWithProvider();
			expect(screen.getByTestId("focus-duration").textContent).toBe("1500");
		});
	});

	// ── toggleTimer ────────────────────────────────────────────────────────────
	describe("toggleTimer", () => {
		test("activates the timer", async () => {
			await renderWithProvider();
			startTimer();
			expect(screen.getByTestId("is-active").textContent).toBe("true");
		});

		test("pauses the timer on second click", async () => {
			await renderWithProvider();
			startTimer();
			act(() => {
				screen.getByTestId("toggle").click();
			});
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});
	});

	// ── Countdown ─────────────────────────────────────────────────────────────
	describe("Timer countdown", () => {
		test("decrements by 1 each second when active", async () => {
			await renderWithProvider();
			startTimer(); // registers interval
			advanceTime(3000); // tick 3 seconds
			expect(screen.getByTestId("time-left").textContent).toBe("1497");
		});

		test("does not decrement while paused", async () => {
			await renderWithProvider();
			startTimer();
			advanceTime(2000);
			act(() => {
				screen.getByTestId("toggle").click();
			}); // pause
			const snapshot = screen.getByTestId("time-left").textContent;
			advanceTime(5000); // time passes but timer is paused
			expect(screen.getByTestId("time-left").textContent).toBe(snapshot);
		});
	});

	// ── resetTimer ────────────────────────────────────────────────────────────
	describe("resetTimer", () => {
		test("restores full duration and stops the timer", async () => {
			await renderWithProvider();
			startTimer();
			advanceTime(5000);
			act(() => {
				screen.getByTestId("reset").click();
			});
			expect(screen.getByTestId("time-left").textContent).toBe("1500");
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});
	});

	// ── setMode ───────────────────────────────────────────────────────────────
	describe("setMode", () => {
		test("switches to shortBreak and sets 5 minutes", async () => {
			await renderWithProvider();
			act(() => {
				screen.getByTestId("set-short-break").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("shortBreak");
			expect(screen.getByTestId("time-left").textContent).toBe("300");
		});

		test("switches to longBreak and sets 15 minutes", async () => {
			await renderWithProvider();
			act(() => {
				screen.getByTestId("set-long-break").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("longBreak");
			expect(screen.getByTestId("time-left").textContent).toBe("900");
		});

		test("stops an active timer when switching mode", async () => {
			await renderWithProvider();
			startTimer();
			act(() => {
				screen.getByTestId("set-short-break").click();
			});
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});
	});

	// ── skipMode ──────────────────────────────────────────────────────────────
	describe("skipMode", () => {
		test("skips from focus → shortBreak", async () => {
			await renderWithProvider();
			act(() => {
				screen.getByTestId("skip").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("shortBreak");
		});

		test("skips from shortBreak → focus", async () => {
			await renderWithProvider();
			act(() => {
				screen.getByTestId("set-short-break").click();
			});
			act(() => {
				screen.getByTestId("skip").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("focus");
		});

		test("stops an active timer when skipping", async () => {
			await renderWithProvider();
			startTimer();
			act(() => {
				screen.getByTestId("skip").click();
			});
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});
	});

	// ── updateSettings ────────────────────────────────────────────────────────
	describe("updateSettings", () => {
		test("updates focus duration and resets timeLeft", async () => {
			await renderWithProvider();
			act(() => {
				screen.getByTestId("update-focus").click();
			});
			expect(screen.getByTestId("focus-duration").textContent).toBe("600");
			expect(screen.getByTestId("time-left").textContent).toBe("600");
		});
	});

	// ── Guard ─────────────────────────────────────────────────────────────────
	describe("usePomodoro guard", () => {
		test("throws when used outside PomodoroProvider", () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			expect(() => render(<PomodoroDisplay />)).toThrow(
				"usePomodoro must be used within a PomodoroProvider",
			);
			consoleSpy.mockRestore();
		});
	});
});
