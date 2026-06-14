export const CANVAS_TOOL_LABELS: Record<string, string> = {
	select: "Select",
	hand: "Pan",
	pencil: "Pencil",
	eraser: "Eraser",
	rect: "Rectangle",
	circle: "Circle",
	triangle: "Triangle",
	polygon: "Polygon",
	star: "Star",
	arrow: "Arrow",
	text: "Text",
	image: "Image",
};

export function getCanvasToolLabel(toolId: string): string {
	return CANVAS_TOOL_LABELS[toolId] ?? toolId;
}
