import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import DesignPage from "../app/dashboard/canvas/page";

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		back: vi.fn(),
	}),
	useParams: vi.fn(() => ({})),
	useSearchParams: vi.fn(() => ({
		get: vi.fn(),
	})),
}));

vi.mock("convex/react", () => ({
	useQuery: vi.fn(() => []),
	useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

type MockChildren = { children?: ReactNode };

vi.mock("react-konva", () => ({
	Stage: ({ children }: MockChildren) => <div>{children}</div>,
	Layer: ({ children }: MockChildren) => <div>{children}</div>,
	Rect: () => <div>Rect</div>,
	Circle: () => <div>Circle</div>,
	Line: () => <div>Line</div>,
	Text: () => <div>Text</div>,
	Transformer: () => <div>Transformer</div>,
}));

vi.mock("next/dynamic", () => ({
	default: () => () => <div>KonvaCanvas Mock</div>,
}));

function importJsonDesign(
	payload: Record<string, unknown>,
	container: HTMLElement,
) {
	const input = container.querySelector(
		'input[accept="application/json,.json"]',
	) as HTMLInputElement;
	const file = new File([JSON.stringify(payload)], "design.json", {
		type: "application/json",
	});
	fireEvent.change(input, { target: { files: [file] } });
}

describe("Page: Design Canvas", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("renders toolbar and sidebar by default", () => {
		render(<DesignPage />);
		expect(
			screen.getByRole("heading", { name: /Canvas settings/i }),
		).toBeInTheDocument();
	});

	test("shows artboard settings when no element is selected", () => {
		render(<DesignPage />);
		expect(screen.getByText(/Rozmery Artboardu/i)).toBeInTheDocument();
		expect(screen.getByText(/Canvas background/i)).toBeInTheDocument();
	});

	test("switches left panel to templates tab", () => {
		render(<DesignPage />);
		fireEvent.click(screen.getByRole("button", { name: /Templates/i }));
		expect(screen.getByText(/Social media/i)).toBeInTheDocument();
		expect(screen.getByText(/Zariadenia/i)).toBeInTheDocument();
	});

	test("shows visual warning for element without fill or stroke", async () => {
		const { container } = render(<DesignPage />);

		importJsonDesign(
			{
				elements: [
					{
						id: "el-imported",
						type: "rect",
						x: 10,
						y: 20,
						width: 140,
						height: 60,
						stroke: "transparent",
						fill: "none",
						strokeWidth: 0,
					},
				],
				canvasSize: { width: 1920, height: 1080 },
			},
			container,
		);

		await waitFor(() => {
			expect(screen.getByText(/Rect/i)).toBeInTheDocument();
		});

		const layerButton = screen.getByText(/^Rect$/i).closest("button");
		expect(layerButton).toBeTruthy();
		fireEvent.click(layerButton!);

		await waitFor(() => {
			expect(
				screen.getByText(/No visual is set anywhere/i),
			).toBeInTheDocument();
		});
	});

	test("applies default visual style from properties panel", async () => {
		const { container } = render(<DesignPage />);

		importJsonDesign(
			{
				elements: [
					{
						id: "el-imported",
						type: "rect",
						x: 0,
						y: 0,
						width: 100,
						height: 50,
						stroke: "transparent",
						fill: "none",
						strokeWidth: 0,
					},
				],
			},
			container,
		);

		await waitFor(() => {
			expect(screen.getByText(/^Rect$/i)).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText(/^Rect$/i).closest("button")!);

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /Set default visual/i }),
			).toBeInTheDocument();
		});

		fireEvent.click(
			screen.getByRole("button", { name: /Set default visual/i }),
		);

		await waitFor(() => {
			expect(
				screen.queryByText(/No visual is set anywhere/i),
			).not.toBeInTheDocument();
		});

		expect(screen.getByText(/Fill type/i)).toBeInTheDocument();
	});

	test("shows multi-selection controls when two layers are selected", async () => {
		const { container } = render(<DesignPage />);

		importJsonDesign(
			{
				elements: [
					{
						id: "el-a",
						type: "rect",
						x: 0,
						y: 0,
						width: 50,
						height: 50,
						stroke: "#000",
						fill: "#fff",
						strokeWidth: 1,
					},
					{
						id: "el-b",
						type: "circle",
						x: 100,
						y: 100,
						width: 40,
						height: 40,
						stroke: "#000",
						fill: "#fff",
						strokeWidth: 1,
					},
				],
			},
			container,
		);

		await waitFor(() => {
			expect(screen.getByText(/^Rect$/i)).toBeInTheDocument();
			expect(screen.getByText(/^Circle$/i)).toBeInTheDocument();
		});

		const rectBtn = screen.getByText(/^Rect$/i).closest("button")!;
		const circleBtn = screen.getByText(/^Circle$/i).closest("button")!;

		fireEvent.click(rectBtn);
		fireEvent.click(circleBtn, { shiftKey: true });

		await waitFor(() => {
			expect(screen.getByText(/Selection: 2 layers/i)).toBeInTheDocument();
		});

		const propertiesPanel = screen.getByText(/Vlastnosti/i).closest("div")
			?.parentElement?.parentElement;
		expect(propertiesPanel).toBeTruthy();
		expect(
			within(propertiesPanel as HTMLElement).getByRole("button", {
				name: /Skupina/i,
			}),
		).toBeInTheDocument();
	});
});
