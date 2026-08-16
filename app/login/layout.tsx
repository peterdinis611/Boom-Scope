import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Sign in",
	description:
		"Sign in to Boom Scope to access your projects, notes, tasks, canvas, and focus tools.",
	alternates: { canonical: "/login" },
	robots: { index: true, follow: true },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
	return children;
}
