import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export function getCSSVariable(name: string): string {
	if (typeof window === "undefined") return "";
	const cssName = name.startsWith("--") ? name : `--${name}`;
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(cssName)
		.trim();
	return value;
}

/** Resolves CSS variables and normalizes colors for Konva/canvas rendering. */
export function resolveCanvasColor(color: string): string {
	if (!color || color === "none" || color === "transparent") {
		return color;
	}

	let resolved = color.trim();
	if (resolved.startsWith("var(")) {
		const inner = resolved.slice(4, -1).trim();
		resolved = getCSSVariable(inner);
	}

	if (typeof document === "undefined" || !resolved) {
		return resolved;
	}

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) return resolved;

	try {
		ctx.fillStyle = resolved;
		return ctx.fillStyle || resolved;
	} catch {
		return resolved;
	}
}
