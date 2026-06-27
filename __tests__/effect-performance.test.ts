import { beforeEach, describe, expect, test } from "vitest";
import {
	invalidateMemoryCache,
	readFromMemoryCache,
	writeToMemoryCache,
} from "@/lib/effect/idb-cache";
import {
	flushIdbWriteQueue,
	queueIdbWrite,
	registerIdbFlushHandler,
	resetIdbWriteQueue,
} from "@/lib/effect/idb-write-queue";
import { clearStripHtmlCache, stripHtml } from "@/lib/strip-html";

describe("Effect: idb-cache", () => {
	beforeEach(() => {
		invalidateMemoryCache();
	});

	test("returns cached values before expiry", () => {
		writeToMemoryCache("key", { ok: true }, 5_000);
		expect(readFromMemoryCache<{ ok: boolean }>("key")).toEqual({ ok: true });
	});

	test("evicts expired entries", () => {
		writeToMemoryCache("key", "value", -1);
		expect(readFromMemoryCache("key")).toBeUndefined();
	});
});

describe("Effect: idb-write-queue", () => {
	beforeEach(() => {
		resetIdbWriteQueue();
	});

	test("coalesces writes and flushes in batch", async () => {
		const writes: Array<[string, unknown]> = [];
		registerIdbFlushHandler(async (entries) => {
			for (const [key, value] of entries) {
				writes.push([key, value]);
			}
		});

		queueIdbWrite("a", 1);
		queueIdbWrite("b", 2);
		queueIdbWrite("a", 3);

		await flushIdbWriteQueue();

		expect(writes).toEqual([
			["a", 3],
			["b", 2],
		]);
	});
});

describe("Effect: strip-html cache", () => {
	beforeEach(() => {
		clearStripHtmlCache();
	});

	test("memoizes repeated html parsing", () => {
		const html = "<p>Hello <strong>world</strong></p>";
		expect(stripHtml(html)).toBe("Hello world");
		expect(stripHtml(html)).toBe("Hello world");
	});
});
