import { cn } from "@/lib/utils";

export const typography = {
	pageTitle:
		"font-heading text-2xl font-semibold tracking-tight text-foreground",
	sectionTitle:
		"font-heading text-lg font-semibold tracking-tight text-foreground",
	body: "text-sm text-foreground",
	caption: "text-xs text-muted-foreground",
} as const;

export function pageTitleClass(className?: string) {
	return cn(typography.pageTitle, className);
}

export function sectionTitleClass(className?: string) {
	return cn(typography.sectionTitle, className);
}
