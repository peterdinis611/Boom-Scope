import { fireEvent, screen } from "@testing-library/react";

export function openVisualLabTab() {
	fireEvent.click(
		screen.getByRole("button", { name: /Visual lab \(AI\)/i }),
	);
}
