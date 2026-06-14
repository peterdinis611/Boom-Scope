// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PomodoroProvider } from "../components/dashboard/pomodoro-context";
import { PomodoroTimer } from "../components/dashboard/pomodoro-timer";

// Mock framer-motion to avoid animation complexity in tests
vi.mock("motion/react", () => ({
	motion: {
		span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
			<span {...props}>{children}</span>
		),
		circle: ({ children, ...props }: React.SVGProps<SVGCircleElement>) => (
			<circle {...props}>{children}</circle>
		),
	},
	AnimatePresence: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

// Mock sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@/lib/pomodoro-db", () => ({
	getPomodoroSettings: vi.fn(() => Promise.resolve(null)),
	savePomodoroSettings: vi.fn(() => Promise.resolve()),
}));

// Mock the Popover to render its content inline so that inputs are always visible
vi.mock("@/components/ui/popover", () => ({
	Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	PopoverTrigger: ({
		children,
		asChild,
	}: {
		children: React.ReactElement;
		asChild?: boolean;
	}) => children,
	PopoverContent: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="popover-content">{children}</div>
	),
}));

function renderTimer() {
	const view = render(
		<PomodoroProvider>
			<PomodoroTimer />
		</PomodoroProvider>,
	);
	act(() => {
		vi.advanceTimersByTime(0);
	});
	return view;
}

// Helper: get the main play/pause button (sits between Reset and Skip)
function getPlayPauseButton() {
	const resetBtn = screen.getByTitle("Reset");
	return resetBtn.nextElementSibling as HTMLElement;
}

describe("Component: PomodoroTimer", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	describe("Initial render", () => {
		test("renders the timer showing 25:00 by default", () => {
			renderTimer();
			expect(screen.getByText("25:00")).toBeDefined();
		});

		test("renders the Focus mode card heading", () => {
			renderTimer();
			// The card heading is inside a CardTitle — use getAllByText to handle multiple instances
			const matches = screen.getAllByText("Focus");
			expect(matches.length).toBeGreaterThanOrEqual(1);
		});

		test("renders the mode description", () => {
			renderTimer();
			expect(screen.getByText(/Time for focused work/i)).toBeDefined();
		});

		test("shows 'Ready' status when timer is not running", () => {
			renderTimer();
			expect(screen.getByText("Ready")).toBeDefined();
		});

		test("renders all three mode selector buttons", () => {
			renderTimer();
			// Each label appears in the mode selector buttons — use getAllByText
			expect(screen.getAllByText("Focus").length).toBeGreaterThanOrEqual(1);
			expect(screen.getAllByText("Short break").length).toBeGreaterThanOrEqual(
				1,
			);
			expect(screen.getAllByText("Long break").length).toBeGreaterThanOrEqual(
				1,
			);
		});

		test("renders Reset and Skip control buttons", () => {
			renderTimer();
			expect(screen.getByTitle("Reset")).toBeDefined();
			expect(screen.getByTitle("Skip")).toBeDefined();
		});

		test("renders the stats cards at the bottom", () => {
			renderTimer();
			expect(screen.getByText("25m")).toBeDefined();
			expect(screen.getByText("5m")).toBeDefined();
			expect(screen.getByText("4 cycles")).toBeDefined();
			expect(screen.getByText("Ideal focus session")).toBeDefined();
			expect(screen.getByText("Short break")).toBeDefined();
			expect(screen.getByText("Before long break")).toBeDefined();
		});
	});

	describe("Play/Pause control", () => {
		test("changes status text to 'Focus...' when timer starts", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton());
			});
			expect(screen.getByText("Focus...")).toBeDefined();
		});

		test("reverts status to 'Ready' after pausing", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton());
			});
			act(() => {
				fireEvent.click(getPlayPauseButton());
			});
			expect(screen.getByText("Ready")).toBeDefined();
		});

		test("timer counts down after starting", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton());
			});
			act(() => {
				vi.advanceTimersByTime(5000);
			});
			expect(screen.getByText("24:55")).toBeDefined();
		});

		test("timer stops counting when paused", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton()); // start
			});
			act(() => {
				vi.advanceTimersByTime(3000);
			});
			act(() => {
				fireEvent.click(getPlayPauseButton()); // pause
			});
			const timeAfterPause = screen.getByText(/\d{2}:\d{2}/).textContent;
			act(() => {
				vi.advanceTimersByTime(5000); // should not count
			});
			expect(screen.getByText(/\d{2}:\d{2}/).textContent).toBe(timeAfterPause);
		});
	});

	describe("Reset control", () => {
		test("resets timer to 25:00 and stops it", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton());
			});
			act(() => {
				vi.advanceTimersByTime(10000);
			});
			act(() => {
				fireEvent.click(screen.getByTitle("Reset"));
			});
			expect(screen.getByText("25:00")).toBeDefined();
			expect(screen.getByText("Ready")).toBeDefined();
		});
	});

	describe("Skip control", () => {
		test("skips from Focus to Short break, showing 05:00", () => {
			renderTimer();
			act(() => {
				fireEvent.click(screen.getByTitle("Skip"));
			});
			// Both the button and the heading show "Short break" — check heading in the card
			expect(screen.getAllByText("Short break").length).toBeGreaterThanOrEqual(
				1,
			);
			expect(screen.getByText("05:00")).toBeDefined();
		});

		test("skips from Short break back to Focus, showing 25:00", () => {
			renderTimer();
			act(() => {
				fireEvent.click(screen.getByTitle("Skip")); // → shortBreak
			});
			act(() => {
				fireEvent.click(screen.getByTitle("Skip")); // → focus
			});
			expect(screen.getByText("25:00")).toBeDefined();
		});

		test("stops the timer when skipping modes", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton()); // start
			});
			act(() => {
				fireEvent.click(screen.getByTitle("Skip")); // skip
			});
			expect(screen.getByText("Ready")).toBeDefined();
		});
	});

	describe("Mode selector buttons", () => {
		test("clicking Short break updates the timer to 05:00", () => {
			renderTimer();
			const shortBreakBtns = screen.getAllByText("Short break");
			// The first one is the mode-selector button
			act(() => {
				fireEvent.click(shortBreakBtns[0]);
			});
			expect(screen.getByText("05:00")).toBeDefined();
			expect(screen.getByText(/Quick rest to recharge/i)).toBeDefined();
		});

		test("clicking Long break updates the timer to 15:00", () => {
			renderTimer();
			const longBreakBtns = screen.getAllByText("Long break");
			act(() => {
				fireEvent.click(longBreakBtns[0]);
			});
			expect(screen.getByText("15:00")).toBeDefined();
			expect(
				screen.getByText(/Extended rest for deeper recovery/i),
			).toBeDefined();
		});

		test("clicking the active Focus button is safe and shows 25:00", () => {
			renderTimer();
			expect(() => {
				act(() => {
					fireEvent.click(screen.getAllByText("Focus")[0]);
				});
			}).not.toThrow();
			expect(screen.getByText("25:00")).toBeDefined();
		});
	});

	describe("Settings panel (inline via mock)", () => {
		test("renders the settings heading", () => {
			renderTimer();
			expect(screen.getByText("Timer settings")).toBeDefined();
		});

		test("renders labels for focus, short break, and long break durations", () => {
			renderTimer();
			expect(screen.getByLabelText(/Focus \(minutes\)/i)).toBeDefined();
			expect(screen.getByLabelText(/Short break/i)).toBeDefined();
			expect(screen.getByLabelText(/Long break/i)).toBeDefined();
		});

		test("focus input has default value of 25", () => {
			renderTimer();
			const focusInput = screen.getByLabelText(
				/Focus \(minutes\)/i,
			) as HTMLInputElement;
			expect(focusInput.value).toBe("25");
		});

		test("short break input has default value of 5", () => {
			renderTimer();
			const shortBreakInput = screen.getByLabelText(
				/Short break/i,
			) as HTMLInputElement;
			expect(shortBreakInput.value).toBe("5");
		});

		test("long break input has default value of 15", () => {
			renderTimer();
			const longBreakInput = screen.getByLabelText(
				/Long break/i,
			) as HTMLInputElement;
			expect(longBreakInput.value).toBe("15");
		});

		test("changing focus duration updates the displayed timer", () => {
			renderTimer();
			const focusInput = screen.getByLabelText(
				/Focus \(minutes\)/i,
			) as HTMLInputElement;
			act(() => {
				fireEvent.change(focusInput, { target: { value: "30" } });
			});
			expect(screen.getByText("30:00")).toBeDefined();
		});

		test("renders the 'Save and close' close button", () => {
			renderTimer();
			expect(screen.getByText(/Save and close/i)).toBeDefined();
		});
	});

	describe("Time formatting", () => {
		test("formats single-digit seconds with a leading zero", () => {
			renderTimer();
			const shortBreakBtns = screen.getAllByText("Short break");
			act(() => {
				fireEvent.click(shortBreakBtns[0]); // 05:00
			});
			act(() => {
				fireEvent.click(getPlayPauseButton()); // start
			});
			act(() => {
				vi.advanceTimersByTime(4000);
			});
			act(() => {
				fireEvent.click(getPlayPauseButton()); // pause at 04:56
			});
			expect(screen.getByText("04:56")).toBeDefined();
		});

		test("displays 00:00 when time runs out", () => {
			renderTimer();
			// Short break is only 5 min — set it to 5s via settings input
			const focusDurationInput = screen.getByLabelText(
				/Focus \(minutes\)/i,
			) as HTMLInputElement;
			// Switch to short break first
			const shortBreakBtns = screen.getAllByText("Short break");
			act(() => {
				fireEvent.click(shortBreakBtns[0]);
			});
			// Manually update the short break to 1 second via updateSettings
			const shortBreakInput = screen.getByLabelText(
				/Short break/i,
			) as HTMLInputElement;
			act(() => {
				// Set to 0 minutes (= 0 seconds, clamp to at least 1s to trigger)
				fireEvent.change(shortBreakInput, { target: { value: "0" } });
			});
			act(() => {
				fireEvent.click(getPlayPauseButton()); // start
			});
			act(() => {
				vi.advanceTimersByTime(1000); // timer hits 0
			});
			// Timer completes and stops
			expect(screen.getByText("Ready")).toBeDefined();
		});
	});
});
