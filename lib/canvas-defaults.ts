export const DEFAULT_CANVAS_SIZE = {
	width: 1920,
	height: 1080,
} as const;

export type CanvasSize = {
	width: number;
	height: number;
};

export function normalizeCanvasSize(
	size?: Partial<CanvasSize> | null,
): CanvasSize {
	return {
		width:
			size?.width && size.width > 0
				? size.width
				: DEFAULT_CANVAS_SIZE.width,
		height:
			size?.height && size.height > 0
				? size.height
				: DEFAULT_CANVAS_SIZE.height,
	};
}
