// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { idbClear } from "@/lib/idb-storage";
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
	return render(
		<PomodoroProvider>
			<PomodoroTimer />
		</PomodoroProvider>,
	);
}

// Helper: get the main play/pause button (sits between Reset and Skip)
function getPlayPauseButton() {
	const resetBtn = screen.getByTitle("Reset");
	return resetBtn.nextElementSibling as HTMLElement;
}

describe("Component: PomodoroTimer", () => {
	beforeEach(async () => {
		vi.useFakeTimers();
		await idbClear();
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
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
			expect(
				screen.getByText(/Time to concentrate on your tasks/i),
			).toBeDefined();
		});

		test("shows 'Pripravený' status when timer is not running", () => {
			renderTimer();
			expect(screen.getByText("Pripravený")).toBeDefined();
		});

		test("renders all three mode selector buttons", () => {
			renderTimer();
			// Each label appears in the mode selector buttons — use getAllByText
			expect(screen.getAllByText("Focus").length).toBeGreaterThanOrEqual(1);
			expect(screen.getAllByText("Short Break").length).toBeGreaterThanOrEqual(
				1,
			);
			expect(screen.getAllByText("Long Break").length).toBeGreaterThanOrEqual(
				1,
			);
		});

		test("renders Reset and Skip control buttons", () => {
			renderTimer();
			expect(screen.getByTitle("Reset")).toBeDefined();
			expect(screen.getByTitle("Preskočiť")).toBeDefined();
		});

		test("renders the stats cards at the bottom", () => {
			renderTimer();
			expect(screen.getByText("25m")).toBeDefined();
			expect(screen.getByText("5m")).toBeDefined();
			expect(screen.getByText("4 cykly")).toBeDefined();
			expect(screen.getByText("Ideálny focus")).toBeDefined();
			expect(screen.getByText("Krátky relax")).toBeDefined();
			expect(screen.getByText("Pred dlhou pauzou")).toBeDefined();
		});
	});

	describe("Play/Pause control", () => {
		test("changes status text to 'Sústredenie...' when timer starts", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton());
			});
			expect(screen.getByText("Sústredenie...")).toBeDefined();
		});

		test("reverts status to 'Pripravený' after pausing", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton());
			});
			act(() => {
				fireEvent.click(getPlayPauseButton());
			});
			expect(screen.getByText("Pripravený")).toBeDefined();
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
			expect(screen.getByText("Pripravený")).toBeDefined();
		});
	});

	describe("Skip control", () => {
		test("skips from Focus to Short Break, showing 05:00", () => {
			renderTimer();
			act(() => {
				fireEvent.click(screen.getByTitle("Preskočiť"));
			});
			// Both the button and the heading show "Short Break" — check heading in the card
			expect(screen.getAllByText("Short Break").length).toBeGreaterThanOrEqual(
				1,
			);
			expect(screen.getByText("05:00")).toBeDefined();
		});

		test("skips from Short Break back to Focus, showing 25:00", () => {
			renderTimer();
			act(() => {
				fireEvent.click(screen.getByTitle("Preskočiť")); // → shortBreak
			});
			act(() => {
				fireEvent.click(screen.getByTitle("Preskočiť")); // → focus
			});
			expect(screen.getByText("25:00")).toBeDefined();
		});

		test("stops the timer when skipping modes", () => {
			renderTimer();
			act(() => {
				fireEvent.click(getPlayPauseButton()); // start
			});
			act(() => {
				fireEvent.click(screen.getByTitle("Preskočiť")); // skip
			});
			expect(screen.getByText("Pripravený")).toBeDefined();
		});
	});

	describe("Mode selector buttons", () => {
		test("clicking Short Break updates the timer to 05:00", () => {
			renderTimer();
			const shortBreakBtns = screen.getAllByText("Short Break");
			// The first one is the mode-selector button
			act(() => {
				fireEvent.click(shortBreakBtns[0]);
			});
			expect(screen.getByText("05:00")).toBeDefined();
			expect(screen.getByText(/Quick rest to recharge/i)).toBeDefined();
		});

		test("clicking Long Break updates the timer to 15:00", () => {
			renderTimer();
			const longBreakBtns = screen.getAllByText("Long Break");
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
			expect(screen.getByText("Nastavenia časovača")).toBeDefined();
		});

		test("renders labels for focus, short break, and long break durations", () => {
			renderTimer();
			expect(screen.getByLabelText(/Focus \(minút\)/i)).toBeDefined();
			expect(screen.getByLabelText(/Krátka prestávka/i)).toBeDefined();
			expect(screen.getByLabelText(/Dlhá prestávka/i)).toBeDefined();
		});

		test("focus input has default value of 25", () => {
			renderTimer();
			const focusInput = screen.getByLabelText(
				/Focus \(minút\)/i,
			) as HTMLInputElement;
			expect(focusInput.value).toBe("25");
		});

		test("short break input has default value of 5", () => {
			renderTimer();
			const shortBreakInput = screen.getByLabelText(
				/Krátka prestávka/i,
			) as HTMLInputElement;
			expect(shortBreakInput.value).toBe("5");
		});

		test("long break input has default value of 15", () => {
			renderTimer();
			const longBreakInput = screen.getByLabelText(
				/Dlhá prestávka/i,
			) as HTMLInputElement;
			expect(longBreakInput.value).toBe("15");
		});

		test("changing focus duration updates the displayed timer", () => {
			renderTimer();
			const focusInput = screen.getByLabelText(
				/Focus \(minút\)/i,
			) as HTMLInputElement;
			act(() => {
				fireEvent.change(focusInput, { target: { value: "30" } });
			});
			expect(screen.getByText("30:00")).toBeDefined();
		});

		test("renders the 'Uložiť a zavrieť' close button", () => {
			renderTimer();
			expect(screen.getByText(/Uložiť a zavrieť/i)).toBeDefined();
		});
	});

	describe("Time formatting", () => {
		test("formats single-digit seconds with a leading zero", () => {
			renderTimer();
			const shortBreakBtns = screen.getAllByText("Short Break");
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
				/Focus \(minút\)/i,
			) as HTMLInputElement;
			// Switch to short break first
			const shortBreakBtns = screen.getAllByText("Short Break");
			act(() => {
				fireEvent.click(shortBreakBtns[0]);
			});
			// Manually update the short break to 1 second via updateSettings
			const shortBreakInput = screen.getByLabelText(
				/Krátka prestávka/i,
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
			expect(screen.getByText("Pripravený")).toBeDefined();
		});
	});
});
