import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { canvasUiMachine } from "@/machines/canvas-ui.machine";

describe("canvasUiMachine", () => {
	it("switches tools and clears previous tool on select", () => {
		const actor = createActor(canvasUiMachine).start();
		actor.send({ type: "SELECT_TOOL", tool: "pencil" });

		expect(actor.getSnapshot().context.activeTool).toBe("pencil");
		expect(actor.getSnapshot().context.previousTool).toBeNull();
	});

	it("temporarily switches to hand while space is held", () => {
		const actor = createActor(canvasUiMachine).start();
		actor.send({ type: "SELECT_TOOL", tool: "rect" });
		actor.send({ type: "HOLD_SPACE" });
		expect(actor.getSnapshot().context.activeTool).toBe("hand");

		actor.send({ type: "RELEASE_SPACE" });
		expect(actor.getSnapshot().context.activeTool).toBe("rect");
	});

	it("toggles panels and sidebar tab", () => {
		const actor = createActor(canvasUiMachine).start();
		actor.send({ type: "TOGGLE_LEFT_PANEL" });
		actor.send({ type: "SET_TAB", tab: "templates" });

		expect(actor.getSnapshot().context.leftPanelOpen).toBe(false);
		expect(actor.getSnapshot().context.activeTab).toBe("templates");
	});
});
