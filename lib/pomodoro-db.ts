const DB_NAME = "boom-scope";
const DB_VERSION = 1;
const STORE_NAME = "pomodoro-settings";
const SETTINGS_KEY = "settings";

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function getPomodoroSettings<T>(): Promise<T | null> {
	try {
		const db = await openDB();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, "readonly");
			const store = tx.objectStore(STORE_NAME);
			const request = store.get(SETTINGS_KEY);
			request.onsuccess = () => resolve(request.result ?? null);
			request.onerror = () => reject(request.error);
		});
	} catch {
		return null;
	}
}

export async function savePomodoroSettings<T>(settings: T): Promise<void> {
	try {
		const db = await openDB();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, "readwrite");
			const store = tx.objectStore(STORE_NAME);
			const request = store.put(settings, SETTINGS_KEY);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch {
		// Silently fail — timer will still work with in-memory defaults
	}
}
