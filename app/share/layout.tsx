import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Shared design",
	description: "View a shared Boom Scope design.",
	robots: { index: false, follow: false },
};

export default function ShareLayout({ children }: { children: ReactNode }) {
	return children;
}
