import { describe, expect, test } from "vitest";
import {
	APP_LOCALE,
	formatAppDate,
	formatAppDateTime,
	formatAppTime,
} from "@/lib/locale";

describe("locale helpers", () => {
	const timestamp = Date.UTC(2026, 6, 11, 14, 30, 0);

	test("uses en-US locale consistently", () => {
		expect(APP_LOCALE).toBe("en-US");
		expect(formatAppDate(timestamp)).toBe(
			new Date(timestamp).toLocaleDateString("en-US"),
		);
		expect(formatAppTime(timestamp, { hour: "2-digit", minute: "2-digit" })).toBe(
			new Date(timestamp).toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		);
	});

	test("formatAppDateTime combines date and time", () => {
		expect(formatAppDateTime(timestamp)).toBe(
			new Date(timestamp).toLocaleString("en-US"),
		);
	});
});
