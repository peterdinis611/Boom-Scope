import { describe, expect, it } from "vitest";
import {
	evaluatePasswordStrength,
	getPasswordCriteria,
} from "@/lib/password-strength";

describe("getPasswordCriteria", () => {
	it("returns all false for empty password", () => {
		expect(getPasswordCriteria("")).toEqual({
			minLength: false,
			hasLowercase: false,
			hasUppercase: false,
			hasNumber: false,
			hasSpecial: false,
		});
	});

	it("detects Slovak diacritics as letters", () => {
		expect(getPasswordCriteria("heslá")).toMatchObject({
			hasLowercase: true,
			hasUppercase: false,
		});
		expect(getPasswordCriteria("HESLÁ")).toMatchObject({
			hasLowercase: false,
			hasUppercase: true,
		});
	});
});

describe("evaluatePasswordStrength", () => {
	it("returns zero score for empty password", () => {
		const result = evaluatePasswordStrength("");
		expect(result.score).toBe(0);
		expect(result.percent).toBe(0);
		expect(result.label).toBe("Very weak");
	});

	it("scores weak password with only length", () => {
		const result = evaluatePasswordStrength("abcdefgh");
		expect(result.score).toBe(2);
		expect(result.label).toBe("Fair");
		expect(result.criteria.minLength).toBe(true);
		expect(result.criteria.hasLowercase).toBe(true);
	});

	it("scores very strong password when all criteria are met", () => {
		const result = evaluatePasswordStrength("Heslo123!");
		expect(result.score).toBe(4);
		expect(result.percent).toBe(100);
		expect(result.label).toBe("Very strong");
		expect(result.metCount).toBe(5);
	});
});
