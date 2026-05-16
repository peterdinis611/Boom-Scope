// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import React from "react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import {
	PomodoroProvider,
	usePomodoro,
} from "../components/dashboard/pomodoro-context";

// Mock sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Helper component to expose the context values to tests
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

function renderWithProvider() {
	return render(
		<PomodoroProvider>
			<PomodoroDisplay />
		</PomodoroProvider>,
	);
}

describe("PomodoroContext", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		localStorage.clear();
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	describe("Initial state", () => {
		test("starts in focus mode with 25 minutes on the clock", () => {
			renderWithProvider();
			expect(screen.getByTestId("mode").textContent).toBe("focus");
			expect(screen.getByTestId("time-left").textContent).toBe("1500");
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});

		test("starts with 0% progress", () => {
			renderWithProvider();
			expect(screen.getByTestId("progress").textContent).toBe("0.00");
		});

		test("loads default focus duration from settings", () => {
			renderWithProvider();
			expect(screen.getByTestId("focus-duration").textContent).toBe("1500");
		});
	});

	describe("toggleTimer", () => {
		test("activates the timer on first toggle", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("toggle").click();
			});
			expect(screen.getByTestId("is-active").textContent).toBe("true");
		});

		test("pauses the timer on second toggle", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("toggle").click();
			});
			act(() => {
				screen.getByTestId("toggle").click();
			});
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});
	});

	describe("Timer countdown", () => {
		test("decrements timeLeft by 1 each second when active", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("toggle").click();
			});
			act(() => {
				vi.advanceTimersByTime(3000);
			});
			expect(screen.getByTestId("time-left").textContent).toBe("1497");
		});

		test("does not decrement when paused", () => {
			renderWithProvider();
			// Start then immediately pause
			act(() => {
				screen.getByTestId("toggle").click();
			});
			act(() => {
				vi.advanceTimersByTime(2000);
			});
			act(() => {
				screen.getByTestId("toggle").click();
			});
			const timeAfterPause = screen.getByTestId("time-left").textContent;
			act(() => {
				vi.advanceTimersByTime(3000);
			});
			// Time should not change after pausing
			expect(screen.getByTestId("time-left").textContent).toBe(timeAfterPause);
		});
	});

	describe("resetTimer", () => {
		test("resets the timer to full duration and stops it", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("toggle").click();
			});
			act(() => {
				vi.advanceTimersByTime(5000);
			});
			act(() => {
				screen.getByTestId("reset").click();
			});
			expect(screen.getByTestId("time-left").textContent).toBe("1500");
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});
	});

	describe("setMode", () => {
		test("switches to short break mode with correct duration", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("set-short-break").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("shortBreak");
			expect(screen.getByTestId("time-left").textContent).toBe("300");
		});

		test("switches to long break mode with correct duration", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("set-long-break").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("longBreak");
			expect(screen.getByTestId("time-left").textContent).toBe("900");
		});

		test("stops the timer when switching modes", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("toggle").click();
			});
			act(() => {
				screen.getByTestId("set-short-break").click();
			});
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});
	});

	describe("skipMode", () => {
		test("skips from focus to short break", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("skip").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("shortBreak");
		});

		test("skips from short break back to focus", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("set-short-break").click();
			});
			act(() => {
				screen.getByTestId("skip").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("focus");
		});

		test("stops the timer when skipping", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("toggle").click();
			});
			act(() => {
				screen.getByTestId("skip").click();
			});
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});
	});

	describe("updateSettings", () => {
		test("updates focus duration and resets the timer", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("update-focus").click();
			});
			expect(screen.getByTestId("focus-duration").textContent).toBe("600");
			expect(screen.getByTestId("time-left").textContent).toBe("600");
		});

		test("persists settings to localStorage", () => {
			renderWithProvider();
			act(() => {
				screen.getByTestId("update-focus").click();
			});
			const saved = JSON.parse(
				localStorage.getItem("pomodoro-settings") ?? "{}",
			);
			expect(saved.focusDuration).toBe(600);
		});
	});

	describe("Settings persistence", () => {
		test("loads saved settings from localStorage on mount", () => {
			localStorage.setItem(
				"pomodoro-settings",
				JSON.stringify({
					focusDuration: 30 * 60,
					shortBreakDuration: 5 * 60,
					longBreakDuration: 15 * 60,
				}),
			);
			renderWithProvider();
			expect(screen.getByTestId("focus-duration").textContent).toBe("1800");
			expect(screen.getByTestId("time-left").textContent).toBe("1800");
		});
	});

	describe("usePomodoro hook", () => {
		test("throws if used outside PomodoroProvider", () => {
			// Suppress expected error output during this test
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
