const DEFAULT_TTL_MS = 30_000;
const MAX_ENTRIES = 128;

type CacheEntry = {
	value: unknown;
	expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

export function readFromMemoryCache<T>(key: string): T | null | undefined {
	const entry = cache.get(key);
	if (!entry) return undefined;
	if (Date.now() > entry.expiresAt) {
		cache.delete(key);
		return undefined;
	}
	return entry.value as T | null;
}

export function writeToMemoryCache(
	key: string,
	value: unknown,
	ttlMs = DEFAULT_TTL_MS,
): void {
	if (cache.size >= MAX_ENTRIES) {
		const oldest = cache.keys().next().value;
		if (oldest) cache.delete(oldest);
	}
	cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidateMemoryCache(key?: string): void {
	if (key === undefined) {
		cache.clear();
		return;
	}
	cache.delete(key);
}
