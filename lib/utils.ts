import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export function getCSSVariable(name: string): string {
	if (typeof window === "undefined") return "";
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
	return value;
}
