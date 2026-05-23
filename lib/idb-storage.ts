const DB_NAME = "boom-scope";
const STORE_NAME = "kv";
const DB_VERSION = 1;

export const IDB_KEYS = {
	generationHistory: "boom_scope_generation_history",
	clipboardHistory: "boom_scope_clipboard_history",
	importedDesign: "imported_design",
	importedViewport: "imported_viewport",
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
	if (typeof indexedDB === "undefined") {
		return Promise.reject(new Error("IndexedDB is not available"));
	}

	if (!dbPromise) {
		dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () => reject(request.error ?? new Error("IDB open failed"));
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

export async function idbGet<T>(key: string): Promise<T | null> {
	const value = await runTransaction("readonly", (store) => store.get(key));
	return value === undefined ? null : (value as T);
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
	await runTransaction("readwrite", (store) => store.put(value, key));
}

export async function idbRemove(key: string): Promise<void> {
	await runTransaction("readwrite", (store) => store.delete(key));
}

export async function idbClear(): Promise<void> {
	await runTransaction("readwrite", (store) => store.clear());
}

/** One-time migration from localStorage for users with existing data. */
export async function migrateFromLocalStorage(key: string): Promise<void> {
	if (typeof window === "undefined") return;

	const legacy = localStorage.getItem(key);
	if (legacy === null) return;

	try {
		const existing = await idbGet<unknown>(key);
		if (existing === null) {
			await idbSet(key, JSON.parse(legacy) as unknown);
		}
	} catch (error) {
		console.error(`Failed to migrate localStorage key "${key}"`, error);
	} finally {
		localStorage.removeItem(key);
	}
}
