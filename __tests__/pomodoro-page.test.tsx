import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { PomodoroProvider } from "@/components/dashboard/pomodoro-context";
import PomodoroPage from "@/app/dashboard/pomodoro/page";

vi.mock("next/dynamic", () => ({
	default: () => {
		const DynamicMock = () => (
			<div data-testid="pomodoro-stats-panel">Pomodoro stats</div>
		);
		return DynamicMock;
	},
}));

vi.mock("@/lib/pomodoro-db", () => ({
	getPomodoroSettings: vi.fn(() => Promise.resolve(null)),
	savePomodoroSettings: vi.fn(() => Promise.resolve()),
}));

vi.mock("motion/react", () => ({
	motion: {
		span: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
		circle: ({ children }: { children: React.ReactNode }) => (
			<circle>{children}</circle>
		),
	},
	AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/popover", () => ({
	Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	PopoverContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

describe("Page: Pomodoro", () => {
	test("renders page shell with stats placeholder and timer", () => {
		render(
			<PomodoroProvider>
				<PomodoroPage />
			</PomodoroProvider>,
		);

		expect(screen.getByText("Pomodoro")).toBeDefined();
		expect(screen.getByText(/Manage your time effectively/i)).toBeDefined();
		expect(screen.getByTestId("pomodoro-stats-panel")).toBeDefined();
		expect(screen.getByText("25:00")).toBeDefined();
	});
});
