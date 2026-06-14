"use client";

import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export function AccentProvider({ children }: { children: React.ReactNode }) {
	const user = useQuery(api.users.viewer);

	useEffect(() => {
		if (user?.accentColor) {
			document.documentElement.style.setProperty("--primary", user.accentColor);
			document.documentElement.style.setProperty(
				"--sidebar-primary",
				user.accentColor,
			);
			document.documentElement.style.setProperty(
				"--user-accent",
				user.accentColor,
			);
			return;
		}

		// Let :root / .dark tokens from globals.css apply — never set
		// `--primary: var(--primary)` (circular reference breaks backgrounds).
		document.documentElement.style.removeProperty("--primary");
		document.documentElement.style.removeProperty("--sidebar-primary");
		document.documentElement.style.removeProperty("--user-accent");
	}, [user?.accentColor]);

	return <>{children}</>;
}
