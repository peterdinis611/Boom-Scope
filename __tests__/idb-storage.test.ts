import { beforeEach, describe, expect, test } from "vitest";
import {
	IDB_KEYS,
	idbClear,
	idbGet,
	idbReadLegacyStore,
	idbRemove,
	idbSet,
} from "@/lib/idb-storage";
import { getPomodoroSettings, savePomodoroSettings } from "@/lib/pomodoro-db";

describe("Lib: idb-storage", () => {
	beforeEach(async () => {
		await idbClear();
	});

	test("stores and retrieves JSON-serializable values", async () => {
		await idbSet("test-key", { foo: "bar", count: 42 });
		expect(await idbGet<{ foo: string; count: number }>("test-key")).toEqual({
			foo: "bar",
			count: 42,
		});
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
