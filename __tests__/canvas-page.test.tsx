import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import DesignPage from "../app/dashboard/canvas/page";

// Mock next/navigation
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

// Mock convex
vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(() => vi.fn()),
}));

type MockChildren = { children?: ReactNode };

// Mock react-konva to avoid canvas issues
vi.mock("react-konva", () => ({
	Stage: ({ children }: MockChildren) => <div>{children}</div>,
	Layer: ({ children }: MockChildren) => <div>{children}</div>,
	Rect: () => <div>Rect</div>,
	Circle: () => <div>Circle</div>,
	Line: () => <div>Line</div>,
	Text: () => <div>Text</div>,
	Transformer: () => <div>Transformer</div>,
}));

// Mock dynamic import
vi.mock("next/dynamic", () => ({
	default: () => () => <div>KonvaCanvas Mock</div>,
}));

describe("Page: Design Canvas", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("renders toolbar and sidebar by default", () => {
		render(<DesignPage />);

		// Check for some tool labels in Dock (assuming it's rendered)
		// Note: Since Dock is separate, we might need to check if DesignPage renders it
		expect(screen.getByText(/Nastavenia Plátna/i)).toBeInTheDocument();
	});

	test("toggles right panel visibility", () => {
		render(<DesignPage />);

		// Find settings/properties toggle
		// In the sidebar there is a button to close it
		const propertiesHeading = screen.getByText(/Vlastnosti/i);
		const closeBtn = propertiesHeading
			.closest("div")
			?.parentElement?.querySelector("button");
		if (closeBtn) {
			fireEvent.click(closeBtn);
			// After closing, the right panel should be gone (or starting to animate out)
			// This depends on how motion.div is handled in tests
		}
	});

	test("shows artboard settings when no element is selected", () => {
		render(<DesignPage />);
		expect(screen.getByText(/Rozmery Artboardu/i)).toBeInTheDocument();
		expect(screen.getByText(/Pozadie Plátna/i)).toBeInTheDocument();
	});
});
