import { describe, expect, it } from "vitest";
import {
	createLayerElement,
	duplicateLayer,
	getLayerDisplayName,
	getLayerTypeLabel,
} from "@/lib/canvas-layers";
import type { CanvasElement } from "@/components/design/KonvaCanvas";

describe("canvas-layers", () => {
	it("creates named layers with default dimensions", () => {
		const layer = createLayerElement("rect", {
			strokeColor: "#000000",
			fillColor: "#3b82f6",
			strokeWidth: 2,
			canvasSize: { width: 1920, height: 1080 },
			layerIndex: 2,
		});

		expect(layer.name).toBe("Rect 3");
		expect(layer.width).toBe(240);
		expect(layer.height).toBe(160);
		expect(layer.fill).toBe("#3b82f6");
	});

	it("creates text layers with placeholder copy", () => {
		const layer = createLayerElement("text", {
			strokeColor: "var(--primary)",
			fillColor: "var(--primary)",
			strokeWidth: 2,
			canvasSize: { width: 800, height: 600 },
			layerIndex: 0,
		});

		expect(layer.type).toBe("text");
		expect(layer.text).toBe("New text layer");
		expect(layer.fontSize).toBe(28);
	});

	it("duplicates a layer with a new id and offset position", () => {
		const original: CanvasElement = {
			id: "el-1",
			name: "Hero",
			type: "rect",
			x: 10,
			y: 20,
			width: 100,
			height: 50,
			stroke: "#000",
			fill: "#fff",
			strokeWidth: 1,
		};

		const copy = duplicateLayer(original);
		expect(copy.id).not.toBe(original.id);
		expect(copy.name).toBe("Hero copy");
		expect(copy.x).toBe(34);
		expect(copy.y).toBe(44);
	});

	it("falls back to type label when layer has no name", () => {
		expect(
			getLayerDisplayName({
				id: "el-1",
				type: "circle",
				x: 0,
				y: 0,
				stroke: "#000",
				fill: "#fff",
				strokeWidth: 1,
			}),
		).toBe("Circle");
		expect(getLayerTypeLabel("star")).toBe("Star");
	});
});
