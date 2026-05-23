import { beforeEach, describe, expect, test } from "vitest";
import {
	IDB_KEYS,
	idbClear,
	idbGet,
	idbRemove,
	idbSet,
	migrateFromLocalStorage,
} from "@/lib/idb-storage";

describe("Lib: idb-storage", () => {
	beforeEach(async () => {
		await idbClear();
		localStorage.clear();
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

	test("migrateFromLocalStorage moves legacy data into IndexedDB", async () => {
		const legacy = [{ id: "1", text: "hello", timestamp: 1 }];
		localStorage.setItem(
			IDB_KEYS.clipboardHistory,
			JSON.stringify(legacy),
		);

		await migrateFromLocalStorage(IDB_KEYS.clipboardHistory);

		expect(await idbGet(IDB_KEYS.clipboardHistory)).toEqual(legacy);
		expect(localStorage.getItem(IDB_KEYS.clipboardHistory)).toBeNull();
	});

	test("migrateFromLocalStorage does not overwrite existing IndexedDB data", async () => {
		const idbValue = [{ id: "idb", text: "from-idb", timestamp: 2 }];
		const legacyValue = [{ id: "ls", text: "from-ls", timestamp: 1 }];
		await idbSet(IDB_KEYS.clipboardHistory, idbValue);
		localStorage.setItem(
			IDB_KEYS.clipboardHistory,
			JSON.stringify(legacyValue),
		);

		await migrateFromLocalStorage(IDB_KEYS.clipboardHistory);

		expect(await idbGet(IDB_KEYS.clipboardHistory)).toEqual(idbValue);
		expect(localStorage.getItem(IDB_KEYS.clipboardHistory)).toBeNull();
	});
});
