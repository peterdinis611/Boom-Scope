import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ProjectKanban } from "@/components/kanban/project-kanban";
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

function mockQueries(tasks: unknown) {
	vi.mocked(useQuery).mockImplementation(() => tasks);
}

describe("Component: ProjectKanban", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("prompts to select a project when none is chosen", () => {
		mockQueries(undefined);
		render(<ProjectKanban />);
		expect(screen.getByText(/Select a project/i)).toBeDefined();
	});

	test("renders kanban columns with tasks", () => {
		mockQueries([
			{
				_id: "task-1" as Id<"project_tasks">,
				title: "Write tests",
				status: "todo",
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
			expect(mockCreate).toHaveBeenCalledWith({
				title: "Deploy release",
				projectId: "proj-1",
				status: "todo",
			});
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
				status: "todo",
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
