import { beforeEach, describe, expect, test } from "vitest";
import {
	IDB_KEYS,
	idbClear,
	idbGet,
	idbReadLegacyStore,
	idbRemove,
	idbSet,
	idbSetImmediate,
} from "@/lib/idb-storage";
import { flushIdbWriteQueue } from "@/lib/effect/idb-write-queue";
import { idbResetConnection } from "@/lib/idb-storage";
import { getPomodoroSettings, savePomodoroSettings } from "@/lib/pomodoro-db";

describe("Lib: idb-storage", () => {
	beforeEach(async () => {
		idbResetConnection();
		await idbClear();
	});

	test("stores and retrieves JSON-serializable values", async () => {
		await idbSet("test-key", { foo: "bar", count: 42 });
		expect(await idbGet<{ foo: string; count: number }>("test-key")).toEqual({
			foo: "bar",
			count: 42,
		});
		await flushIdbWriteQueue();
		expect(await idbGet<{ foo: string; count: number }>("test-key")).toEqual({
			foo: "bar",
			count: 42,
		});
	});

	test("persists queued writes to disk", async () => {
		await idbSetImmediate("persist-key", "value");
		expect(await idbGet("persist-key")).toBe("value");
	});

	test("remove deletes a key", async () => {
		await idbSet("temp", "value");
		await idbRemove("temp");
		expect(await idbGet("temp")).toBeNull();
	});

	test("idbReadLegacyStore returns null when store does not exist", async () => {
		expect(await idbReadLegacyStore("nonexistent-store", "key")).toBeNull();
	});
});

describe("Lib: pomodoro-db", () => {
	beforeEach(async () => {
		await idbClear();
	});

	test("saves and loads pomodoro settings from IndexedDB", async () => {
		const settings = {
			focusDuration: 20 * 60,
			shortBreakDuration: 5 * 60,
			longBreakDuration: 15 * 60,
		};

		await savePomodoroSettings(settings);
		expect(await getPomodoroSettings()).toEqual(settings);
	});
});
