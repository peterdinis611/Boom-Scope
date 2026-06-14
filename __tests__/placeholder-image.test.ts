import { describe, expect, it } from "vitest";
import {
	buildOptimizedImageUrl,
	buildPicsumUrl,
	buildPlaceholderFilename,
	getPlaceholderDimensions,
} from "@/lib/placeholder-image";

describe("placeholder-image", () => {
	it("builds a random sized url", () => {
		expect(buildPicsumUrl({ width: 200, height: 300 })).toBe(
			"https://picsum.photos/200/300",
		);
	});

	it("builds a square url", () => {
		expect(buildPicsumUrl({ width: 400, square: true })).toBe(
			"https://picsum.photos/400",
		);
	});

	it("builds a seeded url with filters", () => {
		expect(
			buildPicsumUrl({
				width: 200,
				height: 300,
				seed: "picsum",
				grayscale: true,
				blur: 3,
			}),
		).toBe("https://picsum.photos/seed/picsum/200/300?grayscale&blur=3");
	});

	it("derives dimensions for square images", () => {
		expect(getPlaceholderDimensions({ width: 500, square: true })).toEqual({
			width: 500,
			height: 500,
		});
	});

	it("builds optimized proxy urls and filenames", () => {
		const source = "https://picsum.photos/800/600";
		expect(buildOptimizedImageUrl(source, 800)).toContain("/_next/image?");

		expect(
			buildPlaceholderFilename({
				width: 800,
				height: 600,
				seed: "hero banner",
				grayscale: true,
			}),
		).toBe("placeholder-800x600-seed-hero-banner-gray.webp");
	});
});
