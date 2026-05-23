import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { idbClear, idbResetConnection } from "@/lib/idb-storage";

// Automatically cleanup after each test
afterEach(async () => {
	cleanup();
	await idbClear().catch(() => {});
	idbResetConnection();
});
