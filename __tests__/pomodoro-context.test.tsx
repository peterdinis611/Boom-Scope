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

// ── IndexedDB mock ──────────────────────────────────────────────────────────
// Replace the real lib functions with controllable vi.fn() so tests remain
// synchronous and don't need a real IDB implementation in jsdom.
const mockGetSettings = vi.fn<[], Promise<null | Record<string, unknown>>>();
const mockSaveSettings = vi.fn<[unknown], Promise<void>>();

vi.mock("@/lib/pomodoro-db", () => ({
	getPomodoroSettings: () => mockGetSettings(),
	savePomodoroSettings: (s: unknown) => mockSaveSettings(s),
}));

// Mock sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// ── Helper component ────────────────────────────────────────────────────────
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

// ── Tests ───────────────────────────────────────────────────────────────────
describe("PomodoroContext", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Default: no saved settings in IDB
		mockGetSettings.mockResolvedValue(null);
		mockSaveSettings.mockResolvedValue(undefined);
	});

	afterEach(() => {
		act(() => {
			vi.runOnlyPendingTimers();
		});
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	describe("Initial state", () => {
		test("starts in focus mode with 25 minutes on the clock", async () => {
			renderWithProvider();
			// Let the async IDB load settle
			await act(async () => {});
			expect(screen.getByTestId("mode").textContent).toBe("focus");
			expect(screen.getByTestId("time-left").textContent).toBe("1500");
			expect(screen.getByTestId("is-active").textContent).toBe("false");
		});

		test("starts with 0% progress", async () => {
			renderWithProvider();
			await act(async () => {});
			expect(screen.getByTestId("progress").textContent).toBe("0.00");
		});

		test("loads default focus duration from settings", async () => {
			renderWithProvider();
			await act(async () => {});
			expect(screen.getByTestId("focus-duration").textContent).toBe("1500");
		});
	});

	describe("toggleTimer", () => {
		test("activates the timer on first toggle", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("toggle").click();
				// Flush the effect that sets up the interval
				vi.advanceTimersByTime(0);
			});
			expect(screen.getByTestId("is-active").textContent).toBe("true");
		});

		test("pauses the timer on second toggle", async () => {
			renderWithProvider();
			await act(async () => {});
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
		test("decrements timeLeft by 1 each second when active", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("toggle").click();
				vi.advanceTimersByTime(3000);
			});
			expect(screen.getByTestId("time-left").textContent).toBe("1497");
		});

		test("does not decrement when paused", async () => {
			renderWithProvider();
			await act(async () => {});
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
			expect(screen.getByTestId("time-left").textContent).toBe(timeAfterPause);
		});
	});

	describe("resetTimer", () => {
		test("resets the timer to full duration and stops it", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("toggle").click();
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
		test("switches to short break mode with correct duration", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("set-short-break").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("shortBreak");
			expect(screen.getByTestId("time-left").textContent).toBe("300");
		});

		test("switches to long break mode with correct duration", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("set-long-break").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("longBreak");
			expect(screen.getByTestId("time-left").textContent).toBe("900");
		});

		test("stops the timer when switching modes", async () => {
			renderWithProvider();
			await act(async () => {});
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
		test("skips from focus to short break", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("skip").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("shortBreak");
		});

		test("skips from short break back to focus", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("set-short-break").click();
			});
			act(() => {
				screen.getByTestId("skip").click();
			});
			expect(screen.getByTestId("mode").textContent).toBe("focus");
		});

		test("stops the timer when skipping", async () => {
			renderWithProvider();
			await act(async () => {});
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
		test("updates focus duration and resets the timer", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("update-focus").click();
			});
			expect(screen.getByTestId("focus-duration").textContent).toBe("600");
			expect(screen.getByTestId("time-left").textContent).toBe("600");
		});

		test("calls savePomodoroSettings with updated value", async () => {
			renderWithProvider();
			await act(async () => {});
			act(() => {
				screen.getByTestId("update-focus").click();
			});
			expect(mockSaveSettings).toHaveBeenCalledWith(
				expect.objectContaining({ focusDuration: 600 }),
			);
		});
	});

	describe("Settings persistence (IDB load on mount)", () => {
		test("loads saved settings from IndexedDB on mount", async () => {
			mockGetSettings.mockResolvedValue({
				focusDuration: 30 * 60,
				shortBreakDuration: 5 * 60,
				longBreakDuration: 15 * 60,
			});
			renderWithProvider();
			await act(async () => {});
			expect(screen.getByTestId("focus-duration").textContent).toBe("1800");
			expect(screen.getByTestId("time-left").textContent).toBe("1800");
		});

		test("uses defaults when IDB returns null", async () => {
			mockGetSettings.mockResolvedValue(null);
			renderWithProvider();
			await act(async () => {});
			expect(screen.getByTestId("focus-duration").textContent).toBe("1500");
		});
	});

	describe("usePomodoro hook", () => {
		test("throws if used outside PomodoroProvider", () => {
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
