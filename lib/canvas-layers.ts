import type { CanvasElement } from "@/components/design/KonvaCanvas";
import type { CanvasSize } from "@/lib/canvas-defaults";
import { regenerateIds } from "@/lib/canvas-elements";

export const LAYER_TYPES = [
	"rect",
	"circle",
	"text",
	"triangle",
	"star",
	"arrow",
] as const;

export type LayerType = (typeof LAYER_TYPES)[number];

export function getLayerTypeLabel(type: string): string {
	return type.charAt(0).toUpperCase() + type.slice(1);
}

export function getLayerDisplayName(el: CanvasElement): string {
	if (el.name?.trim()) return el.name.trim();
	return getLayerTypeLabel(el.type);
}

export function createLayerElement(
	type: LayerType,
	options: {
		strokeColor: string;
		fillColor: string;
		strokeWidth: number;
		canvasSize: CanvasSize;
		layerIndex: number;
	},
): CanvasElement {
	const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
	const centerX = Math.round(options.canvasSize.width / 2);
	const centerY = Math.round(options.canvasSize.height / 2);
	const fill =
		options.fillColor === "none" || options.fillColor === "transparent"
			? "var(--primary)"
			: options.fillColor;

	const base: CanvasElement = {
		id,
		name: `${getLayerTypeLabel(type)} ${options.layerIndex + 1}`,
		type,
		x: centerX - 120,
		y: centerY - 80,
		stroke: options.strokeColor,
		fill,
		strokeWidth: options.strokeWidth,
		rotation: 0,
		opacity: 1,
		isVisible: true,
		isLocked: false,
		fillType: "solid",
	};

	switch (type) {
		case "rect":
			return { ...base, width: 240, height: 160, cornerRadius: 8 };
		case "circle":
			return { ...base, width: 160, height: 160 };
		case "triangle":
			return { ...base, width: 180, height: 160 };
		case "star":
			return { ...base, width: 160, height: 160 };
		case "arrow":
			return { ...base, width: 200, height: 80 };
		case "text":
			return {
				...base,
				x: centerX - 100,
				y: centerY - 20,
				width: 200,
				height: 48,
				text: "New text layer",
				fontSize: 28,
				fontFamily: "Inter, sans-serif",
				fill: "none",
				stroke: options.strokeColor,
			};
		default:
			return base;
	}
}

export function duplicateLayer(el: CanvasElement): CanvasElement {
	const copy = regenerateIds(el);
	const baseName = getLayerDisplayName(el);
	copy.name = `${baseName} copy`;
	copy.x += 24;
	copy.y += 24;
	return copy;
}
