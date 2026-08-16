import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Create account",
	description:
		"Create a Boom Scope account and start managing projects, notes, Kanban tasks, and design work in one workspace.",
	alternates: { canonical: "/register" },
	robots: { index: true, follow: true },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
	return children;
}
