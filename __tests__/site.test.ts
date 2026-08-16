import { describe, expect, test, vi } from "vitest";
import { absoluteUrl, getSiteUrl, PUBLIC_ROUTES } from "@/lib/site";

describe("Lib: site", () => {
	test("exposes public sitemap routes", () => {
		expect(PUBLIC_ROUTES.map((route) => route.path)).toContain("/");
		expect(PUBLIC_ROUTES.map((route) => route.path)).toContain("/login");
	});

	test("builds absolute urls from site origin", () => {
		vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://boom-scope.example");
		expect(getSiteUrl()).toBe("https://boom-scope.example");
		expect(absoluteUrl("/login")).toBe("https://boom-scope.example/login");
		expect(absoluteUrl("/")).toBe("https://boom-scope.example");
		vi.unstubAllEnvs();
	});
});
