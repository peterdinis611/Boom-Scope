import {
	IDB_KEYS,
	idbGet,
	idbReadLegacyStore,
	idbSet,
} from "@/lib/idb-storage";

export async function getPomodoroSettings<T>(): Promise<T | null> {
	try {
		const saved = await idbGet<T>(IDB_KEYS.pomodoroSettings);
		if (saved) return saved;

		const legacy = await idbReadLegacyStore<T>(
			"pomodoro-settings",
			"settings",
		);
		if (legacy) {
			await idbSet(IDB_KEYS.pomodoroSettings, legacy);
		}
		return legacy;
	} catch {
		return null;
	}
}

export async function savePomodoroSettings<T>(settings: T): Promise<void> {
	try {
		await idbSet(IDB_KEYS.pomodoroSettings, settings);
	} catch {
		// Silently fail — timer still works with in-memory defaults
	}
}
