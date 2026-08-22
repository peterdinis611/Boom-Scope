import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ProjectKanban } from "@/components/kanban/project-kanban";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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

vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/dashboard/pomodoro-context", () => ({
	usePomodoro: () => ({
		startFocusOnTask: vi.fn(),
		focusTarget: null,
	}),
}));

vi.mock("@/components/notes/ProjectSelector", () => ({
	ProjectSelector: ({
		value,
		onChange,
	}: {
		value?: Id<"projects">;
		onChange: (value?: Id<"projects">) => void;
	}) => (
		<select
			aria-label="Project selector"
			value={value ?? ""}
			onChange={(event) =>
				onChange(
					event.target.value
						? (event.target.value as Id<"projects">)
						: undefined,
				)
			}
		>
			<option value="">No project</option>
			<option value="proj-1">Alpha</option>
		</select>
	),
}));

const defaultColumns = [
	{
		_id: "col-todo" as Id<"kanban_columns">,
		projectId: "proj-1" as Id<"projects">,
		label: "To do",
		color: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
		position: 0,
		key: "todo",
	},
	{
		_id: "col-progress" as Id<"kanban_columns">,
		projectId: "proj-1" as Id<"projects">,
		label: "In progress",
		color: "bg-scope/10 text-scope",
		position: 1,
		key: "in_progress",
	},
	{
		_id: "col-done" as Id<"kanban_columns">,
		projectId: "proj-1" as Id<"projects">,
		label: "Done",
		color: "bg-success/10 text-success",
		position: 2,
		key: "done",
	},
];

function mockQueries(tasks: unknown) {
	let projectScopedCall = 0;

	vi.mocked(useQuery).mockImplementation((_query, args) => {
		if (args === "skip") return undefined;
		if (!args) {
			return [{ _id: "proj-1" as Id<"projects">, name: "Alpha" }];
		}
		if (typeof args === "object" && "paginationOpts" in args) {
			return { page: [] };
		}
		if (typeof args === "object" && "projectId" in args) {
			projectScopedCall += 1;
			if (projectScopedCall % 3 === 1) return defaultColumns;
			if (projectScopedCall % 3 === 2) return tasks ?? [];
			return [];
		}
		return undefined;
	});
}

describe("Component: ProjectKanban", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("prompts to select a project when none is chosen", () => {
		vi.mocked(useQuery).mockImplementation((query, args) => {
			if (args === "skip") return undefined;
			if (query === api.projects.list) return [];
			if (query === api.project_tasks.list) return [];
			return undefined;
		});
		render(<ProjectKanban />);
		expect(screen.getByText(/Select a project/i)).toBeDefined();
	});

	test("renders kanban columns with tasks", () => {
		mockQueries([
			{
				_id: "task-1" as Id<"project_tasks">,
				title: "Write tests",
				columnId: "col-todo" as Id<"kanban_columns">,
				position: 0,
				projectId: "proj-1" as Id<"projects">,
				_creationTime: Date.now(),
			},
		]);

		render(<ProjectKanban defaultProjectId={"proj-1" as Id<"projects">} />);

		expect(screen.getByText("Write tests")).toBeDefined();
		expect(screen.getByText("Add with details")).toBeDefined();
	});

	test("disables add button until a title is entered", () => {
		mockQueries([]);
		render(<ProjectKanban defaultProjectId={"proj-1" as Id<"projects">} />);
		expect(screen.getByRole("button", { name: /^Add$/i })).toBeDisabled();
	});

	test("creates a task on add", async () => {
		const mockCreate = vi.fn().mockResolvedValue("new-task");
		mockQueries([]);
		vi.mocked(useMutation).mockReturnValue(mockCreate);

		render(<ProjectKanban defaultProjectId={"proj-1" as Id<"projects">} />);

		const input = screen.getByPlaceholderText(/New task title/i);
		fireEvent.change(input, { target: { value: "Deploy release" } });
		fireEvent.click(screen.getByRole("button", { name: /^Add$/i }));

		await waitFor(() => {
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					title: "Deploy release",
					projectId: "proj-1",
				}),
			);
			expect(toast.success).toHaveBeenCalledWith("Task created");
		});
	});

	test("opens details dialog for create", () => {
		mockQueries([]);
		render(<ProjectKanban defaultProjectId={"proj-1" as Id<"projects">} />);

		fireEvent.click(screen.getByRole("button", { name: /Add with details/i }));
		expect(screen.getByText("Add task with details")).toBeDefined();
		expect(
			screen.getByPlaceholderText(/acceptance criteria/i),
		).toBeDefined();
	});

	test("opens details dialog when editing a task", () => {
		mockQueries([
			{
				_id: "task-1" as Id<"project_tasks">,
				title: "Write tests",
				description: "Cover drag and drop",
				columnId: "col-todo" as Id<"kanban_columns">,
				position: 0,
				projectId: "proj-1" as Id<"projects">,
				_creationTime: Date.now(),
			},
		]);

		render(<ProjectKanban defaultProjectId={"proj-1" as Id<"projects">} />);

		fireEvent.click(screen.getByRole("button", { name: /Edit task/i }));

		expect(screen.getByText("Edit task")).toBeDefined();
		expect(screen.getByDisplayValue("Cover drag and drop")).toBeDefined();
	});
});
