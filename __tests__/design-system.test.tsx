import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import { describe, expect, test, vi } from "vitest";
import DesignSystemPage from "../app/dashboard/design-system/page";

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
		expect(screen.getByText(/Presuňte inšpiráciu sem/i)).toBeDefined();
	});

	test("shows generation button after image upload", async () => {
		const { container } = render(<DesignSystemPage />);
		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;

		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(screen.getByText(/Generovať Identitu/i)).toBeDefined();
		});
	});

	test("requires a project before analyzing", async () => {
		const { container } = render(<DesignSystemPage />);

		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;
		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		const generateBtn = await screen.findByText(/Generovať Identitu/i);
		fireEvent.click(generateBtn);

		expect(toast.error).toHaveBeenCalledWith("Najprv vyberte projekt!");
	});

	test("shows Generovať Design button after image upload", async () => {
		const { container } = render(<DesignSystemPage />);
		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;

		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(screen.getByText(/Generovať Design/i)).toBeDefined();
		});
	});

	test("Generovať Design requires a project", async () => {
		const { container } = render(<DesignSystemPage />);
		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;

		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		const generateBtn = await screen.findByText(/Generovať Design/i);
		fireEvent.click(generateBtn);

		expect(toast.error).toHaveBeenCalledWith("Najprv vyberte projekt!");
	});

	test("header Uložiť button is rendered", () => {
		render(<DesignSystemPage />);
		expect(screen.getByText(/^Uložiť$/i)).toBeDefined();
	});
});
