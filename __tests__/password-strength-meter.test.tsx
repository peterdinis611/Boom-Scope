// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

describe("Component: PasswordStrengthMeter", () => {
	it("shows hint when password is empty", () => {
		render(<PasswordStrengthMeter password="" />);
		expect(screen.getByText("Password must be at least 8 characters.")).toBeDefined();
	});

	it("shows strength label when password is entered", () => {
		render(<PasswordStrengthMeter password="Heslo123!" />);
		expect(screen.getByText("Very strong")).toBeDefined();
		expect(screen.getByText("At least 8 characters")).toBeDefined();
	});
});

describe("Component: PasswordField", () => {
	it("renders label and password input", () => {
		render(
			<PasswordField
				id="password"
				name="password"
				label="Heslo"
				placeholder="At least 8 characters"
			/>,
		);
		expect(screen.getByLabelText("Heslo")).toBeDefined();
	});

	it("shows strength meter when showStrength is enabled", () => {
		render(
			<PasswordField
				id="password"
				name="password"
				label="Heslo"
				showStrength
			/>,
		);

		expect(screen.queryByText("Very strong")).toBeNull();
		fireEvent.change(screen.getByLabelText("Heslo"), {
			target: { value: "Heslo123!" },
		});
		expect(screen.getByText("Very strong")).toBeDefined();
	});
});
