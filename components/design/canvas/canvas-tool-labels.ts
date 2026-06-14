export const CANVAS_TOOL_LABELS: Record<string, string> = {
	select: "Select",
	hand: "Posun",
	pencil: "Pero",
	eraser: "Guma",
	rect: "Rectangle",
	circle: "Kruh",
	triangle: "Triangle",
	polygon: "Polygon",
	star: "Hviezda",
	arrow: "Arrow",
	text: "Text",
	image: "Image",
};

export function getCanvasToolLabel(toolId: string): string {
	return CANVAS_TOOL_LABELS[toolId] ?? toolId;
}
