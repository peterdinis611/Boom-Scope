import { assign, setup } from "xstate";

export type CanvasSidebarTab = "layers" | "templates";

export interface CanvasUiContext {
	activeTool: string;
	leftPanelOpen: boolean;
	rightPanelOpen: boolean;
	activeTab: CanvasSidebarTab;
	previousTool: string | null;
}

export type CanvasUiEvent =
	| { type: "SET_TOOL"; tool: string }
	| { type: "SELECT_TOOL"; tool: string }
	| { type: "TOGGLE_LEFT_PANEL" }
	| { type: "TOGGLE_RIGHT_PANEL" }
	| { type: "SET_LEFT_PANEL"; open: boolean }
	| { type: "SET_RIGHT_PANEL"; open: boolean }
	| { type: "SET_TAB"; tab: CanvasSidebarTab }
	| { type: "HOLD_SPACE" }
	| { type: "RELEASE_SPACE" };

export const canvasUiMachine = setup({
	types: {
		context: {} as CanvasUiContext,
		events: {} as CanvasUiEvent,
	},
	actions: {
		setTool: assign({
			activeTool: ({ event }) =>
				event.type === "SET_TOOL" || event.type === "SELECT_TOOL"
					? event.tool
					: "select",
		}),
		selectTool: assign({
			activeTool: ({ event }) => (event.type === "SELECT_TOOL" ? event.tool : "select"),
			previousTool: null,
		}),
		holdSpace: assign({
			previousTool: ({ context }) => context.activeTool,
			activeTool: "hand",
		}),
		releaseSpace: assign({
			activeTool: ({ context }) => context.previousTool ?? "select",
			previousTool: null,
		}),
		toggleLeftPanel: assign({
			leftPanelOpen: ({ context }) => !context.leftPanelOpen,
		}),
		toggleRightPanel: assign({
			rightPanelOpen: ({ context }) => !context.rightPanelOpen,
		}),
		setLeftPanel: assign({
			leftPanelOpen: ({ event }) =>
				event.type === "SET_LEFT_PANEL" ? event.open : true,
		}),
		setRightPanel: assign({
			rightPanelOpen: ({ event }) =>
				event.type === "SET_RIGHT_PANEL" ? event.open : true,
		}),
		setTab: assign({
			activeTab: ({ event }) =>
				event.type === "SET_TAB" ? event.tab : "layers",
		}),
	},
}).createMachine({
	id: "canvasUi",
	initial: "ready",
	context: {
		activeTool: "select",
		leftPanelOpen: true,
		rightPanelOpen: true,
		activeTab: "layers",
		previousTool: null,
	},
	states: {
		ready: {
			on: {
				SET_TOOL: { actions: "setTool" },
				SELECT_TOOL: { actions: "selectTool" },
				TOGGLE_LEFT_PANEL: { actions: "toggleLeftPanel" },
				TOGGLE_RIGHT_PANEL: { actions: "toggleRightPanel" },
				SET_LEFT_PANEL: { actions: "setLeftPanel" },
				SET_RIGHT_PANEL: { actions: "setRightPanel" },
				SET_TAB: { actions: "setTab" },
				HOLD_SPACE: { actions: "holdSpace" },
				RELEASE_SPACE: { actions: "releaseSpace" },
			},
		},
	},
});
