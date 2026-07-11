import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import TasksPage from "@/app/dashboard/tasks/page";

vi.mock("next/navigation", () => ({
	useSearchParams: vi.fn(() => ({
		get: vi.fn((key: string) => (key === "projectId" ? "proj-1" : null)),
	})),
	useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@dnd-kit/core", () => ({
	DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	PointerSensor: vi.fn(),
	closestCorners: vi.fn(),
	useSensor: vi.fn(),
	useSensors: () => [],
	useDroppable: () => ({
		setNodeRef: vi.fn(),
		isOver: false,
	}),
}));

vi.mock("@dnd-kit/sortable", () => ({
	SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	verticalListSortingStrategy: {},
	useSortable: () => ({
		attributes: {},
		listeners: {},
		setNodeRef: vi.fn(),
		transform: null,
		transition: undefined,
		isDragging: false,
	}),
}));

vi.mock("@dnd-kit/utilities", () => ({
	CSS: { Transform: { toString: () => undefined } },
}));

vi.mock("@/components/dashboard/pomodoro-context", () => ({
	usePomodoro: () => ({
		startFocusOnTask: vi.fn(),
		focusTarget: null,
	}),
}));

vi.mock("convex/react", () => ({
	useQuery: vi.fn(() => []),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("@/components/notes/ProjectSelector", () => ({
	ProjectSelector: () => <div>Project selector</div>,
}));

describe("Page: Tasks", () => {
	test("renders task board header and view tabs", () => {
		render(<TasksPage />);
		expect(screen.getByText("Task Board")).toBeDefined();
		expect(screen.getByText(/Organize project work/i)).toBeDefined();
		expect(screen.getByText("Project board")).toBeDefined();
		expect(screen.getByText("My tasks")).toBeDefined();
	});
});
