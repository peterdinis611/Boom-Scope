import { Effect } from "effect";

export function runPromise<A, E>(
	effect: Effect.Effect<A, E, never>,
): Promise<A> {
	return Effect.runPromise(effect);
}

export function runFork<A, E>(effect: Effect.Effect<A, E, never>): void {
	Effect.runFork(effect);
}
