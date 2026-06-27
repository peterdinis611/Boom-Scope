import { Effect, Schedule } from "effect";
import { invalidateMemoryCache, writeToMemoryCache } from "@/lib/effect/idb-cache";
import { runFork } from "@/lib/effect/runtime";

type FlushHandler = (entries: ReadonlyMap<string, unknown>) => Promise<void>;

const pending = new Map<string, unknown>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushHandler: FlushHandler | null = null;

const retrySchedule = Schedule.exponential("32 millis").pipe(
	Schedule.intersect(Schedule.recurs(2)),
);

export function registerIdbFlushHandler(handler: FlushHandler): void {
	flushHandler = handler;
}

export function queueIdbWrite(key: string, value: unknown): void {
	pending.set(key, value);
	writeToMemoryCache(key, value);

	if (flushTimer) return;

	flushTimer = setTimeout(() => {
		flushTimer = null;
		const batch = new Map(pending);
		pending.clear();
		if (!flushHandler || batch.size === 0) return;

		runFork(
			Effect.tryPromise({
				try: () => flushHandler?.(batch) ?? Promise.resolve(),
				catch: (cause) => cause,
			}).pipe(Effect.retry(retrySchedule), Effect.ignore),
		);
	}, 32);
}

export async function flushIdbWriteQueue(): Promise<void> {
	if (flushTimer) {
		clearTimeout(flushTimer);
		flushTimer = null;
	}
	const batch = new Map(pending);
	pending.clear();
	if (!flushHandler || batch.size === 0) return;
	await flushHandler(batch);
}

export function resetIdbWriteQueue(): void {
	if (flushTimer) {
		clearTimeout(flushTimer);
		flushTimer = null;
	}
	pending.clear();
}
