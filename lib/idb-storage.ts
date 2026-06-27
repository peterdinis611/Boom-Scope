import {
	cachedIdbClear,
	cachedIdbGet,
	cachedIdbRemove,
	cachedIdbSet,
} from "@/lib/effect/idb-ops";
import { invalidateMemoryCache } from "@/lib/effect/idb-cache";
import {
	flushIdbWriteQueue,
	queueIdbWrite,
	registerIdbFlushHandler,
	resetIdbWriteQueue,
} from "@/lib/effect/idb-write-queue";
import { runPromise } from "@/lib/effect/runtime";

const DB_NAME = "boom-scope";
const STORE_NAME = "kv";
const DB_VERSION = 2;

export const IDB_KEYS = {
	generationHistory: "boom_scope_generation_history",
	clipboardHistory: "boom_scope_clipboard_history",
	importedDesign: "imported_design",
	importedViewport: "imported_viewport",
	pomodoroSettings: "pomodoro_settings",
	pomodoroSessions: "pomodoro_sessions",
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
	if (typeof indexedDB === "undefined") {
		return Promise.reject(new Error("IndexedDB is not available"));
	}

	if (!dbPromise) {
		dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () =>
				reject(request.error ?? new Error("IDB open failed"));
			request.onsuccess = () => resolve(request.result);
			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME);
				}
			};
		});
	}

	return dbPromise;
}

function runTransaction<T>(
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
	return openDb().then(
		(db) =>
			new Promise<T>((resolve, reject) => {
				const tx = db.transaction(STORE_NAME, mode);
				const store = tx.objectStore(STORE_NAME);
				const request = run(store);

				request.onerror = () =>
					reject(request.error ?? new Error("IDB request failed"));
				request.onsuccess = () => resolve(request.result as T);
			}),
	);
}

async function rawIdbGet<T>(key: string): Promise<T | null> {
	const value = await runTransaction("readonly", (store) => store.get(key));
	return value === undefined ? null : (value as T);
}

async function rawIdbSet<T>(key: string, value: T): Promise<void> {
	await runTransaction("readwrite", (store) => store.put(value, key));
}

async function rawIdbRemove(key: string): Promise<void> {
	await runTransaction("readwrite", (store) => store.delete(key));
}

async function rawIdbClear(): Promise<void> {
	await runTransaction("readwrite", (store) => store.clear());
}

registerIdbFlushHandler(async (entries) => {
	for (const [key, value] of entries) {
		await rawIdbSet(key, value);
	}
});

export async function idbGet<T>(key: string): Promise<T | null> {
	return runPromise(
		cachedIdbGet(key, () => rawIdbGet<T>(key)),
	);
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
	queueIdbWrite(key, value);
}

export async function idbSetImmediate<T>(key: string, value: T): Promise<void> {
	await runPromise(cachedIdbSet(key, value, () => rawIdbSet(key, value)));
}

export async function idbRemove(key: string): Promise<void> {
	await runPromise(cachedIdbRemove(key, () => rawIdbRemove(key)));
}

export async function idbClear(): Promise<void> {
	await flushIdbWriteQueue();
	await runPromise(cachedIdbClear(() => rawIdbClear()));
}

/** Reset the cached DB connection (for tests). */
export function idbResetConnection(): void {
	resetIdbWriteQueue();
	invalidateMemoryCache();
	if (dbPromise) {
		void dbPromise.then((db) => db.close()).catch(() => {});
	}
	dbPromise = null;
}

/** Read from a legacy object store (pre-unified schema). */
export async function idbReadLegacyStore<T>(
	storeName: string,
	key: string,
): Promise<T | null> {
	const db = await openDb();
	if (!db.objectStoreNames.contains(storeName)) return null;

	return new Promise<T | null>((resolve, reject) => {
		const tx = db.transaction(storeName, "readonly");
		const request = tx.objectStore(storeName).get(key);
		request.onerror = () =>
			reject(request.error ?? new Error("IDB read failed"));
		request.onsuccess = () => {
			const value = request.result;
			resolve(value === undefined ? null : (value as T));
		};
	});
}
