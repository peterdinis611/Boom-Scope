import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import { describe, expect, test, vi } from "vitest";
import DesignSystemPage from "../app/dashboard/design-system/v2/page";

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

// Mock Convex hooks so the page renders without a ConvexProvider in tests.
vi.mock("convex/react", () => ({
	useQuery: vi.fn(() => undefined),
	useMutation: vi.fn(() => vi.fn()),
	useAction: vi.fn(() => vi.fn()),
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock FileReader
class MockFileReader {
	onload: (() => void) | null = null;
	readAsDataURL() {
		if (this.onload) this.onload();
	}
	result = "data:image/png;base64,abc";
}

vi.stubGlobal("FileReader", MockFileReader);

describe("Page: Design System Generator", () => {
	test("renders initial upload state", () => {
		render(<DesignSystemPage />);
		expect(screen.getByText(/Drop inspiration here/i)).toBeDefined();
	});

	test("shows generation button after image upload", async () => {
		const { container } = render(<DesignSystemPage />);
		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;

		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(screen.getByText(/Analyze style/i)).toBeDefined();
		});
	});

	test("requires a project before analyzing", async () => {
		const { container } = render(<DesignSystemPage />);

		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;
		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		const generateBtn = await screen.findByText(/Analyze style/i);
		fireEvent.click(generateBtn);

		expect(toast.error).toHaveBeenCalledWith("Select a project first!");
	});

	test("shows Generate design button after image upload", async () => {
		const { container } = render(<DesignSystemPage />);
		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;

		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(screen.getByText(/Generate design/i)).toBeDefined();
		});
	});

	test("Generate design requires a project", async () => {
		const { container } = render(<DesignSystemPage />);
		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;

		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		const generateBtn = await screen.findByText(/Generate design/i);
		fireEvent.click(generateBtn);

		expect(toast.error).toHaveBeenCalledWith("Select a project first!");
	});

	test("header Save button is rendered", () => {
		render(<DesignSystemPage />);
		expect(screen.getByText(/^Save system$/i)).toBeDefined();
	});
});
