export const PLACEHOLDER_IMAGE_LIMITS = {
	minSize: 1,
	maxSize: 5000,
	minBlur: 1,
	maxBlur: 10,
	defaultQuality: 80,
} as const;

export interface PlaceholderImageParams {
	width: number;
	height?: number;
	seed?: string;
	grayscale?: boolean;
	blur?: number;
	square?: boolean;
}

export function clampPlaceholderSize(value: number): number {
	return Math.min(
		PLACEHOLDER_IMAGE_LIMITS.maxSize,
		Math.max(PLACEHOLDER_IMAGE_LIMITS.minSize, Math.round(value)),
	);
}

export function clampPlaceholderBlur(value: number): number {
	return Math.min(
		PLACEHOLDER_IMAGE_LIMITS.maxBlur,
		Math.max(PLACEHOLDER_IMAGE_LIMITS.minBlur, Math.round(value)),
	);
}

export function buildPicsumUrl(params: PlaceholderImageParams): string {
	const width = clampPlaceholderSize(params.width);
	const height = params.square
		? undefined
		: params.height
			? clampPlaceholderSize(params.height)
			: undefined;
	const seed = params.seed?.trim();

	let path: string;
	if (seed) {
		path = height
			? `/seed/${encodeURIComponent(seed)}/${width}/${height}`
			: `/seed/${encodeURIComponent(seed)}/${width}`;
	} else {
		path = height ? `/${width}/${height}` : `/${width}`;
	}

	const queryParts: string[] = [];
	if (params.grayscale) queryParts.push("grayscale");
	if (params.blur && params.blur > 0) {
		queryParts.push(`blur=${clampPlaceholderBlur(params.blur)}`);
	}

	const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
	return `https://picsum.photos${path}${query}`;
}

export function getPlaceholderDimensions(params: PlaceholderImageParams): {
	width: number;
	height: number;
} {
	const width = clampPlaceholderSize(params.width);
	const height = params.square
		? width
		: params.height
			? clampPlaceholderSize(params.height)
			: width;
	return { width, height };
}

export function buildPlaceholderFilename(
	params: PlaceholderImageParams,
	extension = "webp",
): string {
	const { width, height } = getPlaceholderDimensions(params);
	const seedPart = params.seed?.trim()
		? `-seed-${params.seed.trim().replace(/\s+/g, "-").toLowerCase()}`
		: "";
	const filters = [
		params.grayscale ? "gray" : null,
		params.blur && params.blur > 0 ? `blur-${clampPlaceholderBlur(params.blur)}` : null,
	]
		.filter(Boolean)
		.join("-");
	const filterPart = filters ? `-${filters}` : "";
	return `placeholder-${width}x${height}${seedPart}${filterPart}.${extension}`;
}

export function buildOptimizedImageUrl(
	sourceUrl: string,
	width: number,
	quality = PLACEHOLDER_IMAGE_LIMITS.defaultQuality,
): string {
	const params = new URLSearchParams({
		url: sourceUrl,
		w: String(width),
		q: String(quality),
	});
	return `/_next/image?${params.toString()}`;
}

export async function downloadOptimizedPlaceholderImage(
	params: PlaceholderImageParams,
): Promise<void> {
	const sourceUrl = buildPicsumUrl(params);
	const { width } = getPlaceholderDimensions(params);
	const optimizedUrl = buildOptimizedImageUrl(sourceUrl, width);
	const response = await fetch(optimizedUrl);

	if (!response.ok) {
		throw new Error("Failed to download image.");
	}

	const blob = await response.blob();
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = objectUrl;
	link.download = buildPlaceholderFilename(params, "webp");
	link.click();
	URL.revokeObjectURL(objectUrl);
}

export const PLACEHOLDER_SIZE_PRESETS = [
	{ label: "Square 400", width: 400, square: true },
	{ label: "HD 1280×720", width: 1280, height: 720 },
	{ label: "Full HD", width: 1920, height: 1080 },
	{ label: "Mobile", width: 375, height: 667 },
	{ label: "Instagram", width: 1080, height: 1080, square: true },
] as const;
