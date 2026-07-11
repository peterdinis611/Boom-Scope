import Fuse, { type IFuseOptions, type FuseOptionKey } from "fuse.js";

export const DEFAULT_FUSE_OPTIONS: IFuseOptions<unknown> = {
	threshold: 0.35,
	ignoreLocation: true,
	minMatchCharLength: 1,
	isCaseSensitive: false,
};

export function stripHtmlForSearch(html: string): string {
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function fuseSearch<T>(
	items: readonly T[],
	term: string,
	keys: FuseOptionKey<T>[],
	options?: IFuseOptions<T>,
	limit?: number,
): T[] {
	const query = term.trim();
	if (!query) return [...items];
	if (items.length === 0) return [];

	const fuse = new Fuse(items as T[], {
		...DEFAULT_FUSE_OPTIONS,
		keys,
		...options,
	});

	const results = fuse.search(query).map((result) => result.item);
	return limit !== undefined ? results.slice(0, limit) : results;
}
