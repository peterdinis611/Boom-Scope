"use client";

import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export function AccentProvider({ children }: { children: React.ReactNode }) {
	const user = useQuery(api.users.viewer);

	useEffect(() => {
		if (user?.accentColor) {
			// Set the CSS variable for the accent color
			document.documentElement.style.setProperty("--primary", user.accentColor);
			// We can also set a custom one if needed, e.g. --user-accent
			document.documentElement.style.setProperty(
				"--user-accent",
				user.accentColor,
			);
		} else {
			// Default primary from tailwind
			document.documentElement.style.setProperty("--primary", "var(--primary)");
			document.documentElement.style.setProperty(
				"--user-accent",
				"var(--primary)",
			);
		}
	}, [user?.accentColor]);

	return <>{children}</>;
}
