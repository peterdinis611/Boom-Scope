import { Data, Effect, Schedule } from "effect";
import {
	invalidateMemoryCache,
	readFromMemoryCache,
	writeToMemoryCache,
} from "@/lib/effect/idb-cache";

export class IdbError extends Data.TaggedError("IdbError")<{
	message: string;
	cause?: unknown;
}> {}

const retrySchedule = Schedule.exponential("16 millis").pipe(
	Schedule.intersect(Schedule.recurs(2)),
);

export function idbTryPromise<A>(
	label: string,
	run: () => Promise<A>,
): Effect.Effect<A, IdbError> {
	return Effect.tryPromise({
		try: run,
		catch: (cause) =>
			new IdbError({
				message: label,
				cause,
			}),
	}).pipe(Effect.retry(retrySchedule));
}

export function cachedIdbGet<T>(
	key: string,
	read: () => Promise<T | null>,
): Effect.Effect<T | null, IdbError> {
	const cached = readFromMemoryCache<T>(key);
	if (cached !== undefined) {
		return Effect.succeed(cached);
	}

	return idbTryPromise(`read ${key}`, read).pipe(
		Effect.tap((value) => Effect.sync(() => writeToMemoryCache(key, value))),
	);
}

export function cachedIdbSet(
	key: string,
	value: unknown,
	write: () => Promise<void>,
): Effect.Effect<void, IdbError> {
	return idbTryPromise(`write ${key}`, write).pipe(
		Effect.tap(() =>
			Effect.sync(() => {
				writeToMemoryCache(key, value);
			}),
		),
	);
}

export function cachedIdbRemove(
	key: string,
	remove: () => Promise<void>,
): Effect.Effect<void, IdbError> {
	return idbTryPromise(`remove ${key}`, remove).pipe(
		Effect.tap(() =>
			Effect.sync(() => {
				invalidateMemoryCache(key);
			}),
		),
	);
}

export function cachedIdbClear(clear: () => Promise<void>): Effect.Effect<void, IdbError> {
	return idbTryPromise("clear store", clear).pipe(
		Effect.tap(() => Effect.sync(() => invalidateMemoryCache())),
	);
}
